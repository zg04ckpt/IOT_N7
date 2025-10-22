"use client";

import { useState } from "react";
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
  Paper,
  Alert,
  TablePagination,
  InputAdornment,
} from "@mui/material";
import { motion } from "framer-motion";
import AddIcon from "@mui/icons-material/Add";
import StorageIcon from "@mui/icons-material/Storage";
import WarningIcon from "@mui/icons-material/Warning";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import SearchIcon from "@mui/icons-material/Search";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { CiTrash, CiEdit } from "react-icons/ci";
import { PiArrowFatLineUpLight } from "react-icons/pi";

const MotionCard = motion(Card);
const MotionBox = motion(Box);

export default function DeviceManagement() {
  const [devices, setDevices] = useState([
    {
      id: 1,
      name: "Camera Check-In 1",
      type: "Camera",
      status: "Hoạt động",
      ip: "192.168.1.10",
      lastUpdate: "2024-10-22 14:30",
    },
    {
      id: 2,
      name: "Đầu đọc thẻ 1",
      type: "RFID Reader",
      status: "Hoạt động",
      ip: "192.168.1.11",
      lastUpdate: "2024-10-22 14:25",
    },
    {
      id: 3,
      name: "Camera Check-Out 1",
      type: "Camera",
      status: "Hoạt động",
      ip: "192.168.1.12",
      lastUpdate: "2024-10-22 14:20",
    },
    {
      id: 4,
      name: "Đầu đọc thẻ 2",
      type: "RFID Reader",
      status: "Cảnh báo",
      ip: "192.168.1.13",
      lastUpdate: "2024-10-22 13:50",
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("add");
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [searchName, setSearchName] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [searchIp, setSearchIp] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredData = devices.filter((device) => {
    const matchName = device.name
      .toLowerCase()
      .includes(searchName.toLowerCase());
    const matchType = filterType === "all" || device.type === filterType;
    const matchIp = device.ip
      .toLowerCase()
      .includes(searchIp.toLowerCase());
    const matchStatus = filterStatus === "all" || device.status === filterStatus;
    return matchName && matchType && matchIp && matchStatus;
  });

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      name: "",
      type: "",
      ip: "",
      firmware: "",
      code: "",
    },
  });

  const handleOpenDialog = (type, device = null) => {
    setDialogType(type);
    setSelectedDevice(device);
    if (device) {
      reset({
        name: device.name,
        type: device.type,
        ip: device.ip,
        firmware: "",
        code: "",
      });
    } else {
      reset({
        name: "",
        type: "",
        ip: "",
        firmware: "",
        code: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setUploadedFileName("");
    reset();
  };

  const handleSaveDevice = (formData) => {
    if (dialogType === "add") {
      const newDevice = {
        id: Math.max(...devices.map((d) => d.id), 0) + 1,
        name: formData.name,
        type: formData.type,
        ip: formData.ip,
        status: "Hoạt động",
        lastUpdate: new Date().toLocaleString("vi-VN"),
      };
      setDevices([...devices, newDevice]);
    } else if (dialogType === "edit") {
      setDevices(
        devices.map((d) =>
          d.id === selectedDevice.id
            ? {
                ...d,
                name: formData.name,
                type: formData.type,
                ip: formData.ip,
                lastUpdate: new Date().toLocaleString("vi-VN"),
              }
            : d
        )
      );
    }
    handleCloseDialog();
  };

  const handleDeleteClick = (id) => {
    setDeviceToDelete(id);
    setDeleteConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    setDevices(devices.filter((d) => d.id !== deviceToDelete));
    setDeleteConfirmDialog(false);
    setDeviceToDelete(null);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith(".cpp")) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        const codeInput = document.querySelector('textarea[name="code"]');
        if (codeInput) {
          codeInput.value = content;
          const changeEvent = new Event("input", { bubbles: true });
          codeInput.dispatchEvent(changeEvent);
        }
      };
      reader.readAsText(file);
    } else {
      alert("Vui lòng chọn file .cpp");
    }
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
            value: devices.filter((d) => d.status === "Hoạt động").length,
            color: "#4caf50",
            delay: 0.2,
          },
          {
            label: "Cảnh báo",
            value: devices.filter((d) => d.status === "Cảnh báo").length,
            color: "#ff9800",
            delay: 0.3,
          },
          {
            label: "Offline",
            value: devices.filter((d) => d.status === "Offline").length,
            color: "#f44336",
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
            <Grid item xs={12} sm={6} md={3}>
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
            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FormControl fullWidth>
                  <InputLabel id="type-select-label">Loại thiết bị</InputLabel>
                  <Select
                    labelId="type-select-label"
                    id="type-select"
                    value={filterType}
                    label="Loại thiết bị"
                    onChange={(e) => setFilterType(e.target.value)}
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
                    <MenuItem value="Camera">Camera</MenuItem>
                    <MenuItem value="RFID Reader">RFID Reader</MenuItem>
                    <MenuItem value="Barrier">Cổng chắn</MenuItem>
                  </Select>
                </FormControl>
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm địa chỉ IP..."
                  value={searchIp}
                  onChange={(e) => setSearchIp(e.target.value)}
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
                    <MenuItem value="Cảnh báo">Cảnh báo</MenuItem>
                    <MenuItem value="Offline">Offline</MenuItem>
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
                    Tên thiết bị
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, color: "text.primary" }}
                  >
                    Loại
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, color: "text.primary" }}
                  >
                    Địa chỉ IP
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
                    Cập nhật lần cuối
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
                {paginatedData.map((device, index) => (
                  <motion.tr
                    key={device.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05, duration: 0.3 }}
                  >
                    <TableCell align="center" sx={{ fontWeight: 600, py: 2 }}>
                      {device.name}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      {device.type}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        py: 2,
                        fontFamily: "monospace",
                        fontSize: "0.9rem",
                      }}
                    >
                      {device.ip}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Chip
                          label={device.status}
                          sx={{
                            backgroundColor:
                              device.status === "Hoạt động"
                                ? "#dbfde5"
                                : "#fbf8c3",
                            color:
                              device.status === "Hoạt động"
                                ? "#036333"
                                : "#844f0b",
                            width: "100%",
                            fontWeight: 600,
                            borderRadius: "8px",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                      </motion.div>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      {device.lastUpdate}
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
                          <Tooltip title="Cập nhật firmware">
                            <Button
                              size="small"
                              startIcon={<PiArrowFatLineUpLight />}
                              onClick={() =>
                                handleOpenDialog("firmware", device)
                              }
                              sx={{
                                borderRadius: "8px",
                                textTransform: "none",
                                fontWeight: 600,
                                color: "#1e88e5",
                                transition: "all 0.3s",
                                "&:hover": {
                                  bgcolor: "rgba(30, 136, 229, 0.1)",
                                },
                              }}
                            >
                              Firmware
                            </Button>
                          </Tooltip>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Tooltip title="Chỉnh sửa">
                            <Button
                              size="small"
                              startIcon={<CiEdit />}
                              onClick={() => handleOpenDialog("edit", device)}
                              sx={{
                                borderRadius: "8px",
                                textTransform: "none",
                                fontWeight: 600,
                                color: "#ff9800",
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

      {/* Main Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.2rem" }}>
          {dialogType === "add"
            ? "Thêm thiết bị mới"
            : dialogType === "edit"
            ? "Chỉnh sửa thiết bị"
            : "Cập nhật Firmware"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <form onSubmit={handleSubmit(handleSaveDevice)}>
            {dialogType === "firmware" ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Chọn firmware để cập nhật cho thiết bị:{" "}
                  <strong>{selectedDevice?.name}</strong>
                </Typography>
                <Controller
                  name="firmware"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel id="firmware-select-label">
                        Chọn firmware
                      </InputLabel>
                      <Select
                        labelId="firmware-select-label"
                        id="firmware-select"
                        {...field}
                        label="Chọn firmware"
                      >
                        <MenuItem value="v1.0">
                          Firmware v1.0 (Mặc định)
                        </MenuItem>
                        <MenuItem value="v1.1">
                          Firmware v1.1 (Cải tiến)
                        </MenuItem>
                        <MenuItem value="v2.0">Firmware v2.0 (Mới)</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />

                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
                    Tải file mã nguồn (.cpp)
                  </Typography>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<FileUploadIcon />}
                      fullWidth
                      sx={{
                        borderRadius: "10px",
                        textTransform: "none",
                        fontWeight: 600,
                        borderColor: "#1e88e5",
                        color: "#1e88e5",
                        py: 1.5,
                        transition: "all 0.3s",
                        "&:hover": {
                          bgcolor: "rgba(30, 136, 229, 0.05)",
                          borderColor: "#1565c0",
                        },
                      }}
                    >
                      Chọn file .cpp
                      <input
                        type="file"
                        accept=".cpp"
                        onChange={handleFileUpload}
                        hidden
                      />
                    </Button>
                  </motion.div>

                  {uploadedFileName && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Box
                        sx={{
                          mt: 2,
                          p: 2,
                          bgcolor: "rgba(76, 175, 80, 0.08)",
                          borderRadius: "10px",
                          border: "1px solid rgba(76, 175, 80, 0.3)",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          boxShadow: "0 2px 8px rgba(76, 175, 80, 0.15)",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#2e7d32" }}
                        >
                          {uploadedFileName}
                        </Typography>
                      </Box>
                    </motion.div>
                  )}
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
                    Mã nguồn C++ (hoặc dán code trực tiếp)
                  </Typography>
                  <Controller
                    name="code"
                    control={control}
                    render={({ field }) => (
                      <Box>
                        <TextField
                          {...field}
                          fullWidth
                          multiline
                          rows={6}
                          placeholder="Nhập hoặc dán mã nguồn C++ tại đây..."
                          sx={{
                            mb: 1,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "10px",
                              fontFamily: "monospace",
                              fontSize: "0.85rem",
                            },
                          }}
                        />
                        {field.value && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Paper
                              sx={{
                                borderRadius: "10px",
                                overflow: "hidden",
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                              }}
                            >
                              <SyntaxHighlighter
                                language="cpp"
                                style={atomOneDark}
                                customStyle={{
                                  margin: 0,
                                  padding: "16px",
                                  borderRadius: "10px",
                                  fontSize: "0.85rem",
                                  lineHeight: "1.5",
                                }}
                                showLineNumbers
                                wrapLines
                              >
                                {field.value}
                              </SyntaxHighlighter>
                            </Paper>
                          </motion.div>
                        )}
                      </Box>
                    )}
                  />
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: "Tên thiết bị không được để trống" }}
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
                  name="type"
                  control={control}
                  rules={{ required: "Loại thiết bị không được để trống" }}
                  render={({ field, fieldState: { error } }) => (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <FormControl fullWidth error={!!error}>
                        <InputLabel id="type-select-label">
                          Loại thiết bị
                        </InputLabel>
                        <Select
                          labelId="type-select-label"
                          id="type-select"
                          {...field}
                          label="Loại thiết bị"
                          sx={{
                            borderRadius: "10px",
                            transition: "all 0.3s",
                            "& .MuiOutlinedInput-root": {
                              transition: "all 0.3s",
                              "&:hover": {
                                boxShadow: "0 2px 8px rgba(30, 136, 229, 0.15)",
                              },
                              "&.Mui-focused": {
                                boxShadow:
                                  "0 4px 12px rgba(30, 136, 229, 0.25)",
                              },
                            },
                          }}
                        >
                          <MenuItem value="Camera">Camera</MenuItem>
                          <MenuItem value="RFID Reader">
                            Đầu đọc thẻ RFID
                          </MenuItem>
                          <MenuItem value="Barrier">Cổng chắn</MenuItem>
                        </Select>
                      </FormControl>
                      {error && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5 }}
                        >
                          {error.message}
                        </Typography>
                      )}
                    </motion.div>
                  )}
                />
                <Controller
                  name="ip"
                  control={control}
                  rules={{
                    required: "Địa chỉ IP không được để trống",
                    pattern: {
                      value: /^(\d{1,3}\.){3}\d{1,3}$/,
                      message: "Địa chỉ IP không hợp lệ",
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
                        label="Địa chỉ IP"
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
              </Box>
            )}
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ textTransform: "none" }}>
            Hủy
          </Button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleSubmit(handleSaveDevice)}
              variant="contained"
              sx={{
                background: "linear-gradient(135deg, #1e88e5 0%, #00bcd4 100%)",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {dialogType === "firmware" ? "Cập nhật" : "Lưu"}
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
