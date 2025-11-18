"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  TablePagination,
  Alert,
  CircularProgress,
  Paper,
  Checkbox,
  FormHelperText,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MemoryIcon from "@mui/icons-material/Memory";
import RefreshIcon from "@mui/icons-material/Refresh";
import WarningIcon from "@mui/icons-material/WarningAmber";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import SearchIcon from "@mui/icons-material/Search";
import { motion } from "framer-motion";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { useSnackbar } from "../contexts/SnackbarContext";
import { CiTrash } from "react-icons/ci";
import { FaRegEye } from "react-icons/fa";
import { PiArrowFatLineUpLight } from "react-icons/pi";

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const initialDevices = [
  {
    id: 101,
    name: "Cổng vào - Camera A1",
    latestVersion: 2,
    status: "Đã cập nhật",
    updatedAt: "2025-01-08T08:15:00Z",
    baseVersion: 2,
  },
  {
    id: 102,
    name: "Cổng ra - Barrier B1",
    latestVersion: 1,
    status: "Đã cập nhật",
    updatedAt: "2025-01-06T09:45:00Z",
    baseVersion: 1,
  },
  {
    id: 103,
    name: "Bãi VIP - Cảm biến C9",
    latestVersion: 3,
    status: "Đã cập nhật",
    updatedAt: "2025-01-05T07:10:00Z",
    baseVersion: 3,
  },
];

const initialFirmwares = [
  {
    id: "FW-0001",
    version: 2,
    status: "Đã cập nhật",
    description: "Khắc phục lỗi ghi nhận biển số ban đêm.",
    createdAt: "2025-01-08T08:12:00Z",
    sourceCodeSnippet:
      "// improve IR sensitivity\nvoid adjustNightMode(){ /* ... */ }",
    uploadFileName: "camera-a1_v2.cpp",
    devices: [
      {
        id: 101,
        name: "Cổng vào - Camera A1",
        path: "firmware/101/cong-vao-camera-a1_ver2.bin",
        version: 2,
      },
    ],
  },
  {
    id: "FW-0002",
    version: 1,
    status: "Đã cập nhật",
    description: "Tối ưu tốc độ đóng mở barrier.",
    createdAt: "2025-01-06T09:30:00Z",
    sourceCodeSnippet:
      "// optimize barrier speed\nint main(){ calibrateMotor(); }",
    uploadFileName: "barrier-b1_v1.cpp",
    devices: [
      {
        id: 102,
        name: "Cổng ra - Barrier B1",
        path: "firmware/102/cong-ra-barrier-b1_ver1.bin",
        version: 1,
      },
    ],
  },
  {
    id: "FW-0003",
    version: 3,
    status: "Cập nhật lỗi",
    description: "Cải thiện nhận diện xe lớn.",
    createdAt: "2025-01-05T07:05:00Z",
    sourceCodeSnippet: "// enhanced detection logic\nfloat threshold = 0.87;",
    uploadFileName: "sensor-c9_v3.cpp",
    devices: [
      {
        id: 103,
        name: "Bãi VIP - Cảm biến C9",
        path: "firmware/103/bai-vip-cam-bien-c9_ver3.bin",
        version: 3,
      },
    ],
  },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "Chờ cập nhật", label: "Chờ cập nhật" },
  { value: "Đã cập nhật", label: "Đã cập nhật" },
  { value: "Cập nhật lỗi", label: "Cập nhật lỗi" },
];

const defaultCodeTemplate = `#include <Arduino.h>

void setup() {
  Serial.begin(115200);
  // TODO: Khởi tạo cảm biến / module tại đây
}

void loop() {
  // TODO: Viết logic hoạt động của firmware
}
`;

const slugify = (text) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

