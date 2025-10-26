"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tooltip,
  Alert,
  TablePagination,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import LoadingScreen from "../components/LoadingScreen";
import AddIcon from "@mui/icons-material/Add";
import ReceiptIcon from "@mui/icons-material/Receipt";
import WarningIcon from "@mui/icons-material/Warning";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import SortIcon from "@mui/icons-material/Sort";
import { CiTrash, CiEdit } from "react-icons/ci";

import {
  getAllMonthlyUsers,
  createMonthlyCard,
  updateMonthlyUser,
  deleteMonthlyUser,
} from "../api/monthlyCard";
import { getAvailableCards } from "../api/card";
import { useSnackbar } from "../contexts/SnackbarContext";

const MotionCard = motion(Card);
const MotionBox = motion(Box);

export default function MonthlyTicket() {
  const { showSuccess, showError } = useSnackbar();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("add");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchLicensePlate, setSearchLicensePlate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [availableCards, setAvailableCards] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllMonthlyUsers();
        if (response.data.success) {
          setTickets(response.data.data || []);
        } else {
          setError("Không thể tải dữ liệu vé tháng");
        }
      } catch (err) {
        console.error("Error fetching monthly tickets:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const fetchAvailableCards = async () => {
    try {
      const response = await getAvailableCards();
      console.log(response.data.data);
      if (response.data.success) {
        setAvailableCards(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching available cards:", err);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredData = tickets
    .filter((ticket) => {
    const matchName = ticket.name
      .toLowerCase()
      .includes(searchName.toLowerCase());
      const matchPhone = ticket.phoneNumber
      .toLowerCase()
      .includes(searchPhone.toLowerCase());
    const matchLicensePlate = ticket.licensePlate
      .toLowerCase()
      .includes(searchLicensePlate.toLowerCase());

      const now = new Date();
      const startDate = new Date(ticket.createdAt);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      const isActive = endDate > now;
      const ticketStatus = isActive ? "Hoạt động" : "Hết hạn";

    const matchStatus =
        filterStatus === "all" || ticketStatus === filterStatus;
    return matchName && matchPhone && matchLicensePlate && matchStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
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
    formState: { errors, isValid },
    trigger,
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      name: "",
      phoneNumber: "",
      licensePlate: "",
      cardId: "",
    },
  });

  const handleOpenDialog = async (type, ticket = null) => {
    setDialogType(type);
    setSelectedTicket(ticket);

    if (type === "add") {
      await fetchAvailableCards();
    }

    if (ticket) {
      reset({
        name: ticket.name,
        phoneNumber: ticket.phoneNumber,
        licensePlate: ticket.licensePlate,
        cardId: ticket.cardId || "",
      });
    } else {
    reset({
      name: "",
        phoneNumber: "",
      licensePlate: "",
        cardId: "",
    });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    reset();
  };

  const handleSaveTicket = async (formData) => {
    try {
      setRefreshing(true);
      setError(null);
      let response;
      if (dialogType === "add") {
        response = await createMonthlyCard({
      name: formData.name,
          phoneNumber: formData.phoneNumber,
      licensePlate: formData.licensePlate,
          cardId: formData.cardId,
          price: 500000,
        });
      } else if (dialogType === "edit") {
        response = await updateMonthlyUser(
          {
            name: formData.name,
            phoneNumber: formData.phoneNumber,
            licensePlate: formData.licensePlate,
          },
          selectedTicket.id
        );
      }

      if (response && response.data.success) {
        const ticketsResponse = await getAllMonthlyUsers();
        if (ticketsResponse.data.success) {
          setTickets(ticketsResponse.data.data || []);
        }
    handleCloseDialog();
        showSuccess(
          dialogType === "add"
            ? "Đăng ký vé tháng thành công!"
            : "Cập nhật vé tháng thành công!"
        );
      }
    } catch (error) {
      console.error("Error saving ticket:", error);
      showError("Không thể lưu vé tháng. Vui lòng thử lại.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteTicket = (id) => {
    setTicketToDelete(id);
    setDeleteConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await deleteMonthlyUser(ticketToDelete);
      if (response.data.success) {
        const ticketsResponse = await getAllMonthlyUsers();
        if (ticketsResponse.data.success) {
          setTickets(ticketsResponse.data.data || []);
        }
    setDeleteConfirmDialog(false);
    setTicketToDelete(null);
        showSuccess("Xóa vé tháng thành công!");
      }
    } catch (error) {
      console.error("Error deleting ticket:", error);
      showError("Không thể xóa vé tháng. Vui lòng thử lại.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await getAllMonthlyUsers();
      if (response.data.success) {
        setTickets(response.data.data || []);
        setSearchName("");
        setSearchPhone("");
        setSearchLicensePlate("");
        setFilterStatus("all");
        setPage(0);
      } else {
        setError("Không thể tải dữ liệu vé tháng");
      }
    } catch (err) {
      console.error("Error refreshing tickets:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleSortToggle = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  if (loading) {
    return <LoadingScreen message="Đang tải dữ liệu vé tháng..." />;
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
            Đăng ký vé tháng
          </Typography>
          <Typography color="textSecondary">
            Quản lý vé tháng của khách hàng
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
            label: "Tổng vé tháng",
            value: tickets.length,
            color: "#1e88e5",
            delay: 0.1,
          },
          {
            label: "Hoạt động",
            value: tickets.filter((t) => {
              const now = new Date();
              const startDate = new Date(t.createdAt);
              const endDate = new Date(startDate);
              endDate.setMonth(endDate.getMonth() + 1);
              return endDate > now;
            }).length,
            color: "#4caf50",
            delay: 0.2,
          },
          {
            label: "Hết hạn",
            value: tickets.filter((t) => {
              const now = new Date();
              const startDate = new Date(t.createdAt);
              const endDate = new Date(startDate);
              endDate.setMonth(endDate.getMonth() + 1);
              return endDate <= now;
            }).length,
            color: "#f44336",
            delay: 0.3,
          },
          {
            label: "Doanh thu",
            value: `${(tickets.length * 500).toLocaleString("vi-VN")}K`,
            color: "#ff9800",
            delay: 0.4,
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
                  <ReceiptIcon
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
            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm tên khách hàng..."
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
            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm số điện thoại..."
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
            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm biển số xe..."
                  value={searchLicensePlate}
                  onChange={(e) => setSearchLicensePlate(e.target.value)}
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
            <Grid item xs={12} sm={6} md={2}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FormControl fullWidth>
                  <InputLabel id="status-select-label">Trạng thái</InputLabel>
                  <Select
                    labelId="status-select-label"
                    id="status-select"
                    value={filterStatus}
                    label="Trạng thái"
                    onChange={(e) => setFilterStatus(e.target.value)}
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
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="Hoạt động">Hoạt động</MenuItem>
                    <MenuItem value="Hết hạn">Hết hạn</MenuItem>
                  </Select>
                </FormControl>
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={6} md={1}>
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
            <Grid item xs={12} sm={6} md={1}>
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
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    borderBottom: "2px solid",
                    borderColor: "divider",
                    bgcolor: "rgba(30, 136, 229, 0.05)",
                  }}
                >
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, color: "text.primary" }}
                  >
                    Tên khách hàng
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, color: "text.primary" }}
                  >
                    Số điện thoại
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, color: "text.primary" }}
                  >
                    Biển số xe
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, color: "text.primary" }}
                  >
                    ID thẻ
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, color: "text.primary" }}
                  >
                    Giá tiền
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, color: "text.primary" }}
                  >
                    Ngày bắt đầu
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, color: "text.primary" }}
                  >
                    Ngày kết thúc
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, color: "text.primary" }}
                  >
                    Trạng thái
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, color: "text.primary" }}
                  >
                    Hành động
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((ticket, index) => (
                  <motion.tr
                    key={ticket.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05, duration: 0.3 }}
                  >
                    <TableCell align="center" sx={{ py: 2 }}>
                      {ticket.name}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      {ticket.phoneNumber}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2, fontWeight: 600 }}>
                      {ticket.licensePlate}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2, fontWeight: 600 }}>
                      {ticket.cardId}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2, fontWeight: 600 }}>
                      500,000 VND
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      {new Date(ticket.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      {(() => {
                        const startDate = new Date(ticket.createdAt);
                        const endDate = new Date(startDate);
                        endDate.setMonth(endDate.getMonth() + 1);
                        return endDate.toLocaleDateString("vi-VN");
                      })()}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Chip
                          label={(() => {
                            const now = new Date();
                            const startDate = new Date(ticket.createdAt);
                            const endDate = new Date(startDate);
                            endDate.setMonth(endDate.getMonth() + 1);
                            return endDate > now ? "Hoạt động" : "Hết hạn";
                          })()}
                          color={(() => {
                            const now = new Date();
                            const startDate = new Date(ticket.createdAt);
                            const endDate = new Date(startDate);
                            endDate.setMonth(endDate.getMonth() + 1);
                            return endDate > now ? "success" : "error";
                          })()}
                          size="small"
                          sx={{
                            backgroundColor: (() => {
                              const now = new Date();
                              const startDate = new Date(ticket.createdAt);
                              const endDate = new Date(startDate);
                              endDate.setMonth(endDate.getMonth() + 1);
                              return endDate > now ? "#dbfde5" : "#fddbdb";
                            })(),
                            color: (() => {
                              const now = new Date();
                              const startDate = new Date(ticket.createdAt);
                              const endDate = new Date(startDate);
                              endDate.setMonth(endDate.getMonth() + 1);
                              return endDate > now ? "#036333" : "#ef4444";
                            })(),
                            width: "100%",
                            fontWeight: 600,
                            borderRadius: "8px",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                      </motion.div>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
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
                          <Tooltip title="Chỉnh sửa">
                            <Button
                              size="small"
                              startIcon={<CiEdit />}
                              onClick={() => handleOpenDialog("edit", ticket)}
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
                              Sửa
                            </Button>
                          </Tooltip>
                        </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Tooltip title="Xóa vé tháng">
                          <Button
                            size="small"
                            startIcon={<CiTrash />}
                            color="error"
                            onClick={() => handleDeleteTicket(ticket.id)}
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

      {/* Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.2rem" }}>
          {dialogType === "add" ? "Đăng ký vé tháng mới" : "Chỉnh sửa vé tháng"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <form onSubmit={handleSubmit(handleSaveTicket)}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Controller
                name="name"
                control={control}
                rules={{ required: "Tên khách hàng không được để trống" }}
                render={({ field, fieldState: { error } }) => (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <TextField
                      {...field}
                      fullWidth
                      label="Tên khách hàng"
                      error={!!error}
                      helperText={error?.message}
                      onChange={(e) => {
                        field.onChange(e);
                        trigger("name");
                      }}
                      onBlur={() => trigger("name")}
                      sx={{
                        marginTop: "10px",
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
                name="cardId"
                control={control}
                rules={{ required: "ID thẻ không được để trống" }}
                render={({ field, fieldState: { error } }) => (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <FormControl fullWidth error={!!error}>
                      <InputLabel id="card-select-label">ID thẻ</InputLabel>
                      <Select
                        labelId="card-select-label"
                        id="card-select"
                        {...field}
                        label="ID thẻ"
                        disabled={dialogType === "edit"}
                        onChange={(e) => {
                          field.onChange(e);
                          trigger("cardId");
                        }}
                        onBlur={() => trigger("cardId")}
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
                          "& .MuiInputBase-input.Mui-disabled": {
                            WebkitTextFillColor: "rgba(0, 0, 0, 0.6)",
                          },
                        }}
                      >
                        {dialogType === "add" ? (
                          availableCards.length > 0 ? (
                            availableCards.map((card) => (
                              <MenuItem key={card.id} value={card.id}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    ID: {card.id}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="textSecondary"
                                  >
                                    - {card.cardNumber}
                                  </Typography>
                                </Box>
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>
                              <Typography color="textSecondary">
                                Không có thẻ rảnh
                              </Typography>
                            </MenuItem>
                          )
                        ) : (
                          <MenuItem value={field.value}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                              >
                                ID: {field.value}
                              </Typography>
                            </Box>
                          </MenuItem>
                        )}
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
                name="phoneNumber"
                control={control}
                rules={{
                  required: "Số điện thoại không được để trống",
                  pattern: {
                    value: /^0\d{9}$/,
                    message:
                      "Số điện thoại không hợp lệ (phải bắt đầu bằng 0 và có 10 chữ số)",
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
                        trigger("phoneNumber");
                      }}
                      onBlur={() => trigger("phoneNumber")}
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
                name="licensePlate"
                control={control}
                rules={{ required: "Biển số xe không được để trống" }}
                render={({ field, fieldState: { error } }) => (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <TextField
                      {...field}
                      fullWidth
                      label="Biển số xe"
                      error={!!error}
                      helperText={error?.message}
                      onChange={(e) => {
                        field.onChange(e);
                        trigger("licensePlate");
                      }}
                      onBlur={() => trigger("licensePlate")}
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
              <Box
                sx={{
                  p: 2,
                  bgcolor: "rgba(30, 136, 229, 0.1)",
                  borderRadius: "10px",
                  border: "1px solid rgba(30, 136, 229, 0.2)",
                }}
              >
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Giá tiền:</strong> 500,000 VND
                </Typography>
                <Typography variant="body2">
                  {dialogType === "add" ? (
                    <>
                  <strong>Thời hạn:</strong> 30 ngày
                    </>
                  ) : (
                    <>
                      <strong>Số ngày còn lại:</strong>{" "}
                      {(() => {
                        if (selectedTicket) {
                          const now = new Date();
                          const startDate = new Date(selectedTicket.createdAt);
                          const endDate = new Date(startDate);
                          endDate.setMonth(endDate.getMonth() + 1);
                          const diffTime = endDate - now;
                          const diffDays = Math.ceil(
                            diffTime / (1000 * 60 * 60 * 24)
                          );
                          return diffDays > 0
                            ? `${diffDays} ngày`
                            : "Đã hết hạn";
                        }
                        return "30 ngày";
                      })()}
                    </>
                  )}
                </Typography>
              </Box>
            </Box>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ textTransform: "none" }}>
            Hủy
          </Button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleSubmit(handleSaveTicket)}
              variant="contained"
              disabled={!isValid}
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
              {dialogType === "add" ? "Đăng ký" : "Cập nhật"}
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
              Bạn có chắc chắn muốn xóa vé tháng này không? Hành động này không
              thể hoàn tác.
            </Alert>
            <Typography color="textSecondary">
              Khách hàng:{" "}
              <strong>
                {tickets.find((t) => t.id === ticketToDelete)?.name}
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
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Xóa
              </Button>
            </motion.div>
          </DialogActions>
        </motion.div>
      </Dialog>
    </Box>
  );
}
