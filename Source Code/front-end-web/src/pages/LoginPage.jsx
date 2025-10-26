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
} from "@mui/material";
import { motion } from "framer-motion";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { loginUser } from "../api/auth";
import { useAuth } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";

const MotionCard = motion(Card);
const MotionBox = motion(Box);

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const { setUser, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  const validateUsername = (value) => {
    if (!value || value.trim() === "") {
      return "Tên đăng nhập không được để trống";
    }
    return "";
  };

  const validatePassword = (value) => {
    if (!value || value.trim() === "") {
      return "Mật khẩu không được để trống";
    }
    return "";
  };

  const validateForm = () => {
    const errors = {};
    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);

    if (usernameError) errors.username = usernameError;
    if (passwordError) errors.password = passwordError;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUsernameBlur = () => {
    const error = validateUsername(username);
    setValidationErrors((prev) => ({ ...prev, username: error }));
  };

  const handlePasswordBlur = () => {
    const error = validatePassword(password);
    setValidationErrors((prev) => ({ ...prev, password: error }));
  };

  const isFormValid = () => {
    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);
    return (
      !usernameError &&
      !passwordError &&
      username.trim() !== "" &&
      password.trim() !== ""
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isFormValid()) {
      return;
    }

    setLoading(true);

    try {
      const res = await loginUser({ username, password });
      if (res.data.success) {
        setUser(res.data.data);
        setIsAuthenticated(true);
        navigate("/dashboard", { replace: true });
      } else {
        setError(res.data.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Đăng nhập thất bại");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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

          {error && (
            <MotionBox
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              sx={{ mb: 2 }}
            >
              <Alert severity="error">{error}</Alert>
            </MotionBox>
          )}

          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            <MotionBox
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <TextField
                label="Tên đăng nhập"
                type="text"
                fullWidth
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (validationErrors.username) {
                    setValidationErrors((prev) => ({ ...prev, username: "" }));
                  }
                }}
                onBlur={handleUsernameBlur}
                disabled={loading}
                variant="outlined"
                error={!!validationErrors.username}
                helperText={validationErrors.username}
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
                type={showPassword ? "text" : "password"}
                fullWidth
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (validationErrors.password) {
                    setValidationErrors((prev) => ({ ...prev, password: "" }));
                  }
                }}
                onBlur={handlePasswordBlur}
                disabled={loading}
                variant="outlined"
                error={!!validationErrors.password}
                helperText={validationErrors.password}
                InputProps={{
                  endAdornment: password.trim() !== "" && (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                        sx={{
                          color: "#64748b",
                          "&:hover": {
                            color: "#2563eb",
                            backgroundColor: "rgba(37, 99, 235, 0.08)",
                          },
                        }}
                      >
                        {showPassword ? (
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
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !isFormValid()}
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
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </MotionBox>
          </MotionBox>
        </MotionCard>
      </Container>
    </Box>
  );
}
