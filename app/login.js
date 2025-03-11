import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
  StatusBar,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useAuth } from "../context/AuthContext";
import CustomAlert from "../components/CustomAlert";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { width, height } = useWindowDimensions();

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // Screen size breakpoints
  const isMobileScreen = width < 480;
  const isTabletScreen = width >= 480 && width < 1024;
  const isLargeScreen = width >= 1024;
  const isLowHeight = height < 500; // For handling very low height screens

  const router = useRouter();
  const { login, userToken } = useAuth();

  // Set screen orientation based on device type
  useEffect(() => {
    // Check if already logged in
    if (userToken) {
      router.replace("/home");
    }

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [userToken, width]);

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

  const showCustomAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  // Render login form only
  const renderLoginForm = () => (
    <Animated.View
      style={[
        styles.formContainer,
        isMobileScreen && styles.formContainerMobile,
        isTabletScreen && styles.formContainerTablet,
        isLowHeight && styles.formContainerLowHeight,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.formHeader}>
        <Text
          style={[
            styles.welcomeText,
            isMobileScreen && styles.welcomeTextMobile,
            isLowHeight && styles.welcomeTextLowHeight,
          ]}
        >
          Welcome Back
        </Text>
        <Text
          style={[
            styles.subtitle,
            isMobileScreen && styles.subtitleMobile,
            isLowHeight && styles.subtitleLowHeight,
          ]}
        >
          Sign in to continue to your account
        </Text>
      </View>

      <View
        style={[
          styles.inputContainer,
          isMobileScreen && styles.inputContainerMobile,
          isLowHeight && styles.inputContainerLowHeight,
        ]}
      >
        <Text style={styles.label}>Email Address</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="mail-outline"
            size={20}
            color="#4a6da7"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      <View
        style={[
          styles.inputContainer,
          isMobileScreen && styles.inputContainerMobile,
          isLowHeight && styles.inputContainerLowHeight,
        ]}
      >
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#4a6da7"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#777"
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => router.push("/forgot-password")}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, isLowHeight && styles.buttonLowHeight]}
        onPress={handleLogin}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#4a6da7", "#5d7fb9", "#3c5a8a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.buttonText}>Signing In</Text>
              <View style={styles.loadingDots}>
                <Animated.View style={styles.loadingDot} />
                <Animated.View style={[styles.loadingDot, { marginLeft: 4 }]} />
                <Animated.View style={[styles.loadingDot, { marginLeft: 4 }]} />
              </View>
            </View>
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <View
        style={[
          styles.dividerContainer,
          isMobileScreen && styles.dividerContainerMobile,
          isLowHeight && styles.dividerContainerLowHeight,
        ]}
      >
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
    </Animated.View>
  );

  // Mobile view - compact single screen
  if (isMobileScreen) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <CustomAlert
          visible={showAlert}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
        <LinearGradient
          colors={["#f5f5f5", "#e8eef7"]}
          style={styles.gradientBackground}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.mobileContainer}
          >
            <ScrollView
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={false}
            >
              <Animated.View
                style={[
                  styles.mobileLogoContainer,
                  { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                ]}
              >
                <Image
                  source={require("../assets/images/logo.png")}
                  style={[
                    styles.logoMobile,
                    isLowHeight && styles.logoMobileLowHeight,
                  ]}
                  resizeMode="contain"
                />
                <View style={styles.taglineContainer}>
                  <Text style={styles.tagline}>Learn. Protect. Innovate.</Text>
                </View>
              </Animated.View>
              {renderLoginForm()}
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Tablet view - single part with form only
  if (isTabletScreen) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <CustomAlert
          visible={showAlert}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
        <LinearGradient
          colors={["#f5f5f5", "#e8eef7"]}
          style={styles.gradientBackground}
        >
          <ScrollView
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.tabletContainer}>
              <Animated.View
                style={[
                  styles.tabletLogoContainer,
                  { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                ]}
              >
                <Image
                  source={require("../assets/images/logo.png")}
                  style={styles.logoTablet}
                  resizeMode="contain"
                />
                <Text style={styles.tabletTitle}>
                  Learn Intellectual Property Rights
                </Text>
                <View style={styles.tabletTaglineContainer}>
                  <Text style={styles.tabletTagline}>
                    Protecting your ideas in the digital age
                  </Text>
                </View>
              </Animated.View>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.tabletFormSection}
              >
                {renderLoginForm()}
              </KeyboardAvoidingView>
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Large screen view - two parts side by side
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <CustomAlert
        visible={showAlert}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />
      <ScrollView
        contentContainerStyle={styles.largeScreenScrollContent}
        horizontal={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.largeScreenContainer}>
          {/* Left half - Image Section */}
          <View style={styles.imageContainer}>
            <Image
              source={require("../assets/images/login.png")}
              style={styles.image}
              resizeMode="cover"
            />

            <LinearGradient
              colors={["rgba(74, 109, 167, 0.85)", "rgba(58, 83, 128, 0.95)"]}
              style={styles.overlayContainer}
            >
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                  alignItems: "center",
                }}
              >
                <Image
                  source={require("../assets/images/logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.overlaySubtitle}>
                  Learn Intellectual Property Rights with fun and ease
                </Text>
                <View style={styles.featureContainer}>
                  <View style={styles.featureItem}>
                    <Ionicons name="shield-checkmark" size={24} color="white" />
                    <Text style={styles.featureText}>Protect Your Ideas</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="school" size={24} color="white" />
                    <Text style={styles.featureText}>Interactive Learning</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="trophy" size={24} color="white" />
                    <Text style={styles.featureText}>Earn Points</Text>
                  </View>
                </View>
              </Animated.View>
            </LinearGradient>
          </View>

          {/* Right half - Login Form */}
          <LinearGradient
            colors={["#f5f5f5", "#e8eef7"]}
            style={styles.formSection}
          >
            <ScrollView
              contentContainerStyle={styles.formScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {renderLoginForm()}
            </ScrollView>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  gradientBackground: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  // Large screen layout (two parts)
  largeScreenContainer: {
    flex: 1,
    flexDirection: "row",
    minHeight: 600,
  },
  largeScreenScrollContent: {
    flexGrow: 1,
  },
  formScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  overlaySubtitle: {
    fontSize: 26,
    color: "white",
    textAlign: "center",
    fontFamily: "Montserrat_Regular",
    maxWidth: "80%",
    marginBottom: 30,
    textShadow: "0px 2px 4px rgba(0,0,0,0.3)",
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
  featureContainer: {
    marginTop: 20,
    width: "80%",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  featureText: {
    color: "white",
    marginLeft: 10,
    fontSize: 16,
    fontFamily: "Montserrat_Regular",
  },

  // Tablet layout (single part)
  tabletContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    minHeight: 600,
  },
  tabletLogoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoTablet: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  tabletTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4a6da7",
    textAlign: "center",
    fontFamily: "Montserrat_Bold",
    marginBottom: 10,
  },
  tabletTaglineContainer: {
    backgroundColor: "rgba(74, 109, 167, 0.1)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 5,
  },
  tabletTagline: {
    fontSize: 14,
    color: "#4a6da7",
    fontFamily: "Montserrat_Regular",
  },
  tabletFormSection: {
    width: "100%",
    maxWidth: 450,
  },
  formContainerTablet: {
    width: "100%",
  },

  // Mobile layout (compact single screen)
  mobileContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  mobileLogoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoMobile: {
    width: 80,
    height: 80,
    marginBottom: 5,
  },
  logoMobileLowHeight: {
    width: 60,
    height: 60,
    marginBottom: 2,
  },
  taglineContainer: {
    backgroundColor: "rgba(74, 109, 167, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginTop: 5,
  },
  tagline: {
    fontSize: 12,
    color: "#4a6da7",
    fontFamily: "Montserrat_Regular",
  },
  formContainerMobile: {
    padding: 20,
  },
  welcomeTextMobile: {
    fontSize: 22,
    marginBottom: 4,
  },
  subtitleMobile: {
    fontSize: 13,
  },
  inputContainerMobile: {
    marginBottom: 16,
  },
  dividerContainerMobile: {
    marginVertical: 16,
  },

  // Low height styles for landscape mobile
  formContainerLowHeight: {
    padding: 15,
  },
  welcomeTextLowHeight: {
    fontSize: 20,
    marginBottom: 2,
  },
  subtitleLowHeight: {
    fontSize: 12,
  },
  inputContainerLowHeight: {
    marginBottom: 10,
  },
  buttonLowHeight: {
    marginTop: 10,
  },
  dividerContainerLowHeight: {
    marginVertical: 10,
  },

  // Common form styles
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
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    overflow: "hidden",
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    fontFamily: "Montserrat_Regular",
    color: "#333",
  },
  passwordToggle: {
    padding: 12,
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
    marginTop: 16,
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#4a6da7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonGradient: {
    padding: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingDots: {
    flexDirection: "row",
    marginLeft: 8,
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "white",
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
    flexWrap: "wrap",
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
});
