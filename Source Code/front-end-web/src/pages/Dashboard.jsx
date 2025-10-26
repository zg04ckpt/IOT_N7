"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TablePagination,
} from "@mui/material";
import LoadingScreen from "../components/LoadingScreen";
import { motion } from "framer-motion";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TimerIcon from "@mui/icons-material/Timer";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import DevicesIcon from "@mui/icons-material/Devices";

import { getReports } from "../api/report";

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
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [devicePage, setDevicePage] = useState(0);
  const [deviceRowsPerPage, setDeviceRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getReports();
        console.log(response);
        if (response.data.success) {
          setReportData(response.data);
        } else {
          setError("Không thể tải dữ liệu báo cáo");
        }
      } catch (err) {
        console.error("Error fetching report data:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatGrowth = (percentage) => {
    const isNegative = percentage < 0;
    const color = isNegative ? "#f44336" : "#4caf50";
    const icon = isNegative ? TrendingDownIcon : TrendingUpIcon;
    const sign = isNegative ? "" : "+";

    return {
      value: `${sign}${percentage}%`,
      color,
      icon,
      isNegative,
    };
  };

  const handleDevicePageChange = (event, newPage) => {
    setDevicePage(newPage);
  };

  const handleDeviceRowsPerPageChange = (event) => {
    setDeviceRowsPerPage(Number.parseInt(event.target.value, 10));
    setDevicePage(0);
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

  if (!reportData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Không có dữ liệu để hiển thị</Alert>
      </Box>
    );
  }

  const growthPercentage = reportData.yesterdayRevenue
    ? ((reportData.totalRevenueCurrentDay - reportData.yesterdayRevenue) /
        reportData.yesterdayRevenue) *
      100
    : 0;
  const growthData = formatGrowth(growthPercentage);

  return (
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
            title="Phương tiện hiện tại"
            value={reportData.currentVehiclesCount}
            icon={DirectionsCarIcon}
            color="#1e88e5"
            delay={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Doanh thu hôm nay"
            value={formatCurrency(reportData.totalRevenueCurrentDay)}
            icon={AttachMoneyIcon}
            color="#4caf50"
            delay={0.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Doanh thu tháng"
            value={formatCurrency(reportData.totalRevenueCurrentMonth)}
            icon={AttachMoneyIcon}
            color="#2e7d32"
            delay={0.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Thời gian gửi trung bình"
            value={reportData.averageParkingDuration}
            icon={TimerIcon}
            color="#ff9800"
            delay={0.3}
          />
        </Grid>
      </Grid>

      {/* Additional Stats */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Giờ cao điểm"
            value={reportData.peakHour}
            icon={AccessTimeIcon}
            color="#9c27b0"
            delay={0.4}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ngày cao điểm"
            value={reportData.peakDay}
            icon={AccessTimeIcon}
            color="#673ab7"
            delay={0.5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng vé tháng"
            value={reportData.totalMonthlyTickets}
            icon={ConfirmationNumberIcon}
            color="#2196f3"
            delay={0.6}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Thiết bị hoạt động"
            value={`${reportData.activeDevices?.length || 0}/${
              reportData.totalDevices
            }`}
            icon={DevicesIcon}
            color="#00bcd4"
            delay={0.7}
            chart={
              <LinearProgress
                variant="determinate"
                value={
                  ((reportData.activeDevices?.length || 0) /
                    reportData.totalDevices) *
                  100
                }
                sx={{
                  mt: 1,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "rgba(0, 188, 212, 0.2)",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "#00bcd4",
                    borderRadius: 4,
                  },
                }}
              />
            }
          />
        </Grid>
      </Grid>

      {/* Danh sách thiết bị hoạt động */}
      {reportData.activeDevices && reportData.activeDevices.length > 0 && (
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          sx={{ mt: 3, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, pb: 0 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Thiết bị đang hoạt động
              </Typography>
            </Box>
            <TableContainer>
              <Table sx={{ tableLayout: "fixed" }}>
                <TableHead>
                  <TableRow
                    sx={{
                      borderBottom: "2px solid",
                      borderColor: "divider",
                      bgcolor: "rgba(0, 188, 212, 0.05)",
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
                      ID
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        color: "text.primary",
                        width: "50%",
                      }}
                    >
                      Tên thiết bị
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        color: "text.primary",
                        width: "30%",
                      }}
                    >
                      Trạng thái
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.activeDevices
                    .slice(
                      devicePage * deviceRowsPerPage,
                      devicePage * deviceRowsPerPage + deviceRowsPerPage
                    )
                    .map((device, index) => (
                      <motion.tr
                        key={device.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.9 + index * 0.05,
                          duration: 0.3,
                        }}
                      >
                        <TableCell
                          align="center"
                          sx={{
                            fontWeight: 600,
                            py: 2,
                            width: "20%",
                            minWidth: "80px",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: "#1e88e5",
                            }}
                          >
                            {device.id}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontWeight: 600,
                            py: 2,
                            width: "50%",
                            minWidth: "150px",
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
                            width: "30%",
                            minWidth: "120px",
                          }}
                        >
                          <motion.div whileHover={{ scale: 1.05 }}>
                            <Chip
                              label="Hoạt động"
                              size="small"
                              sx={{
                                backgroundColor: "#dbfde5",
                                color: "#036333",
                                fontWeight: 600,
                                borderRadius: "8px",
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                fontSize: "0.75rem",
                              }}
                            />
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
              count={reportData.activeDevices.length}
              rowsPerPage={deviceRowsPerPage}
              page={devicePage}
              onPageChange={handleDevicePageChange}
              onRowsPerPageChange={handleDeviceRowsPerPageChange}
              sx={{
                borderTop: "1px solid",
                borderColor: "divider",
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                  {
                    margin: 0,
                  },
              }}
            />
            {reportData.activeDevices.length === 0 && (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <Typography color="textSecondary" variant="h6">
                  Không có thiết bị hoạt động
                </Typography>
              </Box>
            )}
          </CardContent>
        </MotionCard>
      )}
    </Box>
  );
}
