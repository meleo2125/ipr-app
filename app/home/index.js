import React, { useEffect, useState } from "react";
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
} from "react-native";
import { useRouter, useSegments } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useAuth } from "../../context/AuthContext";

export default function Home() {
  const router = useRouter();
  const segments = useSegments();
  const { userToken } = useAuth();
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get("window"));

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

  if (!userToken) {
    return null; // Prevent rendering while checking authentication
  }

  // Calculate responsive sizes based on screen dimensions
  const { width, height } = screenDimensions;
  const isSmallScreen = width < 600;
  
  // Calculate sizes proportionally to screen dimensions
  const logoSize = isSmallScreen ? width * 0.2 : width * 0.15;
  const buttonWidth = isSmallScreen ? width * 0.3 : width * 0.25;
  const profileIconSize = isSmallScreen ? width * 0.08 : width * 0.06;
  const buttonFontSize = isSmallScreen ? width * 0.025 : width * 0.02;
  const buttonPaddingVertical = height * 0.03;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar hidden />
      <ImageBackground
        source={require("../../assets/images/bg.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.container}>
          {/* Profile Button (Top Right) */}
          <TouchableOpacity
            style={[
              styles.profileButton,
              {
                top: height * 0.05,
                right: width * 0.03,
                width: profileIconSize,
                height: profileIconSize,
                borderRadius: profileIconSize / 2,
              },
            ]}
            onPress={() => router.push("/profile")}
          >
            <Image
              source={require("../../assets/images/profile-icon.png")}
              style={{ width: profileIconSize, height: profileIconSize }}
            />
          </TouchableOpacity>

          {/* Logo */}
          <Image
            source={require("../../assets/images/logo.png")}
            style={[
              styles.logo,
              {
                width: logoSize,
                height: logoSize,
                marginBottom: height * 0.06,
              },
            ]}
            resizeMode="contain"
          />

          {/* Navigation Buttons */}
          <TouchableOpacity
            style={[
              styles.button,
              {
                paddingVertical: buttonPaddingVertical,
                width: buttonWidth,
                marginBottom: height * 0.02,
              },
            ]}
            onPress={() => router.push("/home/chapters")}
          >
            <Text style={[styles.buttonText, { fontSize: buttonFontSize }]}>
              Chapters
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              {
                paddingVertical: buttonPaddingVertical,
                width: buttonWidth,
                marginBottom: height * 0.02,
              },
            ]}
            onPress={() => router.push("/home/tips")}
          >
            <Text style={[styles.buttonText, { fontSize: buttonFontSize }]}>
              Get Tips
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              {
                paddingVertical: buttonPaddingVertical,
                width: buttonWidth,
                marginBottom: height * 0.02,
              },
            ]}
            onPress={() => router.push("/home/leaderboard")}
          >
            <Text style={[styles.buttonText, { fontSize: buttonFontSize }]}>
              Leaderboard
            </Text>
          </TouchableOpacity>
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
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileButton: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logo: {
    resizeMode: "contain",
  },
  button: {
    backgroundColor: "#4a6da7",
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
});