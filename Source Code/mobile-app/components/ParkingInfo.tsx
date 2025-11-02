import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

interface ParkingInfoProps {
  data: {
    licensePlate: string;
    plateImage: string;
    entryTime: string;
    duration: string;
    location: string;
    currentFee: string;
    hasMonthlyPass: boolean;
    monthlyPassExpiry?: string;
  };
}

export function ParkingInfo({ data }: ParkingInfoProps) {
  return (
    <Animated.View
      entering={FadeInUp.delay(400).duration(600)}
      style={styles.container}
    >
      <View style={styles.plateHeader}>
        <Text style={styles.plateLabel}>Biển số xe</Text>
        <View style={styles.plateNumberContainer}>
          <Text style={styles.plateNumber}>{data.licensePlate}</Text>
        </View>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={{ uri: data.plateImage }}
          style={styles.plateImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoCard}>
          <View style={[styles.iconContainer, { backgroundColor: "#DBEAFE" }]}>
            <Text style={styles.icon}>🕐</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Thời gian vào</Text>
            <Text style={styles.infoValue}>{data.entryTime}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={[styles.iconContainer, { backgroundColor: "#DBEAFE" }]}>
            <Text style={styles.icon}>📅</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Thời gian đã gửi</Text>
            <Text style={styles.infoValue}>{data.duration}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={[styles.iconContainer, { backgroundColor: "#E0E7FF" }]}>
            <Text style={styles.icon}>📍</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Vị trí đỗ xe</Text>
            <Text style={styles.infoValue}>{data.location}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={[styles.iconContainer, { backgroundColor: "#FEF3C7" }]}>
            <Text style={styles.icon}>💰</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Phí hiện tại</Text>
            <Text style={[styles.infoValue, styles.feeValue]}>
              {data.currentFee}
            </Text>
          </View>
        </View>
      </View>

      {data.hasMonthlyPass && (
        <View style={styles.monthlyPassContainer}>
          <LinearGradient
            colors={["#EFF6FF", "#DBEAFE"]}
            style={styles.monthlyPassGradient}
          >
            <View style={styles.monthlyPassHeader}>
              <View style={styles.monthlyPassIcon}>
                <Text style={styles.ticketIcon}>🎫</Text>
              </View>
              <View style={styles.monthlyPassTitleContainer}>
                <View style={styles.monthlyPassTitleRow}>
                  <Text style={styles.monthlyPassTitle}>Vé tháng</Text>
                  <View style={styles.vipBadge}>
                    <Text style={styles.vipText}>VIP</Text>
                  </View>
                </View>
                <Text style={styles.monthlyPassExpiry}>
                  Có hiệu lực đến: {data.monthlyPassExpiry}
                </Text>
              </View>
            </View>

            <View style={styles.monthlyPassMessage}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.monthlyPassMessageText}>
                Bạn đang sử dụng vé tháng, không tính phí theo giờ
              </Text>
            </View>
          </LinearGradient>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  plateHeader: {
    marginBottom: 16,
  },
  plateLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 8,
  },
  plateNumberContainer: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#BFDBFE",
    alignItems: "center",
  },
  plateNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0EA5E9",
    letterSpacing: 2,
  },
  imageContainer: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#F1F5F9",
    height: 180,
  },
  plateImage: {
    width: "100%",
    height: "100%",
  },
  infoGrid: {
    gap: 12,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 28,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  feeValue: {
    color: "#F59E0B",
    fontSize: 20,
  },
  monthlyPassContainer: {
    marginTop: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  monthlyPassGradient: {
    padding: 20,
    borderWidth: 2,
    borderColor: "#BFDBFE",
    borderRadius: 16,
  },
  monthlyPassHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  monthlyPassIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  ticketIcon: {
    fontSize: 28,
  },
  monthlyPassTitleContainer: {
    flex: 1,
  },
  monthlyPassTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  monthlyPassTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  vipBadge: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  vipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  monthlyPassExpiry: {
    fontSize: 14,
    color: "#64748B",
  },
  monthlyPassMessage: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  checkIcon: {
    fontSize: 18,
    color: "#059669",
  },
  monthlyPassMessageText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
    lineHeight: 20,
  },
});
