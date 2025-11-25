import React, { createContext, useContext, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type SnackbarSeverity = "success" | "error" | "warning" | "info";

interface SnackbarContextType {
  showSnackbar: (message: string, severity?: SnackbarSeverity, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};

interface SnackbarState {
  message: string;
  severity: SnackbarSeverity;
  visible: boolean;
}

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    message: "",
    severity: "info",
    visible: false,
  });
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));

  const hideSnackbar = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSnackbar((prev) => ({ ...prev, visible: false }));
    });
  }, [fadeAnim, slideAnim]);

  const showSnackbar = useCallback(
    (message: string, severity: SnackbarSeverity = "info", duration: number = 3000) => {
      setSnackbar({ message, severity, visible: true });
      
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(-100);

      // Show animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      if (duration > 0) {
        setTimeout(() => {
          hideSnackbar();
        }, duration);
      }
    },
    [fadeAnim, slideAnim, hideSnackbar]
  );

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      showSnackbar(message, "success", duration);
    },
    [showSnackbar]
  );

  const showError = useCallback(
    (message: string, duration?: number) => {
      showSnackbar(message, "error", duration);
    },
    [showSnackbar]
  );

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      showSnackbar(message, "warning", duration);
    },
    [showSnackbar]
  );

  const showInfo = useCallback(
    (message: string, duration?: number) => {
      showSnackbar(message, "info", duration);
    },
    [showSnackbar]
  );

  const getSeverityColors = (severity: SnackbarSeverity) => {
    switch (severity) {
      case "success":
        return ["#10B981", "#059669"];
      case "error":
        return ["#EF4444", "#DC2626"];
      case "warning":
        return ["#F59E0B", "#D97706"];
      case "info":
        return ["#3B82F6", "#2563EB"];
      default:
        return ["#3B82F6", "#2563EB"];
    }
  };

  const getSeverityIcon = (severity: SnackbarSeverity) => {
    switch (severity) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
        return "ℹ";
      default:
        return "ℹ";
    }
  };

  return (
    <SnackbarContext.Provider
      value={{
        showSnackbar,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      {snackbar.visible && (
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={getSeverityColors(snackbar.severity)}
            style={styles.snackbar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.content}>
              <Text style={styles.icon}>{getSeverityIcon(snackbar.severity)}</Text>
              <Text style={styles.message}>{snackbar.message}</Text>
            </View>
            <TouchableOpacity onPress={hideSnackbar} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      )}
    </SnackbarContext.Provider>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  snackbar: {
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    fontSize: 20,
    color: "#FFFFFF",
    marginRight: 12,
    fontWeight: "bold",
  },
  message: {
    flex: 1,
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
  closeIcon: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

