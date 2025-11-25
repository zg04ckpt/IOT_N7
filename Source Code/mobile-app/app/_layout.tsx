import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SnackbarProvider } from "@/contexts/SnackbarContext";

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const prevAuthStateRef = useRef<{ isAuthenticated: boolean; isLoading: boolean } | null>(null);

  useEffect(() => {
    if (isLoading) {
      prevAuthStateRef.current = { isAuthenticated, isLoading };
      return;
    }

    const inAuthGroup = segments[0] === "auth";
    
    // Only navigate if auth state actually changed
    const authStateChanged = 
      prevAuthStateRef.current === null ||
      prevAuthStateRef.current.isAuthenticated !== isAuthenticated ||
      prevAuthStateRef.current.isLoading !== isLoading;

    if (!authStateChanged) {
      return;
    }

    // Update previous state
    prevAuthStateRef.current = { isAuthenticated, isLoading };

    // Navigate based on auth state
    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to auth if not authenticated
      router.replace("/auth");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home if authenticated and in auth group
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#F8FAFC" },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SnackbarProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </SnackbarProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
});
