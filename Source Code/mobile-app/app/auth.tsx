"use client";

import { useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { loginUser, registerUser } from "@/api/user";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInRight,
  SlideOutLeft,
  SlideInLeft,
  SlideOutRight,
  BounceIn,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

type AuthMode = "login" | "register";

interface FormErrors {
  email?: string;
  password?: string;
  phone?: string;
  plate?: string;
}

export default function AuthScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const [mode, setMode] = useState<AuthMode>("login");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPlate, setRegisterPlate] = useState("");

  // Errors
  const [loginErrors, setLoginErrors] = useState<FormErrors>({});
  const [registerErrors, setRegisterErrors] = useState<FormErrors>({});

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone);
  };

  const validatePlate = (plate: string): boolean => {
    const plateRegex = /^[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}$/i;
    return plateRegex.test(plate);
  };

  const validateLogin = (): boolean => {
    const errors: FormErrors = {};

    if (!loginEmail.trim()) {
      errors.email = "Vui lòng nhập email";
    } else if (!validateEmail(loginEmail.trim())) {
      errors.email = "Email không hợp lệ";
    }

    if (!loginPassword.trim()) {
      errors.password = "Vui lòng nhập mật khẩu";
    }

    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegister = (): boolean => {
    const errors: FormErrors = {};

    if (!registerEmail.trim()) {
      errors.email = "Vui lòng nhập email";
    } else if (!validateEmail(registerEmail.trim())) {
      errors.email = "Email không hợp lệ";
    }

    if (!registerPassword.trim()) {
      errors.password = "Vui lòng nhập mật khẩu";
    }

    if (!registerPhone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại";
    } else if (!validatePhone(registerPhone.trim())) {
      errors.phone = "Số điện thoại không hợp lệ (10-11 số)";
    }

    if (!registerPlate.trim()) {
      errors.plate = "Vui lòng nhập biển số xe";
    } else if (!validatePlate(registerPlate.trim())) {
      errors.plate = "Biển số không hợp lệ (VD: 30A-12345)";
    }

    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    if (validateLogin()) {
      setIsLoading(true);
      try {
        const response = await loginUser({
          email: loginEmail.trim(),
          password: loginPassword,
        });

        if (response.success && response.data) {
          // Backend returns user data in response.data
          const userData = response.data;
          
          // Token might be in response.token or in cookies
          // For mobile, we'll use response.token if available
          const token = response.token || response.data?.token;
          
          await login(
            {
              id: userData.id,
              email: userData.email,
              role: userData.role || "user",
              phone: userData.phone,
              plate: userData.plate,
            },
            token
          );

          showSuccess(response.message || "Đăng nhập thành công!");
          
          // Navigation will be handled by _layout.tsx useEffect
          // No need to manually navigate here
        } else {
          showError(response.message || "Đăng nhập thất bại. Vui lòng thử lại.");
        }
      } catch (error: any) {
        console.error("Login error:", error);
        
        // Handle axios errors
        if (error.response) {
          const errorMessage =
            error.response.data?.message ||
            error.response.data?.error ||
            "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
          showError(errorMessage);
        } else if (error.request) {
          showError("Không thể kết nối đến server. Vui lòng thử lại sau.");
        } else {
          showError("Đã xảy ra lỗi. Vui lòng thử lại.");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRegister = async () => {
    if (validateRegister()) {
      setIsLoading(true);
      try {
        const response = await registerUser({
          email: registerEmail.trim(),
          password: registerPassword,
          phone: registerPhone.trim(),
          plate: registerPlate.toUpperCase().trim(),
        });

        if (response.success) {
          showSuccess(response.message || "Đăng ký thành công!");

          // After successful registration, switch to login
          setTimeout(() => {
            setMode("login");
            setLoginEmail(registerEmail);
            // Clear register form
            setRegisterEmail("");
            setRegisterPassword("");
            setRegisterPhone("");
            setRegisterPlate("");
            setRegisterErrors({});
          }, 500);
        } else {
          showError(response.message || "Đăng ký thất bại. Vui lòng thử lại.");
        }
      } catch (error: any) {
        console.error("Register error:", error);
        
        // Handle axios errors
        if (error.response) {
          const errorMessage =
            error.response.data?.message ||
            error.response.data?.error ||
            "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.";
          
          // Check if it's a validation error with field-specific messages
          if (error.response.data?.errors) {
            const errors = error.response.data.errors;
            const errorFields: FormErrors = {};
            
            if (errors.email) {
              errorFields.email = errors.email;
            }
            if (errors.password) {
              errorFields.password = errors.password;
            }
            if (errors.phone) {
              errorFields.phone = errors.phone;
            }
            if (errors.plate) {
              errorFields.plate = errors.plate;
            }
            
            if (Object.keys(errorFields).length > 0) {
              setRegisterErrors(errorFields);
            }
          }
          
          showError(errorMessage);
        } else if (error.request) {
          showError("Không thể kết nối đến server. Vui lòng thử lại sau.");
        } else {
          showError("Đã xảy ra lỗi. Vui lòng thử lại.");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    // Clear errors when switching
    setLoginErrors({});
    setRegisterErrors({});
  };

  const renderLoginForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>Đăng nhập</Text>
        <Text style={styles.formSubtitle}>Chào mừng bạn trở lại!</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, loginErrors.email && styles.inputError]}
            placeholder="Nhập email của bạn"
            placeholderTextColor="#94A3B8"
            value={loginEmail}
            onChangeText={(text) => {
              setLoginEmail(text);
              if (loginErrors.email) {
                setLoginErrors({ ...loginErrors, email: undefined });
              }
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        {loginErrors.email && (
          <Text style={styles.errorText}>{loginErrors.email}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Mật khẩu</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              styles.passwordInput,
              loginErrors.password && styles.inputError,
            ]}
            placeholder="Nhập mật khẩu"
            placeholderTextColor="#94A3B8"
            value={loginPassword}
            onChangeText={(text) => {
              setLoginPassword(text);
              if (loginErrors.password) {
                setLoginErrors({ ...loginErrors, password: undefined });
              }
            }}
            secureTextEntry={!showLoginPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {loginPassword.trim() !== "" && (
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowLoginPassword(!showLoginPassword)}
            >
              <Text style={styles.eyeIcon}>
                {showLoginPassword ? "👁️" : "👁️‍🗨️"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {loginErrors.password && (
          <Text style={styles.errorText}>{loginErrors.password}</Text>
        )}
      </View>

      <View>
        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <LinearGradient
            colors={["#10B981", "#059669"]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Đăng nhập</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>Chưa có tài khoản? </Text>
        <TouchableOpacity onPress={() => switchMode("register")}>
          <Text style={styles.switchLink}>Đăng ký ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRegisterForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>Đăng ký</Text>
        <Text style={styles.formSubtitle}>Tạo tài khoản mới để bắt đầu</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, registerErrors.email && styles.inputError]}
            placeholder="Nhập email của bạn"
            placeholderTextColor="#94A3B8"
            value={registerEmail}
            onChangeText={(text) => {
              setRegisterEmail(text);
              if (registerErrors.email) {
                setRegisterErrors({ ...registerErrors, email: undefined });
              }
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        {registerErrors.email && (
          <Text style={styles.errorText}>{registerErrors.email}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Mật khẩu</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              styles.passwordInput,
              registerErrors.password && styles.inputError,
            ]}
            placeholder="Nhập mật khẩu"
            placeholderTextColor="#94A3B8"
            value={registerPassword}
            onChangeText={(text) => {
              setRegisterPassword(text);
              if (registerErrors.password) {
                setRegisterErrors({ ...registerErrors, password: undefined });
              }
            }}
            secureTextEntry={!showRegisterPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {registerPassword.trim() !== "" && (
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowRegisterPassword(!showRegisterPassword)}
            >
              <Text style={styles.eyeIcon}>
                {showRegisterPassword ? "👁️" : "👁️‍🗨️"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {registerErrors.password && (
          <Text style={styles.errorText}>{registerErrors.password}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Số điện thoại</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, registerErrors.phone && styles.inputError]}
            placeholder="Nhập số điện thoại (10-11 số)"
            placeholderTextColor="#94A3B8"
            value={registerPhone}
            onChangeText={(text) => {
              // Only allow numbers
              const numericText = text.replace(/[^0-9]/g, "");
              setRegisterPhone(numericText);
              if (registerErrors.phone) {
                setRegisterErrors({ ...registerErrors, phone: undefined });
              }
            }}
            keyboardType="phone-pad"
            maxLength={11}
          />
        </View>
        {registerErrors.phone && (
          <Text style={styles.errorText}>{registerErrors.phone}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Biển số xe</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, registerErrors.plate && styles.inputError]}
            placeholder="VD: 30A-12345"
            placeholderTextColor="#94A3B8"
            value={registerPlate}
            onChangeText={(text) => {
              // Auto uppercase
              const upperText = text.toUpperCase();
              setRegisterPlate(upperText);
              if (registerErrors.plate) {
                setRegisterErrors({ ...registerErrors, plate: undefined });
              }
            }}
            autoCapitalize="characters"
            maxLength={12}
          />
        </View>
        {registerErrors.plate && (
          <Text style={styles.errorText}>{registerErrors.plate}</Text>
        )}
      </View>

      <View>
        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
          onPress={handleRegister}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <LinearGradient
            colors={["#3B82F6", "#2563EB"]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Đăng ký</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>Đã có tài khoản? </Text>
        <TouchableOpacity onPress={() => switchMode("login")}>
          <Text style={styles.switchLink}>Đăng nhập ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <LinearGradient
        colors={["#0EA5E9", "#0284C7", "#0369A1"]}
        style={styles.gradientBackground}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with Logo */}
          <Animated.View
            entering={BounceIn.duration(600)}
            style={styles.header}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Image
                  source={require("../public/android-chrome-192x192.png")}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            </View>
            <Text style={styles.appTitle}>Smart Parking</Text>
            <Text style={styles.appSubtitle}>
              Hệ thống bãi đỗ xe thông minh
            </Text>
          </Animated.View>

          {/* Form Card */}
          <Animated.View
            key={mode}
            entering={
              mode === "login"
                ? SlideInLeft.duration(400).springify()
                : SlideInRight.duration(400).springify()
            }
            exiting={
              mode === "login"
                ? SlideOutLeft.duration(400).springify()
                : SlideOutRight.duration(400).springify()
            }
            style={styles.card}
          >
            {mode === "login" ? renderLoginForm() : renderRegisterForm()}
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
    overflow: "hidden",
  },
  logoImage: {
    width: 70,
    height: 70,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
    letterSpacing: 1,
  },
  appSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 30,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    marginTop: 20,
  },
  formContainer: {
    width: "100%",
  },
  formHeader: {
    marginBottom: 30,
    alignItems: "center",
  },
  formTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#0F172A",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  passwordInput: {
    paddingRight: 50,
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  eyeButton: {
    position: "absolute",
    right: 16,
    top: 16,
    padding: 4,
  },
  eyeIcon: {
    fontSize: 20,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  switchText: {
    fontSize: 15,
    color: "#64748B",
  },
  switchLink: {
    fontSize: 15,
    fontWeight: "700",
    color: "#3B82F6",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
