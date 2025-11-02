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
} from "@mui/material";
import { motion } from "framer-motion";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../contexts/authContext";

const DRAWER_WIDTH = 280;

const menuItems = [
  { label: "Dashboard", path: "/dashboard", icon: DashboardIcon },
  { label: "Danh sách xe gửi", path: "/parking-list", icon: ListAltIcon },
  { label: "Quản lý thiết bị", path: "/device-management", icon: SettingsIcon },
  { label: "Quản lý vé xe", path: "/card-management", icon: CreditCardIcon },
  { label: "Đăng ký vé tháng", path: "/monthly-ticket", icon: ReceiptIcon },
  { label: "Đăng xuất", path: "/logout", icon: LogoutIcon },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuth();
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
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
      }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "12px",
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
                style={{ borderRadius: "8px" }}
              />
            </Box>
          </motion.div>
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "text.primary" }}
            >
              Smart Parking
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Management
            </Typography>
          </Box>
        </Box>
      </motion.div>

      {/* Menu Items */}
      <List sx={{ flex: 1, pt: 2, px: 1 }}>
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const isLastItem = index === menuItems.length - 1;
          return (
            <Box>
              {isLastItem ? <Divider sx={{ marginBottom: 2 }} /> : ""}
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ x: 4 }}
              >
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => {
                      if (isLastItem) handleLogout();
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
                      borderLeft: isActive ? "3px solid #1e88e5" : "none",
                      pl: isActive ? "13px" : "16px",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        bgcolor: !isLastItem
                          ? "rgba(30, 136, 229, 0.1)"
                          : "rgba(244, 67, 54, 0.1)",
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: !isLastItem
                          ? isActive
                            ? "#1e88e5"
                            : "text.secondary"
                          : " #ef4444",
                        minWidth: 40,
                        transition: "color 0.3s",
                      }}
                    >
                      <Icon />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      sx={{
                        "& .MuiTypography-root": {
                          fontWeight: isActive ? 600 : 500,
                          color: !isLastItem
                            ? isActive
                              ? "#1e88e5"
                              : "text.primary"
                            : " #ef4444",
                          transition: "all 0.3s",
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
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
      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
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
              width: DRAWER_WIDTH,
              bgcolor: "background.paper",
              borderRight: "1px solid",
              borderColor: "divider",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          mt: { xs: 4, sm: 4 },
          bgcolor: "background.default",
          minHeight: "100vh",
          overflow: "auto",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
