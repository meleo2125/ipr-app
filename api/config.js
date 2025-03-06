import { Platform } from "react-native";

const API_URL =
  Platform.OS === "android"
    ? "http://192.168.9.219:5000" // ✅ Works on mobile/emulator
    : "http://192.168.9.219:5000"; // ✅ Works on web

export { API_URL };
