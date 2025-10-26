import React, { createContext, useContext, useState } from "react";
import { Snackbar, Alert, IconButton } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";

const SnackbarContext = createContext();

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};

const getIcon = (severity) => {
  switch (severity) {
    case "success":
      return <CheckCircleIcon sx={{ fontSize: 20 }} />;
    case "error":
      return <ErrorIcon sx={{ fontSize: 20 }} />;
    case "warning":
      return <WarningIcon sx={{ fontSize: 20 }} />;
    case "info":
      return <InfoIcon sx={{ fontSize: 20 }} />;
    default:
      return <InfoIcon sx={{ fontSize: 20 }} />;
  }
};

export const SnackbarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
    duration: 3000,
  });

  const showSnackbar = (message, severity = "info", duration = 3000) => {
    setSnackbar({
      open: true,
      message,
      severity,
      duration,
    });
  };

  const hideSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const showSuccess = (message, duration = 3000) => {
    showSnackbar(message, "success", duration);
  };

  const showError = (message, duration = 3000) => {
    showSnackbar(message, "error", duration);
  };

  const showWarning = (message, duration = 3000) => {
    showSnackbar(message, "warning", duration);
  };

  const showInfo = (message, duration = 3000) => {
    showSnackbar(message, "info", duration);
  };

  const value = {
    showSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideSnackbar,
  };

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {snackbar.open && (
          <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            style={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
            }}
          >
            <Snackbar
              open={snackbar.open}
              autoHideDuration={snackbar.duration}
              onClose={hideSnackbar}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              sx={{
                position: "static",
                "& .MuiSnackbar-root": {
                  position: "static",
                },
              }}
            >
              <Alert
                severity={snackbar.severity}
                onClose={hideSnackbar}
                icon={getIcon(snackbar.severity)}
                sx={{
                  minWidth: 300,
                  maxWidth: 400,
                  borderRadius: "12px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  "& .MuiAlert-message": {
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    lineHeight: 1.4,
                  },
                  "& .MuiAlert-action": {
                    padding: 0,
                    marginLeft: 1,
                  },
                  "&.MuiAlert-filledSuccess": {
                    backgroundColor: "rgba(76, 175, 80, 0.95)",
                    color: "white",
                    "& .MuiAlert-icon": {
                      color: "white",
                    },
                  },
                  "&.MuiAlert-filledError": {
                    backgroundColor: "rgba(244, 67, 54, 0.95)",
                    color: "white",
                    "& .MuiAlert-icon": {
                      color: "white",
                    },
                  },
                  "&.MuiAlert-filledWarning": {
                    backgroundColor: "rgba(255, 152, 0, 0.95)",
                    color: "white",
                    "& .MuiAlert-icon": {
                      color: "white",
                    },
                  },
                  "&.MuiAlert-filledInfo": {
                    backgroundColor: "rgba(33, 150, 243, 0.95)",
                    color: "white",
                    "& .MuiAlert-icon": {
                      color: "white",
                    },
                  },
                }}
                action={
                  <IconButton
                    size="small"
                    aria-label="close"
                    onClick={hideSnackbar}
                    sx={{
                      color: "rgba(0, 0, 0, 0.7)",
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.1)",
                        color: "rgba(0, 0, 0, 0.9)",
                      },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                }
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
          </motion.div>
        )}
      </AnimatePresence>
    </SnackbarContext.Provider>
  );
};
