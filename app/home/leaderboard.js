import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image } from "react-native";
import axios from "axios";

const API_URL = "http://localhost:5000"; // Replace with actual backend URL

const LeaderboardScreen = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_URL}/leaderboard`)
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
    if (rank === 0) return require("../../assets/images/gold.png"); // 🥇
    if (rank === 1) return require("../../assets/images/silver.png"); // 🥈
    if (rank === 2) return require("../../assets/images/bronze.png"); // 🥉
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
      <Text style={styles.header}>Leaderboard</Text>

      <FlatList
        data={leaderboard}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={[styles.item, index < 3 && styles.topRank]}>
            {/* Medal for Top 3 */}
            {index < 3 ? (
              <Image source={getMedalIcon(index)} style={styles.medal} />
            ) : (
              <Text style={styles.rank}>{index + 1}</Text>
            )}

            {/* User Info */}
            <View style={styles.userInfo}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.email}>{item.email}</Text>
            </View>

            {/* Score */}
            <Text style={styles.score}>{item.totalScore} pts</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4a6da7",
    textAlign: "center",
    marginBottom: 20,
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
  topRank: {
    backgroundColor: "#eef5ff",
  },
  medal: {
    width: 35,
    height: 35,
    marginRight: 15,
  },
  rank: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4a6da7",
    width: 40,
    textAlign: "center",
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  email: {
    fontSize: 14,
    color: "#777",
  },
  score: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4a6da7",
  },
});

export default LeaderboardScreen;
