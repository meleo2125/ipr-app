import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { useAuth, AuthProvider } from "../context/AuthContext";
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { View, ActivityIndicator, StatusBar } from "react-native";

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Montserrat_Regular: Montserrat_400Regular,
    Montserrat_Bold: Montserrat_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4a6da7" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <StatusBar hidden={true} />
      <ProtectedStack />
    </AuthProvider>
  );
}

// 🔒 Protect all screens inside the app
function ProtectedStack() {
  const router = useRouter();
  const segments = useSegments(); // ✅ More reliable than `pathname`
  const { userToken } = useAuth();

  // ✅ Allow access to reset-password and forgot-password even without authentication
  useEffect(() => {
    // console.log("Current route segments:", segments);

    const publicRoutes = ["reset-password", "forgot-password", "register"];
    const isPublicRoute =
      segments.length > 0 && publicRoutes.includes(segments[0]);

    if (!userToken && !isPublicRoute) {
      router.replace("/login");
    }
  }, [userToken, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="home" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="home/leaderboard" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="home/tips" />
      <Stack.Screen name="verify-otp" />
    </Stack>
  );
}
