"use client";

import { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import { motion } from "framer-motion";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TimerIcon from "@mui/icons-material/Timer";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
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
        <Box>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h3" sx={{ mt: 1 }}>
            {value}
          </Typography>
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
  const [stats] = useState({
    currentVehicles: 156,
    dailyRevenue: "12,500,000 VND",
    avgParkingTime: "4h 32m",
    peakHour: "18:00 - 19:00",
    monthlyTickets: 342,
    activeDevices: 8,
  });

  const [recentParking] = useState([
    {
      id: 1,
      plate: "29A-12345",
      type: "Ô tô",
      checkIn: "14:30",
      status: "Đang gửi",
      amount: "-",
    },
    {
      id: 2,
      plate: "30B-67890",
      type: "Xe máy",
      checkIn: "14:15",
      status: "Đã thanh toán",
      amount: "50,000",
    },
    {
      id: 3,
      plate: "31C-11111",
      type: "Ô tô",
      checkIn: "13:45",
      status: "Đã thanh toán",
      amount: "120,000",
    },
    {
      id: 4,
      plate: "32D-22222",
      type: "Xe máy",
      checkIn: "13:20",
      status: "Đã thanh toán",
      amount: "40,000",
    },
    {
      id: 5,
      plate: "33E-33333",
      type: "Ô tô",
      checkIn: "12:50",
      status: "Đã thanh toán",
      amount: "100,000",
    },
  ]);

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

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Phương tiện hiện tại"
            value={stats.currentVehicles}
            icon={DirectionsCarIcon}
            color="#1e88e5"
            delay={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Doanh thu hôm nay"
            value={stats.dailyRevenue}
            icon={AttachMoneyIcon}
            color="#4caf50"
            delay={0.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Thời gian gửi trung bình"
            value={stats.avgParkingTime}
            icon={TimerIcon}
            color="#ff9800"
            delay={0.2}
          />
        </Grid>
      </Grid>

      {/* Additional Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            sx={{ height: "100%" }}
          >
            <CardContent
              sx={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <Typography color="textSecondary" gutterBottom>
                Giờ cao điểm
              </Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {stats.peakHour}
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            sx={{ height: "100%" }}
          >
            <CardContent
              sx={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <Typography color="textSecondary" gutterBottom>
                Vé tháng hoạt động
              </Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {stats.monthlyTickets}
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <CardContent
              sx={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <Typography color="textSecondary" gutterBottom>
                Thiết bị hoạt động
              </Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {stats.activeDevices}/8
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(stats.activeDevices / 8) * 100}
                sx={{ mt: 2 }}
              />
            </CardContent>
          </MotionCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            sx={{ height: "100%" }}
          >
            <CardContent
              sx={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TrendingUpIcon sx={{ color: "#4caf50" }} />
                <Box>
                  <Typography color="textSecondary" variant="caption">
                    Tăng trưởng
                  </Typography>
                  <Typography variant="h4">+12.5%</Typography>
                </Box>
              </Box>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>

      {/* Recent Parking Table */}
      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <CardContent>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Xe gửi gần đây
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow
                  sx={{ borderBottom: "2px solid rgba(255, 255, 255, 0.1)" }}
                >
                  <TableCell align="center">Biển số</TableCell>
                  <TableCell align="center">Loại xe</TableCell>
                  <TableCell align="center">Giờ vào</TableCell>
                  <TableCell align="center">Trạng thái</TableCell>
                  <TableCell align="center">Tiền</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentParking.map((row, index) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                  >
                    <TableCell align="center">{row.plate}</TableCell>
                    <TableCell align="center">{row.type}</TableCell>
                    <TableCell align="center">{row.checkIn}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.status}
                        sx={{
                          backgroundColor:
                            row.status === "Đang gửi" ? "#dbeafd" : "#dbfde5",
                          color:
                            row.status === "Đang gửi" ? "#223ad2" : "#036333",
                          width: "50%",
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">{row.amount}</TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </MotionCard>
    </Box>
  );
}
