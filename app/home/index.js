import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  Dimensions,
} from "react-native";
import { useRouter, useSegments } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useAuth } from "../../context/AuthContext";

export default function Home() {
  const router = useRouter();
  const segments = useSegments(); // Ensure routing is ready
  const { userToken } = useAuth();

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

  return (
    <ImageBackground
      source={require("../../assets/images/bg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Profile Button (Top Right) */}
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push("/profile")}
        >
          <Image
            source={require("../../assets/images/profile-icon.png")}
            style={styles.profileIcon}
          />
        </TouchableOpacity>

        {/* Logo */}
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
        />

        {/* Navigation Buttons */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/home/chapters")}
        >
          <Text style={styles.buttonText}>Chapters</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/home/tips")}
        >
          <Text style={styles.buttonText}>Get Tips</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/home/leaderboard")}
        >
          <Text style={styles.buttonText}>Leaderboard</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  background: {
    width: width,
    height: height,
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileButton: {
    position: "absolute",
    top: 40,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  profileIcon: {
    width: 60,
    height: 60,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#4a6da7",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 15,
    width: 250,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
});
