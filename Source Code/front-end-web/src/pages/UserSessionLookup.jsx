"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogContent,
  IconButton,
  Zoom,
  AppBar,
  Toolbar,
  Divider,
  Paper,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";
import { getUserProfile } from "../api/user";
import { getInvoiceBySessionId } from "../api/invoice";
import { getCardById } from "../api/card";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ImageIcon from "@mui/icons-material/Image";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

const MotionCard = motion(Card);
const MotionBox = motion(Box);

export default function UserSessionLookup() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [invoices, setInvoices] = useState({}); // Map session_id -> invoice amount
  const [cards, setCards] = useState({}); // Map session_id -> card info
  const [loading, setLoading] = useState(true);
  const [loadingInvoices, setLoadingInvoices] = useState({});
  const [loadingCards, setLoadingCards] = useState({});
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getUserProfile();
        if (response.success) {
          const parkingSessions = response.data.parking_sessions || [];
          setSessions(parkingSessions);

          // Fetch invoices for all completed sessions (must have status "end", check_out, and check_out_image_url)
          const completedSessions = parkingSessions.filter(
            (s) => s.status === "end" && s.check_out && s.check_out_image_url
          );
          if (completedSessions.length > 0) {
            fetchInvoicesForSessions(completedSessions);
          }

          // Fetch card info for all sessions
          if (parkingSessions.length > 0) {
            fetchCardsForSessions(parkingSessions);
          }
        } else {
          setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        }
      } catch (err) {
        console.error("Error fetching sessions:", err);
        // Nếu là lỗi 403, để axios interceptor xử lý redirect
        if (err.response?.status === 403) {
          return;
        }
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user]);

  const fetchInvoicesForSessions = async (completedSessions) => {
    const invoicePromises = completedSessions.map(async (session) => {
      try {
        setLoadingInvoices((prev) => ({ ...prev, [session.id]: true }));
        const response = await getInvoiceBySessionId(session.id);
        if (response.success && response.data) {
          setInvoices((prev) => ({
            ...prev,
            [session.id]: response.data.amount,
          }));
        }
      } catch (err) {
        console.error(`Error fetching invoice for session ${session.id}:`, err);
        // Không set error, chỉ log
      } finally {
        setLoadingInvoices((prev) => ({ ...prev, [session.id]: false }));
      }
    });

    await Promise.all(invoicePromises);
  };

  const fetchCardsForSessions = async (sessions) => {
    const cardPromises = sessions.map(async (session) => {
      if (!session.card_id) return;
      try {
        setLoadingCards((prev) => ({ ...prev, [session.id]: true }));
        const response = await getCardById(session.card_id);
        if (response.success && response.data) {
          setCards((prev) => ({
            ...prev,
            [session.id]: response.data,
          }));
        }
      } catch (err) {
        console.error(`Error fetching card for session ${session.id}:`, err);
        // Không set error, chỉ log
      } finally {
        setLoadingCards((prev) => ({ ...prev, [session.id]: false }));
      }
    });

    await Promise.all(cardPromises);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleImageClick = (imageUrl, plate, type) => {
    setSelectedImage({ url: imageUrl, plate, type });
    setLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
    setSelectedImage(null);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return "-";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const calculateDuration = (checkIn, checkOut) => {
    if (!checkIn) return "-";
    if (!checkOut) return "Đang gửi";

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return `${diffHours}h ${diffMinutes}m ${diffSeconds}s`;
  };

  const calculateDaysRemaining = (expiryDate) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const formatDaysRemaining = (days) => {
    if (days === null) return "-";
    if (days === 0) return "Đã hết hạn";
    if (days === 1) return "1 ngày";
    return `${days} ngày`;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Enhanced Background decorative elements */}
      {Array.from({ length: 8 }, (_, i) => (
        <MotionBox
          key={i}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.sin(i) * 20, 0],
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
          sx={{
            position: "absolute",
            width: `${100 + i * 20}px`,
            height: `${100 + i * 20}px`,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)",
            top: `${10 + i * 10}%`,
            left: `${5 + i * 12}%`,
            boxShadow: "0 8px 32px rgba(37, 99, 235, 0.1)",
          }}
        />
      ))}

      {/* AppBar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
          borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
            <MotionBox
              whileHover={{
                scale: 1.1,
                rotate: [0, -5, 5, 0],
                transition: { duration: 0.3 },
              }}
              whileTap={{ scale: 0.95 }}
              sx={{
                width: 56,
                height: 56,
                borderRadius: "16px",
                background: "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(37, 99, 235, 0.3)",
                cursor: "pointer",
              }}
            >
              <img
                src="/android-chrome-192x192.png"
                alt="Smart Parking"
                width={36}
                height={36}
                style={{ borderRadius: "8px" }}
              />
            </MotionBox>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  background:
                    "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontSize: "1.25rem",
                }}
              >
                Smart Parking
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.75rem" }}
              >
                Tra cứu thông tin gửi xe
              </Typography>
            </Box>
          </Box>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 600,
                borderColor: "#e2e8f0",
                color: "#64748b",
                px: 2.5,
                py: 1,
                transition: "all 0.3s",
                "&:hover": {
                  borderColor: "#2563eb",
                  color: "#2563eb",
                  bgcolor: "rgba(37, 99, 235, 0.05)",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)",
                },
              }}
            >
              Đăng xuất
            </Button>
          </motion.div>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          width: "100%",
          maxWidth: "100vw",
          px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 },
          py: { xs: 3, md: 5 },
          position: "relative",
          zIndex: 1,
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <MotionBox
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          sx={{ mb: 3, textAlign: "center" }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Typography
              variant="h2"
              sx={{
                mb: 1.5,
                fontWeight: 800,
                fontSize: {
                  xs: "2rem",
                  sm: "2.25rem",
                  md: "2.5rem",
                },
                background: "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em",
              }}
            >
              Tra cứu thông tin gửi xe
            </Typography>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mb: 3,
                fontSize: { xs: "0.95rem", sm: "1rem", md: "1.05rem" },
                maxWidth: 700,
                mx: "auto",
                fontWeight: 500,
              }}
            >
              Xem lịch sử các lượt gửi xe của bạn
            </Typography>
          </motion.div>
        </MotionBox>

        {/* Loading State */}
        {loading && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 10,
              gap: 2,
            }}
          >
            <CircularProgress size={60} sx={{ color: "#2563eb" }} />
            <Typography variant="body1" color="text.secondary">
              Đang tải dữ liệu...
            </Typography>
          </Box>
        )}

        {/* Error State */}
        {error && !loading && (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{ mb: 3 }}
          >
            <Alert
              severity="error"
              sx={{
                borderRadius: "12px",
                fontSize: "1rem",
              }}
            >
              {error}
            </Alert>
          </MotionBox>
        )}

        {/* Sessions List */}
        {!loading && !error && (
          <AnimatePresence mode="wait">
            {sessions.length === 0 ? (
              <MotionBox
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                sx={{
                  textAlign: "center",
                  py: 10,
                  px: 3,
                }}
              >
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  <DirectionsCarIcon
                    sx={{
                      fontSize: 100,
                      color: "text.secondary",
                      mb: 3,
                      opacity: 0.5,
                    }}
                  />
                </motion.div>
                <Typography
                  variant="h5"
                  color="text.secondary"
                  gutterBottom
                  sx={{ fontWeight: 600, mb: 1 }}
                >
                  Chưa có phiên gửi xe nào
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Lịch sử gửi xe của bạn sẽ hiển thị tại đây
                </Typography>
              </MotionBox>
            ) : (
              <Grid
                container
                spacing={4}
                sx={{
                  width: "100%",
                  maxWidth: "100%",
                  mx: 0,
                  justifyContent: {
                    xs: "center",
                    sm: "flex-start",
                    md: "flex-start",
                  },
                  alignItems: "stretch",
                }}
              >
                {sessions.map((session, index) => {
                  // Check if session is truly completed (has status "end", check_out, and check_out_image_url)
                  const hasCheckout =
                    session.status === "end" &&
                    session.check_out &&
                    session.check_out_image_url;
                  // If not completed, it's still active/packing
                  const isActive = !hasCheckout;
                  const invoiceAmount = invoices[session.id];
                  const isLoadingInvoice = loadingInvoices[session.id];
                  const card = cards[session.id];
                  const isMonthlyCard = card?.type === "monthly";
                  const daysRemaining = card?.monthly_user_expiry
                    ? calculateDaysRemaining(card.monthly_user_expiry)
                    : null;

                  return (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      lg={4}
                      xl={3}
                      key={session.id}
                      sx={{
                        display: "flex",
                        minWidth: 0,
                        width: "100%",
                        flex: "1 !important",
                        maxWidth: "100% !important",
                      }}
                    >
                      <MotionCard
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          delay: index * 0.1,
                          duration: 0.5,
                          type: "spring",
                          stiffness: 100,
                        }}
                        whileHover={{
                          y: -12,
                          transition: { duration: 0.2 },
                        }}
                        sx={{
                          height: "100%",
                          background: "rgba(255, 255, 255, 0.98)",
                          backdropFilter: "blur(20px)",
                          border: `3px solid ${
                            isActive ? "#f59e0b" : "#10b981"
                          }`,
                          boxShadow: `0 8px 24px ${
                            isActive
                              ? "rgba(245, 158, 11, 0.2)"
                              : "rgba(16, 185, 129, 0.2)"
                          }`,
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          borderRadius: "16px",
                          overflow: "hidden",
                          position: "relative",
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "3px",
                            background: isActive
                              ? "linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)"
                              : "linear-gradient(90deg, #10b981 0%, #34d399 100%)",
                          },
                        }}
                      >
                        <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                          {/* Header */}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              mb: 2.5,
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="h5"
                                sx={{
                                  fontWeight: 800,
                                  mb: 1,
                                  fontSize: {
                                    xs: "1.25rem",
                                    sm: "1.4rem",
                                    md: "1.5rem",
                                  },
                                  letterSpacing: "-0.01em",
                                  lineHeight: 1.2,
                                }}
                              >
                                {session.plate || "N/A"}
                              </Typography>
                              <Chip
                                icon={
                                  isActive ? (
                                    <HourglassEmptyIcon sx={{ fontSize: 16 }} />
                                  ) : (
                                    <CheckCircleIcon sx={{ fontSize: 16 }} />
                                  )
                                }
                                label={isActive ? "Đang gửi" : "Đã checkout"}
                                size="medium"
                                sx={{
                                  backgroundColor: isActive
                                    ? "#fef3c7"
                                    : "#d1fae5",
                                  color: isActive ? "#92400e" : "#065f46",
                                  fontWeight: 600,
                                  fontSize: { xs: "0.8rem", sm: "0.85rem" },
                                  height: { xs: 28, sm: 30 },
                                  borderRadius: "8px",
                                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                                  px: 0.75,
                                }}
                              />
                            </Box>
                          </Box>

                          {/* Main Content: Images (Left 50%) and Details (Right 50%) */}
                          <Box
                            sx={{
                              display: "flex",
                              gap: 2.5,
                              flexDirection: { xs: "column", md: "row" },
                              alignItems: { xs: "stretch", md: "stretch" },
                            }}
                          >
                            {/* Part 1: Images - 50% width, 2 images side by side */}
                            <Box
                              sx={{
                                width: { xs: "100%", md: "50%" },
                                flexShrink: 0,
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <Grid
                                container
                                spacing={2}
                                sx={{ height: "100%" }}
                              >
                                {/* Check-in Image */}
                                <Grid item xs={6} sx={{ display: "flex" }}>
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{ width: "100%", height: "100%" }}
                                  >
                                    <Box
                                      sx={{
                                        position: "relative",
                                        borderRadius: "12px",
                                        overflow: "hidden",
                                        width: "100%",
                                        height: "100%",
                                        minHeight: "200px",
                                        cursor: session.check_in_image_url
                                          ? "pointer"
                                          : "default",
                                        border: "2px solid #e2e8f0",
                                        transition: "all 0.3s",
                                        boxShadow:
                                          "0 2px 8px rgba(0, 0, 0, 0.08)",
                                        "&:hover": session.check_in_image_url
                                          ? {
                                              borderColor: "#2563eb",
                                              boxShadow:
                                                "0 4px 16px rgba(37, 99, 235, 0.2)",
                                              "& .zoom-icon": {
                                                opacity: 1,
                                              },
                                            }
                                          : {},
                                      }}
                                      onClick={() =>
                                        session.check_in_image_url &&
                                        handleImageClick(
                                          session.check_in_image_url,
                                          session.plate,
                                          "checkin"
                                        )
                                      }
                                    >
                                      {session.check_in_image_url ? (
                                        <>
                                          <img
                                            src={session.check_in_image_url}
                                            alt="Check-in"
                                            style={{
                                              width: "100%",
                                              height: "100%",
                                              objectFit: "cover",
                                            }}
                                          />
                                          <Box
                                            sx={{
                                              position: "absolute",
                                              top: 0,
                                              left: 0,
                                              right: 0,
                                              bgcolor: "rgba(0, 0, 0, 0.7)",
                                              color: "white",
                                              px: 1,
                                              py: 0.5,
                                              textAlign: "center",
                                              fontSize: "0.7rem",
                                              fontWeight: 600,
                                              letterSpacing: "0.3px",
                                            }}
                                          >
                                            CHECK-IN
                                          </Box>
                                          <Box
                                            className="zoom-icon"
                                            sx={{
                                              position: "absolute",
                                              bottom: 6,
                                              right: 6,
                                              bgcolor: "rgba(37, 99, 235, 0.9)",
                                              borderRadius: "50%",
                                              width: 28,
                                              height: 28,
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              opacity: 0,
                                              transition: "opacity 0.3s",
                                              boxShadow:
                                                "0 2px 8px rgba(37, 99, 235, 0.4)",
                                            }}
                                          >
                                            <ZoomInIcon
                                              sx={{
                                                color: "white",
                                                fontSize: 16,
                                              }}
                                            />
                                          </Box>
                                        </>
                                      ) : (
                                        <Box
                                          sx={{
                                            width: "100%",
                                            height: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            bgcolor: "#f1f5f9",
                                            color: "#64748b",
                                          }}
                                        >
                                          <ImageIcon
                                            sx={{ fontSize: 28, mb: 0.5 }}
                                          />
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              fontWeight: 600,
                                              fontSize: "0.7rem",
                                            }}
                                          >
                                            Chưa có ảnh
                                          </Typography>
                                        </Box>
                                      )}
                                    </Box>
                                  </motion.div>
                                </Grid>

                                {/* Check-out Image */}
                                <Grid item xs={6} sx={{ display: "flex" }}>
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{ width: "100%", height: "100%" }}
                                  >
                                    <Box
                                      sx={{
                                        position: "relative",
                                        borderRadius: "12px",
                                        overflow: "hidden",
                                        width: "100%",
                                        height: "100%",
                                        minHeight: "200px",
                                        cursor: session.check_out_image_url
                                          ? "pointer"
                                          : "default",
                                        border: "2px solid #e2e8f0",
                                        transition: "all 0.3s",
                                        boxShadow:
                                          "0 2px 8px rgba(0, 0, 0, 0.08)",
                                        "&:hover": session.check_out_image_url
                                          ? {
                                              borderColor: "#2563eb",
                                              boxShadow:
                                                "0 4px 16px rgba(37, 99, 235, 0.2)",
                                              "& .zoom-icon": {
                                                opacity: 1,
                                              },
                                            }
                                          : {},
                                      }}
                                      onClick={() =>
                                        session.check_out_image_url &&
                                        handleImageClick(
                                          session.check_out_image_url,
                                          session.plate,
                                          "checkout"
                                        )
                                      }
                                    >
                                      {session.check_out_image_url ? (
                                        <>
                                          <img
                                            src={session.check_out_image_url}
                                            alt="Check-out"
                                            style={{
                                              width: "100%",
                                              height: "100%",
                                              objectFit: "cover",
                                            }}
                                          />
                                          <Box
                                            sx={{
                                              position: "absolute",
                                              top: 0,
                                              left: 0,
                                              right: 0,
                                              bgcolor: "rgba(0, 0, 0, 0.7)",
                                              color: "white",
                                              px: 1,
                                              py: 0.5,
                                              textAlign: "center",
                                              fontSize: "0.7rem",
                                              fontWeight: 600,
                                              letterSpacing: "0.3px",
                                            }}
                                          >
                                            CHECK-OUT
                                          </Box>
                                          <Box
                                            className="zoom-icon"
                                            sx={{
                                              position: "absolute",
                                              bottom: 6,
                                              right: 6,
                                              bgcolor: "rgba(37, 99, 235, 0.9)",
                                              borderRadius: "50%",
                                              width: 28,
                                              height: 28,
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              opacity: 0,
                                              transition: "opacity 0.3s",
                                              boxShadow:
                                                "0 2px 8px rgba(37, 99, 235, 0.4)",
                                            }}
                                          >
                                            <ZoomInIcon
                                              sx={{
                                                color: "white",
                                                fontSize: 16,
                                              }}
                                            />
                                          </Box>
                                        </>
                                      ) : (
                                        <Box
                                          sx={{
                                            width: "100%",
                                            height: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            bgcolor: "#f1f5f9",
                                            color: "#64748b",
                                          }}
                                        >
                                          <ImageIcon
                                            sx={{ fontSize: 28, mb: 0.5 }}
                                          />
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              fontWeight: 600,
                                              textAlign: "center",
                                              fontSize: "0.7rem",
                                            }}
                                          >
                                            {isActive
                                              ? "Chưa checkout"
                                              : "Chưa có ảnh"}
                                          </Typography>
                                        </Box>
                                      )}
                                    </Box>
                                  </motion.div>
                                </Grid>
                              </Grid>
                            </Box>

                            {/* Part 2: Details - 50% width, divided into 2 columns */}
                            <Box
                              sx={{
                                width: { xs: "100%", md: "50%" },
                                flexShrink: 0,
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <Grid
                                container
                                spacing={1.5}
                                sx={{ height: "100%" }}
                              >
                                {/* Left Column */}
                                <Grid item xs={6} sx={{ display: "flex" }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 1.5,
                                      width: "100%",
                                      height: "100%",
                                    }}
                                  >
                                    <Paper
                                      elevation={0}
                                      sx={{
                                        p: { xs: 2, sm: 2.5 },
                                        borderRadius: "12px",
                                        bgcolor: "#f8fafc",
                                        border: "1.5px solid #e2e8f0",
                                        transition: "all 0.3s",
                                        flex: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                        "&:hover": {
                                          borderColor: "#2563eb",
                                          boxShadow:
                                            "0 2px 8px rgba(37, 99, 235, 0.1)",
                                        },
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          gap: 1.5,
                                          height: "100%",
                                        }}
                                      >
                                        <AccessTimeIcon
                                          sx={{
                                            fontSize: { xs: 24, sm: 28 },
                                            color: "#2563eb",
                                            flexShrink: 0,
                                          }}
                                        />
                                        <Box sx={{ flex: 1 }}>
                                          <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{
                                              display: "block",
                                              mb: 1,
                                              fontWeight: 600,
                                              textTransform: "uppercase",
                                              letterSpacing: "0.5px",
                                              fontSize: {
                                                xs: "0.75rem",
                                                sm: "0.8rem",
                                              },
                                            }}
                                          >
                                            Thời gian vào
                                          </Typography>
                                          <Typography
                                            variant="body1"
                                            fontWeight={600}
                                            sx={{
                                              fontSize: {
                                                xs: "0.95rem",
                                                sm: "1.05rem",
                                              },
                                              lineHeight: 1.4,
                                            }}
                                          >
                                            {formatDateTime(session.check_in)}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </Paper>

                                    {isMonthlyCard && (
                                      <Paper
                                        elevation={0}
                                        sx={{
                                          p: { xs: 2, sm: 2.5 },
                                          borderRadius: "12px",
                                          bgcolor: "#f8fafc",
                                          border: "1.5px solid #e2e8f0",
                                          transition: "all 0.3s",
                                          flex: 1,
                                          display: "flex",
                                          flexDirection: "column",
                                          "&:hover": {
                                            borderColor: "#2563eb",
                                            boxShadow:
                                              "0 2px 8px rgba(37, 99, 235, 0.1)",
                                          },
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 1.5,
                                            height: "100%",
                                          }}
                                        >
                                          <CreditCardIcon
                                            sx={{
                                              fontSize: { xs: 24, sm: 28 },
                                              color: "#2563eb",
                                              flexShrink: 0,
                                            }}
                                          />
                                          <Box sx={{ flex: 1 }}>
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                              sx={{
                                                display: "block",
                                                mb: 1,
                                                fontWeight: 600,
                                                textTransform: "uppercase",
                                                letterSpacing: "0.5px",
                                                fontSize: {
                                                  xs: "0.75rem",
                                                  sm: "0.8rem",
                                                },
                                              }}
                                            >
                                              Loại vé
                                            </Typography>
                                            {loadingCards[session.id] ? (
                                              <CircularProgress
                                                size={20}
                                                sx={{ color: "#2563eb" }}
                                              />
                                            ) : (
                                              <Typography
                                                variant="body1"
                                                fontWeight={600}
                                                sx={{
                                                  fontSize: {
                                                    xs: "0.95rem",
                                                    sm: "1.05rem",
                                                  },
                                                  lineHeight: 1.4,
                                                }}
                                              >
                                                Vé tháng
                                              </Typography>
                                            )}
                                          </Box>
                                        </Box>
                                      </Paper>
                                    )}

                                    {hasCheckout && (
                                      <Paper
                                        elevation={0}
                                        sx={{
                                          p: { xs: 2, sm: 2.5 },
                                          borderRadius: "12px",
                                          bgcolor: "#f8fafc",
                                          border: "1.5px solid #e2e8f0",
                                          transition: "all 0.3s",
                                          flex: 1,
                                          display: "flex",
                                          flexDirection: "column",
                                          "&:hover": {
                                            borderColor: "#2563eb",
                                            boxShadow:
                                              "0 2px 8px rgba(37, 99, 235, 0.1)",
                                          },
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 1.5,
                                            height: "100%",
                                          }}
                                        >
                                          <CheckCircleIcon
                                            sx={{
                                              fontSize: { xs: 24, sm: 28 },
                                              color: "#2563eb",
                                              flexShrink: 0,
                                            }}
                                          />
                                          <Box sx={{ flex: 1 }}>
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                              sx={{
                                                display: "block",
                                                mb: 1,
                                                fontWeight: 600,
                                                textTransform: "uppercase",
                                                letterSpacing: "0.5px",
                                                fontSize: {
                                                  xs: "0.75rem",
                                                  sm: "0.8rem",
                                                },
                                              }}
                                            >
                                              Thời gian checkout
                                            </Typography>
                                            <Typography
                                              variant="body1"
                                              fontWeight={600}
                                              sx={{
                                                fontSize: {
                                                  xs: "0.95rem",
                                                  sm: "1.05rem",
                                                },
                                                lineHeight: 1.4,
                                              }}
                                            >
                                              {formatDateTime(
                                                session.check_out
                                              )}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      </Paper>
                                    )}
                                  </Box>
                                </Grid>

                                {/* Right Column */}
                                <Grid item xs={6} sx={{ display: "flex" }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 1.5,
                                      width: "100%",
                                      height: "100%",
                                    }}
                                  >
                                    {isMonthlyCard && (
                                      <Paper
                                        elevation={0}
                                        sx={{
                                          p: { xs: 2, sm: 2.5 },
                                          borderRadius: "12px",
                                          bgcolor: "#f8fafc",
                                          border: "1.5px solid #e2e8f0",
                                          transition: "all 0.3s",
                                          flex: 1,
                                          display: "flex",
                                          flexDirection: "column",
                                          "&:hover": {
                                            borderColor: "#2563eb",
                                            boxShadow:
                                              "0 2px 8px rgba(37, 99, 235, 0.1)",
                                          },
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 1.5,
                                            height: "100%",
                                          }}
                                        >
                                          <CalendarTodayIcon
                                            sx={{
                                              fontSize: { xs: 24, sm: 28 },
                                              color: "#2563eb",
                                              flexShrink: 0,
                                            }}
                                          />
                                          <Box sx={{ flex: 1 }}>
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                              sx={{
                                                display: "block",
                                                mb: 1,
                                                fontWeight: 600,
                                                textTransform: "uppercase",
                                                letterSpacing: "0.5px",
                                                fontSize: {
                                                  xs: "0.75rem",
                                                  sm: "0.8rem",
                                                },
                                              }}
                                            >
                                              Số ngày còn hiệu lực
                                            </Typography>
                                            {loadingCards[session.id] ? (
                                              <CircularProgress
                                                size={20}
                                                sx={{ color: "#2563eb" }}
                                              />
                                            ) : (
                                              <Typography
                                                variant="body1"
                                                fontWeight={600}
                                                sx={{
                                                  fontSize: {
                                                    xs: "0.95rem",
                                                    sm: "1.05rem",
                                                  },
                                                  lineHeight: 1.4,
                                                  color:
                                                    daysRemaining !== null &&
                                                    daysRemaining <= 7
                                                      ? "#DC2626"
                                                      : "inherit",
                                                }}
                                              >
                                                {formatDaysRemaining(
                                                  daysRemaining
                                                )}
                                              </Typography>
                                            )}
                                          </Box>
                                        </Box>
                                      </Paper>
                                    )}

                                    {hasCheckout && (
                                      <>
                                        <Paper
                                          elevation={0}
                                          sx={{
                                            p: { xs: 2, sm: 2.5 },
                                            borderRadius: "12px",
                                            bgcolor: "#f8fafc",
                                            border: "1.5px solid #e2e8f0",
                                            transition: "all 0.3s",
                                            flex: 1,
                                            display: "flex",
                                            flexDirection: "column",
                                            "&:hover": {
                                              borderColor: "#2563eb",
                                              boxShadow:
                                                "0 2px 8px rgba(37, 99, 235, 0.1)",
                                            },
                                          }}
                                        >
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              gap: 1.5,
                                              height: "100%",
                                            }}
                                          >
                                            <AccessTimeIcon
                                              sx={{
                                                fontSize: { xs: 24, sm: 28 },
                                                color: "#2563eb",
                                                flexShrink: 0,
                                              }}
                                            />
                                            <Box sx={{ flex: 1 }}>
                                              <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                  display: "block",
                                                  mb: 1,
                                                  fontWeight: 600,
                                                  textTransform: "uppercase",
                                                  letterSpacing: "0.5px",
                                                  fontSize: {
                                                    xs: "0.75rem",
                                                    sm: "0.8rem",
                                                  },
                                                }}
                                              >
                                                Thời gian gửi
                                              </Typography>
                                              <Typography
                                                variant="body1"
                                                fontWeight={600}
                                                sx={{
                                                  fontSize: {
                                                    xs: "0.95rem",
                                                    sm: "1.05rem",
                                                  },
                                                  lineHeight: 1.4,
                                                }}
                                              >
                                                {calculateDuration(
                                                  session.check_in,
                                                  session.check_out
                                                )}
                                              </Typography>
                                            </Box>
                                          </Box>
                                        </Paper>

                                        <Paper
                                          elevation={0}
                                          sx={{
                                            p: { xs: 2, sm: 2.5 },
                                            borderRadius: "12px",
                                            bgcolor: "#f8fafc",
                                            border: "1.5px solid #e2e8f0",
                                            transition: "all 0.3s",
                                            flex: 1,
                                            display: "flex",
                                            flexDirection: "column",
                                            "&:hover": {
                                              borderColor: "#2563eb",
                                              boxShadow:
                                                "0 2px 8px rgba(37, 99, 235, 0.1)",
                                            },
                                          }}
                                        >
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              gap: 1.5,
                                              height: "100%",
                                            }}
                                          >
                                            <ReceiptIcon
                                              sx={{
                                                fontSize: { xs: 24, sm: 28 },
                                                color: "#2563eb",
                                                flexShrink: 0,
                                              }}
                                            />
                                            <Box sx={{ flex: 1 }}>
                                              <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                  display: "block",
                                                  mb: 1,
                                                  fontWeight: 600,
                                                  textTransform: "uppercase",
                                                  letterSpacing: "0.5px",
                                                  fontSize: {
                                                    xs: "0.75rem",
                                                    sm: "0.8rem",
                                                  },
                                                }}
                                              >
                                                Số tiền đã thanh toán
                                              </Typography>
                                              {isLoadingInvoice ? (
                                                <Box
                                                  sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1,
                                                  }}
                                                >
                                                  <CircularProgress
                                                    size={20}
                                                    sx={{ color: "#2563eb" }}
                                                  />
                                                  <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                      fontSize: {
                                                        xs: "0.85rem",
                                                        sm: "0.9rem",
                                                      },
                                                    }}
                                                  >
                                                    Đang tải...
                                                  </Typography>
                                                </Box>
                                              ) : (
                                                <Typography
                                                  variant="body1"
                                                  fontWeight={600}
                                                  sx={{
                                                    fontSize: {
                                                      xs: "0.95rem",
                                                      sm: "1.05rem",
                                                    },
                                                    lineHeight: 1.4,
                                                  }}
                                                >
                                                  {invoiceAmount
                                                    ? formatCurrency(
                                                        invoiceAmount
                                                      )
                                                    : "-"}
                                                </Typography>
                                              )}
                                            </Box>
                                          </Box>
                                        </Paper>
                                      </>
                                    )}
                                  </Box>
                                </Grid>
                              </Grid>
                            </Box>
                          </Box>
                        </CardContent>
                      </MotionCard>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </AnimatePresence>
        )}
      </Box>

      {/* Enhanced Lightbox Dialog */}
      <Dialog
        open={lightboxOpen}
        onClose={handleCloseLightbox}
        maxWidth={false}
        fullWidth
        TransitionComponent={Zoom}
        transitionDuration={400}
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: "transparent",
            boxShadow: "none",
            overflow: "visible",
            maxWidth: "none",
            maxHeight: "none",
            margin: 0,
            borderRadius: 0,
          },
          "& .MuiBackdrop-root": {
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            backdropFilter: "blur(10px)",
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <IconButton
              onClick={handleCloseLightbox}
              sx={{
                position: "fixed",
                top: 24,
                right: 24,
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                color: "white",
                zIndex: 1000,
                width: 48,
                height: 48,
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  transform: "scale(1.1)",
                },
                transition: "all 0.3s",
              }}
            >
              <CloseIcon sx={{ fontSize: 28 }} />
            </IconButton>
          </motion.div>

          {selectedImage && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Paper
                elevation={0}
                sx={{
                  position: "absolute",
                  top: 24,
                  left: 24,
                  bgcolor: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  px: 3,
                  py: 1.5,
                  borderRadius: "12px",
                  zIndex: 999,
                  backdropFilter: "blur(10px)",
                }}
              >
                <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                  {selectedImage.plate}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {selectedImage.type === "checkin" ? "Check-in" : "Check-out"}
                </Typography>
              </Paper>
              <img
                src={selectedImage.url}
                alt={`${selectedImage.type} - ${selectedImage.plate}`}
                style={{
                  maxWidth: "95vw",
                  maxHeight: "95vh",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                  borderRadius: "12px",
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
                }}
              />
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
