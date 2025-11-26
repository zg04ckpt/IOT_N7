"use client";

import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import BlockIcon from "@mui/icons-material/Block";
import LockIcon from "@mui/icons-material/Lock";

export default function AccessDenied() {

  // Floating decorative elements
  const decorativeElements = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    size: Math.random() * 20 + 10,
  }));

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        bgcolor: "background.default",
        p: 3,
      }}
    >
      {/* Background decorative elements */}
      {decorativeElements.map((element) => (
        <motion.div
          key={element.id}
          style={{
            position: "absolute",
            left: `${element.x}%`,
            top: `${element.y}%`,
            width: element.size,
            height: element.size,
            borderRadius: "50%",
            backgroundColor: "#E0F7E9",
            opacity: 0.3,
          }}
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: element.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Stars */}
      {Array.from({ length: 8 }, (_, i) => (
        <motion.div
          key={`star-${i}`}
          style={{
            position: "absolute",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: 12,
            height: 12,
            color: "#4A2F6B",
          }}
          animate={{
            rotate: [0, 180, 360],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "linear",
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </motion.div>
      ))}

      {/* Dots */}
      {Array.from({ length: 12 }, (_, i) => (
        <motion.div
          key={`dot-${i}`}
          style={{
            position: "absolute",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "#4A2F6B",
            opacity: 0.4,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Main Content */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          maxWidth: 600,
        }}
      >
        {/* 403 Number with animated denied symbol */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              mb: 2,
            }}
          >
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "4rem", sm: "6rem", md: "8rem" },
                  fontWeight: 900,
                  color: "#52C48F",
                  textShadow: "4px 4px 0px #4A2F6B",
                  lineHeight: 1,
                }}
              >
                4
              </Typography>
            </motion.div>

            {/* Denied Symbol (0 replaced) */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.4,
                duration: 0.6,
                type: "spring",
                stiffness: 150,
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Box
                sx={{
                  width: { xs: 80, sm: 120, md: 160 },
                  height: { xs: 80, sm: 120, md: 160 },
                  borderRadius: "50%",
                  bgcolor: "#52C48F",
                  border: "8px solid #4A2F6B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  boxShadow: "0 8px 24px rgba(82, 196, 143, 0.3)",
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <BlockIcon
                    sx={{
                      fontSize: { xs: 40, sm: 60, md: 80 },
                      color: "#ffffff",
                    }}
                  />
                </motion.div>
              </Box>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "4rem", sm: "6rem", md: "8rem" },
                  fontWeight: 900,
                  color: "#52C48F",
                  textShadow: "4px 4px 0px #4A2F6B",
                  lineHeight: 1,
                }}
              >
                3
              </Typography>
            </motion.div>
          </Box>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
              fontWeight: 700,
              color: "#4A2F6B",
              mb: 2,
            }}
          >
            Access denied...
          </Typography>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: "1rem", sm: "1.125rem" },
              color: "#6A5087",
              mb: 4,
              maxWidth: 500,
              mx: "auto",
            }}
          >
            Bạn không có quyền truy cập trang này.
          </Typography>
        </motion.div>

        {/* Lock Icon Animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -180 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ delay: 1, duration: 0.6, type: "spring", stiffness: 200 }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              mt: 2,
            }}
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Box
                sx={{
                  width: { xs: 60, sm: 80, md: 100 },
                  height: { xs: 60, sm: 80, md: 100 },
                  borderRadius: "50%",
                  bgcolor: "rgba(74, 47, 107, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "3px solid rgba(74, 47, 107, 0.2)",
                }}
              >
                <LockIcon
                  sx={{
                    fontSize: { xs: 30, sm: 40, md: 50 },
                    color: "#4A2F6B",
                  }}
                />
              </Box>
            </motion.div>
          </Box>
        </motion.div>

      </Box>
    </Box>
  );
}

