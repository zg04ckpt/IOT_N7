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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInUp,
  BounceIn,
} from "react-native-reanimated";
import { ParkingInfo } from "@/components/ParkingInfo";
import { mockParkingData } from "@/utils/mockData";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const [licensePlate, setLicensePlate] = useState("");
  const [parkingData, setParkingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!licensePlate.trim()) return;

    setLoading(true);
    setSearched(false);

    setTimeout(() => {
      const data = mockParkingData(licensePlate.toUpperCase());
      setParkingData(data);
      setLoading(false);
      setSearched(true);
    }, 1000);
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
              <Text style={styles.logoIcon}>🚗</Text>
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
              onChangeText={setLicensePlate}
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
            <Text style={styles.statusText}>Xe đang gửi</Text>
          </Animated.View>
        )}

        {searched && parkingData && <ParkingInfo data={parkingData} />}

        {searched && !parkingData && (
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
  },
  logoIcon: {
    fontSize: 28,
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
});
