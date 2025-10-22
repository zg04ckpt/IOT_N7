"use client";

import { useState } from "react";
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
} from "@mui/material";
import { motion } from "framer-motion";
import AddIcon from "@mui/icons-material/Add";
import ReceiptIcon from "@mui/icons-material/Receipt";
import WarningIcon from "@mui/icons-material/Warning";
import SearchIcon from "@mui/icons-material/Search";
import { CiTrash } from "react-icons/ci";

const MotionCard = motion(Card);
const MotionBox = motion(Box);

export default function MonthlyTicket() {
  const [tickets, setTickets] = useState([
    {
      id: 1,
      uid: "UID-MONTH-001",
      name: "Nguyễn Văn A",
      phone: "0912345678",
      licensePlate: "29A-12345",
      amount: "500,000 VND",
      startDate: "2024-10-01",
      endDate: "2024-10-31",
      status: "Hoạt động",
    },
    {
      id: 2,
      uid: "UID-MONTH-002",
      name: "Trần Thị B",
      phone: "0987654321",
      licensePlate: "30B-67890",
      amount: "500,000 VND",
      startDate: "2024-10-05",
      endDate: "2024-11-04",
      status: "Hoạt động",
    },
    {
      id: 3,
      uid: "UID-MONTH-003",
      name: "Lê Văn C",
      phone: "0901234567",
      licensePlate: "31C-11111",
      amount: "500,000 VND",
      startDate: "2024-09-15",
      endDate: "2024-10-14",
      status: "Hết hạn",
    },
    {
      id: 4,
      uid: "UID-MONTH-004",
      name: "Phạm Thị D",
      phone: "0923456789",
      licensePlate: "32D-22222",
      amount: "500,000 VND",
      startDate: "2024-10-01",
      endDate: "2024-10-31",
      status: "Hoạt động",
    },
    {
      id: 5,
      uid: "UID-MONTH-005",
      name: "Hoàng Văn E",
      phone: "0934567890",
      licensePlate: "33E-33333",
      amount: "500,000 VND",
      startDate: "2024-10-05",
      endDate: "2024-11-04",
      status: "Hoạt động",
    },
    {
      id: 6,
      uid: "UID-MONTH-006",
      name: "Võ Thị F",
      phone: "0945678901",
      licensePlate: "34F-44444",
      amount: "500,000 VND",
      startDate: "2024-09-15",
      endDate: "2024-10-14",
      status: "Hết hạn",
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchLicensePlate, setSearchLicensePlate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredData = tickets.filter((ticket) => {
    const matchName = ticket.name
      .toLowerCase()
      .includes(searchName.toLowerCase());
    const matchPhone = ticket.phone
      .toLowerCase()
      .includes(searchPhone.toLowerCase());
    const matchLicensePlate = ticket.licensePlate
      .toLowerCase()
      .includes(searchLicensePlate.toLowerCase());
    const matchStatus =
      filterStatus === "all" || ticket.status === filterStatus;
    return matchName && matchPhone && matchLicensePlate && matchStatus;
  });

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      phone: "",
      licensePlate: "",
    },
  });

  const handleOpenDialog = () => {
    reset({
      name: "",
      phone: "",
      licensePlate: "",
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    reset();
  };

  const handleSaveTicket = (formData) => {
    const newTicket = {
      id: Math.max(...tickets.map((t) => t.id), 0) + 1,
      uid: `UID-MONTH-${String(
        Math.max(
          ...tickets.map((t) => Number.parseInt(t.uid.split("-")[2])),
          0
        ) + 1
      ).padStart(3, "0")}`,
      name: formData.name,
      phone: formData.phone,
      licensePlate: formData.licensePlate,
      amount: "500,000 VND",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      status: "Hoạt động",
    };
    setTickets([...tickets, newTicket]);
    handleCloseDialog();
  };

  const handleDeleteTicket = (id) => {
    setTicketToDelete(id);
    setDeleteConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    setTickets(tickets.filter((t) => t.id !== ticketToDelete));
    setDeleteConfirmDialog(false);
    setTicketToDelete(null);
  };

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
            onClick={handleOpenDialog}
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
            value: tickets.filter((t) => t.status === "Hoạt động").length,
            color: "#4caf50",
            delay: 0.2,
          },
          {
            label: "Hết hạn",
            value: tickets.filter((t) => t.status === "Hết hạn").length,
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
            <Grid item xs={12} sm={6} md={3}>
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
        <CardContent sx={{ p: 0 }}>
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
                    UID
                  </TableCell>
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
                    <TableCell align="center" sx={{ fontWeight: 600, py: 2 }}>
                      {ticket.uid}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      {ticket.name}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      {ticket.phone}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2, fontWeight: 600 }}>
                      {ticket.licensePlate}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2, fontWeight: 600 }}>
                      {ticket.amount}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      {ticket.startDate}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      {ticket.endDate}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Chip
                          label={ticket.status}
                          color={
                            ticket.status === "Hoạt động" ? "success" : "error"
                          }
                          size="small"
                          sx={{
                            backgroundColor:
                              ticket.status === "Hoạt động"
                                ? "#dbfde5"
                                : "#dbfde5",
                            color:
                              ticket.status === "Hoạt động"
                                ? "#036333"
                                : "#036333",
                            width: "100%",
                            fontWeight: 600,
                            borderRadius: "8px",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                      </motion.div>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
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
          Đăng ký vé tháng mới
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
                name="phone"
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
                  <strong>Thời hạn:</strong> 30 ngày
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
              sx={{
                background: "linear-gradient(135deg, #1e88e5 0%, #00bcd4 100%)",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Đăng ký
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
                {tickets.find((d) => d.id === ticketToDelete)?.name}
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
