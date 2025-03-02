import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useAuth } from "../context/AuthContext";
import CustomAlert from "../components/CustomAlert";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(""); // ✅ Alert state
  const [showAlert, setShowAlert] = useState(false);

  const router = useRouter();
  const { login, userToken } = useAuth();

  // Set screen orientation to landscape
  useEffect(() => {
    async function setOrientation() {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    }
    setOrientation();

    // Check if already logged in
    if (userToken) {
      router.replace("/home");
    }
  }, [userToken]);

  const handleLogin = async () => {
    if (!email || !password) {
      showCustomAlert("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email, password);
      setIsLoading(false);

      if (!result.success) {
        showCustomAlert(result.message || "Invalid email or password");
      } else {
        router.replace("/home");
      }
    } catch (error) {
      setIsLoading(false);
      showCustomAlert("Something went wrong. Please try again.");
    }
  };

  // ✅ Custom alert function
  const showCustomAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomAlert
        visible={showAlert}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />
      {/* Left half - Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={require("../assets/images/login.png")} // ✅ Use require()
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.overlayContainer}>
          <Image
            source={require("../assets/images/logo.png")} // Replace with your actual image path
            style={styles.logo} // Define logo size in styles
            resizeMode="contain"
          />
          <Text style={styles.overlaySubtitle}>
            Learn Intellectual Property Rights with fun and ease
          </Text>
        </View>
      </View>

      {/* Right half - Login Form */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.formSection}
      >
        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue to your account
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => router.push("/forgot-password")}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text style={styles.registerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
  },
  // Left section - Image
  imageContainer: {
    flex: 1,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(74, 109, 167, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  overlayTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
    fontFamily: "Montserrat_Bold",
  },
  overlaySubtitle: {
    fontSize: 26,
    color: "white",
    textAlign: "center",
    fontFamily: "Montserrat_Regular",
    maxWidth: "80%",
  },

  // Right section - Form
  formSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  formContainer: {
    width: "100%",
    maxWidth: 450,
    backgroundColor: "white",
    padding: 32,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  formHeader: {
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    fontFamily: "Montserrat_Bold",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    fontFamily: "Montserrat_Regular",
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: "#555",
    fontFamily: "Montserrat_Regular",
  },
  input: {
    backgroundColor: "#f9f9f9",
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 16,
    fontFamily: "Montserrat_Regular",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  forgotPasswordText: {
    color: "#4a6da7",
    fontSize: 14,
    fontFamily: "Montserrat_Regular",
  },
  button: {
    backgroundColor: "#4a6da7",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#4a6da7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  dividerText: {
    paddingHorizontal: 16,
    color: "#888",
    fontFamily: "Montserrat_Regular",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  registerText: {
    color: "#555",
    fontSize: 16,
    fontFamily: "Montserrat_Regular",
  },
  registerLink: {
    color: "#4a6da7",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
});
