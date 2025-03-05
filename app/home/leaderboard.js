import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  ImageBackground,
} from "react-native";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../api/config";

const LeaderboardScreen = () => {
  const { userInfo } = useAuth(); // Get logged-in user info
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/leaderboard`)
      .then((response) => {
        setLeaderboard(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching leaderboard:", error);
        setLoading(false);
      });
  }, []);

  const getMedalIcon = (rank) => {
    if (rank === 0) return require("../../assets/images/gold.png");
    if (rank === 1) return require("../../assets/images/silver.png");
    if (rank === 2) return require("../../assets/images/bronze.png");
    return null;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a6da7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Leaderboard Title with Background */}
      <ImageBackground
        source={require("../../assets/images/lead.png")}
        style={styles.titleBackground}
        resizeMode="contain" // ✅ Ensures the whole image is visible
      >
        <Text style={styles.header}>Leaderboard</Text>
      </ImageBackground>

      {leaderboard.length === 0 ? (
        <Text style={styles.noData}>No leaderboard data available</Text>
      ) : (
        <FlatList
          data={leaderboard}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={[styles.item, index < 3 && styles.topRank]}>
              {index < 3 ? (
                <Image source={getMedalIcon(index)} style={styles.medal} />
              ) : (
                <Text style={styles.rank}>{index + 1}</Text>
              )}

              <View style={styles.userInfo}>
                <Text
                  style={[
                    styles.name,
                    item.name === userInfo?.name && styles.highlightName,
                  ]}
                >
                  {item.name} {item.name === userInfo?.name && "(You)"}
                </Text>
                <Text style={styles.email}>{item.email}</Text>
              </View>

              <Text style={styles.score}>{item.totalScore} pts</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  noData: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
    fontFamily: "Montserrat_Regular",
  },
  titleBackground: {
    width: "100%",
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    fontFamily: "Montserrat_Bold",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    fontFamily: "Montserrat_Bold",
  },
  item: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topRank: { backgroundColor: "#eef5ff" },
  medal: { width: 35, height: 35, marginRight: 15 },
  rank: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4a6da7",
    width: 40,
    textAlign: "center",
    fontFamily: "Montserrat_Bold",
  },
  userInfo: { flex: 1 },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "Montserrat_Bold",
  },
  highlightName: { color: "#e67e22" },
  email: { fontSize: 14, color: "#777", fontFamily: "Montserrat_Regular" },
  score: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4a6da7",
    fontFamily: "Montserrat_Bold",
  },
});

export default LeaderboardScreen;
