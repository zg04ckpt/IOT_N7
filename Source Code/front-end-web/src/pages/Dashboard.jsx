"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  CircularProgress,
  InputAdornment,
  Button,
  TablePagination,
} from "@mui/material";
import LoadingScreen from "../components/LoadingScreen";
import { motion } from "framer-motion";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import RefreshIcon from "@mui/icons-material/Refresh";
import SortIcon from "@mui/icons-material/Sort";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { vi } from "date-fns/locale";

import { getInvoiceStats } from "../api/invoice";
import { getUserById } from "../api/user";

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  delay,
  subtitle,
  chart,
}) => (
  <MotionCard
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    sx={{
      height: "100%",
      background: `linear-gradient(135deg, rgba(30, 136, 229, 0.1) 0%, rgba(0, 188, 212, 0.05) 100%)`,
      border: "1px solid rgba(30, 136, 229, 0.2)",
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
        <Box sx={{ flex: 1 }}>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h3" sx={{ mt: 1 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {subtitle}
            </Typography>
          )}
          {chart && <Box sx={{ mt: 2 }}>{chart}</Box>}
        </Box>
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: "12px",
            background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 12px ${color}40`,
          }}
        >
          <Icon sx={{ fontSize: 32, color: "white" }} />
        </Box>
      </Box>
    </CardContent>
  </MotionCard>
);

export default function Dashboard() {
  const [invoiceStats, setInvoiceStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [customerNames, setCustomerNames] = useState({});
  const [sortOrder, setSortOrder] = useState("desc");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Filter states
  const [filterType, setFilterType] = useState("all"); // "all", "SESSION", "MONTHLY_CARD"
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Format dates as YYYY-MM-DD HH:mm:ss
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchInvoiceStats = async (
    customStartDate = null,
    customEndDate = null
  ) => {
    try {
      setError(null);

      let start, end;

      if (customStartDate && customEndDate) {
        // Use custom dates (Date objects)
        const startDateObj = new Date(customStartDate);
        startDateObj.setHours(0, 0, 0, 0);
        start = formatDate(startDateObj);

        const endDateObj = new Date(customEndDate);
        endDateObj.setHours(23, 59, 59, 999);
        end = formatDate(endDateObj);
      } else {
        // Default: today
        const today = new Date();
        const startDateObj = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        const endDateObj = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59
        );
        start = formatDate(startDateObj);
        end = formatDate(endDateObj);
      }

      const response = await getInvoiceStats(start, end, 1, 1000);

      if (response.success) {
        setInvoiceStats(response.data);

        // Fetch customer names for all invoices
        const invoices = response.data.invoices || [];
        const userIds = [
          ...new Set(invoices.map((inv) => inv.user_id).filter(Boolean)),
        ];

        const namesMap = {};
        await Promise.all(
          userIds.map(async (userId) => {
            try {
              const userResponse = await getUserById(userId);
              if (userResponse.success && userResponse.data) {
                namesMap[userId] = userResponse.data.email || "-";
              } else {
                namesMap[userId] = "-";
              }
            } catch (err) {
              console.error(`Error fetching user ${userId}:`, err);
              // Nếu là lỗi 403, để axios interceptor xử lý redirect
              if (err.response?.status === 403) {
                return;
              }
              namesMap[userId] = "-";
            }
          })
        );
        setCustomerNames(namesMap);
      } else {
        setError("Không thể tải dữ liệu thống kê");
      }
    } catch (err) {
      console.error("Error fetching invoice stats:", err);
      // Nếu là lỗi 403, để axios interceptor xử lý redirect
      if (err.response?.status === 403) {
        return;
      }
      setError(
        err.response?.data?.message ||
          "Không thể tải dữ liệu. Vui lòng thử lại sau."
      );
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchInvoiceStats();
      setLoading(false);
      setIsInitialLoad(false);
    };
    loadData();
  }, []);

  // Auto fetch when date filters change (both must be set or both empty)
  useEffect(() => {
    // Skip on initial mount (handled by first useEffect)
    if (isInitialLoad) return;

    if ((startDate && endDate) || (!startDate && !endDate)) {
      const timer = setTimeout(async () => {
        setRefreshing(true);
        if (startDate && endDate) {
          await fetchInvoiceStats(startDate, endDate);
        } else {
          await fetchInvoiceStats();
        }
        setRefreshing(false);
      }, 500); // Debounce 500ms

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, isInitialLoad]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (startDate && endDate) {
      await fetchInvoiceStats(startDate, endDate);
    } else {
      await fetchInvoiceStats();
    }
    setRefreshing(false);
  };

  const handleSortToggle = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClearFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setFilterType("all");
    setPage(0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Helper function to get ticket type display info
  const getTicketTypeInfo = (from) => {
    const normalizedFrom = (from || "").toUpperCase();

    if (normalizedFrom === "SESSION") {
      return {
        label: "Vé lượt",
        backgroundColor: "#fff3e0",
        color: "#e65100",
        icon: DirectionsCarIcon,
      };
    } else if (normalizedFrom === "MONTHLY_CARD") {
      return {
        label: "Vé tháng",
        backgroundColor: "#f3e5f5",
        color: "#7b1fa2",
        icon: ConfirmationNumberIcon,
      };
    }

    // Fallback for unknown types
    return {
      label: from || "-",
      backgroundColor: "#f5f5f5",
      color: "#757575",
      icon: null,
    };
  };

  if (loading) {
    return <LoadingScreen message="Đang tải dashboard..." />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!invoiceStats) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Không có dữ liệu để hiển thị</Alert>
      </Box>
    );
  }

  const summary = invoiceStats.summary || {};
  const bySource = summary.by_source || [];

  // Tìm doanh thu theo nguồn
  const sessionRevenue =
    bySource.find((s) => s.source === "SESSION")?.total_amount || 0;
  const monthlyCardRevenue =
    bySource.find((s) => s.source === "MONTHLY_CARD")?.total_amount || 0;
  const sessionCount = bySource.find((s) => s.source === "SESSION")?.count || 0;
  const monthlyCardCount =
    bySource.find((s) => s.source === "MONTHLY_CARD")?.count || 0;

  // Filter and sort invoices
  const filteredInvoices = (invoiceStats.invoices || [])
    .filter((invoice) => {
      if (filterType === "all") return true;
      if (filterType === "SESSION") return invoice.from === "SESSION";
      if (filterType === "MONTHLY_CARD") return invoice.from === "MONTHLY_CARD";
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  // Paginated data
  const paginatedData = filteredInvoices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <MotionBox
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          sx={{ mb: 4 }}
        >
          <Typography variant="h2" sx={{ mb: 1 }}>
            Dashboard
          </Typography>
          <Typography color="textSecondary">
            Tổng quan về hoạt động bãi đỗ xe hôm nay
          </Typography>
        </MotionBox>

        {/* Main Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng doanh thu hôm nay"
              value={formatCurrency(summary.total_amount || 0)}
              icon={AttachMoneyIcon}
              color="#4caf50"
              delay={0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng số hóa đơn"
              value={summary.total_count || 0}
              icon={ConfirmationNumberIcon}
              color="#1e88e5"
              delay={0.1}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Doanh thu vé lượt"
              value={formatCurrency(sessionRevenue)}
              icon={DirectionsCarIcon}
              color="#ff9800"
              delay={0.2}
              subtitle={`${sessionCount} hóa đơn`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Doanh thu vé tháng"
              value={formatCurrency(monthlyCardRevenue)}
              icon={ConfirmationNumberIcon}
              color="#9c27b0"
              delay={0.3}
              subtitle={`${monthlyCardCount} hóa đơn`}
            />
          </Grid>
        </Grid>

        {/* Filters */}
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          sx={{ mb: 3, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}
        >
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={2}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <FormControl fullWidth>
                    <InputLabel id="type-select-label">Loại vé</InputLabel>
                    <Select
                      labelId="type-select-label"
                      id="type-select"
                      value={filterType}
                      label="Loại vé"
                      onChange={(e) => {
                        setFilterType(e.target.value);
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
                      <MenuItem value="SESSION">Vé lượt</MenuItem>
                      <MenuItem value="MONTHLY_CARD">Vé tháng</MenuItem>
                    </Select>
                  </FormControl>
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <DatePicker
                    label="Ngày bắt đầu"
                    value={startDate}
                    onChange={(newValue) => {
                      setStartDate(newValue);
                      setPage(0);
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: {
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
                  <DatePicker
                    label="Ngày kết thúc"
                    value={endDate}
                    onChange={(newValue) => {
                      setEndDate(newValue);
                      setPage(0);
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: {
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
                        },
                      },
                    }}
                  />
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
              {(startDate || endDate || filterType !== "all") && (
                <Grid item xs={12} sm={6} md={2}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={handleClearFilter}
                      sx={{
                        height: "56px",
                        borderRadius: "10px",
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      Xóa bộ lọc
                    </Button>
                  </motion.div>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </MotionCard>

        {/* Recent Invoices Table */}
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          sx={{
            mt: 3,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
            overflowX: "auto",
          }}
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
                  <CircularProgress
                    size={40}
                    sx={{ color: "#1e88e5", mb: 1 }}
                  />
                  <Typography variant="body2" color="textSecondary">
                    Đang làm mới dữ liệu...
                  </Typography>
                </Box>
              </Box>
            )}
            <Box sx={{ p: 3, pb: 0 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Hóa đơn
              </Typography>
            </Box>
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
                        width: "10%",
                      }}
                    >
                      ID
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        color: "text.primary",
                        width: "15%",
                      }}
                    >
                      Loại vé
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        color: "text.primary",
                        width: "20%",
                      }}
                    >
                      Số tiền
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        color: "text.primary",
                        width: "25%",
                      }}
                    >
                      Thời gian
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        color: "text.primary",
                        width: "30%",
                      }}
                    >
                      Nhân viên thu tiền
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map((invoice, index) => (
                    <motion.tr
                      key={invoice.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.5 + index * 0.05,
                        duration: 0.3,
                      }}
                    >
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 600,
                          py: 2,
                          width: "10%",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: "#1e88e5",
                          }}
                        >
                          {invoice.id || "-"}
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
                          {(() => {
                            const typeInfo = getTicketTypeInfo(invoice.from);
                            const IconComponent = typeInfo.icon;

                            return (
                              <Chip
                                icon={
                                  IconComponent ? (
                                    <IconComponent
                                      sx={{
                                        fontSize: "14px !important",
                                        color: `${typeInfo.color} !important`,
                                      }}
                                    />
                                  ) : undefined
                                }
                                label={typeInfo.label}
                                size="small"
                                sx={{
                                  backgroundColor: typeInfo.backgroundColor,
                                  color: typeInfo.color,
                                  fontWeight: 600,
                                  borderRadius: "8px",
                                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                  fontSize: "0.75rem",
                                  "& .MuiChip-icon": {
                                    marginLeft: "8px",
                                  },
                                }}
                              />
                            );
                          })()}
                        </motion.div>
                      </TableCell>
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
                            color: "#4caf50",
                          }}
                        >
                          {invoice.amount
                            ? formatCurrency(invoice.amount)
                            : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          py: 2,
                          width: "25%",
                        }}
                      >
                        <Typography variant="body2">
                          {invoice.created_at
                            ? new Date(invoice.created_at).toLocaleString(
                                "vi-VN"
                              )
                            : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          py: 2,
                          width: "30%",
                        }}
                      >
                        <Typography variant="body2">
                          {invoice.user_id
                            ? customerNames[invoice.user_id] || "-"
                            : "-"}
                        </Typography>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredInvoices.length}
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
            {filteredInvoices.length === 0 && (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <Typography color="textSecondary" variant="h6">
                  Không có hóa đơn nào
                </Typography>
              </Box>
            )}
          </CardContent>
        </MotionCard>
      </Box>
    </LocalizationProvider>
  );
}
