import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import CustomAlert from "../components/CustomAlert";
import { API_URL } from "../api/config";

export default function ResetPassword() {
  const params = useLocalSearchParams();
  const [token, setToken] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true); // ✅ New state to track token check
  const [alertMessage, setAlertMessage] = useState(""); // ✅ Alert state
  const [showAlert, setShowAlert] = useState(false);
  const router = useRouter();

  // ✅ Fix: Wait until the token is extracted before deciding to redirect
  useEffect(() => {
    const extractedToken = params?.token || "";
    setToken(extractedToken);
    setCheckingToken(false); // ✅ Only after setting the token, stop checking

    console.log("Extracted token:", extractedToken);

    if (!extractedToken) {
      console.log("No token found in URL");
    }
  }, [params]);

  const handleReset = async () => {
    if (!newPassword) {
      showCustomAlert("Please enter a new password");
      return;
    }
    if (!token) {
      showCustomAlert("Missing reset token");
      return;
    }

    setLoading(true);

    try {
      console.log("Sending token to API:", token);
      const response = await fetch(`${API_URL}/api/update-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      showCustomAlert("Password updated successfully!", [
        { text: "OK", onPress: () => router.replace("/login") },
      ]);
    } catch (error) {
      console.error("Reset error:", error);
      showCustomAlert("Invalid or expired token.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fix: Show loading indicator while checking token
  if (checkingToken) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4a6da7" />
      </View>
    );
  }
  const showCustomAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };
  return (
    <View style={styles.container}>
      <CustomAlert
        visible={showAlert}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />
      <Text style={styles.title}>Reset Password</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4a6da7" />
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter new password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity
            style={[styles.button, !token && styles.buttonDisabled]}
            onPress={handleReset}
            disabled={!token}
          >
            <Text style={styles.buttonText}>Update Password</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/login")}
          >
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
const showCustomAlert = (message) => {
  setAlertMessage(message);
  setShowAlert(true);
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1565c0",
    marginBottom: 10,
    fontFamily: "Montserrat_Bold",
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    width: "100%",
    maxWidth: 400,
    marginBottom: 15,
    fontFamily: "Montserrat_Regular",
  },
  button: {
    backgroundColor: "#4a6da7",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: "#9eb6d7",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: "#4a6da7",
    fontSize: 16,
    fontFamily: "Montserrat_Bold",
  },
});
