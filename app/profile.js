import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const router = useRouter();
  const { userInfo, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Image */}
        <Image
          source={require("../assets/images/profile-icon.png")}
          style={styles.profileImage}
        />

        <Text style={styles.title}>Profile</Text>

        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Name:</Text>
          <Text style={styles.infoText}>{userInfo?.name || "N/A"}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoText}>{userInfo?.email || "N/A"}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Age:</Text>
          <Text style={styles.infoText}>
            {userInfo?.age ? userInfo.age : "N/A"}
          </Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Gender:</Text>
          <Text style={styles.infoText}>{userInfo?.gender || "N/A"}</Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>

        {/* Back to Home Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/home")}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    alignItems: "center",
    padding: 20,
    paddingBottom: 40, // Extra padding to avoid content cut-off
  },
  profileImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    fontFamily: "Montserrat_Bold",
  },
  infoContainer: {
    width: "90%",
    marginBottom: 15,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    fontFamily: "Montserrat_Regular",
  },
  infoText: {
    fontSize: 16,
    color: "#333",
    fontFamily: "Montserrat_Regular",
  },
  logoutButton: {
    backgroundColor: "#d9534f",
    padding: 15,
    borderRadius: 8,
    width: "90%",
    alignItems: "center",
    marginTop: 20,
  },
  backButton: {
    backgroundColor: "#4a6da7",
    padding: 15,
    borderRadius: 8,
    width: "90%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Montserrat_Regular",
  },
});
