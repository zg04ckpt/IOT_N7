"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  Typography,
  InputAdornment,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Dialog,
  DialogContent,
  IconButton,
  Zoom,
  Tooltip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { vi } from "date-fns/locale";
import { motion } from "framer-motion";
import LoadingScreen from "../components/LoadingScreen";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CloseIcon from "@mui/icons-material/Close";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import RefreshIcon from "@mui/icons-material/Refresh";
import SortIcon from "@mui/icons-material/Sort";
import { getAllParkingSessions } from "../api/parkingSession";
import * as XLSX from "xlsx";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

export default function ParkingList() {
  const [searchPlate, setSearchPlate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [parkingData, setParkingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    const fetchParkingSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllParkingSessions();
        setParkingData(response.data.data || []);
      } catch (err) {
        console.error("Error fetching parking sessions:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchParkingSessions();
  }, []);

  const filteredData = parkingData
    .filter((item) => {
      const plate = item?.licensePlate || item?.plate || "";
      const status = item?.timeEnd ? "Đã thanh toán" : "Đang gửi";

      const matchPlate = plate
        .toLowerCase()
        .includes(searchPlate.toLowerCase());
      const matchStatus = filterStatus === "all" || status === filterStatus;

      let matchDate = true;

      if (filterStartDate || filterEndDate) {
        const itemStartDate = new Date(item.timeStart);
        const itemEndDate = item.timeEnd
          ? new Date(item.timeEnd)
          : new Date(item.timeStart);

        let matchStart = true;
        let matchEnd = true;

        if (filterStartDate) {
          const filterStart = new Date(filterStartDate);
          filterStart.setHours(0, 0, 0, 0);
          matchStart = itemStartDate >= filterStart;
        }

        if (filterEndDate) {
          const filterEnd = new Date(filterEndDate);
          filterEnd.setHours(23, 59, 59, 999);
          matchEnd = itemEndDate <= filterEnd;
        }

        matchDate = matchStart && matchEnd;
      }

      return matchPlate && matchStatus && matchDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.timeStart);
      const dateB = new Date(b.timeStart);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleImageClick = (imageUrl, plate) => {
    setSelectedImage({ url: imageUrl, plate });
    setLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
    setSelectedImage(null);
  };

  const handleClearFilters = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await getAllParkingSessions();
      setParkingData(response.data.data || []);
      setSearchPlate("");
      setFilterStatus("all");
      setFilterStartDate(null);
      setFilterEndDate(null);
      setPage(0);
    } catch (err) {
      console.error("Error refreshing parking sessions:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleSortToggle = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  const handleExportToExcel = () => {
    try {
      const exportData = parkingData.map((item, index) => {
        const formatDate = (dateString) => {
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

        const calculateDuration = (timeStart, timeEnd) => {
          if (!timeStart) return "-";
          if (!timeEnd) return "Đang gửi";

          const start = new Date(timeStart);
          const end = new Date(timeEnd);
          const diffMs = end - start;
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          const diffMinutes = Math.floor(
            (diffMs % (1000 * 60 * 60)) / (1000 * 60)
          );
          const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

          return `${diffHours}h ${diffMinutes}m ${diffSeconds}s`;
        };

        const formatPrice = (price, isMonthlyCard) => {
          if (isMonthlyCard) return "-";
          if (!price || price === 0) return "-";
          return `${price.toLocaleString("vi-VN")} VND`;
        };

        const status = item.timeEnd ? "Đã thanh toán" : "Đang gửi";
        const plate = item.licensePlate || item.plate || "N/A";
        const ticketType = item.isMonthlyCard ? "Vé tháng" : "Vé lượt";

        return {
          STT: index + 1,
          "ID thẻ": item.cardId || "N/A",
          "Biển số": plate,
          "Loại vé": ticketType,
          "Giờ vào": formatDate(item.timeStart),
          "Giờ ra": formatDate(item.timeEnd),
          "Thời gian": calculateDuration(item.timeStart, item.timeEnd),
          Tiền: formatPrice(item.price, item.isMonthlyCard),
          "Trạng thái": status,
          "Link ảnh": item.imageUrl || "-",
          "Ngày tạo": formatDate(item.createdAt),
        };
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      const colWidths = [
        { wch: 5 }, // STT
        { wch: 10 }, // ID thẻ
        { wch: 15 }, // Biển số
        { wch: 12 }, // Loại vé
        { wch: 20 }, // Giờ vào
        { wch: 20 }, // Giờ ra
        { wch: 15 }, // Thời gian
        { wch: 15 }, // Tiền
        { wch: 15 }, // Trạng thái
        { wch: 50 }, // Link ảnh
        { wch: 20 }, // Ngày tạo
      ];
      ws["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Danh sách xe gửi");

      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      const filename = `Danh_sach_xe_gui_${dateStr}.xlsx`;

      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      setError("Không thể xuất file Excel. Vui lòng thử lại.");
    }
  };

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return <LoadingScreen message="Đang tải dữ liệu bãi đỗ xe..." />;
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
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header */}
        <MotionBox
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          sx={{ mb: 4 }}
        >
          <Typography
            variant="h2"
            sx={{ mb: 1, fontSize: { xs: "1.8rem", sm: "2.5rem" } }}
          >
            Danh sách xe gửi
          </Typography>
          <Typography color="textSecondary">
            Xem lịch sử các lượt đỗ xe
          </Typography>
        </MotionBox>

        {/* Filters */}
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          sx={{ mb: 3, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}
        >
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <TextField
                    fullWidth
                    placeholder="Tìm kiếm biển số..."
                    value={searchPlate}
                    onChange={(e) => setSearchPlate(e.target.value)}
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
                      <MenuItem value="Đang gửi">Đang gửi</MenuItem>
                      <MenuItem value="Đã thanh toán">Đã thanh toán</MenuItem>
                    </Select>
                  </FormControl>
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <DatePicker
                    label="Từ ngày"
                    value={filterStartDate}
                    onChange={(newValue) => setFilterStartDate(newValue)}
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
              <Grid item xs={12} sm={6} md={2}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <DatePicker
                    label="Đến ngày"
                    value={filterEndDate}
                    onChange={(newValue) => setFilterEndDate(newValue)}
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
              <Grid item xs={12} sm={6} md={2}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FileDownloadIcon />}
                    onClick={handleExportToExcel}
                    disabled={loading || parkingData.length === 0}
                    sx={{
                      height: "56px",
                      borderRadius: "10px",
                      fontWeight: 600,
                      textTransform: "none",
                      fontSize: "1rem",
                      borderColor: "#1e88e5",
                      color: "#1e88e5",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        borderColor: "#00bcd4",
                        color: "#00bcd4",
                        bgcolor: "rgba(30, 136, 229, 0.05)",
                      },
                      "&:disabled": {
                        borderColor: "#ccc",
                        color: "#ccc",
                        bgcolor: "#f5f5f5",
                      },
                    }}
                  >
                    Xuất Excel
                  </Button>
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
                      onClick={handleClearFilters}
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
          transition={{ delay: 0.2, duration: 0.5 }}
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
                      Hình ảnh
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
                      Biển số
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 700, color: "text.primary" }}
                    >
                      Loại vé
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 700, color: "text.primary" }}
                    >
                      Giờ vào
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 700, color: "text.primary" }}
                    >
                      Giờ ra
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 700, color: "text.primary" }}
                    >
                      Thời gian
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 700, color: "text.primary" }}
                    >
                      Tiền
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 700, color: "text.primary" }}
                    >
                      Trạng thái
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map((row, index) => {
                    // Helper function to format date
                    const formatDate = (dateString) => {
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

                    // Helper function to calculate duration
                    const calculateDuration = (timeStart, timeEnd) => {
                      if (!timeStart) return "-";
                      if (!timeEnd) return "Đang gửi";

                      const start = new Date(timeStart);
                      const end = new Date(timeEnd);
                      const diffMs = end - start;
                      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                      const diffMinutes = Math.floor(
                        (diffMs % (1000 * 60 * 60)) / (1000 * 60)
                      );
                      const diffSeconds = Math.floor(
                        (diffMs % (1000 * 60)) / 1000
                      );

                      return `${diffHours}h ${diffMinutes}m ${diffSeconds}s`;
                    };

                    const formatPrice = (price, ticketType) => {
                      if (ticketType === "Vé tháng") return "-";
                      if (!price || price === 0) return "-";
                      return `${price.toLocaleString("vi-VN")} VND`;
                    };

                    const status = row.timeEnd ? "Đã thanh toán" : "Đang gửi";
                    const plate = row.licensePlate || row.plate || "N/A";
                    const ticketType = row.isMonthlyCard
                      ? "Vé tháng"
                      : "Vé lượt";

                    return (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.3 + index * 0.05,
                          duration: 0.3,
                        }}
                      >
                        <TableCell align="center" sx={{ py: 2 }}>
                          <Tooltip
                            title={
                              row.imageUrl
                                ? "Click để xem chi tiết"
                                : "Không có hình ảnh"
                            }
                            placement="top"
                            arrow
                          >
                            <Box
                              sx={{
                                width: 60,
                                height: 40,
                                borderRadius: "8px",
                                overflow: "hidden",
                                mx: "auto",
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                                border: "2px solid #e3f2fd",
                                cursor: row.imageUrl ? "pointer" : "default",
                                position: "relative",
                                transition: "all 0.3s ease",
                                "&:hover": row.imageUrl
                                  ? {
                                      transform: "scale(1.05)",
                                      boxShadow:
                                        "0 4px 16px rgba(0, 0, 0, 0.2)",
                                      border: "2px solid #1e88e5",
                                    }
                                  : {},
                              }}
                              onClick={() =>
                                row.imageUrl &&
                                handleImageClick(row.imageUrl, plate)
                              }
                            >
                              {row.imageUrl ? (
                                <>
                                  <img
                                    src={row.imageUrl}
                                    alt={`Xe ${plate}`}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                      e.target.nextSibling.style.display =
                                        "flex";
                                    }}
                                  />
                                  <Box
                                    sx={{
                                      position: "absolute",
                                      top: "50%",
                                      left: "50%",
                                      transform: "translate(-50%, -50%)",
                                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                                      borderRadius: "50%",
                                      width: "24px",
                                      height: "24px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      opacity: 0,
                                      transition: "opacity 0.3s ease",
                                      "&:hover": {
                                        opacity: 1,
                                      },
                                    }}
                                  >
                                    <ZoomInIcon
                                      sx={{ color: "white", fontSize: "16px" }}
                                    />
                                  </Box>
                                </>
                              ) : null}
                              <Box
                                sx={{
                                  width: "100%",
                                  height: "100%",
                                  display: row.imageUrl ? "none" : "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  backgroundColor: "#f5f5f5",
                                  color: "#666",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                }}
                              >
                                N/A
                              </Box>
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: 600, py: 2 }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: "text.primary",
                            }}
                          >
                            {row.cardId || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: 600, py: 2 }}
                        >
                          {plate}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 2 }}>
                          {ticketType}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 2 }}>
                          {formatDate(row.timeStart)}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 2 }}>
                          {formatDate(row.timeEnd)}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 2 }}>
                          {calculateDuration(row.timeStart, row.timeEnd)}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 2 }}>
                          {formatPrice(row.price, ticketType)}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 2 }}>
                          <Chip
                            label={status}
                            sx={{
                              backgroundColor:
                                status === "Đang gửi" ? "#dbeafd" : "#dbfde5",
                              color:
                                status === "Đang gửi" ? "#223ad2" : "#036333",
                              width: "100%",
                              fontWeight: 600,
                              borderRadius: "8px",
                              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                            }}
                          />
                        </TableCell>
                      </motion.tr>
                    );
                  })}
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
            {filteredData.length === 0 && !loading && (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <Typography color="textSecondary" variant="h6">
                  {parkingData.length === 0
                    ? "Chưa có dữ liệu xe gửi"
                    : "Không tìm thấy dữ liệu phù hợp"}
                </Typography>
              </Box>
            )}
          </CardContent>
        </MotionCard>

        {/* Lightbox Dialog */}
        <Dialog
          open={lightboxOpen}
          onClose={handleCloseLightbox}
          maxWidth={false}
          fullWidth
          TransitionComponent={Zoom}
          transitionDuration={300}
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
              backgroundColor: "rgba(0, 0, 0, 0.8)",
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
            {/* Close Button */}
            <IconButton
              onClick={handleCloseLightbox}
              sx={{
                position: "fixed",
                top: 16,
                right: 16,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                color: "white",
                zIndex: 1000,
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>

            {/* Image */}
            {selectedImage && (
              <motion.img
                src={selectedImage.url}
                alt={`Xe ${selectedImage.plate}`}
                style={{
                  maxWidth: "100vw",
                  maxHeight: "100vh",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}
