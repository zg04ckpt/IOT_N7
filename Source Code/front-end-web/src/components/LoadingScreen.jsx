import React from "react";
import { Box, LinearProgress, Fade, Typography } from "@mui/material";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const LoadingScreen = ({ message = "Đang tải..." }) => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(8px)",
        zIndex: 9999,
      }}
    >
      <MotionBox
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        sx={{
          width: "100%",
          maxWidth: "400px",
          px: 3,
        }}
      >
        {/* Animated Logo/Icon */}
        <MotionBox
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: {
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            },
            scale: {
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 4,
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 32px rgba(37, 99, 235, 0.3)",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                inset: "-4px",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, #2563eb, #06b6d4, #2563eb)",
                zIndex: -1,
                opacity: 0.3,
                animation: "pulse 2s infinite",
              },
            }}
          >
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                backgroundColor: "white",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
              }}
            />
          </Box>
        </MotionBox>

        {/* Animated Progress Bar */}
        <Box sx={{ width: "100%", mb: 2 }}>
          <Fade in={true} timeout={500}>
            <LinearProgress
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: "rgba(37, 99, 235, 0.1)",
                "& .MuiLinearProgress-bar": {
                  background:
                    "linear-gradient(90deg, #2563eb 0%, #06b6d4 100%)",
                  borderRadius: 3,
                  animation: "progress 2s ease-in-out infinite",
                },
              }}
            />
          </Fade>
        </Box>

        {/* Loading Message */}
        <MotionBox
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          sx={{
            textAlign: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#64748b",
              fontWeight: 500,
              fontSize: "1.1rem",
              background: "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {message}
          </Typography>
        </MotionBox>

        {/* Animated Dots */}
        <MotionBox
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 1,
          }}
        >
          {[0, 1, 2].map((index) => (
            <MotionBox
              key={index}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut",
              }}
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#2563eb",
              }}
            />
          ))}
        </MotionBox>
      </MotionBox>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 0.3;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.6;
            }
          }
          
          @keyframes progress {
            0% {
              transform: translateX(-100%);
            }
            50% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default LoadingScreen;
