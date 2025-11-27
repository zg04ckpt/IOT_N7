"use client";

import { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import MemoryIcon from "@mui/icons-material/Memory";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import WarningIcon from "@mui/icons-material/Warning";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useAuth } from "../contexts/authContext";

const DRAWER_WIDTH = 240;
const DRAWER_WIDTH_COLLAPSED = 72;

const menuItems = [
  { label: "Dashboard", path: "/dashboard", icon: DashboardIcon },
  { label: "Danh sách xe gửi", path: "/parking-list", icon: ListAltIcon },
  { label: "Quản lý thiết bị", path: "/device-management", icon: SettingsIcon },
  { label: "Quản lý vé xe", path: "/card-management", icon: CreditCardIcon },
  { label: "Quản lý người dùng", path: "/user-management", icon: PersonIcon },
  // { label: "Quản lý firmware", path: "/firmware-management", icon: MemoryIcon },
  { label: "Đăng xuất", path: "/logout", icon: LogoutIcon },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [logoutConfirmDialog, setLogoutConfirmDialog] = useState(false);
  const { logout } = useAuth();

  // Check if current route is access-denied
  const isAccessDeniedPage = location.pathname === "/access-denied";

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCollapseToggle = () => {
    setCollapsed(!collapsed);
  };

  const handleLogoutClick = () => {
    setLogoutConfirmDialog(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await logout();
      setLogoutConfirmDialog(false);
      navigate("/login");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        position: "relative",
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
          height: 80,
          minHeight: 80,
          maxHeight: 80,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            minWidth: 48,
            minHeight: 48,
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            position: collapsed ? "relative" : "static",
            margin: collapsed ? "0 auto" : 0,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src="/android-chrome-192x192.png"
              alt="Smart Parking"
              width={48}
              height={48}
              style={{
                borderRadius: "8px",
                display: "block",
                width: "48px",
                height: "48px",
                objectFit: "contain",
              }}
            />
          </motion.div>
        </Box>
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              key="logo-text"
              initial={{ opacity: 0, x: -10, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "auto" }}
              exit={{ opacity: 0, x: -10, width: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{
                overflow: "hidden",
                flexShrink: 0,
                marginLeft: "12px",
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "text.primary",
                    fontSize: "1.1rem",
                    whiteSpace: "nowrap",
                    lineHeight: 1.2,
                  }}
                >
                  Smart Parking
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    whiteSpace: "nowrap",
                    lineHeight: 1.2,
                  }}
                >
                  Management
                </Typography>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Menu Items */}
      <List sx={{ flex: 1, pt: 2, px: collapsed ? 0.5 : 1 }}>
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const isLastItem = index === menuItems.length - 1;
          return (
            <Box key={item.path}>
              {isLastItem ? (
                <Divider sx={{ marginBottom: 2, mx: collapsed ? 1 : 2 }} />
              ) : (
                ""
              )}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ x: collapsed ? 0 : 4 }}
              >
                <Tooltip
                  title={collapsed ? item.label : ""}
                  placement="right"
                  arrow
                >
                  <ListItem
                    disablePadding
                    sx={{ mb: 0.5, px: collapsed ? 0.5 : 1 }}
                  >
                    <ListItemButton
                      onClick={() => {
                        if (isLastItem) handleLogoutClick();
                        else {
                          navigate(item.path);
                          setMobileOpen(false);
                        }
                      }}
                      sx={{
                        borderRadius: "10px",
                        bgcolor: isActive
                          ? "rgba(30, 136, 229, 0.15)"
                          : "transparent",
                        borderLeft: isActive
                          ? "3px solid #1e88e5"
                          : "3px solid transparent",
                        pl: collapsed ? "12px" : isActive ? "13px" : "16px",
                        pr: collapsed ? "12px" : "16px",
                        justifyContent: collapsed ? "center" : "flex-start",
                        alignItems: "center",
                        minHeight: 48,
                        height: 48,
                        maxHeight: 48,
                        py: 0,
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                          bgcolor: !isLastItem
                            ? "rgba(30, 136, 229, 0.1)"
                            : "rgba(244, 67, 54, 0.1)",
                          transform: collapsed
                            ? "scale(1.05)"
                            : "translateX(4px)",
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: !isLastItem
                            ? isActive
                              ? "#1e88e5"
                              : "text.secondary"
                            : "#ef4444",
                          minWidth: 40,
                          width: 40,
                          maxWidth: 40,
                          height: 24,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          transition: "color 0.3s",
                          flexShrink: 0,
                          margin: 0,
                        }}
                      >
                        <Icon sx={{ fontSize: 24, width: 24, height: 24 }} />
                      </ListItemIcon>
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.div
                            initial={{ opacity: 0, x: -10, width: 0 }}
                            animate={{ opacity: 1, x: 0, width: "auto" }}
                            exit={{ opacity: 0, x: -10, width: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            style={{ overflow: "hidden", flex: 1 }}
                          >
                            <ListItemText
                              primary={item.label}
                              sx={{
                                "& .MuiTypography-root": {
                                  fontWeight: isActive ? 600 : 500,
                                  color: !isLastItem
                                    ? isActive
                                      ? "#1e88e5"
                                      : "text.primary"
                                    : "#ef4444",
                                  transition: "all 0.3s",
                                  fontSize: "0.9rem",
                                  whiteSpace: "nowrap",
                                },
                              }}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </ListItemButton>
                  </ListItem>
                </Tooltip>
              </motion.div>
            </Box>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* Drawer - Hidden on Access Denied page */}
      {!isAccessDeniedPage && (
        <Box
          component="nav"
          sx={{
            width: {
              sm: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
            },
            flexShrink: { sm: 0 },
            transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
          }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: DRAWER_WIDTH,
                bgcolor: "background.paper",
                borderRight: "1px solid",
                borderColor: "divider",
              },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
                bgcolor: "background.paper",
                borderRight: "1px solid",
                borderColor: "divider",
                transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                overflowX: "hidden",
              },
            }}
            open
          >
            {drawer}
          </Drawer>

          {/* Collapse Toggle Button - Gắn vào border */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              right: -20,
              transform: "translateY(-50%)",
              zIndex: 1300,
              display: { xs: "none", sm: "block" },
            }}
          >
            <IconButton
              onClick={handleCollapseToggle}
              sx={{
                bgcolor: "background.paper",
                border: "2px solid",
                borderColor: "divider",
                width: 40,
                height: 40,
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "&:hover": {
                  bgcolor: "action.hover",
                  transform: "scale(1.1)",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {collapsed ? (
                <ChevronRightIcon sx={{ fontSize: 20, color: "text.primary" }} />
              ) : (
                <ChevronLeftIcon sx={{ fontSize: 20, color: "text.primary" }} />
              )}
            </IconButton>
          </Box>
        </Box>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          mt: isAccessDeniedPage ? 0 : { xs: 4, sm: 4 },
          bgcolor: "background.default",
          minHeight: "100vh",
          overflow: "auto",
        }}
      >
        <Outlet />
      </Box>

      {/* Logout Confirm Dialog */}
      <Dialog
        open={logoutConfirmDialog}
        onClose={() => setLogoutConfirmDialog(false)}
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
            <WarningIcon sx={{ color: "#ef4444" }} />
            Xác nhận đăng xuất
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Bạn có chắc chắn muốn đăng xuất không?
            </Alert>
            <Typography color="textSecondary">
              Sau khi đăng xuất, bạn sẽ cần đăng nhập lại để tiếp tục sử dụng hệ
              thống.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setLogoutConfirmDialog(false)}
              sx={{ textTransform: "none" }}
            >
              Hủy
            </Button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleConfirmLogout}
                variant="contained"
                sx={{
                  background:
                    "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                  },
                }}
              >
                Đăng xuất
              </Button>
            </motion.div>
          </DialogActions>
        </motion.div>
      </Dialog>
    </Box>
  );
}
