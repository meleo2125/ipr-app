import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../api/config";
import { LineChart, ProgressChart } from "react-native-chart-kit";
import { FontAwesome5, FontAwesome } from "@expo/vector-icons";

const chapters = ["patent", "copyrights", "trademark", "design"];

export default function Profile() {
  const router = useRouter();
  const { userInfo, logout, userToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [chapterData, setChapterData] = useState({});
  const [completionTitle, setCompletionTitle] = useState("Novice");
  const [timelineData, setTimelineData] = useState(null);
  const [userRanking, setUserRanking] = useState({ rank: "-", totalUsers: "-" });
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userInfo?.email) return;

      setLoading(true);
      try {
        // Fetch chapter data
        const chapterResults = {};
        for (const chapter of chapters) {
          const response = await fetch(
            `${API_URL}/api/user-levels?email=${userInfo.email}&chapter=${chapter}`,
            {
              headers: {
                "x-auth-token": userToken,
              },
            }
          );

          const data = await response.json();
          if (response.ok) {
            chapterResults[chapter] = data.completedLevelsData || [];
          }
        }
        setChapterData(chapterResults);
        calculateUserTitle(chapterResults);
        prepareTimelineData(chapterResults);

        // Fetch leaderboard data to determine user ranking
        const leaderboardResponse = await fetch(`${API_URL}/api/leaderboard`);
        const leaderboardData = await leaderboardResponse.json();
        
        if (leaderboardResponse.ok) {
          const userIndex = leaderboardData.findIndex(
            (entry) => entry.email === userInfo.email
          );
          
          if (userIndex !== -1) {
            setUserRanking({
              rank: userIndex + 1,
              totalUsers: leaderboardData.length,
              score: leaderboardData[userIndex].totalScore
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userInfo]);

  const calculateUserTitle = (data) => {
    let totalCompleted = 0;

    Object.values(data).forEach((levels) => {
      totalCompleted += levels.length;
    });

    const totalPossible = chapters.length * 5; // 5 levels per chapter
    const completionPercentage = (totalCompleted / totalPossible) * 100;

    if (completionPercentage === 0) setCompletionTitle("Novice");
    else if (completionPercentage < 20) setCompletionTitle("Beginner");
    else if (completionPercentage < 40) setCompletionTitle("Apprentice");
    else if (completionPercentage < 60) setCompletionTitle("Practitioner");
    else if (completionPercentage < 80) setCompletionTitle("Expert");
    else if (completionPercentage < 100) setCompletionTitle("Master");
    else setCompletionTitle("Grand Master");
  };

  const prepareTimelineData = (data) => {
    // Collect all completion dates
    const completionEvents = [];

    Object.entries(data).forEach(([chapter, levels]) => {
      levels.forEach((level) => {
        if (level.completedAt) {
          completionEvents.push({
            chapter,
            levelNumber: level.levelNumber,
            completedAt: new Date(level.completedAt),
            score: level.score,
          });
        }
      });
    });

    // Sort by completion date
    completionEvents.sort((a, b) => a.completedAt - b.completedAt);

    if (completionEvents.length === 0) {
      setTimelineData(null);
      return;
    }

    // Take only the last 7 events if there are more than 7
    // This helps with timeline visibility by reducing label crowding
    const recentEvents = completionEvents.slice(-7);

    // Format dates for better readability on x-axis
    const formatDate = (date) => {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}/${day}`;
    };

    // Prepare data for line chart with formatted date labels
    const labels = recentEvents.map(event => formatDate(event.completedAt));

    const datasets = [
      {
        data: recentEvents.map((event) => event.score),
        color: () => "rgba(65, 105, 225, 1)",
        strokeWidth: 2,
      },
    ];

    setTimelineData({ 
      labels, 
      datasets,
      legend: ["Recent Level Scores"]
    });
  };

  const getCompletionRate = (chapter) => {
    if (!chapterData[chapter]) return 0;
    return chapterData[chapter].length / 5; // 5 levels per chapter
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Header - Enhanced */}
        <View style={styles.profileHeader}>
          <Image
            source={require("../assets/images/profile-icon.png")}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <View style={styles.nameTitle}>
              <Text style={styles.name}>{userInfo?.name || "User"}</Text>
              <View style={styles.titleBadge}>
                <Text style={styles.titleText}>{completionTitle}</Text>
              </View>
            </View>
            <Text style={styles.email}>
              {userInfo?.email || "email@example.com"}
            </Text>
            
            {/* Added user details */}
            <View style={styles.userDetails}>
              <View style={styles.detailItem}>
                <FontAwesome name="birthday-cake" size={14} color="#666" />
                <Text style={styles.detailText}>Age: {userInfo?.age || "N/A"}</Text>
              </View>
              <View style={styles.detailItem}>
                <FontAwesome name="user" size={14} color="#666" />
                <Text style={styles.detailText}>Gender: {userInfo?.gender || "N/A"}</Text>
              </View>
            </View>
            
            <View style={styles.profileActions}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.buttonText}>Logout</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.homeButton}
                onPress={() => router.replace("/home")}
              >
                <Text style={styles.buttonText}>Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* User Ranking Card */}
        <View style={styles.rankingCard}>
          <FontAwesome5 name="trophy" size={24} color="#FFD700" style={styles.rankingIcon} />
          <View style={styles.rankingContent}>
            <Text style={styles.rankingTitle}>Current Ranking</Text>
            <Text style={styles.rankingValue}>
              {userRanking.rank} <Text style={styles.rankingOf}>of</Text> {userRanking.totalUsers}
            </Text>
          </View>
          <View style={styles.scoreContent}>
            <Text style={styles.scoreTitle}>Total Score</Text>
            <Text style={styles.scoreValue}>{userRanking.score || 0}</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4a6da7" />
            <Text style={styles.loadingText}>Loading your progress...</Text>
          </View>
        ) : (
          <>
            {/* Chapter Progress - Single Row */}
            <Text style={styles.sectionTitle}>Chapter Completion</Text>
            <View style={styles.progressGrid}>
              {chapters.map((chapter, index) => (
                <View key={index} style={styles.progressCard}>
                  <Text style={styles.progressChapter}>{chapter}</Text>
                  <View style={styles.progressMeter}>
                    <ProgressChart
                      data={{
                        data: [getCompletionRate(chapter)],
                      }}
                      width={screenWidth * 0.4}
                      height={screenWidth * 0.25}
                      strokeWidth={12}
                      radius={32}
                      chartConfig={{
                        backgroundColor: "#ffffff",
                        backgroundGradientFrom: "#ffffff",
                        backgroundGradientTo: "#ffffff",
                        decimalPlaces: 0,
                        color: (opacity = 1) => {
                          const value = getCompletionRate(chapter);
                          if (value >= 0.8)
                            return `rgba(50, 205, 50, ${opacity})`;
                          if (value >= 0.6)
                            return `rgba(46, 139, 87, ${opacity})`;
                          if (value >= 0.4)
                            return `rgba(255, 165, 0, ${opacity})`;
                          if (value >= 0.2)
                            return `rgba(255, 140, 0, ${opacity})`;
                          return `rgba(220, 20, 60, ${opacity})`;
                        },
                        labelColor: () => "#333333",
                        style: {
                          borderRadius: 16,
                        },
                      }}
                      hideLegend={true}
                    />
                    <Text style={styles.progressSubtext}>
                      {chapterData[chapter]?.length || 0} of 5 Levels
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Performance Timeline - Improved visibility */}
            <Text style={styles.sectionTitle}>Performance Timeline</Text>
            <View style={styles.timelineContainer}>
              {timelineData ? (
                <>
                  <Text style={styles.timelineSubtitle}>Your recent level scores by completion date</Text>
                  <LineChart
                    data={timelineData}
                    width={screenWidth - 40}
                    height={220}
                    yAxisSuffix=""
                    chartConfig={{
                      backgroundColor: "#f5f5f5",
                      backgroundGradientFrom: "#f5f5f5",
                      backgroundGradientTo: "#f5f5f5",
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(74, 109, 167, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      style: {
                        borderRadius: 16,
                      },
                      propsForDots: {
                        r: "6",
                        strokeWidth: "2",
                        stroke: "#ffa726",
                      },
                      propsForLabels: {
                        fontSize: 10,
                        rotation: 45,
                        fontWeight: "bold"
                      }
                    }}
                    bezier
                    style={styles.chart}
                    fromZero={true}
                    segments={5}
                    formatXLabel={(value) => value}
                    yAxisInterval={1}
                    verticalLabelRotation={30}
                  />
                  <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, {backgroundColor: "#ffa726"}]} />
                      <Text style={styles.legendText}>Score on each date</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendLine, {backgroundColor: "rgba(74, 109, 167, 1)"}]} />
                      <Text style={styles.legendText}>Progress trend</Text>
                    </View>
                  </View>
                  <Text style={styles.timelineNote}>
                    Showing your {timelineData.labels.length} most recent level completions
                  </Text>
                </>
              ) : (
                <View style={styles.noDataContainer}>
                  <FontAwesome5 name="chart-line" size={48} color="#ccc" />
                  <Text style={styles.noDataText}>
                    Complete some levels to see your performance timeline
                  </Text>
                </View>
              )}
            </View>

            {/* Statistics Summary */}
            <Text style={styles.sectionTitle}>Learning Statistics</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {Object.values(chapterData).reduce(
                    (sum, levels) => sum + levels.length,
                    0
                  )}
                </Text>
                <Text style={styles.statLabel}>Levels Completed</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {Object.values(chapterData).reduce((sum, levels) => {
                    const totalScore = levels.reduce(
                      (acc, level) => acc + level.score,
                      0
                    );
                    return sum + totalScore;
                  }, 0)}
                </Text>
                <Text style={styles.statLabel}>Total Score</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {(() => {
                    const allLevels = Object.values(chapterData).flat();
                    if (allLevels.length === 0) return 0;

                    const totalScore = allLevels.reduce(
                      (sum, level) => sum + level.score,
                      0
                    );
                    return Math.round(totalScore / allLevels.length);
                  })()}
                </Text>
                <Text style={styles.statLabel}>Avg. Score</Text>
              </View>
            </View>
          </>
        )}
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 40,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  nameTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
    marginRight: 8,
  },
  titleBadge: {
    backgroundColor: "#4a6da7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  titleText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
    fontFamily: "Montserrat_Regular",
  },
  userDetails: {
    flexDirection: "row",
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  detailText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 5,
    fontFamily: "Montserrat_Regular",
  },
  profileActions: {
    flexDirection: "row",
  },
  logoutButton: {
    backgroundColor: "#d9534f",
    padding: 6,
    borderRadius: 6,
    alignItems: "center",
    marginRight: 10,
    minWidth: 70,
  },
  homeButton: {
    backgroundColor: "#4a6da7",
    padding: 6,
    borderRadius: 6,
    alignItems: "center",
    minWidth: 70,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "Montserrat_Regular",
  },
  rankingCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  rankingIcon: {
    marginRight: 15,
  },
  rankingContent: {
    flex: 1,
  },
  rankingTitle: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Montserrat_Regular",
  },
  rankingValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "Montserrat_Bold",
  },
  rankingOf: {
    fontSize: 16,
    fontWeight: "normal",
    color: "#666",
  },
  scoreContent: {
    alignItems: "flex-end",
  },
  scoreTitle: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Montserrat_Regular",
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4a6da7",
    fontFamily: "Montserrat_Bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    fontFamily: "Montserrat_Bold",
    color: "#333",
  },
  progressGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  progressCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    width: "48%",
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  progressChapter: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    fontFamily: "Montserrat_Bold",
    color: "#333",
    textAlign: "center",
  },
  progressMeter: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  progressSubtext: {
    marginTop: 5,
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    fontFamily: "Montserrat_Regular",
  },
  timelineContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  timelineSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    fontFamily: "Montserrat_Regular",
    alignSelf: "flex-start",
  },
  chart: {
    borderRadius: 12,
    marginVertical: 8,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    width: "100%",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendLine: {
    width: 15,
    height: 3,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },
  timelineNote: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
    fontFamily: "Montserrat_Regular",
  },
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 180,
    width: "100%",
  },
  noDataText: {
    marginTop: 12,
    color: "#888",
    textAlign: "center",
    fontFamily: "Montserrat_Regular",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4a6da7",
    marginBottom: 5,
    fontFamily: "Montserrat_Bold",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    fontFamily: "Montserrat_Regular",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 300,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontFamily: "Montserrat_Regular",
  },
});