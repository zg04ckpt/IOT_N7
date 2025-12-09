"use client";

import { useState, useEffect } from "react";
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
  Modal,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile } from "@/api/user";
import { getInvoiceBySessionId, ParkingSession } from "@/api/session";
import { getCardById, Card } from "@/api/card";
import {
  formatDateTime,
  formatCurrency,
  calculateDuration,
  calculateDaysRemaining,
  formatDaysRemaining,
} from "@/utils/helpers";
import { useSnackbar } from "@/contexts/SnackbarContext";

const { width } = Dimensions.get("window");
const BASE_URL = "http://10.55.155.99:4000"; // IP máy tính trong mạng Wi-Fi

// Helper function to get full image URL
const getImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null;
  // If URL is already absolute (starts with http:// or https://), use it directly
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  // Otherwise, prepend BASE_URL for relative paths
  return `${BASE_URL}${imageUrl}`;
};

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { showError } = useSnackbar();
  const [sessions, setSessions] = useState<ParkingSession[]>([]);
  const [invoices, setInvoices] = useState<{ [key: number]: number }>({});
  const [cards, setCards] = useState<{ [key: number]: Card }>({});
  const [loading, setLoading] = useState(true);
  const [loadingInvoices, setLoadingInvoices] = useState<{
    [key: number]: boolean;
  }>({});
  const [loadingCards, setLoadingCards] = useState<{
    [key: number]: boolean;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    plate: string;
    type: string;
  } | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [user]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserProfile();
      if (response.success) {
        const parkingSessions = response.data.parking_sessions || [];
        setSessions(parkingSessions);

        // Fetch invoices for all completed sessions (must have status "end", check_out, and check_out_image_url)
        const completedSessions = parkingSessions.filter(
          (s: ParkingSession) =>
            s.status === "end" && s.check_out && s.check_out_image_url
        );
        if (completedSessions.length > 0) {
          fetchInvoicesForSessions(completedSessions);
        }

        // Fetch card info for all sessions
        if (parkingSessions.length > 0) {
          fetchCardsForSessions(parkingSessions);
        }
      } else {
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      }
    } catch (err: any) {
      console.error("Error fetching sessions:", err);
      if (err.response?.status === 403) {
        return;
      }
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      showError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoicesForSessions = async (
    completedSessions: ParkingSession[]
  ) => {
    const invoicePromises = completedSessions.map(async (session) => {
      try {
        setLoadingInvoices((prev) => ({ ...prev, [session.id]: true }));
        const response = await getInvoiceBySessionId(session.id);
        if (response.success && response.data) {
          setInvoices((prev) => ({
            ...prev,
            [session.id]: response.data.amount,
          }));
        }
      } catch (err) {
        console.error(`Error fetching invoice for session ${session.id}:`, err);
      } finally {
        setLoadingInvoices((prev) => ({ ...prev, [session.id]: false }));
      }
    });

    await Promise.all(invoicePromises);
  };

  const fetchCardsForSessions = async (sessions: ParkingSession[]) => {
    const cardPromises = sessions.map(async (session) => {
      if (!session.card_id) return;
      try {
        setLoadingCards((prev) => ({ ...prev, [session.id]: true }));
        const response = await getCardById(session.card_id);
        if (response.success && response.data) {
          setCards((prev) => ({
            ...prev,
            [session.id]: response.data,
          }));
        }
      } catch (err) {
        console.error(`Error fetching card for session ${session.id}:`, err);
      } finally {
        setLoadingCards((prev) => ({ ...prev, [session.id]: false }));
      }
    });

    await Promise.all(cardPromises);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleImageClick = (imageUrl: string, plate: string, type: string) => {
    setSelectedImage({ url: imageUrl, plate, type });
    setLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
    setSelectedImage(null);
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
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Smart Parking</Text>
              <Text style={styles.headerSubtitle}>
                Tra cứu thông tin gửi xe
              </Text>
              {user && <Text style={styles.userEmail}>{user.email}</Text>}
            </View>
          </View>
          {user && (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(600)}
          style={styles.searchSection}
        >
          <Text style={styles.mainTitle}>Lịch sử gửi xe</Text>
          <Text style={styles.subtitle}>
            Xem lịch sử các lượt gửi xe của bạn
          </Text>
        </Animated.View>

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0EA5E9" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <Animated.View entering={FadeIn} style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        )}

        {/* Sessions List */}
        {!loading && !error && (
          <>
            {sessions.length === 0 ? (
              <Animated.View entering={FadeIn} style={styles.noDataContainer}>
                <Text style={styles.noDataIcon}>🚗</Text>
                <Text style={styles.noDataText}>Chưa có phiên gửi xe nào</Text>
                <Text style={styles.noDataSubtext}>
                  Lịch sử gửi xe của bạn sẽ hiển thị tại đây
                </Text>
              </Animated.View>
            ) : (
              sessions.map((session, index) => {
                // Check if session is truly completed (has status "end", check_out, and check_out_image_url)
                const hasCheckout =
                  session.status === "end" &&
                  session.check_out &&
                  session.check_out_image_url;
                // If not completed, it's still active/packing
                const isActive = !hasCheckout;
                const invoiceAmount = invoices[session.id];
                const isLoadingInvoice = loadingInvoices[session.id];
                const card = cards[session.id];
                const isMonthlyCard = card?.type === "monthly";
                const daysRemaining = card?.monthly_user_expiry
                  ? calculateDaysRemaining(card.monthly_user_expiry)
                  : null;

                return (
                  <Animated.View
                    key={session.id}
                    entering={FadeInUp.delay(index * 100).duration(500)}
                    style={[
                      styles.sessionCard,
                      {
                        borderColor: isActive ? "#F59E0B" : "#10B981",
                        borderWidth: 3,
                      },
                    ]}
                  >
                    {/* Header */}
                    <View style={styles.sessionHeader}>
                      <Text style={styles.sessionPlate}>
                        {session.plate || "N/A"}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: isActive ? "#FEF3C7" : "#D1FAE5",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: isActive ? "#92400E" : "#065F46" },
                          ]}
                        >
                          {isActive ? "Đang gửi" : "Đã checkout"}
                        </Text>
                      </View>
                    </View>

                    {/* Images Row */}
                    <View style={styles.imagesRow}>
                      {/* Check-in Image */}
                      <TouchableOpacity
                        style={styles.imageContainer}
                        onPress={() =>
                          session.check_in_image_url &&
                          handleImageClick(
                            session.check_in_image_url,
                            session.plate,
                            "checkin"
                          )
                        }
                        disabled={!session.check_in_image_url}
                        activeOpacity={0.8}
                      >
                        {session.check_in_image_url ? (
                          <Image
                            source={{
                              uri:
                                getImageUrl(session.check_in_image_url) || "",
                            }}
                            style={styles.sessionImage}
                            resizeMode="cover"
                            onLoad={() => console.log(`✓ Check-in image loaded: ${getImageUrl(session.check_in_image_url)}`)}
                            onError={(e) => console.log(`✗ Check-in image error:`, e.nativeEvent.error, `URL: ${getImageUrl(session.check_in_image_url)}`)}
                          />
                        ) : (
                          <View style={styles.imagePlaceholder}>
                            <Text style={styles.imagePlaceholderText}>
                              Chưa có ảnh
                            </Text>
                          </View>
                        )}
                        <View style={styles.imageLabel}>
                          <Text style={styles.imageLabelText}>CHECK-IN</Text>
                        </View>
                      </TouchableOpacity>

                      {/* Check-out Image */}
                      <TouchableOpacity
                        style={styles.imageContainer}
                        onPress={() =>
                          session.check_out_image_url &&
                          handleImageClick(
                            session.check_out_image_url,
                            session.plate,
                            "checkout"
                          )
                        }
                        disabled={!session.check_out_image_url}
                        activeOpacity={0.8}
                      >
                        {session.check_out_image_url ? (
                          <>
                            {(() => {
                              const fullUrl = getImageUrl(session.check_out_image_url);
                              console.log("[Check-out Image] URL:", fullUrl);
                              return (
                                <Image
                                  source={{ uri: fullUrl || "" }}
                                  style={styles.sessionImage}
                                  resizeMode="cover"
                                  onLoad={() => console.log("[Check-out Image] ✓ Loaded:", fullUrl)}
                                  onError={(e) => console.log("[Check-out Image] ✗ Error:", fullUrl, e.nativeEvent)}
                                />
                              );
                            })()}
                          </>
                        ) : (
                          <View style={styles.imagePlaceholder}>
                            <Text style={styles.imagePlaceholderText}>
                              {isActive ? "Chưa checkout" : "Chưa có ảnh"}
                            </Text>
                          </View>
                        )}
                        <View style={styles.imageLabel}>
                          <Text style={styles.imageLabelText}>CHECK-OUT</Text>
                        </View>
                      </TouchableOpacity>
                    </View>

                    {/* Details */}
                    <View style={styles.detailsContainer}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Thời gian vào:</Text>
                        <Text style={styles.detailValue}>
                          {formatDateTime(session.check_in)}
                        </Text>
                      </View>

                      {isMonthlyCard && (
                        <>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Loại vé:</Text>
                            {loadingCards[session.id] ? (
                              <ActivityIndicator size="small" color="#0EA5E9" />
                            ) : (
                              <Text style={styles.detailValue}>Vé tháng</Text>
                            )}
                          </View>

                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>
                              Số ngày còn hiệu lực:
                            </Text>
                            {loadingCards[session.id] ? (
                              <ActivityIndicator size="small" color="#0EA5E9" />
                            ) : (
                              <Text
                                style={[
                                  styles.detailValue,
                                  daysRemaining !== null && daysRemaining <= 7
                                    ? styles.expiringText
                                    : null,
                                ]}
                              >
                                {formatDaysRemaining(daysRemaining)}
                              </Text>
                            )}
                          </View>
                        </>
                      )}

                      {hasCheckout && (
                        <>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>
                              Thời gian checkout:
                            </Text>
                            <Text style={styles.detailValue}>
                              {formatDateTime(session.check_out)}
                            </Text>
                          </View>

                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>
                              Thời gian gửi:
                            </Text>
                            <Text style={styles.detailValue}>
                              {calculateDuration(
                                session.check_in,
                                session.check_out
                              )}
                            </Text>
                          </View>

                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>
                              Số tiền đã thanh toán:
                            </Text>
                            {isLoadingInvoice ? (
                              <ActivityIndicator size="small" color="#0EA5E9" />
                            ) : (
                              <Text
                                style={[styles.detailValue, styles.amountText]}
                              >
                                {isMonthlyCard
                                  ? formatCurrency(0)
                                  : invoiceAmount
                                  ? formatCurrency(invoiceAmount)
                                  : "-"}
                              </Text>
                            )}
                          </View>
                        </>
                      )}
                    </View>
                  </Animated.View>
                );
              })
            )}
          </>
        )}
      </ScrollView>

      {/* Lightbox Modal */}
      <Modal
        visible={lightboxOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseLightbox}
      >
        <Pressable style={styles.lightboxOverlay} onPress={handleCloseLightbox}>
          <Pressable
            style={styles.lightboxContent}
            onPress={(e) => e.stopPropagation()}
          >
            {selectedImage && (
              <>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCloseLightbox}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
                <View style={styles.lightboxHeader}>
                  <Text style={styles.lightboxPlate}>
                    {selectedImage.plate}
                  </Text>
                  <Text style={styles.lightboxType}>
                    {selectedImage.type === "checkin"
                      ? "Check-in"
                      : "Check-out"}
                  </Text>
                </View>
                <Image
                  source={{ uri: getImageUrl(selectedImage.url) || "" }}
                  style={styles.lightboxImage}
                  resizeMode="contain"
                />
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  headerTextContainer: {
    flex: 1,
  },
  userEmail: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
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
    marginBottom: 20,
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
    marginBottom: 0,
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
    fontSize: 16,
    color: "#0F172A",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  searchButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 16,
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
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#64748B",
  },
  errorContainer: {
    backgroundColor: "#FEF2F2",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    marginTop: 20,
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
    textAlign: "center",
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
    textAlign: "center",
  },
  noDataSubtext: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
  },
  sessionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sessionPlate: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "700",
  },
  imagesRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  imageContainer: {
    flex: 1,
    height: 150,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    position: "relative",
  },
  sessionImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  imageLabel: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  imageLabelText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 1,
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    flex: 1,
  },
  detailValue: {
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
  expiringText: {
    color: "#DC2626",
    fontWeight: "700",
  },
  lightboxOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  lightboxContent: {
    width: width - 40,
    maxHeight: "90%",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: -50,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  lightboxHeader: {
    marginBottom: 20,
    alignItems: "center",
  },
  lightboxPlate: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  lightboxType: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  lightboxImage: {
    width: width - 40,
    height: (width - 40) * 1.2,
    borderRadius: 12,
  },
});
