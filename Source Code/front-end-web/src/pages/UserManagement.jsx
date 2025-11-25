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
  Alert,
  TablePagination,
  InputAdornment,
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { motion } from "framer-motion";
import LoadingScreen from "../components/LoadingScreen";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import WarningIcon from "@mui/icons-material/Warning";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import SortIcon from "@mui/icons-material/Sort";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { CiTrash } from "react-icons/ci";
import { getAllUsers, createUser, deleteUser, getUserById } from "../api/user";
import { useSnackbar } from "../contexts/SnackbarContext";

const MotionCard = motion(Card);
const MotionBox = motion(Box);

export default function UserManagement() {
  const { showSuccess, showError } = useSnackbar();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("add");
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordIcon, setShowPasswordIcon] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [searchEmail, setSearchEmail] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch tất cả users với size lớn để filter ở frontend
      const response = await getAllUsers(1, 1000);
      if (response.success) {
        const usersData = response.data || [];
        setUsers(usersData);
      } else {
        setError("Không thể tải dữ liệu người dùng");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      // Nếu là lỗi 403, để axios interceptor xử lý redirect
      if (err.response?.status === 403) {
        return;
      }
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = Number.parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  // Filter data ở frontend
  const filteredData = users
    .filter((user) => {
      const matchEmail = (user.email || "")
        .toLowerCase()
        .includes(searchEmail.toLowerCase());
      const matchPhone = (user.phone || "")
        .toLowerCase()
        .includes(searchPhone.toLowerCase());
      const matchRole =
        filterRole === "all" || (user.role || "").toLowerCase() === filterRole;
      return matchEmail && matchPhone && matchRole;
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
    formState: { errors, isValid },
    trigger,
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
      phone: "",
      role: "user",
    },
  });

  const handleOpenDialog = () => {
    setDialogType("add");
    setSelectedUser(null);
    setShowPassword(false);
    setShowPasswordIcon(false);
    reset({
      email: "",
      password: "",
      phone: "",
      role: "user",
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setShowPassword(false);
    setShowPasswordIcon(false);
    reset();
  };

  const handleViewUser = async (id) => {
    try {
      setRefreshing(true);
      const response = await getUserById(id);
      if (response.success) {
        setSelectedUser(response.data);
        setViewDialog(true);
      } else {
        showError("Không thể tải thông tin người dùng");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      showError("Không thể tải thông tin người dùng. Vui lòng thử lại.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleSaveUser = async (formData) => {
    try {
      setRefreshing(true);
      setError(null);

      const response = await createUser({
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        role: formData.role,
      });

      if (response.success) {
        await fetchUsers();
        handleCloseDialog();
        showSuccess("Tạo người dùng thành công!");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Không thể tạo người dùng. Vui lòng thử lại.";
      showError(errorMessage);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteClick = (id) => {
    setUserToDelete(id);
    setDeleteConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await deleteUser(userToDelete);
      if (response.success) {
        await fetchUsers();
        setDeleteConfirmDialog(false);
        setUserToDelete(null);
        showSuccess("Xóa người dùng thành công!");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Không thể xóa người dùng. Vui lòng thử lại.";
      showError(errorMessage);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await getAllUsers(1, 1000);
      if (response.success) {
        const usersData = response.data || [];
        setUsers(usersData);
      } else {
        showError("Không thể tải dữ liệu người dùng");
      }
    } catch (err) {
      console.error("Error refreshing users:", err);
      // Nếu là lỗi 403, để axios interceptor xử lý redirect
      if (err.response?.status === 403) {
        return;
      }
      showError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleSortToggle = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  if (loading) {
    return <LoadingScreen message="Đang tải dữ liệu người dùng..." />;
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
            Quản lý người dùng
          </Typography>
          <Typography color="textSecondary">
            Quản lý danh sách người dùng trong hệ thống
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
            Tạo mới
          </Button>
        </motion.div>
      </MotionBox>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          {
            label: "Tổng người dùng",
            value: users.length,
            color: "#1e88e5",
            delay: 0.1,
          },
          {
            label: "Quản trị viên",
            value: users.filter((u) => (u.role || "").toLowerCase() === "admin")
              .length,
            color: "#7b1fa2",
            delay: 0.2,
          },
          {
            label: "Bảo vệ",
            value: users.filter((u) => (u.role || "").toLowerCase() === "guard")
              .length,
            color: "#1976d2",
            delay: 0.3,
          },
          {
            label: "Người dùng",
            value: users.filter((u) => (u.role || "").toLowerCase() === "user")
              .length,
            color: "#4caf50",
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
                  <PersonIcon
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
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
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
            <Grid item xs={12} sm={6} md={2}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FormControl fullWidth>
                  <InputLabel id="role-select-label">Vai trò</InputLabel>
                  <Select
                    labelId="role-select-label"
                    id="role-select"
                    value={filterRole}
                    label="Vai trò"
                    onChange={(e) => {
                      setFilterRole(e.target.value);
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
                    <MenuItem value="all">Tất cả</MenuItem>
                    <MenuItem value="admin">Quản trị viên</MenuItem>
                    <MenuItem value="guard">Bảo vệ</MenuItem>
                    <MenuItem value="user">Người dùng</MenuItem>
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
            <Grid item xs={6} sm={3} md={2}>
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
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                      width: "20%",
                    }}
                  >
                    Email
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                      width: "15%",
                    }}
                  >
                    Số điện thoại
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                      width: "15%",
                    }}
                  >
                    Biển số xe
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                      width: "20%",
                    }}
                  >
                    Vai trò
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                      width: "30%",
                    }}
                  >
                    Hành động
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05, duration: 0.3 }}
                  >
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 600,
                        py: 2,
                        width: "20%",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          wordBreak: "break-word",
                        }}
                      >
                        {user.email || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        py: 2,
                        width: "15%",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          wordBreak: "break-word",
                        }}
                      >
                        {user.phone || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        py: 2,
                        width: "15%",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          wordBreak: "break-word",
                        }}
                      >
                        {user.plate || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        py: 2,
                        width: "15%",
                      }}
                    >
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Chip
                          label={
                            (user.role || "").toLowerCase() === "admin"
                              ? "Quản trị viên"
                              : (user.role || "").toLowerCase() === "guard"
                              ? "Bảo vệ"
                              : "Người dùng"
                          }
                          size="small"
                          sx={{
                            backgroundColor:
                              (user.role || "").toLowerCase() === "admin"
                                ? "#f3e5f5"
                                : (user.role || "").toLowerCase() === "guard"
                                ? "#e3f2fd"
                                : "#e8f5e9",
                            color:
                              (user.role || "").toLowerCase() === "admin"
                                ? "#7b1fa2"
                                : (user.role || "").toLowerCase() === "guard"
                                ? "#1976d2"
                                : "#2e7d32",
                            fontWeight: 600,
                            borderRadius: "8px",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                            fontSize: "0.75rem",
                          }}
                        />
                      </motion.div>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        py: 2,
                        width: "30%",
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
                              onClick={() => handleDeleteClick(user.id)}
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
            rowsPerPageOptions={[5, 10, 25, 50]}
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

      {/* Create Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.2rem" }}>
          Tạo người dùng mới
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <form onSubmit={handleSubmit(handleSaveUser)}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: "Email không được để trống",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Email không hợp lệ",
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    style={{ marginTop: "10px" }}
                  >
                    <TextField
                      {...field}
                      fullWidth
                      label="Email"
                      type="email"
                      error={!!error}
                      helperText={error?.message}
                      onChange={(e) => {
                        field.onChange(e);
                        trigger("email");
                      }}
                      onBlur={() => trigger("email")}
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
                name="password"
                control={control}
                rules={{
                  required: "Mật khẩu không được để trống",
                  validate: (value) => {
                    if (!value || value.trim() === "") {
                      return "Mật khẩu không được để trống";
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
                      label="Mật khẩu"
                      type={showPassword ? "text" : "password"}
                      error={!!error}
                      helperText={error?.message}
                      onInput={(e) => {
                        const value = e.target.value.trim();
                        setShowPasswordIcon(value !== "");
                      }}
                      onChange={(e) => {
                        field.onChange(e);
                        const value = e.target.value.trim();
                        setShowPasswordIcon(value !== "");
                        trigger("password");
                      }}
                      onBlur={() => trigger("password")}
                      InputProps={{
                        endAdornment: showPasswordIcon ? (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              sx={{
                                color: "text.secondary",
                                "&:hover": {
                                  color: "primary.main",
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
                        ) : null,
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
                )}
              />
              <Controller
                name="phone"
                control={control}
                rules={{
                  required: "Số điện thoại không được để trống",
                  validate: (value) => {
                    if (!value || value.trim() === "") {
                      return "Số điện thoại không được để trống";
                    }
                    if (value.trim().length > 15) {
                      return "Số điện thoại không được quá 15 ký tự";
                    }
                    if (!/^[0-9]+$/.test(value.trim())) {
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
                name="role"
                control={control}
                rules={{
                  required: "Vai trò không được để trống",
                  validate: (value) => {
                    const validRoles = ["user", "guard", "admin"];
                    if (!value) {
                      return "Vai trò không được để trống";
                    }
                    if (!validRoles.includes(value)) {
                      return "Vai trò không hợp lệ";
                    }
                    return true;
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <FormControl fullWidth error={!!error}>
                      <InputLabel id="role-select-label">Vai trò</InputLabel>
                      <Select
                        labelId="role-select-label"
                        id="role-select"
                        {...field}
                        label="Vai trò"
                        onChange={(e) => {
                          field.onChange(e);
                          trigger("role");
                        }}
                        onBlur={() => trigger("role")}
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
                        <MenuItem value="user">Người dùng</MenuItem>
                        <MenuItem value="guard">Bảo vệ</MenuItem>
                        <MenuItem value="admin">Quản trị viên</MenuItem>
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
            </Box>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ textTransform: "none" }}>
            Hủy
          </Button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleSubmit(handleSaveUser)}
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
              {refreshing ? "Đang tạo..." : "Tạo mới"}
            </Button>
          </motion.div>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.2rem" }}>
          Thông tin người dùng
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedUser && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ fontSize: "0.75rem" }}
                >
                  Email
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                  {selectedUser.email || "N/A"}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ fontSize: "0.75rem" }}
                >
                  Số điện thoại
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                  {selectedUser.phone || "N/A"}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ fontSize: "0.75rem" }}
                >
                  Biển số xe
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                  {selectedUser.plate || "N/A"}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ fontSize: "0.75rem" }}
                >
                  Vai trò
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={
                      (selectedUser.role || "").toLowerCase() === "admin"
                        ? "Quản trị viên"
                        : (selectedUser.role || "").toLowerCase() === "guard"
                        ? "Bảo vệ"
                        : "Người dùng"
                    }
                    size="small"
                    sx={{
                      backgroundColor:
                        (selectedUser.role || "").toLowerCase() === "admin"
                          ? "#f3e5f5"
                          : (selectedUser.role || "").toLowerCase() === "guard"
                          ? "#e3f2fd"
                          : "#e8f5e9",
                      color:
                        (selectedUser.role || "").toLowerCase() === "admin"
                          ? "#7b1fa2"
                          : (selectedUser.role || "").toLowerCase() === "guard"
                          ? "#1976d2"
                          : "#2e7d32",
                      fontWeight: 600,
                      borderRadius: "8px",
                    }}
                  />
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setViewDialog(false)}
            sx={{ textTransform: "none" }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
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
              Bạn có chắc chắn muốn xóa người dùng này không? Hành động này
              không thể hoàn tác.
            </Alert>
            <Typography color="textSecondary">
              Người dùng:{" "}
              <strong>
                {users.find((u) => u.id === userToDelete)?.email || "N/A"}
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
    </Box>
  );
}
