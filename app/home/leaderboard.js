import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  ImageBackground,
  Dimensions,
  Animated,
} from "react-native";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../api/config";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const LeaderboardScreen = () => {
  const { userInfo } = useAuth(); // Get logged-in user info
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    axios
      .get(`${API_URL}/api/leaderboard`)
      .then((response) => {
        setLeaderboard(response.data);
        setLoading(false);

        // Start animations when data is loaded
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
      <ImageBackground
        source={require("../../assets/images/bg.png")}
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.6)"]}
          style={styles.gradientOverlay}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.loadingText}>Loading Champions...</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("../../assets/images/bg.png")}
      style={styles.backgroundImage}
    >
      <LinearGradient
        colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.6)"]}
        style={styles.gradientOverlay}
      >
        <View style={styles.container}>
          {/* Gamified Header */}
          <View style={styles.headerContainer}>
            <LinearGradient
              colors={["#4a6da7", "#3c5a8a"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.headerGradient}
            >
              <View style={styles.headerContent}>
                <Ionicons
                  name="trophy"
                  size={24}
                  color="#FFD700"
                  style={styles.trophyIcon}
                />
                <View>
                  <Text style={styles.header}>CHAMPIONS BOARD</Text>
                  <Text style={styles.headerSubtitle}>Top IPR Masters</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {leaderboard.length === 0 ? (
            <View style={styles.noDataContainer}>
              <Ionicons name="alert-circle-outline" size={50} color="#FFD700" />
              <Text style={styles.noData}>No champions yet. Be the first!</Text>
            </View>
          ) : (
            <Animated.View
              style={[
                styles.listContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <FlatList
                data={leaderboard}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <Animated.View
                    style={[
                      styles.item,
                      index < 3 && styles.topRank,
                      item.name === userInfo?.name && styles.currentUserItem,
                    ]}
                  >
                    <View style={styles.rankContainer}>
                      {index < 3 ? (
                        <Image
                          source={getMedalIcon(index)}
                          style={styles.medal}
                        />
                      ) : (
                        <View style={styles.rankBadge}>
                          <Text style={styles.rank}>{index + 1}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.userInfo}>
                      <View style={styles.nameContainer}>
                        <Text
                          style={[
                            styles.name,
                            item.name === userInfo?.name &&
                              styles.highlightName,
                          ]}
                        >
                          {item.name}
                        </Text>

                        {item.name === userInfo?.name && (
                          <View style={styles.currentUserIndicator}>
                            <Text style={styles.currentUserText}>YOU</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.email}>{item.email}</Text>
                    </View>

                    <View style={styles.scoreContainer}>
                      <Text style={styles.scoreValue}>{item.totalScore}</Text>
                      <Text style={styles.scoreLabel}>POINTS</Text>
                    </View>
                  </Animated.View>
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            </Animated.View>
          )}
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: "#FFD700",
    fontFamily: "Montserrat_Bold",
  },
  headerContainer: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  headerGradient: {
    padding: 12,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  trophyIcon: {
    marginRight: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    fontFamily: "Montserrat_Bold",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#FFD700",
    fontFamily: "Montserrat_Regular",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noData: {
    fontSize: 18,
    color: "#FFD700",
    textAlign: "center",
    marginTop: 20,
    fontFamily: "Montserrat_Regular",
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  item: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
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
    position: "relative",
  },
  topRank: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
  },
  currentUserItem: {
    borderWidth: 2,
    borderColor: "#e67e22",
  },
  rankContainer: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  rankBadge: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#4a6da7",
    alignItems: "center",
    justifyContent: "center",
  },
  medal: {
    width: 40,
    height: 40,
  },
  rank: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    fontFamily: "Montserrat_Bold",
  },
  userInfo: {
    flex: 1,
    paddingHorizontal: 15,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "Montserrat_Bold",
    marginRight: 8,
  },
  highlightName: {
    color: "#e67e22",
  },
  email: {
    fontSize: 14,
    color: "#777",
    fontFamily: "Montserrat_Regular",
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 8,
    minWidth: 70,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4a6da7",
    fontFamily: "Montserrat_Bold",
  },
  scoreLabel: {
    fontSize: 10,
    color: "#666",
    fontFamily: "Montserrat_Regular",
  },
  currentUserIndicator: {
    backgroundColor: "#e67e22",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 5,
  },
  currentUserText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
});

export default LeaderboardScreen;
