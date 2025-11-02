"use client";

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInUp,
  BounceIn,
} from "react-native-reanimated";
import { getVehicleInfoByLicensePlate } from "@/api/vehicle";
import { VehicleInfo } from "@/types/vehicle";
import { ApiResponse } from "@/utils/ApiResponse";
import {
  formatTimeElapsed,
  formatTimeElapsedDetailed,
  formatCurrency,
  formatDate,
  getCardTypeText,
  getStatusColor,
} from "@/utils/helpers";
import { VehicleImage } from "@/components/VehicleImage";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const [licensePlate, setLicensePlate] = useState("");
  const [parkingData, setParkingData] = useState<VehicleInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLicensePlateChange = (text: string) => {
    setLicensePlate(text);
    if (searched) {
      setSearched(false);
      setParkingData(null);
      setError(null);
    }
  };

  const handleSearch = async () => {
    if (!licensePlate.trim()) return;

    setLoading(true);
    setSearched(false);
    setError(null);
    setParkingData(null);

    try {
      const response: ApiResponse<VehicleInfo[]> =
        await getVehicleInfoByLicensePlate(licensePlate.toUpperCase());

      if (response.success && response.data && response.data.length > 0) {
        setParkingData(response.data[0]);
        setSearched(true);
      } else {
        setError("Không tìm thấy xe với biển số này");
        setSearched(true);
      }
    } catch (err: any) {
      console.error("Lỗi tìm kiếm xe:", err);
      setError("Có lỗi xảy ra khi tìm kiếm xe");
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0EA5E9", "#0284C7"]} style={styles.header}>
        <Animated.View
          entering={FadeInDown.duration(600)}
          style={styles.headerContent}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Image
                source={require("../public/android-chrome-192x192.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <View>
              <Text style={styles.headerTitle}>Smart Parking</Text>
              <Text style={styles.headerSubtitle}>
                Hệ thống bãi đỗ xe thông minh
              </Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInUp.delay(200).duration(600)}
          style={styles.searchSection}
        >
          <Text style={styles.mainTitle}>Tra cứu thông tin đỗ xe</Text>
          <Text style={styles.subtitle}>
            Nhập biển số xe để xem thông tin chi tiết về trạng thái đỗ xe của
            bạn
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Biển số xe</Text>
            <TextInput
              style={styles.input}
              placeholder="30A-12345"
              placeholderTextColor="#94A3B8"
              value={licensePlate}
              onChangeText={handleLicensePlateChange}
              autoCapitalize="characters"
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
          </View>

          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#0EA5E9", "#0284C7"]}
              style={styles.searchButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.searchIcon}>🔍</Text>
                  <Text style={styles.searchButtonText}>Tra cứu thông tin</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {searched && parkingData && (
          <Animated.View
            entering={BounceIn.delay(300)}
            style={styles.statusBadge}
          >
            <Text style={styles.statusIcon}>✓</Text>
            <Text style={styles.statusText}>
              Tìm thấy xe với biển số {licensePlate}
            </Text>
          </Animated.View>
        )}

        {searched && parkingData && (
          <Animated.View entering={FadeInUp.delay(400)}>
            <View style={styles.vehicleCard}>
              <View style={styles.vehicleHeader}>
                <Text style={styles.vehicleTitle}>Thông tin xe</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        getStatusColor(parkingData.status) === "#4CAF50"
                          ? "#D1FAE5"
                          : "#FEF3C7",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(parkingData.status) },
                    ]}
                  >
                    {parkingData.status}
                  </Text>
                </View>
              </View>

              <View style={styles.vehicleInfo}>
                {/* Hình ảnh xe */}
                {parkingData.imageUrl && (
                  <VehicleImage
                    imageUrl={parkingData.imageUrl}
                    vehicleId={parkingData.id}
                  />
                )}

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Biển số xe:</Text>
                  <Text style={styles.infoValue}>
                    {parkingData.licensePlate}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Loại thẻ:</Text>
                  <Text style={styles.infoValue}>
                    {getCardTypeText(parkingData.cardType)}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Thời gian vào:</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(parkingData.timeStart)}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Thời gian đã gửi:</Text>
                  <Text style={styles.infoValue}>
                    {formatTimeElapsedDetailed(
                      parkingData.timeElapsedMinutes,
                      parkingData.timeElapsedSeconds
                    )}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Số tiền phải trả:</Text>
                  <Text style={[styles.infoValue, styles.amountText]}>
                    {formatCurrency(parkingData.amountToPay)}
                  </Text>
                </View>

                {parkingData.monthlyTicketInfo && (
                  <View style={styles.monthlyTicketSection}>
                    <Text style={styles.monthlyTicketTitle}>
                      Thông tin vé tháng
                    </Text>
                    <View style={styles.monthlyTicketInfo}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Tên chủ xe:</Text>
                        <Text style={styles.infoValue}>
                          {parkingData.monthlyTicketInfo.name}
                        </Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Ngày bắt đầu:</Text>
                        <Text style={styles.infoValue}>
                          {parkingData.monthlyTicketInfo.startDate}
                        </Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Ngày kết thúc:</Text>
                        <Text style={styles.infoValue}>
                          {parkingData.monthlyTicketInfo.endDate}
                        </Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Số ngày còn lại:</Text>
                        <Text
                          style={[
                            styles.infoValue,
                            {
                              color: parkingData.monthlyTicketInfo.isActive
                                ? "#059669"
                                : "#DC2626",
                            },
                          ]}
                        >
                          {parkingData.monthlyTicketInfo.daysRemaining} ngày
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </Animated.View>
        )}

        {searched && !parkingData && !error && (
          <Animated.View
            entering={FadeInUp.delay(300)}
            style={styles.noDataContainer}
          >
            <Text style={styles.noDataIcon}>🚫</Text>
            <Text style={styles.noDataText}>Không tìm thấy thông tin xe</Text>
            <Text style={styles.noDataSubtext}>
              Vui lòng kiểm tra lại biển số xe
            </Text>
          </Animated.View>
        )}

        {searched && error && (
          <Animated.View
            entering={FadeInUp.delay(300)}
            style={styles.errorContainer}
          >
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorSubtext}>Vui lòng thử lại sau</Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    gap: 12,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    overflow: "hidden",
  },
  logoImage: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  searchSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  searchButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  searchButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  searchIcon: {
    fontSize: 20,
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D1FAE5",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 20,
    alignSelf: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "#A7F3D0",
  },
  statusIcon: {
    fontSize: 18,
    color: "#059669",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#059669",
  },
  noDataContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  noDataIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 15,
    color: "#64748B",
  },
  vehicleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  vehicleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  vehicleTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  vehicleInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
    flex: 1,
    textAlign: "right",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#059669",
  },
  monthlyTicketSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  monthlyTicketTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  monthlyTicketInfo: {
    gap: 8,
  },
  errorContainer: {
    backgroundColor: "#FEF2F2",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#DC2626",
    marginBottom: 8,
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 15,
    color: "#7F1D1D",
    textAlign: "center",
  },
});
