import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Animated,
  Platform,
} from "react-native";
import { useRouter, useSegments } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useAuth } from "../../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Home() {
  const router = useRouter();
  const segments = useSegments();
  const { userToken } = useAuth();
  const [screenDimensions, setScreenDimensions] = useState(
    Dimensions.get("window")
  );
  const [userInfo, setUserInfo] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonAnimations = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  // Get user info from AsyncStorage
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const userInfoString = await AsyncStorage.getItem("userInfo");
        if (userInfoString) {
          const userInfoData = JSON.parse(userInfoString);
          setUserInfo(userInfoData);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    if (userToken) {
      getUserInfo();
    }
  }, [userToken]);

  // Handle screen dimension changes
  useEffect(() => {
    const dimensionsHandler = ({ window }) => {
      setScreenDimensions(window);
    };

    Dimensions.addEventListener("change", dimensionsHandler);
    return () => {
      // Clean up event listener properly based on Expo SDK version
      const dimensionsObject = Dimensions;
      if (dimensionsObject.removeEventListener) {
        dimensionsObject.removeEventListener("change", dimensionsHandler);
      }
    };
  }, []);

  // Set screen orientation to landscape
  useEffect(() => {
    async function setOrientation() {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    }
    setOrientation();
  }, []);

  // Ensure routing is ready before navigation
  useEffect(() => {
    if (segments.length === 0) return;
    if (!userToken) {
      setTimeout(() => {
        router.replace("/login");
      }, 100);
    }
  }, [userToken, segments]);

  // Start animations when component mounts
  useEffect(() => {
    if (userToken) {
      // Main content animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
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

      // Staggered button animations
      buttonAnimations.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          delay: 400 + index * 150,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [userToken]);

  if (!userToken) {
    return null; // Prevent rendering while checking authentication
  }

  // Calculate responsive sizes based on screen dimensions
  const { width, height } = screenDimensions;
  const isSmallScreen = width < 600;
  const isWebPlatform = Platform.OS === "web";

  // Calculate sizes proportionally to screen dimensions
  const logoSize = isSmallScreen ? width * 0.2 : width * 0.15;
  const buttonWidth = isSmallScreen ? width * 0.3 : width * 0.25;
  const profileIconSize = isSmallScreen ? width * 0.08 : width * 0.06;
  const helpIconSize = profileIconSize * 0.9;
  const buttonFontSize = isSmallScreen ? width * 0.025 : width * 0.02;
  const buttonPaddingVertical = height * 0.03;

  // Get user's name from userInfo
  const userName = userInfo?.name || userInfo?.username || "User";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar hidden />
      <ImageBackground
        source={require("../../assets/images/bg.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.4)"]}
          style={styles.overlay}
        />

        <View style={styles.container}>
          {/* Header with welcome message and profile */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{userName}</Text>
            </View>

            <View style={styles.headerButtons}>
              {/* Profile Button */}
              <View style={styles.iconsContainer}>
                <TouchableOpacity
                  style={[
                    styles.circleButton,
                    {
                      width: profileIconSize * 1.2,
                      height: profileIconSize * 1.2,
                      borderRadius: (profileIconSize * 1.2) / 2,
                      marginBottom: 10,
                    },
                  ]}
                  onPress={() => router.push("/profile")}
                  activeOpacity={0.8}
                >
                  {Platform.OS === "ios" ? (
                    <BlurView intensity={20} style={styles.blurView}>
                      <Image
                        source={require("../../assets/images/profile-icon.png")}
                        style={{
                          width: profileIconSize,
                          height: profileIconSize,
                        }}
                      />
                    </BlurView>
                  ) : (
                    <View style={styles.profileContent}>
                      <Image
                        source={require("../../assets/images/profile-icon.png")}
                        style={{
                          width: profileIconSize,
                          height: profileIconSize,
                        }}
                      />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Help Button */}
                <TouchableOpacity
                  style={[
                    styles.circleButton,
                    {
                      width: helpIconSize * 1.2,
                      height: helpIconSize * 1.2,
                      borderRadius: (helpIconSize * 1.2) / 2,
                    },
                  ]}
                  onPress={() => router.push("/help")}
                  activeOpacity={0.8}
                >
                  {Platform.OS === "ios" ? (
                    <BlurView intensity={20} style={styles.blurView}>
                      <Ionicons
                        name="help-circle-outline"
                        size={helpIconSize}
                        color="white"
                      />
                    </BlurView>
                  ) : (
                    <View style={styles.profileContent}>
                      <Ionicons
                        name="help-circle-outline"
                        size={helpIconSize}
                        color="white"
                      />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Logo */}
          <Animated.Image
            source={require("../../assets/images/logo.png")}
            style={[
              styles.logo,
              {
                width: logoSize,
                height: logoSize,
                marginBottom: height * 0.06,
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
            resizeMode="contain"
          />

          {/* App Tagline */}
          <Animated.View
            style={[
              styles.taglineContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                marginBottom: height * 0.04,
              },
            ]}
          >
            <Text style={[styles.tagline, isWebPlatform && styles.taglineWeb]}>
              Learn Intellectual Property Rights with fun and ease
            </Text>
          </Animated.View>

          {/* Navigation Buttons */}
          <View style={styles.buttonsContainer}>
            <Animated.View
              style={{
                opacity: buttonAnimations[0],
                transform: [
                  {
                    translateY: buttonAnimations[0].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              }}
            >
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    width: buttonWidth,
                    marginBottom: height * 0.02,
                  },
                ]}
                onPress={() => router.push("/home/chapters")}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#4a6da7", "#5d7fb9", "#3c5a8a"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.buttonGradient,
                    { paddingVertical: buttonPaddingVertical },
                  ]}
                >
                  <Ionicons
                    name="book-outline"
                    size={buttonFontSize * 1.5}
                    color="white"
                    style={styles.buttonIcon}
                  />
                  <Text
                    style={[styles.buttonText, { fontSize: buttonFontSize }]}
                  >
                    Chapters
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={{
                opacity: buttonAnimations[1],
                transform: [
                  {
                    translateY: buttonAnimations[1].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              }}
            >
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    width: buttonWidth,
                    marginBottom: height * 0.02,
                  },
                ]}
                onPress={() => router.push("/home/tips")}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#4a6da7", "#5d7fb9", "#3c5a8a"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.buttonGradient,
                    { paddingVertical: buttonPaddingVertical },
                  ]}
                >
                  <Ionicons
                    name="bulb-outline"
                    size={buttonFontSize * 1.5}
                    color="white"
                    style={styles.buttonIcon}
                  />
                  <Text
                    style={[styles.buttonText, { fontSize: buttonFontSize }]}
                  >
                    Get Tips
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={{
                opacity: buttonAnimations[2],
                transform: [
                  {
                    translateY: buttonAnimations[2].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              }}
            >
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    width: buttonWidth,
                    marginBottom: height * 0.02,
                  },
                ]}
                onPress={() => router.push("/home/leaderboard")}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#4a6da7", "#5d7fb9", "#3c5a8a"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.buttonGradient,
                    { paddingVertical: buttonPaddingVertical },
                  ]}
                >
                  <Ionicons
                    name="trophy-outline"
                    size={buttonFontSize * 1.5}
                    color="white"
                    style={styles.buttonIcon}
                  />
                  <Text
                    style={[styles.buttonText, { fontSize: buttonFontSize }]}
                  >
                    Leaderboard
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  header: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 30,
    zIndex: 10,
  },
  welcomeContainer: {
    flexDirection: "column",
  },
  welcomeText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Montserrat_Regular",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  userName: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerButtons: {
    alignItems: "flex-end",
  },
  iconsContainer: {
    alignItems: "center",
  },
  circleButton: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  blurView: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  profileContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  logo: {
    resizeMode: "contain",
  },
  taglineContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  tagline: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    fontFamily: "Montserrat_Regular",
    maxWidth: "80%",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  taglineWeb: {
    maxWidth: "60%",
    whiteSpace: "nowrap",
  },
  buttonsContainer: {
    alignItems: "center",
  },
  button: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    width: "100%",
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
});
