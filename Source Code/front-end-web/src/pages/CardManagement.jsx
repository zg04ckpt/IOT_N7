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
  Alert,
  TablePagination,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import LoadingScreen from "../components/LoadingScreen";
import AddIcon from "@mui/icons-material/Add";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import WarningIcon from "@mui/icons-material/Warning";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import SortIcon from "@mui/icons-material/Sort";
import { CiTrash, CiEdit } from "react-icons/ci";
import { getAllCards, createCard, updateCard, deleteCard } from "../api/card";
import { useSnackbar } from "../contexts/SnackbarContext";

const MotionCard = motion(Card);
const MotionBox = motion(Box);

export default function CardManagement() {
  const { showSuccess, showError } = useSnackbar();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("add");
  const [selectedCard, setSelectedCard] = useState(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [searchName, setSearchName] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllCards();
        if (response.data.success) {
          setCards(response.data.data || []);
        } else {
          setError("Không thể tải dữ liệu vé xe");
        }
      } catch (err) {
        console.error("Error fetching cards:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredData = cards
    .filter((card) => {
      const matchName = card.cardNumber
        ?.toLowerCase()
        .includes(searchName.toLowerCase());
      const matchStatus =
        filterStatus === "all" ||
        (card.isActive ? "Hoạt động" : "Không hoạt động") === filterStatus;
      const matchType =
        filterType === "all" ||
        (card.type === 0 ? "Vé lượt" : "Vé tháng") === filterType;
      return matchName && matchStatus && matchType;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
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
    watch,
    formState: { errors, isValid },
    trigger,
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      cardNumber: "",
      price: "",
      type: 0,
      isActive: true,
    },
  });

  const handleOpenDialog = (type, card = null) => {
    setDialogType(type);
    setSelectedCard(card);
    if (card) {
      reset({
        cardNumber: card.cardNumber,
        price: card.price,
        type: card.type,
        isActive: card.isActive,
      });
    } else {
      reset({
        cardNumber: "",
        price: "",
        type: 0,
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    reset();
  };

  const handleSaveCard = async (formData) => {
    try {
      setRefreshing(true);
      setError(null);
      let response;
      if (dialogType === "add") {
        response = await createCard({
          cardNumber: formData.cardNumber,
          price: Number(formData.price),
          type: Number(formData.type),
        });
        console.log(formData.cardNumber, formData.price, formData.type);
      } else if (dialogType === "edit") {
        response = await updateCard(
          {
            cardNumber: formData.cardNumber,
            price: Number(formData.price),
            type: Number(formData.type),
            isActive: formData.isActive,
          },
          selectedCard.id
        );
      }

      if (response && response.data.success) {
        const cardsResponse = await getAllCards();
        if (cardsResponse.data.success) {
          setCards(cardsResponse.data.data || []);
        }
        handleCloseDialog();
        showSuccess(
          dialogType === "add"
            ? "Đăng ký vé xe thành công!"
            : "Cập nhật vé xe thành công!"
        );
      }
    } catch (error) {
      console.error("Error saving card:", error);
      showError("Không thể lưu vé xe. Vui lòng thử lại.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteClick = (id) => {
    setCardToDelete(id);
    setDeleteConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await deleteCard(cardToDelete);
      if (response.data.success) {
        const cardsResponse = await getAllCards();
        if (cardsResponse.data.success) {
          setCards(cardsResponse.data.data || []);
        }
        setDeleteConfirmDialog(false);
        setCardToDelete(null);
        showSuccess("Xóa vé xe thành công!");
      }
    } catch (error) {
      console.error("Error deleting card:", error);
      showError("Không thể xóa vé xe. Vui lòng thử lại.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await getAllCards();
      if (response.data.success) {
        setCards(response.data.data || []);
        setSearchName("");
        setFilterStatus("all");
        setFilterType("all");
        setPage(0);
      } else {
        setError("Không thể tải dữ liệu vé xe");
      }
    } catch (err) {
      console.error("Error refreshing cards:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleSortToggle = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  if (loading) {
    return <LoadingScreen message="Đang tải dữ liệu vé xe..." />;
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
            Quản lý vé xe
          </Typography>
          <Typography color="textSecondary">
            Quản lý các loại vé xe trong hệ thống
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
            Đăng ký vé xe
          </Button>
        </motion.div>
      </MotionBox>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          {
            label: "Tổng vé xe",
            value: cards.length,
            color: "#1e88e5",
            delay: 0.1,
          },
          {
            label: "Vé lượt",
            value: cards.filter((c) => c.type === 0).length,
            color: "#1976d2",
            delay: 0.2,
          },
          {
            label: "Vé tháng",
            value: cards.filter((c) => c.type === 1).length,
            color: "#7b1fa2",
            delay: 0.3,
          },
          {
            label: "Hoạt động",
            value: cards.filter((c) => c.isActive === true).length,
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
                  <CreditCardIcon
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
                  placeholder="Tìm kiếm số thẻ..."
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
                    <MenuItem value="Không hoạt động">Không hoạt động</MenuItem>
                  </Select>
                </FormControl>
              </motion.div>
            </Grid>
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
                    <MenuItem value="Vé lượt">Vé lượt</MenuItem>
                    <MenuItem value="Vé tháng">Vé tháng</MenuItem>
                  </Select>
                </FormControl>
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
                    ID thẻ
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                      width: "20%",
                    }}
                  >
                    Số thẻ
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
                      width: "15%",
                    }}
                  >
                    Giá vé
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                      width: "15%",
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
                {paginatedData.map((card, index) => (
                  <motion.tr
                    key={card.id}
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
                        minWidth: "80px",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          wordBreak: "break-word",
                        }}
                      >
                        {card.id}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 600,
                        py: 2,
                        width: "20%",
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
                        {card.cardNumber}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        py: 2,
                        width: "15%",
                        minWidth: "100px",
                      }}
                    >
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Chip
                          label={card.type === 0 ? "Vé lượt" : "Vé tháng"}
                          size="small"
                          sx={{
                            backgroundColor:
                              card.type === 0 ? "#e3f2fd" : "#f3e5f5",
                            color: card.type === 0 ? "#1976d2" : "#7b1fa2",
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
                        width: "15%",
                        minWidth: "100px",
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {card.price?.toLocaleString("vi-VN")} VND
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        py: 2,
                        width: "15%",
                        minWidth: "120px",
                      }}
                    >
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Chip
                          label={
                            card.isActive ? "Hoạt động" : "Không hoạt động"
                          }
                          size="small"
                          sx={{
                            backgroundColor: card.isActive
                              ? "#dbfde5"
                              : "#fdeaea",
                            color: card.isActive ? "#036333" : "#d32f2f",
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
                          <Tooltip title="Chỉnh sửa">
                            <Button
                              size="small"
                              startIcon={<CiEdit />}
                              onClick={() => handleOpenDialog("edit", card)}
                              sx={{
                                borderRadius: "8px",
                                textTransform: "none",
                                fontWeight: 600,
                                color: "#ff9800",
                                fontSize: "0.75rem",
                                px: 1.5,
                                py: 0.5,
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
                              onClick={() => handleDeleteClick(card.id)}
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
          {dialogType === "add" ? "Đăng ký vé xe mới" : "Chỉnh sửa vé xe"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <form onSubmit={handleSubmit(handleSaveCard)}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Controller
                name="cardNumber"
                control={control}
                rules={{ required: "Số thẻ không được để trống" }}
                render={({ field, fieldState: { error } }) => (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <TextField
                      {...field}
                      fullWidth
                      label="Số thẻ"
                      error={!!error}
                      helperText={error?.message}
                      onChange={(e) => {
                        field.onChange(e);
                        trigger("cardNumber");
                      }}
                      onBlur={() => trigger("cardNumber")}
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
                name="price"
                control={control}
                rules={{
                  required: "Giá vé không được để trống",
                  pattern: {
                    value: /^\d+$/,
                    message: "Giá vé phải là số dương",
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
                      label="Giá vé (VND)"
                      type="number"
                      error={!!error}
                      helperText={error?.message}
                      onChange={(e) => {
                        field.onChange(e);
                        trigger("price");
                      }}
                      onBlur={() => trigger("price")}
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
                name="type"
                control={control}
                rules={{ required: "Loại vé không được để trống" }}
                render={({ field, fieldState: { error } }) => (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <FormControl fullWidth error={!!error}>
                      <InputLabel id="type-select-label">Loại vé</InputLabel>
                      <Select
                        labelId="type-select-label"
                        id="type-select"
                        {...field}
                        label="Loại vé"
                        onChange={(e) => {
                          field.onChange(e);
                          trigger("type");
                        }}
                        onBlur={() => trigger("type")}
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
                        <MenuItem value={0}>Vé lượt</MenuItem>
                        <MenuItem value={1}>Vé tháng</MenuItem>
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
              {dialogType === "edit" && (
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <FormControl fullWidth>
                        <InputLabel id="status-select-label">
                          Trạng thái
                        </InputLabel>
                        <Select
                          labelId="status-select-label"
                          id="status-select"
                          {...field}
                          label="Trạng thái"
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
                          <MenuItem value={true}>Hoạt động</MenuItem>
                          <MenuItem value={false}>Không hoạt động</MenuItem>
                        </Select>
                      </FormControl>
                    </motion.div>
                  )}
                />
              )}
            </Box>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ textTransform: "none" }}>
            Hủy
          </Button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleSubmit(handleSaveCard)}
              variant="contained"
              disabled={!isValid}
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
              {dialogType === "add" ? "Đăng ký" : "Cập nhật"}
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
              Bạn có chắc chắn muốn xóa vé xe này không? Hành động này không thể
              hoàn tác.
            </Alert>
            <Typography color="textSecondary">
              Vé xe:{" "}
              <strong>
                {cards.find((c) => c.id === cardToDelete)?.cardNumber}
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
