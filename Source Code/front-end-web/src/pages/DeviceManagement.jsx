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
  // Paper,
  Alert,
  TablePagination,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import LoadingScreen from "../components/LoadingScreen";
import AddIcon from "@mui/icons-material/Add";
import StorageIcon from "@mui/icons-material/Storage";
import WarningIcon from "@mui/icons-material/Warning";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import CodeIcon from "@mui/icons-material/Code";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
// import SyntaxHighlighter from "react-syntax-highlighter";
// import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { CiTrash } from "react-icons/ci";
import { PiArrowFatLineUpLight } from "react-icons/pi";
import {
  getAllDevices,
  createDevice,
  deleteDevice,
  updateVersion,
} from "../api/device";
import { useSnackbar } from "../contexts/SnackbarContext";
import Editor from "@monaco-editor/react";

const MotionCard = motion(Card);
const MotionBox = motion(Box);

// Helper function để format board name
const formatBoardName = (board) => {
  const boardMap = {
    "esp32:esp32:esp32": "ESP32",
    "esp32:esp32:esp32c3": "ESP32-C3",
    "esp32:esp32:esp32s2": "ESP32-S2",
    "esp32:esp32:esp32s3": "ESP32-S3",
    "esp8266:esp8266:generic": "ESP8266",
  };
  return boardMap[board] || board;
};

