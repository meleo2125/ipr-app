import React from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext"; // Import AuthProvider

export default function Layout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="home" />
      </Stack>
    </AuthProvider>
  );
}
