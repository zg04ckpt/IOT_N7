"use client";

import { useState } from "react";
import {
  Container,
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { login as loginAPI, registerUser } from "../api/user";
import { useAuth } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";

const MotionCard = motion(Card);
const MotionBox = motion(Box);

export default function LoginPage() {
  const [mode, setMode] = useState("login"); // "login" or "register"

  // Login states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [loginShowPasswordIcon, setLoginShowPasswordIcon] = useState(false);
  const [loginValidationErrors, setLoginValidationErrors] = useState({});

  // Register states
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPlate, setRegisterPlate] = useState("");
  const [registerShowPassword, setRegisterShowPassword] = useState(false);
  const [registerShowPasswordIcon, setRegisterShowPasswordIcon] =
    useState(false);
  const [registerValidationErrors, setRegisterValidationErrors] = useState({});

  // Common states
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Login validation functions
  const validateLoginEmail = (value) => {
    if (!value || value.trim() === "") {
      return "Email không được để trống";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) {
      return "Email không hợp lệ";
    }
    return "";
  };

  const validateLoginPassword = (value) => {
    if (!value || value.trim() === "") {
      return "Mật khẩu không được để trống";
    }
    return "";
  };

  // Register validation functions
  const validateRegisterEmail = (value) => {
    if (!value || value.trim() === "") {
      return "Email không được để trống";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) {
      return "Email không hợp lệ";
    }
    return "";
  };

  const validateRegisterPassword = (value) => {
    if (!value || value.trim() === "") {
      return "Mật khẩu không được để trống";
    }
    return "";
  };

  const validateRegisterPhone = (value) => {
    if (!value || value.trim() === "") {
      return "Số điện thoại không được để trống";
    }
    const trimmedValue = value.trim();
    if (trimmedValue.length > 15) {
      return "Số điện thoại không được quá 15 ký tự";
    }
    if (!/^[0-9]+$/.test(trimmedValue)) {
      return "Số điện thoại chỉ được chứa số";
    }
    return "";
  };

  const validateRegisterPlate = (value) => {
    if (!value || value.trim() === "") {
      return "Biển số xe không được để trống";
    }
    if (value.length > 20) {
      return "Biển số xe không được quá 20 ký tự";
    }
    if (!/^[A-Z0-9\-\.]+$/i.test(value.trim())) {
      return "Biển số xe không hợp lệ";
    }
    return "";
  };

  // Login handlers
  const handleLoginEmailBlur = () => {
    const error = validateLoginEmail(loginEmail);
    setLoginValidationErrors((prev) => ({ ...prev, email: error }));
  };

  const handleLoginPasswordBlur = () => {
    const error = validateLoginPassword(loginPassword);
    setLoginValidationErrors((prev) => ({ ...prev, password: error }));
  };

  const handleLoginPasswordInput = (e) => {
    const value = e.target.value;
    setLoginShowPasswordIcon(value.trim() !== "");
  };

  const handleLoginTogglePasswordVisibility = () => {
    setLoginShowPassword(!loginShowPassword);
  };

  const isLoginFormValid = () => {
    const emailError = validateLoginEmail(loginEmail);
    const passwordError = validateLoginPassword(loginPassword);
    return (
      !emailError &&
      !passwordError &&
      loginEmail.trim() !== "" &&
      loginPassword.trim() !== ""
    );
  };

  // Register handlers
  const handleRegisterEmailBlur = () => {
    const error = validateRegisterEmail(registerEmail);
    setRegisterValidationErrors((prev) => ({ ...prev, email: error }));
  };

  const handleRegisterPasswordBlur = () => {
    const error = validateRegisterPassword(registerPassword);
    setRegisterValidationErrors((prev) => ({ ...prev, password: error }));
  };

  const handleRegisterPhoneBlur = () => {
    const error = validateRegisterPhone(registerPhone);
    setRegisterValidationErrors((prev) => ({ ...prev, phone: error }));
  };

  const handleRegisterPlateBlur = () => {
    const error = validateRegisterPlate(registerPlate);
    setRegisterValidationErrors((prev) => ({ ...prev, plate: error }));
  };

  const handleRegisterPasswordInput = (e) => {
    const value = e.target.value;
    setRegisterShowPasswordIcon(value.trim() !== "");
  };

  const handleRegisterTogglePasswordVisibility = () => {
    setRegisterShowPassword(!registerShowPassword);
  };

  const isRegisterFormValid = () => {
    const emailError = validateRegisterEmail(registerEmail);
    const passwordError = validateRegisterPassword(registerPassword);
    const phoneError = validateRegisterPhone(registerPhone);
    const plateError = validateRegisterPlate(registerPlate);
    return (
      !emailError &&
      !passwordError &&
      !phoneError &&
      !plateError &&
      registerEmail.trim() !== "" &&
      registerPassword.trim() !== "" &&
      registerPhone.trim() !== "" &&
      registerPlate.trim() !== ""
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "login") {
      if (!isLoginFormValid()) {
        return;
      }
    } else {
      if (!isRegisterFormValid()) {
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === "login") {
        const res = await loginAPI({
          email: loginEmail,
          password: loginPassword,
        });
        if (res.success) {
          login(res.data);
          // Redirect based on user role
          const userRole = res.data.role?.toLowerCase();
          if (userRole === "user") {
            navigate("/user-sessions", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
        } else {
          setError(res.message || "Đăng nhập thất bại");
        }
      } else {
        // Register mode
        const res = await registerUser({
          email: registerEmail.trim(),
          password: registerPassword.trim(),
          phone: registerPhone.trim(),
          plate: registerPlate.trim(),
        });
        if (res.success) {
          setSuccess("Đăng ký thành công! Vui lòng đăng nhập.");
          // Reset register form
          setRegisterEmail("");
          setRegisterPassword("");
          setRegisterPhone("");
          setRegisterPlate("");
          setRegisterValidationErrors({});
          setRegisterShowPassword(false);
          setRegisterShowPasswordIcon(false);
          // Switch to login mode after 1.5 seconds
          setTimeout(() => {
            setMode("login");
            setSuccess("");
          }, 1500);
        } else {
          setError(res.message || "Đăng ký thất bại");
        }
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          (mode === "login" ? "Đăng nhập thất bại" : "Đăng ký thất bại")
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (event, newMode) => {
    if (newMode !== mode) {
      setMode(newMode);
      setError("");
      setSuccess("");

      // Reset validation errors when switching modes
      setLoginValidationErrors({});
      setRegisterValidationErrors({});

      // Reset all fields when switching modes
      if (newMode === "login") {
        // Switching to login, reset register fields
        setRegisterEmail("");
        setRegisterPassword("");
        setRegisterPhone("");
        setRegisterPlate("");
        setRegisterShowPassword(false);
        setRegisterShowPasswordIcon(false);
      } else {
        // Switching to register, reset login fields
        setLoginEmail("");
        setLoginPassword("");
        setLoginShowPassword(false);
        setLoginShowPasswordIcon(false);
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <MotionBox
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
        sx={{
          position: "absolute",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)",
          top: "10%",
          right: "10%",
          boxShadow: "0 8px 32px rgba(37, 99, 235, 0.1)",
        }}
      />
      <MotionBox
        animate={{
          rotate: -360,
          scale: [1, 1.2, 1],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 25,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
        sx={{
          position: "absolute",
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)",
          bottom: "15%",
          left: "8%",
          boxShadow: "0 6px 24px rgba(6, 182, 212, 0.1)",
        }}
      />

      <MotionBox
        animate={{
          y: [0, -30, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 15,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        sx={{
          position: "absolute",
          width: "80px",
          height: "80px",
          borderRadius: "20px",
          background:
            "linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)",
          top: "20%",
          left: "15%",
          boxShadow: "0 4px 16px rgba(37, 99, 235, 0.08)",
        }}
      />
      <MotionBox
        animate={{
          y: [0, 25, 0],
          x: [0, 15, 0],
          rotate: [0, -90, -180],
        }}
        transition={{
          duration: 18,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        sx={{
          position: "absolute",
          width: "60px",
          height: "60px",
          borderRadius: "12px",
          background:
            "linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)",
          bottom: "25%",
          right: "20%",
          boxShadow: "0 4px 12px rgba(6, 182, 212, 0.1)",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(37, 99, 235, 0.05) 1px, transparent 0)
          `,
          backgroundSize: "20px 20px",
          opacity: 0.3,
        }}
      />

      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        <MotionCard
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          sx={{
            p: 4,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow:
              "0 20px 60px rgba(37, 99, 235, 0.15), 0 8px 32px rgba(6, 182, 212, 0.1)",
            borderRadius: "24px",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "linear-gradient(90deg, #2563eb 0%, #06b6d4 100%)",
            },
          }}
        >
          <MotionBox
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <MotionBox
              whileHover={{
                scale: 1.1,
                rotate: [0, -5, 5, 0],
                transition: { duration: 0.3 },
              }}
              sx={{
                width: 80,
                height: 80,
                borderRadius: "20px",
                background: "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  "0 12px 32px rgba(37, 99, 235, 0.3), 0 4px 16px rgba(6, 182, 212, 0.2)",
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: "-2px",
                  borderRadius: "22px",
                  background:
                    "linear-gradient(135deg, #2563eb, #06b6d4, #2563eb)",
                  zIndex: -1,
                  opacity: 0.3,
                },
              }}
            >
              <img
                src="/android-chrome-192x192.png"
                alt="Smart Parking"
                width={48}
                height={48}
                style={{ borderRadius: "8px" }}
              />
            </MotionBox>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Typography
              variant="h2"
              sx={{
                textAlign: "center",
                mb: 1,
                background: "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Smart Parking
            </Typography>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Typography
              variant="body1"
              sx={{
                textAlign: "center",
                color: "#64748b",
                mb: 3,
                fontSize: "1.1rem",
                fontWeight: 500,
              }}
            >
              Hệ thống quản lý bãi đỗ xe thông minh
            </Typography>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            sx={{ mb: 3 }}
          >
            <Tabs
              value={mode}
              onChange={handleModeChange}
              centered
              sx={{
                "& .MuiTabs-indicator": {
                  background:
                    "linear-gradient(90deg, #2563eb 0%, #06b6d4 100%)",
                  height: 3,
                  borderRadius: "3px 3px 0 0",
                },
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "#64748b",
                  transition: "all 0.3s ease",
                  "&.Mui-selected": {
                    color: "#2563eb",
                  },
                  "&:hover": {
                    color: "#2563eb",
                    backgroundColor: "rgba(37, 99, 235, 0.05)",
                  },
                },
              }}
            >
              <Tab label="Đăng nhập" value="login" />
              <Tab label="Đăng ký" value="register" />
            </Tabs>
          </MotionBox>

          {error && (
            <MotionBox
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              sx={{ mb: 2 }}
            >
              <Alert severity="error">{error}</Alert>
            </MotionBox>
          )}

          {success && (
            <MotionBox
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              sx={{ mb: 2 }}
            >
              <Alert severity="success">{success}</Alert>
            </MotionBox>
          )}

          <AnimatePresence mode="wait">
            <MotionBox
              key={mode}
              initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === "login" ? 20 : -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              {mode === "login" ? (
                <>
                  <MotionBox
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TextField
                      label="Email"
                      type="email"
                      fullWidth
                      value={loginEmail}
                      onChange={(e) => {
                        setLoginEmail(e.target.value);
                        if (loginValidationErrors.email) {
                          setLoginValidationErrors((prev) => ({
                            ...prev,
                            email: "",
                          }));
                        }
                      }}
                      onBlur={handleLoginEmailBlur}
                      disabled={loading}
                      variant="outlined"
                      error={!!loginValidationErrors.email}
                      helperText={loginValidationErrors.email}
                      autoComplete="email"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          backgroundColor: "rgba(248, 250, 252, 0.8)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor: "rgba(248, 250, 252, 1)",
                            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.1)",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "rgba(248, 250, 252, 1)",
                            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "#64748b",
                          fontWeight: 500,
                        },
                      }}
                    />
                  </MotionBox>

                  <MotionBox
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TextField
                      label="Mật khẩu"
                      type={loginShowPassword ? "text" : "password"}
                      fullWidth
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        handleLoginPasswordInput(e);
                        if (loginValidationErrors.password) {
                          setLoginValidationErrors((prev) => ({
                            ...prev,
                            password: "",
                          }));
                        }
                      }}
                      onInput={handleLoginPasswordInput}
                      onBlur={handleLoginPasswordBlur}
                      disabled={loading}
                      variant="outlined"
                      error={!!loginValidationErrors.password}
                      helperText={loginValidationErrors.password}
                      InputProps={{
                        endAdornment: loginShowPasswordIcon && (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleLoginTogglePasswordVisibility}
                              edge="end"
                              sx={{
                                color: "#64748b",
                                "&:hover": {
                                  color: "#2563eb",
                                  backgroundColor: "rgba(37, 99, 235, 0.08)",
                                },
                              }}
                            >
                              {loginShowPassword ? (
                                <VisibilityOffIcon />
                              ) : (
                                <VisibilityIcon />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          backgroundColor: "rgba(248, 250, 252, 0.8)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor: "rgba(248, 250, 252, 1)",
                            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.1)",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "rgba(248, 250, 252, 1)",
                            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "#64748b",
                          fontWeight: 500,
                        },
                      }}
                    />
                  </MotionBox>
                </>
              ) : (
                <>
                  <MotionBox
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileFocus={{ scale: 1.02 }}
                  >
                    <TextField
                      label="Email"
                      type="email"
                      fullWidth
                      value={registerEmail}
                      onChange={(e) => {
                        setRegisterEmail(e.target.value);
                        if (registerValidationErrors.email) {
                          setRegisterValidationErrors((prev) => ({
                            ...prev,
                            email: "",
                          }));
                        }
                      }}
                      onBlur={handleRegisterEmailBlur}
                      disabled={loading}
                      variant="outlined"
                      error={!!registerValidationErrors.email}
                      helperText={registerValidationErrors.email}
                      autoComplete="email"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          backgroundColor: "rgba(248, 250, 252, 0.8)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor: "rgba(248, 250, 252, 1)",
                            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.1)",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "rgba(248, 250, 252, 1)",
                            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "#64748b",
                          fontWeight: 500,
                        },
                      }}
                    />
                  </MotionBox>

                  <MotionBox
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    whileFocus={{ scale: 1.02 }}
                  >
                    <TextField
                      label="Mật khẩu"
                      type={registerShowPassword ? "text" : "password"}
                      fullWidth
                      value={registerPassword}
                      onChange={(e) => {
                        setRegisterPassword(e.target.value);
                        handleRegisterPasswordInput(e);
                        if (registerValidationErrors.password) {
                          setRegisterValidationErrors((prev) => ({
                            ...prev,
                            password: "",
                          }));
                        }
                      }}
                      onInput={handleRegisterPasswordInput}
                      onBlur={handleRegisterPasswordBlur}
                      disabled={loading}
                      variant="outlined"
                      error={!!registerValidationErrors.password}
                      helperText={registerValidationErrors.password}
                      InputProps={{
                        endAdornment: registerShowPasswordIcon && (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleRegisterTogglePasswordVisibility}
                              edge="end"
                              sx={{
                                color: "#64748b",
                                "&:hover": {
                                  color: "#2563eb",
                                  backgroundColor: "rgba(37, 99, 235, 0.08)",
                                },
                              }}
                            >
                              {registerShowPassword ? (
                                <VisibilityOffIcon />
                              ) : (
                                <VisibilityIcon />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          backgroundColor: "rgba(248, 250, 252, 0.8)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor: "rgba(248, 250, 252, 1)",
                            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.1)",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "rgba(248, 250, 252, 1)",
                            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "#64748b",
                          fontWeight: 500,
                        },
                      }}
                    />
                  </MotionBox>

                  <MotionBox
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    whileFocus={{ scale: 1.02 }}
                  >
                    <TextField
                      label="Số điện thoại"
                      type="tel"
                      fullWidth
                      value={registerPhone}
                      onChange={(e) => {
                        setRegisterPhone(e.target.value);
                        if (registerValidationErrors.phone) {
                          setRegisterValidationErrors((prev) => ({
                            ...prev,
                            phone: "",
                          }));
                        }
                      }}
                      onBlur={handleRegisterPhoneBlur}
                      disabled={loading}
                      variant="outlined"
                      error={!!registerValidationErrors.phone}
                      helperText={registerValidationErrors.phone}
                      autoComplete="tel"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          backgroundColor: "rgba(248, 250, 252, 0.8)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor: "rgba(248, 250, 252, 1)",
                            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.1)",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "rgba(248, 250, 252, 1)",
                            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "#64748b",
                          fontWeight: 500,
                        },
                      }}
                    />
                  </MotionBox>

                  <MotionBox
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    whileFocus={{ scale: 1.02 }}
                  >
                    <TextField
                      label="Biển số xe"
                      type="text"
                      fullWidth
                      value={registerPlate}
                      onChange={(e) => {
                        setRegisterPlate(e.target.value);
                        if (registerValidationErrors.plate) {
                          setRegisterValidationErrors((prev) => ({
                            ...prev,
                            plate: "",
                          }));
                        }
                      }}
                      onBlur={handleRegisterPlateBlur}
                      disabled={loading}
                      variant="outlined"
                      error={!!registerValidationErrors.plate}
                      helperText={registerValidationErrors.plate}
                      autoComplete="off"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          backgroundColor: "rgba(248, 250, 252, 0.8)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor: "rgba(248, 250, 252, 1)",
                            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.1)",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "rgba(248, 250, 252, 1)",
                            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "#64748b",
                          fontWeight: 500,
                        },
                      }}
                    />
                  </MotionBox>
                </>
              )}

              <MotionBox
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={
                    loading ||
                    (mode === "login"
                      ? !isLoginFormValid()
                      : !isRegisterFormValid())
                  }
                  sx={{
                    mt: 1,
                    background:
                      "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",
                    height: "52px",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    borderRadius: "12px",
                    textTransform: "none",
                    boxShadow: "0 8px 24px rgba(37, 99, 235, 0.3)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 12px 32px rgba(37, 99, 235, 0.4)",
                      transform: "translateY(-2px)",
                    },
                    "&:active": {
                      transform: "translateY(0)",
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : mode === "login" ? (
                    "Đăng nhập"
                  ) : (
                    "Đăng ký"
                  )}
                </Button>
              </MotionBox>
            </MotionBox>
          </AnimatePresence>
        </MotionCard>
      </Container>
    </Box>
  );
}