const formatDateTime = (value) =>
  new Date(value).toLocaleString("vi-VN", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function FirmwareManagement() {
  const { showSuccess, showError } = useSnackbar();

  const [devices, setDevices] = useState(initialDevices);
  const [firmwares, setFirmwares] = useState(initialFirmwares);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDevice, setFilterDevice] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedFirmware, setSelectedFirmware] = useState(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [firmwareToDelete, setFirmwareToDelete] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");
  const [dialogMode, setDialogMode] = useState("create");
  const [editingFirmware, setEditingFirmware] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid },
    trigger,
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      deviceIds: [],
      description: "",
      sourceCode: defaultCodeTemplate,
    },
  });

  const watchSourceCode = watch("sourceCode");

  const recomputeDevices = useCallback((firmwareList) => {
    setDevices((prevDevices) =>
      prevDevices.map((device) => {
        const relatedFirmwares = firmwareList.filter((fw) =>
          fw.devices.some((d) => d.id === device.id)
        );
        const latestVersion = relatedFirmwares.reduce((max, fw) => {
          const entry = fw.devices.find((d) => d.id === device.id);
          return entry ? Math.max(max, entry.version) : max;
        }, device.baseVersion ?? device.latestVersion ?? 0);

        let status = device.status;
        if (
          relatedFirmwares.some(
            (fw) =>
              fw.status === "Chờ cập nhật" &&
              fw.devices.some((d) => d.id === device.id)
          )
        ) {
          status = "Chờ cập nhật firmware";
        } else if (
          relatedFirmwares.some(
            (fw) =>
              fw.status === "Cập nhật lỗi" &&
              fw.devices.some((d) => d.id === device.id)
          )
        ) {
          status = "Cập nhật lỗi";
        } else if (relatedFirmwares.length > 0) {
          status = "Đã cập nhật";
        } else {
          status = device.baseVersion ? "Đã cập nhật" : device.status;
        }

        return {
          ...device,
          latestVersion,
          status,
        };
      })
    );
  }, []);

  useEffect(() => {
    recomputeDevices(initialFirmwares);
  }, [recomputeDevices]);

  const statistics = useMemo(() => {
    const waiting = firmwares.filter(
      (fw) => fw.status === "Chờ cập nhật"
    ).length;
    const success = firmwares.filter(
      (fw) => fw.status === "Đã cập nhật"
    ).length;
    const failed = firmwares.filter(
      (fw) => fw.status === "Cập nhật lỗi"
    ).length;
    return [
      {
        label: "Tổng firmware",
        value: firmwares.length,
        color: "#1e88e5",
        icon: <MemoryIcon sx={{ fontSize: 32, opacity: 0.3 }} />,
      },
      {
        label: "Chờ cập nhật",
        value: waiting,
        color: "#ff9800",
        icon: <WarningIcon sx={{ fontSize: 32, opacity: 0.3 }} />,
      },
      {
        label: "Đã cập nhật",
        value: success,
        color: "#4caf50",
        icon: <MemoryIcon sx={{ fontSize: 32, opacity: 0.3 }} />,
      },
      {
        label: "Cập nhật lỗi",
        value: failed,
        color: "#ef5350",
        icon: <WarningIcon sx={{ fontSize: 32, opacity: 0.3 }} />,
      },
    ];
  }, [firmwares]);

  const filteredFirmwares = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return firmwares
      .filter((item) => {
        const matchSearch =
          keyword.length === 0 ||
          item.version.toString().includes(keyword) ||
          item.devices.some((device) =>
            device.name.toLowerCase().includes(keyword)
          );
        const matchDevice =
          filterDevice === "all" ||
          item.devices.some((device) => device.id === Number(filterDevice));
        const matchStatus =
          filterStatus === "all" || item.status === filterStatus;
        return matchSearch && matchDevice && matchStatus;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [firmwares, searchTerm, filterDevice, filterStatus]);

  const paginatedFirmwares = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredFirmwares.slice(start, start + rowsPerPage);
  }, [filteredFirmwares, page, rowsPerPage]);

  useEffect(() => {
    if (page > 0) {
      const maxPage = Math.ceil(filteredFirmwares.length / rowsPerPage);
      if (page + 1 > maxPage) {
        setPage(Math.max(maxPage - 1, 0));
      }
    }
  }, [filteredFirmwares, page, rowsPerPage]);

  const handleOpenCreateDialog = () => {
    setDialogMode("create");
    setEditingFirmware(null);
    reset({
      deviceIds: [],
      description: "",
      sourceCode: defaultCodeTemplate,
    });
    setUploadFileName("");
    setIsCompiling(false);
    setOpenDialog(true);
  };

  const handleRetryFirmware = (firmware) => {
    setDialogMode("retry");
    setEditingFirmware(firmware);
    reset({
      deviceIds: firmware.devices.map((device) => device.id),
      description: firmware.description || "",
      sourceCode: firmware.sourceCodeSnippet || defaultCodeTemplate,
    });
    setUploadFileName(firmware.uploadFileName || "");
    setIsCompiling(false);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIsCompiling(false);
    setDialogMode("create");
    setEditingFirmware(null);
    setUploadFileName("");
  };

  const handleViewFirmware = (firmware) => {
    setSelectedFirmware(firmware);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedFirmware(null);
  };

  const handleAskDelete = (firmware) => {
    setFirmwareToDelete(firmware);
    setDeleteConfirmDialog(true);
  };

  const handleDeleteFirmware = () => {
    if (!firmwareToDelete) return;
    setFirmwares((prev) => {
      const updated = prev.filter((item) => item.id !== firmwareToDelete.id);
      recomputeDevices(updated);
      return updated;
    });
    showSuccess("Đã xóa firmware khỏi danh sách.");
    setDeleteConfirmDialog(false);
    setFirmwareToDelete(null);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      showSuccess("Đã làm mới danh sách firmware.");
      setRefreshing(false);
      recomputeDevices(firmwares);
    }, 800);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".cpp")) {
      showError("Vui lòng chọn tệp .cpp hợp lệ.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === "string") {
        setValue("sourceCode", content);
        trigger("sourceCode");
        setUploadFileName(file.name);
      }
    };
    reader.onerror = () => {
      showError("Không thể đọc tệp. Vui lòng thử lại.");
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const onSubmit = (formData) => {
    const selectedDeviceIds = Array.isArray(formData.deviceIds)
      ? formData.deviceIds.map((value) => Number(value))
      : [];

    if (selectedDeviceIds.length === 0) {
      showError("Vui lòng chọn ít nhất một thiết bị để cập nhật.");
      return;
    }

    const selectedDeviceList = devices.filter((device) =>
      selectedDeviceIds.includes(device.id)
    );

    if (selectedDeviceList.length === 0) {
      showError("Không tìm thấy thiết bị hợp lệ để cập nhật.");
      return;
    }

    setIsCompiling(true);

    if (dialogMode === "retry" && editingFirmware) {
      setTimeout(() => {
        const releaseVersion = editingFirmware.version;
        const targetDevices = selectedDeviceList.map((device) => ({
          id: device.id,
          name: device.name,
          version: releaseVersion,
          path: `firmware/${device.id}/${slugify(
            device.name
          )}_ver${releaseVersion}.bin`,
        }));

        const updatedFirmware = {
          ...editingFirmware,
          devices: targetDevices,
          description: formData.description.trim(),
          sourceCodeSnippet: formData.sourceCode,
          uploadFileName:
            uploadFileName || editingFirmware.uploadFileName || "",
          status: "Chờ cập nhật",
          createdAt: new Date().toISOString(),
        };

        setFirmwares((prev) => {
          const updated = prev.map((fw) =>
            fw.id === editingFirmware.id ? updatedFirmware : fw
          );
          recomputeDevices(updated);
          return updated;
        });

        showSuccess("Đã cập nhật lại firmware thành công!");
        setIsCompiling(false);
        setOpenDialog(false);
        setUploadFileName("");
        setEditingFirmware(null);
        setDialogMode("create");
      }, 1000);

      return;
    }

    const baseVersion = selectedDeviceList.reduce(
      (max, device) =>
        Math.max(max, device.latestVersion ?? device.baseVersion ?? 0),
      0
    );
    const releaseVersion = baseVersion + 1;

    const targetDevices = selectedDeviceList.map((device) => ({
      id: device.id,
      name: device.name,
      version: releaseVersion,
      path: `firmware/${device.id}/${slugify(
        device.name
      )}_ver${releaseVersion}.bin`,
    }));

    const newFirmware = {
      id: `FW-${Date.now()}`,
      version: releaseVersion,
      status: "Chờ cập nhật",
      description: formData.description.trim(),
      createdAt: new Date().toISOString(),
      sourceCodeSnippet: formData.sourceCode,
      uploadFileName: uploadFileName || "",
      devices: targetDevices,
    };

    setTimeout(() => {
      setFirmwares((prev) => {
        const updated = [newFirmware, ...prev];
        recomputeDevices(updated);
        return updated;
      });

      showSuccess(
        selectedDeviceList.length > 1
          ? `Đã tạo firmware v${releaseVersion} cho ${selectedDeviceList.length} thiết bị.`
          : `Đã tạo firmware v${releaseVersion} cho ${selectedDeviceList[0].name}.`
      );
      setIsCompiling(false);
      setOpenDialog(false);
      setDialogMode("create");
      setUploadFileName("");
    }, 1200);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
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
            Quản lý firmware
          </Typography>
          <Typography color="textSecondary">
            Theo dõi phiên bản firmware và tình trạng cập nhật của thiết bị
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{
                height: "48px",
                borderRadius: "10px",
                fontWeight: 600,
                borderColor: "#1e88e5",
                color: "#1e88e5",
                "&:hover": {
                  borderColor: "#0c63ce",
                  color: "#0c63ce",
                  bgcolor: "rgba(30, 136, 229, 0.05)",
                },
                "&:disabled": {
                  borderColor: "#cbd5e1",
                  color: "#94a3b8",
                },
              }}
            >
              Làm mới
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
              sx={{
                height: "48px",
                background: "linear-gradient(135deg, #1e88e5 0%, #00bcd4 100%)",
                borderRadius: "10px",
                fontWeight: 600,
                textTransform: "none",
                px: 3,
                boxShadow: "0 4px 12px rgba(30, 136, 229, 0.3)",
                "&:hover": {
                  boxShadow: "0 6px 16px rgba(30, 136, 229, 0.4)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              Tạo firmware mới
            </Button>
          </motion.div>
        </Box>
      </MotionBox>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statistics.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.45 }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mb: 0.5 }}
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
                  <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                </Box>
              </CardContent>
            </MotionCard>
          </Grid>
        ))}
      </Grid>

      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        sx={{ mb: 3, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}
      >
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <motion.div whileHover={{ scale: 1.02 }}>
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm thiết bị hoặc phiên bản..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <SearchIcon sx={{ color: "text.secondary", mr: 1.5 }} />
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
              <motion.div whileHover={{ scale: 1.02 }}>
                <FormControl fullWidth>
                  <InputLabel id="device-filter-label">Thiết bị</InputLabel>
                  <Select
                    labelId="device-filter-label"
                    value={filterDevice}
                    label="Thiết bị"
                    onChange={(e) => setFilterDevice(e.target.value)}
                    sx={{
                      borderRadius: "10px",
                      "& .MuiOutlinedInput-root": {
                        transition: "all 0.3s",
                      },
                    }}
                  >
                    <MenuItem value="all">Tất cả</MenuItem>
                    {devices.map((device) => (
                      <MenuItem key={device.id} value={device.id}>
                        {device.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div whileHover={{ scale: 1.02 }}>
                <FormControl fullWidth>
                  <InputLabel id="status-filter-label">Trạng thái</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    value={filterStatus}
                    label="Trạng thái"
                    onChange={(e) => setFilterStatus(e.target.value)}
                    sx={{
                      borderRadius: "10px",
                      "& .MuiOutlinedInput-root": {
                        transition: "all 0.3s",
                      },
                    }}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </motion.div>
            </Grid>
          </Grid>
        </CardContent>
      </MotionCard>

      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.55 }}
        sx={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)", overflow: "hidden" }}
      >
        <CardContent sx={{ p: 0, position: "relative" }}>
          {refreshing && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(255,255,255,0.85)",
                zIndex: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress sx={{ color: "#1e88e5", mb: 1.5 }} />
              <Typography color="textSecondary">
                Đang đồng bộ dữ liệu...
              </Typography>
            </Box>
          )}
          <TableContainer>
            <Table
              sx={{
                "& tbody tr": {
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:last-of-type": { borderBottom: "none" },
                },
              }}
            >
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: "rgba(30, 136, 229, 0.05)",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, width: "8%" }}
                  >
                    Phiên bản
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, width: "10%" }}
                  >
                    Trạng thái
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, width: "28%" }}
                  >
                    Đường dẫn
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, width: "15%" }}
                  >
                    Thời gian
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, width: "30%" }}
                  >
                    Hành động
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedFirmwares.map((firmware, index) => (
                  <motion.tr
                    key={firmware.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05, duration: 0.25 }}
                  >
                    <TableCell align="center">
                      <Chip
                        label={`v${firmware.version}`}
                        size="small"
                        sx={{
                          backgroundColor: "#e3f2fd",
                          color: "#1e88e5",
                          fontWeight: 600,
                          borderRadius: "8px",
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={firmware.status}
                        size="small"
                        sx={{
                          backgroundColor:
                            firmware.status === "Chờ cập nhật"
                              ? "#fff4e5"
                              : firmware.status === "Đã cập nhật"
                              ? "#dbfde5"
                              : "#fdeaea",
                          color:
                            firmware.status === "Chờ cập nhật"
                              ? "#fb8c00"
                              : firmware.status === "Đã cập nhật"
                              ? "#036333"
                              : "#d32f2f",
                          fontWeight: 600,
                          borderRadius: "8px",
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {firmware.devices.length > 0 ? (
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "monospace",
                            fontSize: "0.85rem",
                            wordBreak: "break-all",
                          }}
                        >
                          {firmware.devices[0].path}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          --
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {formatDateTime(firmware.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        {firmware.status === "Cập nhật lỗi" && (
                          <Tooltip title="Cập nhật lại" placement="top" arrow>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleRetryFirmware(firmware)}
                              sx={{
                                borderRadius: "999px",
                                px: 2.5,
                                fontWeight: 600,
                                textTransform: "none",
                                borderColor: "#fb8c00",
                                color: "#fb8c00",
                                bgcolor: "#fff",
                                "&:hover": {
                                  borderColor: "#f57c00",
                                  bgcolor: "rgba(255, 152, 0, 0.08)",
                                },
                              }}
                              startIcon={<PiArrowFatLineUpLight size={18} />}
                            >
                              Cập nhật lại
                            </Button>
                          </Tooltip>
                        )}
                        <Tooltip title="Xem chi tiết" placement="top" arrow>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleViewFirmware(firmware)}
                            sx={{
                              borderRadius: "999px",
                              px: 2.5,
                              fontWeight: 600,
                              textTransform: "none",
                              borderColor: "#1e88e5",
                              color: "#1e88e5",
                              "&:hover": {
                                borderColor: "#1565c0",
                                bgcolor: "rgba(30, 136, 229, 0.08)",
                                boxShadow:
                                  "0 4px 12px rgba(30, 136, 229, 0.18)",
                              },
                            }}
                            startIcon={<FaRegEye size={17} />}
                          >
                            Xem
                          </Button>
                        </Tooltip>
                        <Tooltip title="Xóa firmware" placement="top" arrow>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleAskDelete(firmware)}
                            sx={{
                              borderRadius: "999px",
                              px: 2.5,
                              fontWeight: 600,
                              textTransform: "none",
                              "&:hover": {
                                bgcolor: "rgba(244, 67, 54, 0.08)",
                                borderColor: "#d32f2f",
                              },
                            }}
                            startIcon={<CiTrash size={18} />}
                          >
                            Xóa
                          </Button>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 20]}
            component="div"
            count={filteredFirmwares.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
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
          {filteredFirmwares.length === 0 && (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <Typography color="textSecondary" variant="h6">
                Không tìm thấy firmware phù hợp.
              </Typography>
            </Box>
          )}
        </CardContent>
      </MotionCard>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.2rem" }}>
          {dialogMode === "retry"
            ? "Cập nhật lại Firmware"
            : "Tạo firmware mới"}
        </DialogTitle>
        <DialogContent dividers>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <Controller
                  name="deviceIds"
                  control={control}
                  rules={{
                    validate: (value) =>
                      value && value.length > 0
                        ? true
                        : "Vui lòng chọn ít nhất một thiết bị",
                  }}
                  render={({ field, fieldState: { error } }) => {
                    const selectedValues = field.value || [];
                    const allSelected =
                      devices.length > 0 &&
                      selectedValues.length === devices.length;
                    const isIndeterminate =
                      selectedValues.length > 0 &&
                      selectedValues.length < devices.length;

                    const toggleAll = (checked) => {
                      const newValues = checked ? devices.map((d) => d.id) : [];
                      field.onChange(newValues);
                      trigger("deviceIds");
                    };

                    const toggleDevice = (deviceId) => {
                      let newValues = [];
                      if (selectedValues.includes(deviceId)) {
                        newValues = selectedValues.filter(
                          (id) => id !== deviceId
                        );
                      } else {
                        newValues = [...selectedValues, deviceId];
                      }
                      field.onChange(newValues);
                      trigger("deviceIds");
                    };

                    return (
                      <FormControl
                        component="fieldset"
                        fullWidth
                        error={!!error}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600, mb: 1 }}
                        >
                          Thiết bị cập nhật
                        </Typography>
                        <Paper
                          variant="outlined"
                          sx={{
                            borderRadius: "12px",
                            borderColor: "divider",
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              px: 2,
                              py: 1.5,
                              borderBottom: "1px solid",
                              borderColor: "divider",
                              bgcolor: "rgba(30, 136, 229, 0.05)",
                            }}
                          >
                            <Checkbox
                              checked={allSelected}
                              indeterminate={isIndeterminate}
                              onChange={(event) =>
                                toggleAll(event.target.checked)
                              }
                              color="primary"
                            />
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                Tất cả thiết bị
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Chọn/bỏ chọn toàn bộ
                              </Typography>
                            </Box>
                          </Box>
                          <Box
                            sx={{
                              maxHeight: 240,
                              overflowY: "auto",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            {devices.map((device) => {
                              const checked = selectedValues.includes(
                                device.id
                              );
                              return (
                                <Box
                                  key={device.id}
                                  sx={{
                                    px: 2,
                                    py: 1.25,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    borderBottom: "1px solid",
                                    borderColor: "divider",
                                    "&:last-of-type": { borderBottom: "none" },
                                  }}
                                >
                                  <Checkbox
                                    checked={checked}
                                    onChange={() => toggleDevice(device.id)}
                                    color="primary"
                                  />
                                  <Box sx={{ flex: 1 }}>
                                    <Typography
                                      variant="body2"
                                      fontWeight={600}
                                    >
                                      {device.name}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Version hiện tại: v{device.latestVersion}
                                    </Typography>
                                  </Box>
                                </Box>
                              );
                            })}
                          </Box>
                        </Paper>
                        {error && (
                          <FormHelperText sx={{ mt: 1 }}>
                            {error.message}
                          </FormHelperText>
                        )}
                      </FormControl>
                    );
                  }}
                />
              </Grid>
              <Grid item xs={12} md={7} sx={{ marginTop: "30px" }}>
                <Controller
                  name="description"
                  control={control}
                  rules={{
                    required: "Vui lòng nhập mô tả thay đổi",
                    minLength: {
                      value: 10,
                      message: "Mô tả cần tối thiểu 10 ký tự",
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Mô tả thay đổi"
                      fullWidth
                      multiline
                      rows={3}
                      error={!!error}
                      helperText={error?.message}
                      onChange={(event) => {
                        field.onChange(event);
                        trigger("description");
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                        },
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Tải file mã nguồn (.cpp)
                </Typography>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Button
                    startIcon={<FileUploadIcon />}
                    component="label"
                    variant="outlined"
                    fullWidth
                    sx={{
                      borderRadius: "10px",
                      textTransform: "none",
                      fontWeight: 600,
                      borderColor: "#1e88e5",
                      color: "#1e88e5",
                      py: 1.4,
                      "&:hover": {
                        borderColor: "#0d47a1",
                        bgcolor: "rgba(30, 136, 229, 0.05)",
                      },
                    }}
                  >
                    Chọn file .cpp
                    <input
                      type="file"
                      accept=".cpp"
                      hidden
                      onChange={handleFileUpload}
                    />
                  </Button>
                </motion.div>
                {uploadFileName && (
                  <Alert
                    severity="success"
                    sx={{ mt: 1, borderRadius: "10px" }}
                  >
                    Đã tải: <strong>{uploadFileName}</strong>
                  </Alert>
                )}
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 3,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Controller
                    name="sourceCode"
                    control={control}
                    rules={{
                      required: "Mã nguồn không được để trống",
                      minLength: {
                        value: 20,
                        message: "Mã nguồn tối thiểu 20 ký tự",
                      },
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="Mã nguồn C++"
                        fullWidth
                        multiline
                        minRows={8}
                        error={!!error}
                        helperText={error?.message}
                        onChange={(event) => {
                          field.onChange(event);
                          trigger("sourceCode");
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "10px",
                            fontFamily: "monospace",
                            fontSize: "0.85rem",
                          },
                        }}
                      />
                    )}
                  />
                </Box>
                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: "12px",
                    overflow: "hidden",
                    borderColor: "rgba(15, 23, 42, 0.08)",
                    boxShadow: "0 4px 18px rgba(15, 23, 42, 0.1)",
                    flex: 1,
                  }}
                >
                  <SyntaxHighlighter
                    language="cpp"
                    style={atomOneDark}
                    customStyle={{
                      margin: 0,
                      padding: "18px",
                      fontSize: "0.85rem",
                    }}
                    showLineNumbers
                  >
                    {watchSourceCode || "// Chưa có mã nguồn"}
                  </SyntaxHighlighter>
                </Paper>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseDialog} sx={{ textTransform: "none" }}>
            Hủy
          </Button>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              onClick={handleSubmit(onSubmit)}
              variant="contained"
              disabled={!isValid || isCompiling}
              startIcon={
                isCompiling ? (
                  <CircularProgress size={18} color="inherit" />
                ) : null
              }
              sx={{
                minWidth: 140,
                background: isValid
                  ? "linear-gradient(135deg, #1e88e5 0%, #00bcd4 100%)"
                  : "rgba(0, 0, 0, 0.12)",
                "&:disabled": {
                  color: "rgba(0, 0, 0, 0.26)",
                },
              }}
            >
              {isCompiling
                ? dialogMode === "retry"
                  ? "Đang cập nhật..."
                  : "Đang biên dịch..."
                : dialogMode === "retry"
                ? "Cập nhật lại"
                : "Tạo firmware"}
            </Button>
          </motion.div>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDetailDialog}
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Thông tin firmware</DialogTitle>
        <DialogContent dividers>
          {selectedFirmware ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <Card variant="outlined" sx={{ borderRadius: "12px" }}>
                  <CardContent>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Chip
                        label={`Phiên bản: v${selectedFirmware.version}`}
                        color="primary"
                        variant="outlined"
                      />
                      <Chip label={selectedFirmware.status} />
                    </Box>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Thời gian tạo:{" "}
                      <strong>
                        {formatDateTime(selectedFirmware.createdAt)}
                      </strong>
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, lineHeight: 1.6 }}>
                      Mô tả:{" "}
                      {selectedFirmware.description
                        ? selectedFirmware.description
                        : "Không có ghi chú."}
                    </Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined" sx={{ borderRadius: "12px", mt: 2 }}>
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 1.5 }}
                    >
                      Thiết bị &amp; đường dẫn
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      {selectedFirmware.devices.map((device) => (
                        <Paper
                          key={device.id}
                          variant="outlined"
                          sx={{ p: 1.5, borderRadius: "10px" }}
                        >
                          <Typography variant="body2" fontWeight={600}>
                            {device.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {device.id} • Version: v{device.version}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              mt: 0.5,
                              fontFamily: "monospace",
                              wordBreak: "break-all",
                            }}
                          >
                            {device.path}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={7}>
                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: "12px",
                    overflow: "hidden",
                    borderColor: "rgba(15, 23, 42, 0.08)",
                    boxShadow: "0 4px 18px rgba(15, 23, 42, 0.1)",
                  }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      bgcolor: "#0f172a",
                      color: "#fff",
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Mã nguồn hiện tại
                    </Typography>
                    <Chip
                      label=".cpp"
                      size="small"
                      sx={{
                        bgcolor: "rgba(255,255,255,0.12)",
                        color: "#fff",
                      }}
                    />
                  </Box>
                  <SyntaxHighlighter
                    language="cpp"
                    style={atomOneDark}
                    customStyle={{
                      margin: 0,
                      padding: "18px",
                      minHeight: 320,
                      maxHeight: 480,
                    }}
                    showLineNumbers
                  >
                    {selectedFirmware.sourceCodeSnippet ||
                      "// Không có mã nguồn mẫu"}
                  </SyntaxHighlighter>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ borderRadius: "12px" }}>
                  API: thiết bị gọi{" "}
                  <code>
                    GET /api/firmware/check-update?deviceId=&lt;ID&gt;
                  </code>{" "}
                  để nhận version mới nhất (ví dụ v{selectedFirmware.version})
                  và đường dẫn file .bin tương ứng. Khi cập nhật thành công, gửi{" "}
                  <code>POST /api/firmware/update</code> kèm{" "}
                  <code>state=success</code> và <code>deviceId</code> để máy chủ
                  ghi nhận trạng thái.
                </Alert>
              </Grid>
            </Grid>
          ) : (
            <Typography>Không tìm thấy thông tin firmware.</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDetailDialog}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmDialog}
        onClose={() => setDeleteConfirmDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <WarningIcon color="error" />
          Xác nhận xóa firmware
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ borderRadius: "10px", mb: 2 }}>
            Firmware sẽ bị xóa khỏi danh sách quản lý. Thao tác này không thể
            hoàn tác.
          </Alert>
          <Typography>
            Firmware:{" "}
            <strong>
              {firmwareToDelete
                ? `v${firmwareToDelete.version} • ${
                    firmwareToDelete.devices?.length || 0
                  } thiết bị`
                : ""}
            </strong>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirmDialog(false)}>Hủy</Button>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              color="error"
              variant="contained"
              onClick={handleDeleteFirmware}
            >
              Xóa
            </Button>
          </motion.div>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
