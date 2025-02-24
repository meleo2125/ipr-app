import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { useAuth, AuthProvider } from "../context/AuthContext";
import { useFonts, Montserrat_400Regular, Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { View, ActivityIndicator } from "react-native";

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
      <ProtectedStack />
    </AuthProvider>
  );
}

// 🔒 Protect all screens inside the app
function ProtectedStack() {
  const router = useRouter();
  const { userToken } = useAuth();

  useEffect(() => {
    if (!userToken) {
      router.replace("/login");
    }
  }, [userToken]);

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