export default function DeviceManagement() {
  const { showSuccess, showError } = useSnackbar();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("add");
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [hasMore, setHasMore] = useState(true);

  const [searchName, setSearchName] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch devices from API với pagination
  useEffect(() => {
    fetchDevices();
  }, [page, rowsPerPage]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const currentPage = page + 1; // Backend sử dụng page bắt đầu từ 1
      const response = await getAllDevices(currentPage, rowsPerPage);
      if (response.data.success) {
        const devicesData = response.data.data || [];
        setDevices(devicesData);
        // Nếu số lượng devices < rowsPerPage thì không còn trang tiếp theo
        setHasMore(devicesData.length === rowsPerPage);
      } else {
        setError("Không thể tải dữ liệu thiết bị");
      }
    } catch (err) {
      console.error("Error fetching devices:", err);
      // Nếu là lỗi 403, để axios interceptor xử lý redirect
      if (err.response?.status === 403) {
        return;
      }
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = async (event, newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChangeRowsPerPage = async (event) => {
    const newRowsPerPage = Number.parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  // Helper function to normalize status
  const normalizeStatus = (status) => {
    if (!status) return "offline";
    return String(status).toLowerCase().trim();
  };

  // Helper function to get status label
  const getStatusLabel = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized === "running") return "Hoạt động";
    if (normalized === "updating") return "Đang cập nhật";
    return "Offline";
  };

  // Filter data ở frontend (có thể chuyển sang backend sau nếu cần)
  const filteredData = devices.filter((device) => {
    const matchName = device.name
      .toLowerCase()
      .includes(searchName.toLowerCase());

    // Map status từ backend sang label hiển thị
    const statusLabel = getStatusLabel(device.status);

    const matchStatus = filterStatus === "all" || statusLabel === filterStatus;

    return matchName && matchStatus;
  });

  // Không cần slice nữa vì đã phân trang ở backend
  const paginatedData = filteredData;

  // Template code mẫu cho Arduino
  const defaultArduinoCode = `
  #include <Arduino.h>

  #ifndef LED_BUILTIN
  #define LED_BUILTIN 2
  #endif

  void setup() {
    Serial.begin(115200);
    pinMode(LED_BUILTIN, OUTPUT);
    Serial.println("Device initialized!");
  }

  void loop() {
    digitalWrite(LED_BUILTIN, HIGH);
    delay(1000);
    digitalWrite(LED_BUILTIN, LOW);
    delay(1000);
    Serial.println("Loop running...");
  }`;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid },
    trigger,
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      name: "",
      board: "esp32:esp32:esp32",
      source_code: "",
    },
  });

  const handleOpenDialog = (type, device = null) => {
    setDialogType(type);
    setSelectedDevice(device);
    setUploadedFileName(null);
    if (device) {
      if (type === "updateVersion") {
        // Mode cập nhật version: fill name và board, code editor rỗng
        reset({
          name: device.name,
          board: device.board,
          source_code: "",
        });
      }
    } else {
      reset({
        name: "",
        board: "esp32:esp32:esp32",
        source_code: defaultArduinoCode,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setUploadedFileName(null);
    reset();
  };

  const handleSaveDevice = async (formData) => {
    try {
      setRefreshing(true);
      setError(null);

      if (dialogType === "add") {
        // Trim và validate dữ liệu trước khi gửi (giống backend)
        const trimmedName = formData.name?.trim();
        const trimmedSourceCode = formData.source_code?.trim();

        // Validate name (giống backend Device.isValidName)
        if (
          !trimmedName ||
          trimmedName.length === 0 ||
          trimmedName.length > 100
        ) {
          showError("Tên thiết bị không hợp lệ (phải có từ 1-100 ký tự)");
          return;
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(trimmedName)) {
          showError(
            "Tên thiết bị không hợp lệ (chỉ chứa chữ, số, gạch ngang và gạch dưới)"
          );
          return;
        }

        // Validate board (giống backend Device.isValidBoard)
        const validBoards = [
          "esp32:esp32:esp32",
          "esp32:esp32:esp32c3",
          "esp32:esp32:esp32s2",
          "esp32:esp32:esp32s3",
          "esp8266:esp8266:generic",
        ];
        if (!formData.board || !validBoards.includes(formData.board)) {
          showError("Board không hợp lệ");
          return;
        }

        // Validate source code (giống backend)
        if (!trimmedSourceCode || typeof trimmedSourceCode !== "string") {
          showError("Source code bắt buộc");
          return;
        }

        const response = await createDevice({
          name: trimmedName,
          board: formData.board,
          source_code: trimmedSourceCode,
        });

        if (response.data.success) {
          await fetchDevices();
          handleCloseDialog();
          const deviceKey = response.data.data?.key;
          if (deviceKey) {
            showSuccess(`Thêm thiết bị thành công!\nKey: ${deviceKey}`, 6000);
          } else {
            showSuccess("Thêm thiết bị thành công!");
          }
        }
      } else if (dialogType === "updateVersion") {
        // Cập nhật version firmware
        const trimmedSourceCode = formData.source_code?.trim();

        // Validate source code
        if (!trimmedSourceCode || typeof trimmedSourceCode !== "string") {
          showError("Source code bắt buộc");
          return;
        }

        if (!selectedDevice || !selectedDevice.id) {
          showError("Không tìm thấy thông tin thiết bị");
          return;
        }

        const response = await updateVersion(selectedDevice.id, {
          source_code: trimmedSourceCode.replace(/\r\n|\r/g, "\n"), // Đảm bảo xuống dòng là \n
        });

        if (response.data.success) {
          await fetchDevices();
          handleCloseDialog();
          showSuccess("Cập nhật firmware thành công!");
        }
      } else {
        // Backend không có API update device, chỉ có updateVersion
        showError(
          "Chức năng cập nhật thiết bị không khả dụng. Vui lòng xóa và tạo mới."
        );
      }
    } catch (error) {
      console.error("Error saving device:", error);
      const errorMessage =
        error.response?.message || "Không thể lưu thiết bị. Vui lòng thử lại.";
      showError(errorMessage);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeviceToDelete(id);
    setDeleteConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await deleteDevice(deviceToDelete);
      if (response.data.success) {
        await fetchDevices();
        setDeleteConfirmDialog(false);
        setDeviceToDelete(null);
        showSuccess("Xóa thiết bị thành công!");
      }
    } catch (error) {
      console.error("Error deleting device:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Không thể xóa thiết bị. Vui lòng thử lại.";
      showError(errorMessage);
    } finally {
      setRefreshing(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // Chỉ chấp nhận file .cpp, .ino, .h, .txt
      const validExtensions = [".cpp", ".ino", ".h", ".txt"];
      const fileExtension = file.name
        .substring(file.name.lastIndexOf("."))
        .toLowerCase();

      if (!validExtensions.includes(fileExtension)) {
        showError("Vui lòng chọn file .cpp, .ino, .h hoặc .txt");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (content) {
          // Đảm bảo xuống dòng là \n
          const formattedContent = content.replace(/\r\n|\r/g, "\n");
          setValue("source_code", formattedContent);
          trigger("source_code");
          setUploadedFileName(file.name);
          showSuccess(`Đã tải file ${file.name} thành công!`);
        }
      };
      reader.onerror = () => {
        showError("Lỗi khi đọc file. Vui lòng thử lại.");
      };
      reader.readAsText(file);

      // Reset input file để có thể chọn lại cùng một file
      event.target.value = null;
    }
  };

  const handleRemoveUploadedFile = () => {
    setUploadedFileName(null);
    setValue("source_code", "");
    trigger("source_code");
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const currentPage = page + 1;
      const response = await getAllDevices(currentPage, rowsPerPage);
      if (response.data.success) {
        const devicesData = response.data.data || [];
        setDevices(devicesData);
        setHasMore(devicesData.length === rowsPerPage);
      } else {
        showError("Không thể tải dữ liệu thiết bị");
      }
    } catch (err) {
      console.error("Error refreshing devices:", err);
      // Nếu là lỗi 403, để axios interceptor xử lý redirect
      if (err.response?.status === 403) {
        return;
      }
      showError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Đang tải dữ liệu thiết bị..." />;
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
            Quản lý thiết bị
          </Typography>
          <Typography color="textSecondary">
            Quản lý các thiết bị đầu vào của bãi đỗ xe
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
            Thêm thiết bị
          </Button>
        </motion.div>
      </MotionBox>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          {
            label: "Tổng thiết bị",
            value: devices.length,
            color: "#1e88e5",
            delay: 0.1,
          },
          {
            label: "Hoạt động",
            value: devices.filter(
              (d) => normalizeStatus(d.status) === "running"
            ).length,
            color: "#4caf50",
            delay: 0.2,
          },
          {
            label: "Offline",
            value: devices.filter(
              (d) => normalizeStatus(d.status) === "offline"
            ).length,
            color: "#f44336",
            delay: 0.3,
          },
        ].map((stat, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
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
                  <StorageIcon
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
            <Grid item xs={12} sm={6} md={4}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm tên thiết bị..."
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
                    <MenuItem value="Đang cập nhật">Đang cập nhật</MenuItem>
                    <MenuItem value="Offline">Offline</MenuItem>
                  </Select>
                </FormControl>
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
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
                      width: "15%",
                    }}
                  >
                    Tên thiết bị
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                      width: "12%",
                    }}
                  >
                    Loại board
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                      width: "10%",
                    }}
                  >
                    Phiên bản mới nhất
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                      width: "10%",
                    }}
                  >
                    Phiên bản hiện tại
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                      width: "10%",
                    }}
                  >
                    Tổng phiên bản
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                      width: "13%",
                    }}
                  >
                    Trạng thái
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                      width: "20%",
                    }}
                  >
                    Hành động
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((device, index) => (
                  <motion.tr
                    key={device.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05, duration: 0.3 }}
                  >
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 600,
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
                        {device.name}
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
                      <Typography variant="body2" color="text.secondary">
                        {formatBoardName(device.board)}
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
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: "primary.main",
                        }}
                      >
                        v{device.latest_version || "N/A"}
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
                      <Typography
                        variant="body2"
                        color={
                          device.curr_version ? "success.main" : "text.disabled"
                        }
                        sx={{
                          fontWeight: device.curr_version ? 600 : 400,
                        }}
                      >
                        {device.curr_version
                          ? `v${device.curr_version}`
                          : "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        py: 2,
                        width: "10%",
                        minWidth: "70px",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {device.total_versions || 0}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        py: 2,
                        width: "13%",
                        minWidth: "120px",
                      }}
                    >
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Chip
                          label={getStatusLabel(device.status)}
                          size="small"
                          sx={{
                            backgroundColor:
                              normalizeStatus(device.status) === "running"
                                ? "#dbfde5"
                                : normalizeStatus(device.status) === "updating"
                                ? "#fff3cd"
                                : "#fdeaea",
                            color:
                              normalizeStatus(device.status) === "running"
                                ? "#036333"
                                : normalizeStatus(device.status) === "updating"
                                ? "#856404"
                                : "#d32f2f",
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
                        width: "20%",
                        minWidth: "150px",
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
                          <Tooltip title="Cập nhật version">
                            <Button
                              size="small"
                              startIcon={<PiArrowFatLineUpLight />}
                              onClick={() =>
                                handleOpenDialog("updateVersion", device)
                              }
                              sx={{
                                borderRadius: "8px",
                                textTransform: "none",
                                fontWeight: 600,
                                color: "#4caf50",
                                fontSize: "0.75rem",
                                px: 1.5,
                                py: 0.5,
                                transition: "all 0.3s",
                                "&:hover": {
                                  bgcolor: "rgba(76, 175, 80, 0.1)",
                                },
                              }}
                            >
                              Cập nhật
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
                              onClick={() => handleDeleteClick(device.id)}
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
            count={-1} // -1 để hiển thị "1–10 of many" thay vì số cụ thể
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelDisplayedRows={({ from, to }) => {
              if (hasMore) {
                return `${from}–${to} of many`;
              }
              return `${from}–${to} of ${filteredData.length}`;
            }}
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
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: "90vh",
            borderRadius: "16px",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.2rem" }}>
          {dialogType === "add"
            ? "Thêm thiết bị mới"
            : dialogType === "updateVersion"
            ? "Cập nhật firmware"
            : "Xem thông tin thiết bị"}
        </DialogTitle>
        <DialogContent
          sx={{
            pt: 2,
            overflow: "auto",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#f1f1f1",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#888",
              borderRadius: "4px",
              "&:hover": {
                background: "#555",
              },
            },
          }}
        >
          <form onSubmit={handleSubmit(handleSaveDevice)}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Controller
                name="name"
                control={control}
                rules={{
                  required: "Tên thiết bị không được để trống",
                  minLength: {
                    value: 1,
                    message: "Tên thiết bị phải có ít nhất 1 ký tự",
                  },
                  maxLength: {
                    value: 100,
                    message: "Tên thiết bị tối đa 100 ký tự",
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_-]+$/,
                    message:
                      "Tên chỉ được chứa chữ, số, gạch ngang và gạch dưới",
                  },
                  validate: (value) => {
                    const trimmed = value?.trim();
                    if (!trimmed || trimmed.length === 0) {
                      return "Tên thiết bị không được để trống";
                    }
                    if (trimmed.length > 100) {
                      return "Tên thiết bị tối đa 100 ký tự";
                    }
                    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
                      return "Tên chỉ được chứa chữ, số, gạch ngang và gạch dưới";
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
                      label="Tên thiết bị"
                      error={!!error}
                      helperText={error?.message}
                      disabled={
                        dialogType === "edit" || dialogType === "updateVersion"
                      }
                      onChange={(e) => {
                        // Không cho phép khoảng trắng ở đầu và cuối
                        const value = e.target.value;
                        field.onChange(value);
                        trigger("name");
                      }}
                      onBlur={(e) => {
                        // Trim khi blur
                        const trimmed = e.target.value.trim();
                        field.onChange(trimmed);
                        trigger("name");
                      }}
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
                name="board"
                control={control}
                rules={{
                  required: "Vui lòng chọn loại board",
                  validate: (value) => {
                    const validBoards = [
                      "esp32:esp32:esp32",
                      "esp32:esp32:esp32c3",
                      "esp32:esp32:esp32s2",
                      "esp32:esp32:esp32s3",
                      "esp8266:esp8266:generic",
                    ];
                    if (!value) {
                      return "Vui lòng chọn loại board";
                    }
                    if (!validBoards.includes(value)) {
                      return "Board không hợp lệ";
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
                      <InputLabel id="board-select-label">
                        Loại board
                      </InputLabel>
                      <Select
                        labelId="board-select-label"
                        id="board-select"
                        {...field}
                        label="Loại board"
                        disabled={
                          dialogType === "edit" ||
                          dialogType === "updateVersion"
                        }
                        onChange={(e) => {
                          field.onChange(e);
                          trigger("board");
                        }}
                        onBlur={() => trigger("board")}
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
                        <MenuItem value="esp32:esp32:esp32">ESP32</MenuItem>
                        <MenuItem value="esp32:esp32:esp32c3">
                          ESP32-C3
                        </MenuItem>
                        <MenuItem value="esp32:esp32:esp32s2">
                          ESP32-S2
                        </MenuItem>
                        <MenuItem value="esp32:esp32:esp32s3">
                          ESP32-S3
                        </MenuItem>
                        <MenuItem value="esp8266:esp8266:generic">
                          ESP8266
                        </MenuItem>
                      </Select>
                      {error && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5, ml: 2 }}
                        >
                          {error.message}
                        </Typography>
                      )}
                    </FormControl>
                  </motion.div>
                )}
              />
              <Controller
                name="source_code"
                control={control}
                rules={{
                  required: "Source code không được để trống",
                  validate: (value) => {
                    if (!value) {
                      return "Source code không được để trống";
                    }
                    if (typeof value !== "string") {
                      return "Source code phải là chuỗi ký tự";
                    }
                    const trimmed = value.trim();
                    if (trimmed.length === 0) {
                      return "Source code không được để trống";
                    }
                    return true;
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        mt: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: error ? "error.main" : "text.primary",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <CodeIcon sx={{ fontSize: 20 }} />
                          Source code (Arduino C++)
                          {error && (
                            <Typography
                              component="span"
                              variant="caption"
                              sx={{ ml: 1, color: "error.main" }}
                            >
                              *
                            </Typography>
                          )}
                        </Typography>
                        {(dialogType === "add" ||
                          dialogType === "updateVersion") && (
                          <Box sx={{ display: "flex", gap: 1 }}>
                            {dialogType === "add" && (
                              <Tooltip
                                title="Tải code mẫu"
                                placement="top"
                                arrow
                              >
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setValue("source_code", defaultArduinoCode);
                                    setUploadedFileName(null);
                                    trigger("source_code");
                                  }}
                                  sx={{
                                    color: "primary.main",
                                    "&:hover": {
                                      bgcolor: "rgba(30, 136, 229, 0.1)",
                                    },
                                  }}
                                >
                                  <CodeIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip
                              title={
                                uploadedFileName
                                  ? "Chỉ được upload 1 file"
                                  : "Tải file code (.cpp, .ino, .h, .txt)"
                              }
                              placement="top"
                              arrow
                            >
                              <IconButton
                                size="small"
                                component="label"
                                disabled={!!uploadedFileName}
                                sx={{
                                  color: uploadedFileName
                                    ? "text.disabled"
                                    : "primary.main",
                                  "&:hover": {
                                    bgcolor: uploadedFileName
                                      ? "transparent"
                                      : "rgba(30, 136, 229, 0.1)",
                                  },
                                }}
                              >
                                <FileUploadIcon fontSize="small" />
                                <input
                                  type="file"
                                  accept=".cpp,.ino,.h,.txt"
                                  onChange={handleFileUpload}
                                  hidden
                                />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                        {uploadedFileName &&
                          (dialogType === "add" ||
                            dialogType === "updateVersion") && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Box
                                sx={{
                                  mt: 1.5,
                                  p: 1.5,
                                  bgcolor: "rgba(30, 136, 229, 0.08)",
                                  borderRadius: "10px",
                                  border: "1px solid rgba(30, 136, 229, 0.2)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: 1,
                                  boxShadow:
                                    "0 2px 8px rgba(30, 136, 229, 0.15)",
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    flex: 1,
                                    minWidth: 0,
                                  }}
                                >
                                  <FileUploadIcon
                                    sx={{
                                      color: "primary.main",
                                      fontSize: 20,
                                      flexShrink: 0,
                                    }}
                                  />
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 600,
                                      color: "primary.main",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                    title={uploadedFileName}
                                  >
                                    {uploadedFileName}
                                  </Typography>
                                </Box>
                                <Tooltip
                                  title="Xóa file đã upload"
                                  placement="top"
                                  arrow
                                >
                                  <IconButton
                                    size="small"
                                    onClick={handleRemoveUploadedFile}
                                    sx={{
                                      color: "error.main",
                                      "&:hover": {
                                        bgcolor: "rgba(244, 67, 54, 0.1)",
                                      },
                                    }}
                                  >
                                    <CloseIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </motion.div>
                          )}
                      </Box>
                      <Box
                        sx={{
                          border: error ? "2px solid" : "1px solid",
                          borderColor: error ? "error.main" : "divider",
                          borderRadius: "10px",
                          overflow: "hidden",
                          transition: "all 0.3s",
                          "&:hover": {
                            borderColor: error ? "error.main" : "primary.main",
                            boxShadow: error
                              ? "0 2px 8px rgba(211, 47, 47, 0.15)"
                              : "0 2px 8px rgba(30, 136, 229, 0.15)",
                          },
                          "&:focus-within": {
                            borderColor: error ? "error.main" : "primary.main",
                            boxShadow: error
                              ? "0 4px 12px rgba(211, 47, 47, 0.25)"
                              : "0 4px 12px rgba(30, 136, 229, 0.25)",
                          },
                        }}
                      >
                        <Editor
                          height="450px"
                          language="cpp"
                          value={field.value || ""}
                          onChange={(value) => {
                            field.onChange(value || "");
                            trigger("source_code");
                          }}
                          onBlur={() => {
                            trigger("source_code");
                          }}
                          theme="vs-dark"
                          options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            fontFamily:
                              "'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace",
                            lineNumbers: "on",
                            roundedSelection: false,
                            scrollBeyondLastLine: false,
                            readOnly: dialogType === "edit",
                            automaticLayout: true,
                            tabSize: 2,
                            insertSpaces: true,
                            wordWrap: "on",
                            formatOnPaste: true,
                            formatOnType: true,
                            suggestOnTriggerCharacters: true,
                            acceptSuggestionOnEnter: "on",
                            snippetSuggestions: "top",
                            quickSuggestions: {
                              other: true,
                              comments: true,
                              strings: true,
                            },
                            padding: { top: 12, bottom: 12 },
                            scrollbar: {
                              vertical: "auto",
                              horizontal: "auto",
                              useShadows: false,
                              verticalHasArrows: false,
                              horizontalHasArrows: false,
                              verticalScrollbarSize: 10,
                              horizontalScrollbarSize: 10,
                            },
                            renderLineHighlight: "all",
                            cursorBlinking: "smooth",
                            cursorSmoothCaretAnimation: "on",
                            smoothScrolling: true,
                            bracketPairColorization: {
                              enabled: true,
                            },
                            guides: {
                              bracketPairs: true,
                              indentation: true,
                            },
                            colorDecorators: true,
                            contextmenu: true,
                            mouseWheelZoom: true,
                            multiCursorModifier: "ctrlCmd",
                            accessibilitySupport: "auto",
                          }}
                          loading={
                            <Box
                              sx={{
                                height: "450px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: "#1e1e1e",
                                gap: 2,
                              }}
                            >
                              <CircularProgress
                                size={40}
                                sx={{ color: "#1e88e5" }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ color: "#888", fontFamily: "monospace" }}
                              >
                                Đang tải editor...
                              </Typography>
                            </Box>
                          }
                        />
                      </Box>
                      {error && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5, ml: 1, display: "block" }}
                        >
                          {error.message}
                        </Typography>
                      )}
                      {!error && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 0.5, ml: 1, display: "block" }}
                        >
                          Source code sẽ được biên dịch thành firmware
                        </Typography>
                      )}
                    </Box>
                  </motion.div>
                )}
              />
            </Box>
            {/* )} */}
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ textTransform: "none" }}>
            Hủy
          </Button>
          {dialogType === "add" && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleSubmit(handleSaveDevice)}
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
                {refreshing ? "Đang tạo..." : "Tạo thiết bị"}
              </Button>
            </motion.div>
          )}
          {dialogType === "updateVersion" && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleSubmit(handleSaveDevice)}
                variant="contained"
                disabled={!isValid || refreshing}
                sx={{
                  background: isValid
                    ? "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)"
                    : "rgba(0, 0, 0, 0.12)",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:disabled": {
                    color: "rgba(0, 0, 0, 0.26)",
                    backgroundColor: "rgba(0, 0, 0, 0.12)",
                  },
                }}
              >
                {refreshing ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </motion.div>
          )}
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
              Bạn có chắc chắn muốn xóa thiết bị này không? Hành động này không
              thể hoàn tác.
            </Alert>
            <Typography color="textSecondary">
              Thiết bị:{" "}
              <strong>
                {devices.find((d) => d.id === deviceToDelete)?.name}
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
