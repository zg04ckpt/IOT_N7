"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Grid,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  TablePagination,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import LoadingScreen from "../components/LoadingScreen";
import AddIcon from "@mui/icons-material/Add";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import WarningIcon from "@mui/icons-material/Warning";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import SortIcon from "@mui/icons-material/Sort";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import { CiTrash } from "react-icons/ci";
import {
  getAllCards,
  deleteCard,
  registerMonthlyCard,
  unregisterMonthlyCard,
} from "../api/card";
import { useSnackbar } from "../contexts/SnackbarContext";

const MotionCard = motion(Card);
const MotionBox = motion(Box);

export default function CardManagement() {
  const { showSuccess, showError } = useSnackbar();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("add");
  const [selectedCard, setSelectedCard] = useState(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [searchName, setSearchName] = useState("");
  const [searchCustomerName, setSearchCustomerName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [filterType, setFilterType] = useState("Vé lượt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [unregisterConfirmDialog, setUnregisterConfirmDialog] = useState(false);
  const [cardToUnregister, setCardToUnregister] = useState(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllCards();
        if (response.success) {
          setCards(response.data || []);
        } else {
          setError("Không thể tải dữ liệu vé xe");
        }
      } catch (err) {
        console.error("Error fetching cards:", err);
        // Nếu là lỗi 403, để axios interceptor xử lý redirect
        if (err.response?.status === 403) {
          return;
        }
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredData = cards
    .filter((card) => {
      // Filter theo loại vé
      const matchType =
        (card.type === "normal" ? "Vé lượt" : "Vé tháng") === filterType;

      if (!matchType) return false;

      // Filter theo UID (cho cả 2 loại)
      const matchUid = (card.uid || "")
        .toLowerCase()
        .includes(searchName.toLowerCase());

      // Filter theo tên và số điện thoại (chỉ cho vé tháng)
      if (filterType === "Vé tháng" && card.type === "monthly") {
        const matchCustomerName = (card.monthly_user_name || "")
          .toLowerCase()
          .includes(searchCustomerName.toLowerCase());
        const matchPhone = (card.monthly_user_phone || "")
          .toLowerCase()
          .includes(searchPhone.toLowerCase());
        return matchUid && matchCustomerName && matchPhone;
      }

      return matchUid;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at || a.createdAt);
      const dateB = new Date(b.created_at || b.createdAt);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
    trigger,
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      cardId: "",
      name: "",
      phone: "",
      months: "",
      address: "",
    },
  });

  const handleOpenDialog = () => {
    setDialogType("add");
    setSelectedCard(null);
    reset({
      cardId: "",
      name: "",
      phone: "",
      months: "",
      address: "",
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    reset();
  };

  const handleSaveCard = async (formData) => {
    try {
      setRefreshing(true);
      setError(null);

      const response = await registerMonthlyCard(formData.cardId, {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        months: Number(formData.months),
        address: formData.address.trim(),
      });

      if (response && response.success) {
        const cardsResponse = await getAllCards();
        if (cardsResponse.success) {
          setCards(cardsResponse.data || []);
        }
        handleCloseDialog();
        showSuccess("Đăng ký vé tháng thành công!");
      }
    } catch (error) {
      console.error("Error registering monthly card:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Không thể đăng ký vé tháng. Vui lòng thử lại.";
      showError(errorMessage);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteClick = (id) => {
    setCardToDelete(id);
    setDeleteConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await deleteCard(cardToDelete);
      if (response.success) {
        const cardsResponse = await getAllCards();
        if (cardsResponse.success) {
          setCards(cardsResponse.data || []);
        }
        setDeleteConfirmDialog(false);
        setCardToDelete(null);
        showSuccess("Xóa vé xe thành công!");
      }
    } catch (error) {
      console.error("Error deleting card:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Không thể xóa vé xe. Vui lòng thử lại.";
      showError(errorMessage);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await getAllCards();
      if (response.success) {
        setCards(response.data || []);
        setSearchName("");
        setSearchCustomerName("");
        setSearchPhone("");
        setFilterType("Vé lượt");
        setPage(0);
      } else {
        setError("Không thể tải dữ liệu vé xe");
      }
    } catch (err) {
      console.error("Error refreshing cards:", err);
      // Nếu là lỗi 403, để axios interceptor xử lý redirect
      if (err.response?.status === 403) {
        return;
      }
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleUnregisterClick = (id) => {
    setCardToUnregister(id);
    setUnregisterConfirmDialog(true);
  };

  const handleConfirmUnregister = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await unregisterMonthlyCard(cardToUnregister);
      if (response.success) {
        const cardsResponse = await getAllCards();
        if (cardsResponse.success) {
          setCards(cardsResponse.data || []);
        }
        setUnregisterConfirmDialog(false);
        setCardToUnregister(null);
        showSuccess("Hủy đăng ký vé tháng thành công!");
      }
    } catch (error) {
      console.error("Error unregistering monthly card:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Không thể hủy đăng ký vé tháng. Vui lòng thử lại.";
      showError(errorMessage);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSortToggle = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  if (loading) {
    return <LoadingScreen message="Đang tải dữ liệu vé xe..." />;
  }

  if (error) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
          sx={{
            background: "linear-gradient(135deg, #1e88e5 0%, #00bcd4 100%)",
            borderRadius: "10px",
          }}
        >
          Thử lại
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <MotionBox
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h2"
            sx={{ mb: 1, fontSize: { xs: "1.8rem", sm: "2.5rem" } }}
          >
            Quản lý vé xe
          </Typography>
          <Typography color="textSecondary">
            Quản lý các loại vé xe trong hệ thống
          </Typography>
        </Box>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog("add")}
            sx={{
              background: "linear-gradient(135deg, #1e88e5 0%, #00bcd4 100%)",
              borderRadius: "10px",
              fontWeight: 600,
              textTransform: "none",
              fontSize: "1rem",
              px: 3,
              py: 1.5,
              boxShadow: "0 4px 12px rgba(30, 136, 229, 0.3)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(30, 136, 229, 0.4)",
                transform: "translateY(-2px)",
              },
            }}
          >
            Đăng ký vé tháng
          </Button>
        </motion.div>
      </MotionBox>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          {
            label: "Tổng vé xe",
            value: cards.length,
            color: "#1e88e5",
            delay: 0.1,
          },
          {
            label: "Vé lượt",
            value: cards.filter((c) => c.type === "normal").length,
            color: "#1976d2",
            delay: 0.2,
          },
          {
            label: "Vé tháng",
            value: cards.filter((c) => c.type === "monthly").length,
            color: "#7b1fa2",
            delay: 0.3,
          },
        ].map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay, duration: 0.5 }}
              sx={{
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                transition: "all 0.3s",
                "&:hover": {
                  boxShadow: `0 4px 16px ${stat.color}30`,
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box>
                    <Typography
                      color="textSecondary"
                      gutterBottom
                      sx={{ fontSize: "0.9rem" }}
                    >
                      {stat.label}
                    </Typography>
                    <Typography
                      variant="h3"
                      sx={{ color: stat.color, fontWeight: 700 }}
                    >
                      {stat.value}
                    </Typography>
                  </Box>
                  <CreditCardIcon
                    sx={{ color: stat.color, opacity: 0.3, fontSize: 32 }}
                  />
                </Box>
              </CardContent>
            </MotionCard>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        sx={{ mb: 3, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}
      >
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <TextField
                  fullWidth
                  placeholder="Nhập UID thẻ..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      transition: "all 0.3s",
                      "&:hover": {
                        boxShadow: "0 2px 8px rgba(30, 136, 229, 0.15)",
                      },
                      "&.Mui-focused": {
                        boxShadow: "0 4px 12px rgba(30, 136, 229, 0.25)",
                      },
                    },
                  }}
                />
              </motion.div>
            </Grid>
            {filterType === "Vé tháng" && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <TextField
                      fullWidth
                      placeholder="Nhập tên khách hàng..."
                      value={searchCustomerName}
                      onChange={(e) => setSearchCustomerName(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: "text.secondary" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                          transition: "all 0.3s",
                          "&:hover": {
                            boxShadow: "0 2px 8px rgba(30, 136, 229, 0.15)",
                          },
                          "&.Mui-focused": {
                            boxShadow: "0 4px 12px rgba(30, 136, 229, 0.25)",
                          },
                        },
                      }}
                    />
                  </motion.div>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <TextField
                      fullWidth
                      placeholder="Nhập số điện thoại..."
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: "text.secondary" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                          transition: "all 0.3s",
                          "&:hover": {
                            boxShadow: "0 2px 8px rgba(30, 136, 229, 0.15)",
                          },
                          "&.Mui-focused": {
                            boxShadow: "0 4px 12px rgba(30, 136, 229, 0.25)",
                          },
                        },
                      }}
                    />
                  </motion.div>
                </Grid>
              </>
            )}
            <Grid item xs={12} sm={6} md={filterType === "Vé tháng" ? 2 : 3}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FormControl fullWidth>
                  <InputLabel id="type-select-label" shrink>
                    Loại vé
                  </InputLabel>
                  <Select
                    labelId="type-select-label"
                    id="type-select"
                    value={filterType || "Vé lượt"}
                    label="Loại vé"
                    displayEmpty={false}
                    onChange={(e) => {
                      setFilterType(e.target.value);
                      setSearchCustomerName("");
                      setSearchPhone("");
                      setPage(0);
                    }}
                    sx={{
                      borderRadius: "10px",
                      transition: "all 0.3s",
                      "& .MuiOutlinedInput-root": {
                        transition: "all 0.3s",
                        "&:hover": {
                          boxShadow: "0 2px 8px rgba(30, 136, 229, 0.15)",
                        },
                        "&.Mui-focused": {
                          boxShadow: "0 4px 12px rgba(30, 136, 229, 0.25)",
                        },
                      },
                    }}
                  >
                    <MenuItem value="Vé lượt">Vé lượt</MenuItem>
                    <MenuItem value="Vé tháng">Vé tháng</MenuItem>
                  </Select>
                </FormControl>
              </motion.div>
            </Grid>
            <Grid item xs={6} sm={3} md={1}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Tooltip title="Sắp xếp theo thời gian" placement="top" arrow>
                  <IconButton
                    onClick={handleSortToggle}
                    sx={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "10px",
                      color: "#1e88e5",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "scale(1.1)",
                        bgcolor: "rgba(30, 136, 229, 0.1)",
                      },
                    }}
                  >
                    <SortIcon
                      sx={{
                        fontSize: "24px",
                        transform:
                          sortOrder === "desc"
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                      }}
                    />
                  </IconButton>
                </Tooltip>
              </motion.div>
            </Grid>
            <Grid item xs={6} sm={3} md={1}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Tooltip title="Làm mới dữ liệu" placement="top" arrow>
                  <IconButton
                    onClick={handleRefresh}
                    disabled={refreshing}
                    sx={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "10px",
                      color: "#1e88e5",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "rotate(180deg)",
                        bgcolor: "rgba(30, 136, 229, 0.1)",
                      },
                      "&:disabled": {
                        color: "#ccc",
                        bgcolor: "#f5f5f5",
                      },
                    }}
                  >
                    <RefreshIcon sx={{ fontSize: "24px" }} />
                  </IconButton>
                </Tooltip>
              </motion.div>
            </Grid>
          </Grid>
        </CardContent>
      </MotionCard>

      {/* Table */}
      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        sx={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)", overflowX: "auto" }}
      >
        <CardContent sx={{ p: 0, position: "relative" }}>
          {refreshing && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <CircularProgress size={40} sx={{ color: "#1e88e5", mb: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Đang làm mới dữ liệu...
                </Typography>
              </Box>
            </Box>
          )}
          <TableContainer>
            <Table sx={{ tableLayout: "fixed" }}>
              <TableHead>
                <TableRow
                  sx={{
                    borderBottom: "2px solid",
                    borderColor: "divider",
                    bgcolor: "rgba(30, 136, 229, 0.05)",
                  }}
                >
                  {filterType === "Vé lượt" ? (
                    <>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          color: "text.primary",
                          width: "33.33%",
                        }}
                      >
                        UID
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          color: "text.primary",
                          width: "33.33%",
                        }}
                      >
                        Loại vé
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          color: "text.primary",
                          width: "33.33%",
                        }}
                      >
                        Hành động
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          color: "text.primary",
                          width: "12%",
                        }}
                      >
                        UID
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          color: "text.primary",
                          width: "10%",
                        }}
                      >
                        Loại vé
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          color: "text.primary",
                          width: "15%",
                        }}
                      >
                        Tên khách hàng
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          color: "text.primary",
                          width: "12%",
                        }}
                      >
                        Số điện thoại
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          color: "text.primary",
                          width: "10%",
                        }}
                      >
                        Ngày đăng ký
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          color: "text.primary",
                          width: "10%",
                        }}
                      >
                        Ngày hết hạn
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          color: "text.primary",
                          width: "10%",
                        }}
                      >
                        Địa chỉ
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          color: "text.primary",
                          width: "25%",
                        }}
                      >
                        Hành động
                      </TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((card, index) => (
                  <motion.tr
                    key={card.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05, duration: 0.3 }}
                  >
                    {filterType === "Vé lượt" ? (
                      <>
                        <TableCell
                          align="center"
                          sx={{
                            fontWeight: 600,
                            py: 2,
                            width: "33.33%",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              wordBreak: "break-word",
                            }}
                          >
                            {card.uid || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            py: 2,
                            width: "33.33%",
                          }}
                        >
                          <motion.div whileHover={{ scale: 1.05 }}>
                            <Chip
                              icon={
                                <DirectionsCarIcon
                                  sx={{
                                    fontSize: "14px !important",
                                    color: "#e65100 !important",
                                  }}
                                />
                              }
                              label="Vé lượt"
                              size="small"
                              sx={{
                                backgroundColor: "#fff3e0",
                                color: "#e65100",
                                fontWeight: 600,
                                borderRadius: "8px",
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                fontSize: "0.75rem",
                                "& .MuiChip-icon": {
                                  marginLeft: "8px",
                                },
                              }}
                            />
                          </motion.div>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            py: 2,
                            width: "33.33%",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              justifyContent: "center",
                              flexWrap: "wrap",
                            }}
                          >
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Tooltip title="Xóa">
                                <Button
                                  size="small"
                                  startIcon={<CiTrash />}
                                  color="error"
                                  onClick={() => handleDeleteClick(card.id)}
                                  sx={{
                                    borderRadius: "8px",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    fontSize: "0.75rem",
                                    px: 1.5,
                                    py: 0.5,
                                    transition: "all 0.3s",
                                    "&:hover": {
                                      bgcolor: "rgba(244, 67, 54, 0.1)",
                                    },
                                  }}
                                >
                                  Xóa
                                </Button>
                              </Tooltip>
                            </motion.div>
                          </Box>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell
                          align="center"
                          sx={{
                            fontWeight: 600,
                            py: 2,
                            width: "12%",
                            minWidth: "100px",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              wordBreak: "break-word",
                            }}
                          >
                            {card.uid || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            py: 2,
                            width: "10%",
                            minWidth: "80px",
                          }}
                        >
                          <motion.div whileHover={{ scale: 1.05 }}>
                            <Chip
                              icon={
                                <ConfirmationNumberIcon
                                  sx={{
                                    fontSize: "14px !important",
                                    color: "#7b1fa2 !important",
                                  }}
                                />
                              }
                              label="Vé tháng"
                              size="small"
                              sx={{
                                backgroundColor: "#f3e5f5",
                                color: "#7b1fa2",
                                fontWeight: 600,
                                borderRadius: "8px",
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                fontSize: "0.75rem",
                                "& .MuiChip-icon": {
                                  marginLeft: "8px",
                                },
                              }}
                            />
                          </motion.div>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            py: 2,
                            width: "15%",
                            minWidth: "120px",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              wordBreak: "break-word",
                            }}
                          >
                            {card.monthly_user_name || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            py: 2,
                            width: "12%",
                            minWidth: "100px",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              wordBreak: "break-word",
                            }}
                          >
                            {card.monthly_user_phone || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            py: 2,
                            width: "10%",
                            minWidth: "100px",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              wordBreak: "break-word",
                            }}
                          >
                            {card.updated_at
                              ? (() => {
                                  const date = new Date(card.updated_at);
                                  const day = String(date.getDate()).padStart(
                                    2,
                                    "0"
                                  );
                                  const month = String(
                                    date.getMonth() + 1
                                  ).padStart(2, "0");
                                  const year = date.getFullYear();
                                  return `${day}/${month}/${year}`;
                                })()
                              : "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            py: 2,
                            width: "10%",
                            minWidth: "100px",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              wordBreak: "break-word",
                            }}
                          >
                            {card.monthly_user_expiry
                              ? (() => {
                                  const date = new Date(
                                    card.monthly_user_expiry
                                  );
                                  const day = String(date.getDate()).padStart(
                                    2,
                                    "0"
                                  );
                                  const month = String(
                                    date.getMonth() + 1
                                  ).padStart(2, "0");
                                  const year = date.getFullYear();
                                  return `${day}/${month}/${year}`;
                                })()
                              : "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            py: 2,
                            width: "10%",
                            minWidth: "100px",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              wordBreak: "break-word",
                            }}
                          >
                            {card.monthly_user_address || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            py: 2,
                            width: "27%",
                            minWidth: "200px",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              justifyContent: "center",
                              flexWrap: "wrap",
                            }}
                          >
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Tooltip title="Hủy đăng ký">
                                <Button
                                  size="small"
                                  startIcon={<CiTrash />}
                                  onClick={() => handleUnregisterClick(card.id)}
                                  sx={{
                                    borderRadius: "8px",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    color: "#ff9800",
                                    fontSize: "0.75rem",
                                    px: 1.5,
                                    py: 0.5,
                                    transition: "all 0.3s",
                                    "&:hover": {
                                      bgcolor: "rgba(255, 152, 0, 0.1)",
                                    },
                                  }}
                                >
                                  Hủy đăng ký
                                </Button>
                              </Tooltip>
                            </motion.div>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Tooltip title="Xóa">
                                <Button
                                  size="small"
                                  startIcon={<CiTrash />}
                                  color="error"
                                  onClick={() => handleDeleteClick(card.id)}
                                  sx={{
                                    borderRadius: "8px",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    fontSize: "0.75rem",
                                    px: 1.5,
                                    py: 0.5,
                                    transition: "all 0.3s",
                                    "&:hover": {
                                      bgcolor: "rgba(244, 67, 54, 0.1)",
                                    },
                                  }}
                                >
                                  Xóa
                                </Button>
                              </Tooltip>
                            </motion.div>
                          </Box>
                        </TableCell>
                      </>
                    )}
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                {
                  margin: 0,
                },
            }}
          />
          {filteredData.length === 0 && (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography color="textSecondary" variant="h6">
                Không tìm thấy dữ liệu
              </Typography>
            </Box>
          )}
        </CardContent>
      </MotionCard>

      {/* Main Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.2rem" }}>
          Đăng ký vé tháng
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <form onSubmit={handleSubmit(handleSaveCard)}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Controller
                name="cardId"
                control={control}
                rules={{ required: "Vui lòng chọn thẻ" }}
                render={({ field, fieldState: { error } }) => (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    style={{ marginTop: "10px" }}
                  >
                    <FormControl fullWidth error={!!error}>
                      <InputLabel id="card-select-label">Chọn thẻ</InputLabel>
                      <Select
                        labelId="card-select-label"
                        id="card-select"
                        {...field}
                        label="Chọn thẻ"
                        onChange={(e) => {
                          field.onChange(e);
                          trigger("cardId");
                        }}
                        onBlur={() => trigger("cardId")}
                        sx={{
                          marginTop: "10px",
                          borderRadius: "10px",
                          transition: "all 0.3s",
                          "& .MuiOutlinedInput-root": {
                            transition: "all 0.3s",
                            "&:hover": {
                              boxShadow: "0 2px 8px rgba(30, 136, 229, 0.15)",
                            },
                            "&.Mui-focused": {
                              boxShadow: "0 4px 12px rgba(30, 136, 229, 0.25)",
                            },
                          },
                        }}
                      >
                        {cards
                          .filter((card) => card.type === "normal")
                          .map((card) => (
                            <MenuItem key={card.id} value={card.id}>
                              ID: {card.id} - {card.uid || "N/A"}
                            </MenuItem>
                          ))}
                      </Select>
                      {error && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5, ml: 1.5 }}
                        >
                          {error.message}
                        </Typography>
                      )}
                    </FormControl>
                  </motion.div>
                )}
              />
              <Controller
                name="name"
                control={control}
                rules={{
                  required: "Tên không được để trống",
                  validate: (value) => {
                    const trimmed = value?.trim();
                    if (!trimmed || trimmed.length === 0) {
                      return "Tên không được để trống";
                    }
                    if (trimmed.length > 50) {
                      return "Tên không được vượt quá 50 ký tự";
                    }
                    if (!/^[\p{L}\s]+$/u.test(trimmed)) {
                      return "Tên chỉ được chứa chữ cái và khoảng trắng";
                    }
                    return true;
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <TextField
                      {...field}
                      fullWidth
                      label="Tên người đăng ký"
                      error={!!error}
                      helperText={error?.message}
                      onChange={(e) => {
                        field.onChange(e);
                        trigger("name");
                      }}
                      onBlur={() => trigger("name")}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                          transition: "all 0.3s",
                          "&:hover": {
                            boxShadow: "0 2px 8px rgba(30, 136, 229, 0.15)",
                          },
                          "&.Mui-focused": {
                            boxShadow: "0 4px 12px rgba(30, 136, 229, 0.25)",
                          },
                        },
                      }}
                    />
                  </motion.div>
                )}
              />
              <Controller
                name="phone"
                control={control}
                rules={{
                  required: "Số điện thoại không được để trống",
                  validate: (value) => {
                    const trimmed = value?.trim();
                    if (!trimmed || trimmed.length === 0) {
                      return "Số điện thoại không được để trống";
                    }
                    if (trimmed.length > 15) {
                      return "Số điện thoại không được vượt quá 15 ký tự";
                    }
                    if (!/^[0-9]+$/.test(trimmed)) {
                      return "Số điện thoại chỉ được chứa số";
                    }
                    return true;
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <TextField
                      {...field}
                      fullWidth
                      label="Số điện thoại"
                      error={!!error}
                      helperText={error?.message}
                      onChange={(e) => {
                        field.onChange(e);
                        trigger("phone");
                      }}
                      onBlur={() => trigger("phone")}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                          transition: "all 0.3s",
                          "&:hover": {
                            boxShadow: "0 2px 8px rgba(30, 136, 229, 0.15)",
                          },
                          "&.Mui-focused": {
                            boxShadow: "0 4px 12px rgba(30, 136, 229, 0.25)",
                          },
                        },
                      }}
                    />
                  </motion.div>
                )}
              />
              <Controller
                name="months"
                control={control}
                rules={{
                  required: "Số tháng không được để trống",
                  validate: (value) => {
                    const num = Number(value);
                    if (!value || value === "") {
                      return "Số tháng không được để trống";
                    }
                    if (isNaN(num) || num <= 0) {
                      return "Số tháng phải là số dương";
                    }
                    return true;
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <TextField
                      {...field}
                      fullWidth
                      label="Số tháng đăng ký"
                      type="number"
                      error={!!error}
                      helperText={error?.message}
                      onChange={(e) => {
                        field.onChange(e);
                        trigger("months");
                      }}
                      onBlur={() => trigger("months")}
                      inputProps={{ min: 1 }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                          transition: "all 0.3s",
                          "&:hover": {
                            boxShadow: "0 2px 8px rgba(30, 136, 229, 0.15)",
                          },
                          "&.Mui-focused": {
                            boxShadow: "0 4px 12px rgba(30, 136, 229, 0.25)",
                          },
                        },
                      }}
                    />
                  </motion.div>
                )}
              />
              <Controller
                name="address"
                control={control}
                rules={{
                  required: "Địa chỉ không được để trống",
                  validate: (value) => {
                    const trimmed = value?.trim();
                    if (!trimmed || trimmed.length === 0) {
                      return "Địa chỉ không được để trống";
                    }
                    if (trimmed.length > 20) {
                      return "Địa chỉ không được vượt quá 20 ký tự";
                    }
                    if (!/^[\p{L}\s]+$/u.test(trimmed)) {
                      return "Địa chỉ chỉ được chứa chữ cái và khoảng trắng";
                    }
                    return true;
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <TextField
                      {...field}
                      fullWidth
                      label="Địa chỉ"
                      error={!!error}
                      helperText={error?.message}
                      onChange={(e) => {
                        field.onChange(e);
                        trigger("address");
                      }}
                      onBlur={() => trigger("address")}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                          transition: "all 0.3s",
                          "&:hover": {
                            boxShadow: "0 2px 8px rgba(30, 136, 229, 0.15)",
                          },
                          "&.Mui-focused": {
                            boxShadow: "0 4px 12px rgba(30, 136, 229, 0.25)",
                          },
                        },
                      }}
                    />
                  </motion.div>
                )}
              />
            </Box>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ textTransform: "none" }}>
            Hủy
          </Button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleSubmit(handleSaveCard)}
              variant="contained"
              disabled={!isValid || refreshing}
              sx={{
                background: isValid
                  ? "linear-gradient(135deg, #1e88e5 0%, #00bcd4 100%)"
                  : "rgba(0, 0, 0, 0.12)",
                textTransform: "none",
                fontWeight: 600,
                "&:disabled": {
                  color: "rgba(0, 0, 0, 0.26)",
                  backgroundColor: "rgba(0, 0, 0, 0.12)",
                },
              }}
            >
              {refreshing ? "Đang xử lý..." : "Đăng ký"}
            </Button>
          </motion.div>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmDialog}
        onClose={() => setDeleteConfirmDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <DialogTitle
            sx={{
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <WarningIcon sx={{ color: "#f44336" }} />
            Xác nhận xóa
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Bạn có chắc chắn muốn xóa vé xe này không? Hành động này không thể
              hoàn tác.
            </Alert>
            <Typography color="textSecondary">
              Vé xe:{" "}
              <strong>
                {cards.find((c) => c.id === cardToDelete)?.uid || "N/A"}
              </strong>
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setDeleteConfirmDialog(false)}
              sx={{ textTransform: "none" }}
            >
              Hủy
            </Button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleConfirmDelete}
                variant="contained"
                color="error"
                disabled={refreshing}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                {refreshing ? "Đang xóa..." : "Xóa"}
              </Button>
            </motion.div>
          </DialogActions>
        </motion.div>
      </Dialog>

      <Dialog
        open={unregisterConfirmDialog}
        onClose={() => setUnregisterConfirmDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <DialogTitle
            sx={{
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <WarningIcon sx={{ color: "#ff9800" }} />
            Xác nhận hủy đăng ký
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Bạn có chắc chắn muốn hủy đăng ký vé tháng này không? Thẻ sẽ được
              chuyển về vé lượt.
            </Alert>
            <Typography color="textSecondary">
              Thẻ:{" "}
              <strong>
                {cards.find((c) => c.id === cardToUnregister)?.uid || "N/A"}
              </strong>
            </Typography>
            {cards.find((c) => c.id === cardToUnregister)
              ?.monthly_user_name && (
              <Typography color="textSecondary" sx={{ mt: 1 }}>
                Khách hàng:{" "}
                <strong>
                  {
                    cards.find((c) => c.id === cardToUnregister)
                      ?.monthly_user_name
                  }
                </strong>
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setUnregisterConfirmDialog(false)}
              sx={{ textTransform: "none" }}
            >
              Hủy
            </Button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleConfirmUnregister}
                variant="contained"
                disabled={refreshing}
                sx={{
                  background:
                    "linear-gradient(135deg, #ff9800 0%, #fb8c00 100%)",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:disabled": {
                    color: "rgba(0, 0, 0, 0.26)",
                    backgroundColor: "rgba(0, 0, 0, 0.12)",
                  },
                }}
              >
                {refreshing ? "Đang xử lý..." : "Xác nhận"}
              </Button>
            </motion.div>
          </DialogActions>
        </motion.div>
      </Dialog>
    </Box>
  );
}
