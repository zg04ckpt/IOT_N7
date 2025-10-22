"use client";

import { useState } from "react";
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
} from "@mui/material";
import { motion } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

export default function ParkingList() {
  const [searchPlate, setSearchPlate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [parkingData] = useState([
    {
      id: 1,
      uid: "UID001",
      plate: "29A-12345",
      type: "Ô tô",
      ticketType: "Vé lượt",
      checkIn: "2024-10-22 14:30",
      checkOut: "2024-10-22 16:45",
      duration: "2h 15m",
      amount: "120,000 VND",
      status: "Đã thanh toán",
      image: "/license-plate.jpg",
    },
    {
      id: 2,
      uid: "UID002",
      plate: "30B-67890",
      type: "Xe máy",
      ticketType: "Vé tháng",
      checkIn: "2024-10-22 13:15",
      checkOut: "2024-10-22 15:30",
      duration: "2h 15m",
      amount: "-",
      status: "Đã thanh toán",
      image: "/license-plate.jpg",
    },
    {
      id: 3,
      uid: "UID003",
      plate: "31C-11111",
      type: "Ô tô",
      ticketType: "Vé lượt",
      checkIn: "2024-10-22 12:00",
      checkOut: "-",
      duration: "-",
      amount: "-",
      status: "Đang gửi",
      image: "/license-plate.jpg",
    },
    {
      id: 4,
      uid: "UID004",
      plate: "32D-22222",
      type: "Xe máy",
      ticketType: "Vé lượt",
      checkIn: "2024-10-22 11:30",
      checkOut: "2024-10-22 13:45",
      duration: "2h 15m",
      amount: "50,000 VND",
      status: "Đã thanh toán",
      image: "/license-plate.jpg",
    },
    {
      id: 5,
      uid: "UID005",
      plate: "33E-33333",
      type: "Ô tô",
      ticketType: "Vé tháng",
      checkIn: "2024-10-22 10:00",
      checkOut: "2024-10-22 12:30",
      duration: "2h 30m",
      amount: "-",
      status: "Đã thanh toán",
      image: "/license-plate.jpg",
    },
  ]);

  const filteredData = parkingData.filter((item) => {
    const matchPlate = item.plate
      .toLowerCase()
      .includes(searchPlate.toLowerCase());
    const matchStatus = filterStatus === "all" || item.status === filterStatus;
    return matchPlate && matchStatus;
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
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
          <Grid container spacing={2}>
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
                    <MenuItem value="Đang gửi">Đang gửi</MenuItem>
                    <MenuItem value="Đã thanh toán">Đã thanh toán</MenuItem>
                  </Select>
                </FormControl>
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<FilterListIcon />}
                  sx={{
                    height: "56px",
                    background:
                      "linear-gradient(135deg, #1e88e5 0%, #00bcd4 100%)",
                    borderRadius: "10px",
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: "1rem",
                    boxShadow: "0 4px 12px rgba(30, 136, 229, 0.3)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      boxShadow: "0 6px 16px rgba(30, 136, 229, 0.4)",
                      transform: "translateY(-2px)",
                    },
                    "&:active": {
                      transform: "translateY(0)",
                    },
                  }}
                >
                  Lọc
                </Button>
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
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
                  }}
                >
                  Xuất
                </Button>
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
                    Biển số
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, color: "text.primary" }}
                  >
                    Loại xe
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
                {paginatedData.map((row, index) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
                  >
                    <TableCell align="center" sx={{ py: 2 }}>
                      {row.uid}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, py: 2 }}>
                      {row.plate}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      {row.type}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      {row.ticketType}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      {row.checkIn}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      {row.checkOut}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      {row.duration}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      {row.amount}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      <Chip
                        label={row.status}
                        sx={{
                          backgroundColor:
                            row.status === "Đang gửi" ? "#dbeafd" : "#dbfde5",
                          color:
                            row.status === "Đang gửi" ? "#223ad2" : "#036333",
                          width: "100%",
                          fontWeight: 600,
                          borderRadius: "8px",
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                        }}
                      />
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
    </Box>
  );
}
