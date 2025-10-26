import React, { useState } from "react";
import { View, Text, Image, ActivityIndicator, StyleSheet } from "react-native";

interface VehicleImageProps {
  imageUrl: string;
  vehicleId: number;
  style?: any;
}

export const VehicleImage: React.FC<VehicleImageProps> = ({
  imageUrl,
  vehicleId,
  style,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.imageWrapper}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0EA5E9" />
            <Text style={styles.loadingText}>Đang tải hình ảnh...</Text>
          </View>
        )}

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>📷</Text>
            <Text style={styles.errorText}>Không thể tải hình ảnh</Text>
          </View>
        ) : (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
          />
        )}
      </View>
      <Text style={styles.label}>Hình ảnh biển số xe</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    alignItems: "center",
  },
  imageWrapper: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    position: "relative",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(241, 245, 249, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748B",
  },
  errorContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#DC2626",
    textAlign: "center",
  },
  label: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 8,
    fontStyle: "italic",
  },
});
