import React, { useState, useEffect, useRef } from "react";
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
  useWindowDimensions,
  RefreshControl,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../api/config";
import { LineChart, ProgressChart, PieChart } from "react-native-chart-kit";
import {
  FontAwesome5,
  FontAwesome,
  MaterialIcons,
  Ionicons,
} from "@expo/vector-icons";

const chapters = ["patent", "copyrights", "trademark", "design"];

export default function Profile() {
  const router = useRouter();
  const { userInfo, logout, userToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chapterData, setChapterData] = useState({});
  const [completionTitle, setCompletionTitle] = useState("Novice");
  const [timelineData, setTimelineData] = useState(null);
  const [userRanking, setUserRanking] = useState({
    rank: "-",
    totalUsers: "-",
  });
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  const [skillRadarData, setSkillRadarData] = useState(null);
  const [studyTimeData, setStudyTimeData] = useState(null);
  const [isEstimatedTime, setIsEstimatedTime] = useState(false);
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
  });
  const [lastActive, setLastActive] = useState(null);

  // Replace Dimensions with useWindowDimensions hook
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [screenWidth, setScreenWidth] = useState(windowWidth);
  const [isSmallScreen, setIsSmallScreen] = useState(windowWidth < 380);

  // Update screenWidth when window dimensions change
  useEffect(() => {
    setScreenWidth(windowWidth);
    setIsSmallScreen(windowWidth < 380);
  }, [windowWidth]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

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
      prepareSkillRadarData(chapterResults);
      prepareStudyTimeData(chapterResults);
      calculateStreakData(chapterResults);

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
            score: leaderboardData[userIndex].totalScore,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  // Store the original completion events for reference when selecting data points
  const [completionEvents, setCompletionEvents] = useState([]);

  const prepareTimelineData = (data) => {
    // Collect all completion dates
    const allCompletionEvents = [];

    Object.entries(data).forEach(([chapter, levels]) => {
      levels.forEach((level) => {
        if (level.completedAt) {
          allCompletionEvents.push({
            chapter,
            levelNumber: level.levelNumber,
            completedAt: new Date(level.completedAt),
            score: level.score,
          });
        }
      });
    });

    // Sort by completion date
    allCompletionEvents.sort((a, b) => a.completedAt - b.completedAt);

    // Store all events for reference
    setCompletionEvents(allCompletionEvents);

    if (allCompletionEvents.length === 0) {
      setTimelineData(null);
      return;
    }

    // Take only the last 7 events if there are more than 7
    // This helps with timeline visibility by reducing label crowding
    const recentEvents = allCompletionEvents.slice(-7);

    // Format dates for better readability on x-axis
    const formatDate = (date) => {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}/${day}`;
    };

    // Prepare data for line chart with formatted date labels
    const labels = recentEvents.map((event) => formatDate(event.completedAt));

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
      legend: ["Recent Level Scores"],
      recentEvents, // Include the actual event data for tooltips
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

  // Calculate percentage for display
  const getCompletionPercentage = (chapter) => {
    const rate = getCompletionRate(chapter);
    return Math.round(rate * 100);
  };

  // Handle data point selection
  const handleDataPointClick = (data, index) => {
    if (
      timelineData &&
      timelineData.recentEvents &&
      timelineData.recentEvents[index]
    ) {
      setSelectedDataPoint(timelineData.recentEvents[index]);
    }
  };

  const prepareSkillRadarData = (data) => {
    // Calculate average score for each chapter
    const chapterScores = {};
    const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"];
    let hasAnyData = false;

    chapters.forEach((chapter) => {
      const levels = data[chapter] || [];
      if (levels.length === 0) {
        chapterScores[chapter] = 0;
      } else {
        hasAnyData = true;
        const totalScore = levels.reduce((sum, level) => sum + level.score, 0);
        chapterScores[chapter] = Math.round(totalScore / levels.length);
      }
    });

    // Format data for pie chart - only include chapters with actual data
    const chartData = chapters
      .map((chapter, index) => {
        const score = chapterScores[chapter];
        // Only include chapters with actual data (score > 0)
        if (score <= 0) return null;

        return {
          name: chapter.charAt(0).toUpperCase() + chapter.slice(1),
          score: score,
          value: score,
          percentage: score,
          color: colors[index % colors.length],
          legendFontColor: "#555",
          legendFontSize: 12,
        };
      })
      .filter((item) => item !== null); // Remove null entries

    console.log("Skill chart data (filtered):", JSON.stringify(chartData));

    if (chartData.length > 0) {
      setSkillRadarData(chartData);
    } else {
      // If no chapters have data, show a message
      const dummyData = [
        {
          name: "No Data",
          score: 1,
          value: 1,
          percentage: 100,
          color: "#cccccc",
          legendFontColor: "#555",
          legendFontSize: 12,
        },
      ];
      console.log("Using dummy skill data:", JSON.stringify(dummyData));
      setSkillRadarData(dummyData);
    }
  };

  const prepareStudyTimeData = (data) => {
    // Calculate total time spent on each chapter
    const chapterTimes = {};
    let totalTime = 0;
    let hasRealData = false;
    const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"];

    chapters.forEach((chapter) => {
      const levels = data[chapter] || [];
      // Convert seconds to minutes (round to nearest minute)
      const chapterTime = levels.reduce(
        (sum, level) => sum + Math.round((level.timeTaken || 0) / 60),
        0
      );

      // Check if we have any real time data
      if (chapterTime > 0) {
        hasRealData = true;
      }

      chapterTimes[chapter] = chapterTime;
      totalTime += chapterTime;
    });

    console.log("Chapter times (minutes):", JSON.stringify(chapterTimes));
    console.log("Total time (minutes):", totalTime);

    // If no real time data is available, use the number of completed levels as a proxy
    if (totalTime === 0) {
      setIsEstimatedTime(true);
      chapters.forEach((chapter) => {
        const levels = data[chapter] || [];
        // Use the number of completed levels as a proxy for time spent
        const levelCount = levels.length;
        if (levelCount > 0) {
          chapterTimes[chapter] = levelCount * 10; // Assume 10 minutes per level
          totalTime += chapterTimes[chapter];
        }
      });
      console.log("Using estimated times:", JSON.stringify(chapterTimes));
    } else {
      setIsEstimatedTime(false);
    }

    // Format data for pie chart - only include chapters with actual time data
    const chartData = chapters
      .map((chapter, index) => {
        const time = chapterTimes[chapter];
        // Skip chapters with no time data
        if (!time || time <= 0) return null;

        const percentage = Math.max(1, Math.round((time / totalTime) * 100));

        return {
          name: chapter.charAt(0).toUpperCase() + chapter.slice(1),
          time: time,
          value: time,
          percentage: percentage,
          color: colors[index % colors.length],
          legendFontColor: "#555",
          legendFontSize: 12,
        };
      })
      .filter((item) => item !== null); // Remove null entries

    console.log("Study time chart data (filtered):", JSON.stringify(chartData));

    if (chartData.length > 0) {
      setStudyTimeData(chartData);
    } else {
      // Create dummy data to show empty chart
      const dummyData = [
        {
          name: "No Data",
          time: 0,
          value: 1,
          percentage: 100,
          color: "#cccccc",
          legendFontColor: "#555",
          legendFontSize: 12,
        },
      ];
      console.log("Using dummy study time data:", JSON.stringify(dummyData));
      setStudyTimeData(dummyData);
    }
  };

  const calculateStreakData = (data) => {
    // Collect all completion dates
    const completionDates = [];

    Object.values(data).forEach((levels) => {
      levels.forEach((level) => {
        if (level.completedAt) {
          completionDates.push(new Date(level.completedAt));
        }
      });
    });

    if (completionDates.length === 0) {
      setStreakData({ currentStreak: 0, longestStreak: 0 });
      setLastActive(null);
      return;
    }

    // Sort dates
    completionDates.sort((a, b) => a - b);

    // Set last active date
    const lastActiveDate = completionDates[completionDates.length - 1];
    setLastActive(lastActiveDate);

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let currentDate = new Date();

    // Format dates to YYYY-MM-DD for comparison
    const formatDateString = (date) => {
      return date.toISOString().split("T")[0];
    };

    // Get unique dates (only count one activity per day)
    const uniqueDates = [...new Set(completionDates.map(formatDateString))].map(
      (dateStr) => new Date(dateStr)
    );
    uniqueDates.sort((a, b) => a - b);

    // Calculate current streak
    const today = formatDateString(currentDate);
    const yesterday = formatDateString(
      new Date(currentDate.setDate(currentDate.getDate() - 1))
    );

    // Check if user was active today or yesterday to maintain streak
    const lastActiveFormatted = formatDateString(lastActiveDate);
    const isActiveRecently =
      lastActiveFormatted === today || lastActiveFormatted === yesterday;

    if (isActiveRecently) {
      currentStreak = 1; // Start with 1 for the most recent day

      // Go backwards from the second most recent unique date
      for (let i = uniqueDates.length - 2; i >= 0; i--) {
        const currentDateStr = formatDateString(uniqueDates[i]);
        const prevDateStr = formatDateString(uniqueDates[i + 1]);

        // Check if dates are consecutive
        const current = new Date(currentDateStr);
        const prev = new Date(prevDateStr);
        const diffTime = Math.abs(prev - current);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let tempStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDateStr = formatDateString(uniqueDates[i]);
      const prevDateStr = formatDateString(uniqueDates[i - 1]);

      // Check if dates are consecutive
      const current = new Date(currentDateStr);
      const prev = new Date(prevDateStr);
      const diffTime = Math.abs(current - prev);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    setStreakData({ currentStreak, longestStreak });
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
                <Text style={styles.detailText}>
                  Age: {userInfo?.age || "N/A"}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <FontAwesome name="user" size={14} color="#666" />
                <Text style={styles.detailText}>
                  Gender: {userInfo?.gender || "N/A"}
                </Text>
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

        {/* Streak Card */}
        <View style={styles.streakCard}>
          <View style={styles.streakSection}>
            <FontAwesome5 name="fire" size={24} color="#FF6B6B" />
            <View style={styles.streakInfo}>
              <Text style={styles.streakTitle}>Current Streak</Text>
              <Text style={styles.streakValue}>
                {streakData.currentStreak} days
              </Text>
            </View>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakSection}>
            <FontAwesome5 name="trophy" size={24} color="#FFD700" />
            <View style={styles.streakInfo}>
              <Text style={styles.streakTitle}>Longest Streak</Text>
              <Text style={styles.streakValue}>
                {streakData.longestStreak} days
              </Text>
            </View>
          </View>
        </View>

        {/* User Ranking Card */}
        <View style={styles.rankingCard}>
          <FontAwesome5
            name="trophy"
            size={24}
            color="#FFD700"
            style={styles.rankingIcon}
          />
          <View style={styles.rankingContent}>
            <Text style={styles.rankingTitle}>Current Ranking</Text>
            <Text style={styles.rankingValue}>
              {userRanking.rank} <Text style={styles.rankingOf}>of</Text>{" "}
              {userRanking.totalUsers}
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
            {/* Chapter Progress - Single Row (4x1) with responsive sizing */}
            <Text style={styles.sectionTitle}>Chapter Completion</Text>
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalProgressContainer}
            >
              {chapters.map((chapter, index) => {
                const percentage = getCompletionPercentage(chapter);
                // Calculate the card width based on screen size
                const cardWidth = Math.min(screenWidth * 0.35, 140);
                const chartSize = cardWidth * 0.65; // Chart size is proportional to card width

                return (
                  <View
                    key={index}
                    style={[styles.progressCard, { width: cardWidth }]}
                  >
                    <Text style={styles.progressChapter}>{chapter}</Text>
                    <View style={styles.progressMeter}>
                      <View style={styles.percentageContainer}>
                        <ProgressChart
                          data={{
                            data: [getCompletionRate(chapter)],
                          }}
                          width={chartSize}
                          height={chartSize}
                          strokeWidth={10}
                          radius={chartSize / 2 - 10}
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
                        <Text style={styles.percentageText}>{percentage}%</Text>
                      </View>
                      <Text style={styles.progressSubtext}>
                        {chapterData[chapter]?.length || 0} of 5 Levels
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Skill Distribution and Study Time - Side by Side or Stacked */}
            <Text style={styles.sectionTitle}>Learning Analytics</Text>
            <View
              style={[styles.chartsRow, isSmallScreen && styles.chartsRowSmall]}
            >
              {/* Skill Distribution */}
              <View
                style={[
                  styles.chartCard,
                  isSmallScreen
                    ? styles.chartCardSmall
                    : { flex: 1, marginRight: 5 },
                ]}
              >
                <Text style={styles.chartTitle}>Skill Distribution</Text>
                {skillRadarData &&
                skillRadarData.length > 0 &&
                skillRadarData[0].name !== "No Data" ? (
                  <>
                    <PieChart
                      key={`skill-chart-${Date.now()}`}
                      data={skillRadarData}
                      width={
                        isSmallScreen
                          ? screenWidth - 60
                          : screenWidth * 0.45 - 30
                      }
                      height={180}
                      chartConfig={{
                        backgroundColor: "#ffffff",
                        backgroundGradientFrom: "#ffffff",
                        backgroundGradientTo: "#ffffff",
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      }}
                      accessor="percentage"
                      backgroundColor="transparent"
                      paddingLeft="0"
                      hasLegend={false}
                      absolute
                    />
                    <View style={styles.chartLegend}>
                      {skillRadarData.map((item, index) => (
                        <View key={index} style={styles.legendItem}>
                          <View
                            style={[
                              styles.legendDot,
                              { backgroundColor: item.color },
                            ]}
                          />
                          <Text style={styles.legendText}>
                            {item.name}: {item.score}
                          </Text>
                        </View>
                      ))}
                    </View>
                    <Text style={styles.chartNote}>
                      Based on average scores
                    </Text>
                  </>
                ) : (
                  <View style={styles.noDataContainer}>
                    <FontAwesome5 name="chart-pie" size={36} color="#ccc" />
                    <Text style={styles.noDataText}>
                      Complete some levels to see your skill distribution
                    </Text>
                  </View>
                )}
              </View>

              {/* Study Time Distribution */}
              <View
                style={[
                  styles.chartCard,
                  isSmallScreen
                    ? styles.chartCardSmall
                    : { flex: 1, marginLeft: 5 },
                ]}
              >
                <Text style={styles.chartTitle}>Study Time</Text>
                {studyTimeData &&
                studyTimeData.length > 0 &&
                studyTimeData[0].name !== "No Data" ? (
                  <>
                    <PieChart
                      key={`time-chart-${Date.now()}`}
                      data={studyTimeData}
                      width={
                        isSmallScreen
                          ? screenWidth - 60
                          : screenWidth * 0.45 - 30
                      }
                      height={180}
                      chartConfig={{
                        backgroundColor: "#ffffff",
                        backgroundGradientFrom: "#ffffff",
                        backgroundGradientTo: "#ffffff",
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      }}
                      accessor="percentage"
                      backgroundColor="transparent"
                      paddingLeft="0"
                      hasLegend={false}
                      absolute
                    />
                    <View style={styles.chartLegend}>
                      {studyTimeData.map((item, index) => (
                        <View key={index} style={styles.legendItem}>
                          <View
                            style={[
                              styles.legendDot,
                              { backgroundColor: item.color },
                            ]}
                          />
                          <Text style={styles.legendText}>
                            {item.name}: {item.time} min
                          </Text>
                        </View>
                      ))}
                    </View>
                    <Text style={styles.chartNote}>
                      {isEstimatedTime ? "Estimated time" : "Actual time"}
                    </Text>
                  </>
                ) : (
                  <View style={styles.noDataContainer}>
                    <FontAwesome5 name="clock" size={36} color="#ccc" />
                    <Text style={styles.noDataText}>
                      Complete some levels to see your study time
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Performance Timeline - Improved visibility and interactivity */}
            <Text style={styles.sectionTitle}>Performance Timeline</Text>
            <View style={styles.timelineContainer}>
              {timelineData ? (
                <>
                  <Text style={styles.timelineSubtitle}>
                    Your recent level scores by completion date
                  </Text>
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
                        fill: "#fff",
                      },
                      propsForLabels: {
                        fontSize: isSmallScreen ? 8 : 10,
                        rotation: 45,
                        fontWeight: "bold",
                      },
                      propsForBackgroundLines: {
                        strokeDasharray: "",
                        stroke: "#e0e0e0",
                        strokeWidth: 1,
                      },
                    }}
                    bezier
                    style={styles.chart}
                    fromZero={true}
                    segments={5}
                    formatXLabel={(value) => value}
                    yAxisInterval={1}
                    verticalLabelRotation={30}
                    onDataPointClick={({ value, dataset, getColor, index }) =>
                      handleDataPointClick(value, index)
                    }
                  />

                  {/* Data point details popup - Enhanced */}
                  {selectedDataPoint && (
                    <View style={styles.dataPointDetails}>
                      <View style={styles.dataPointHeader}>
                        <Text style={styles.dataPointTitle}>Level Details</Text>
                        <TouchableOpacity
                          style={styles.closeButton}
                          onPress={() => setSelectedDataPoint(null)}
                        >
                          <FontAwesome name="close" size={16} color="#666" />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.dataPointContent}>
                        <View style={styles.dataPointRow}>
                          <View style={styles.dataPointIconContainer}>
                            <FontAwesome5
                              name="book"
                              size={16}
                              color="#4a6da7"
                            />
                          </View>
                          <View style={styles.dataPointTextContainer}>
                            <Text style={styles.dataPointLabel}>Chapter</Text>
                            <Text style={styles.dataPointValue}>
                              {selectedDataPoint.chapter
                                .charAt(0)
                                .toUpperCase() +
                                selectedDataPoint.chapter.slice(1)}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.dataPointRow}>
                          <View style={styles.dataPointIconContainer}>
                            <FontAwesome5
                              name="layer-group"
                              size={16}
                              color="#4a6da7"
                            />
                          </View>
                          <View style={styles.dataPointTextContainer}>
                            <Text style={styles.dataPointLabel}>Level</Text>
                            <Text style={styles.dataPointValue}>
                              {selectedDataPoint.levelNumber}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.dataPointRow}>
                          <View style={styles.dataPointIconContainer}>
                            <FontAwesome5
                              name="star"
                              size={16}
                              color="#FFD700"
                            />
                          </View>
                          <View style={styles.dataPointTextContainer}>
                            <Text style={styles.dataPointLabel}>Score</Text>
                            <Text style={styles.dataPointValue}>
                              {selectedDataPoint.score}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.dataPointRow}>
                          <View style={styles.dataPointIconContainer}>
                            <FontAwesome5
                              name="calendar-check"
                              size={16}
                              color="#4a6da7"
                            />
                          </View>
                          <View style={styles.dataPointTextContainer}>
                            <Text style={styles.dataPointLabel}>Completed</Text>
                            <Text style={styles.dataPointValue}>
                              {selectedDataPoint.completedAt.toLocaleDateString()}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  )}

                  <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendDot,
                          { backgroundColor: "#ffa726" },
                        ]}
                      />
                      <Text style={styles.legendText}>Score on each date</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendLine,
                          { backgroundColor: "rgba(74, 109, 167, 1)" },
                        ]}
                      />
                      <Text style={styles.legendText}>Progress trend</Text>
                    </View>
                  </View>
                  <Text style={styles.timelineNote}>
                    Showing your {timelineData.labels.length} most recent level
                    completions
                  </Text>
                  <Text style={styles.interactionHint}>
                    <FontAwesome5 name="hand-pointer" size={12} color="#888" />{" "}
                    Tap on any data point for details
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

            {/* Last Active Section */}
            {lastActive && (
              <View style={styles.lastActiveContainer}>
                <FontAwesome5 name="clock" size={16} color="#666" />
                <Text style={styles.lastActiveText}>
                  Last active: {lastActive.toLocaleDateString()}
                </Text>
              </View>
            )}

            {/* Statistics Summary - Responsive Grid */}
            <Text style={styles.sectionTitle}>Learning Statistics</Text>
            <View
              style={[
                styles.statsContainer,
                isSmallScreen ? styles.statsContainerSmall : null,
              ]}
            >
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
  streakCard: {
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
  streakSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  streakInfo: {
    marginLeft: 10,
  },
  streakTitle: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Montserrat_Regular",
  },
  streakValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "Montserrat_Bold",
  },
  streakDivider: {
    width: 1,
    height: "80%",
    backgroundColor: "#ddd",
    marginHorizontal: 15,
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
  horizontalProgressContainer: {
    paddingRight: 20,
  },
  progressCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginRight: 10,
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
  percentageContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  percentageText: {
    position: "absolute",
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
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
    marginBottom: 8,
    paddingHorizontal: 5,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  legendLine: {
    width: 15,
    height: 3,
    marginRight: 5,
  },
  legendText: {
    fontSize: 13,
    color: "#333",
    fontFamily: "Montserrat_Regular",
  },
  timelineNote: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
    fontFamily: "Montserrat_Regular",
  },
  interactionHint: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
    fontFamily: "Montserrat_Regular",
    fontStyle: "italic",
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
  statsContainerSmall: {
    flexDirection: "column",
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
    marginBottom: 10,
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
  // Data point details styles
  dataPointDetails: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  dataPointHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dataPointTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4a6da7",
  },
  closeButton: {
    padding: 5,
  },
  dataPointContent: {
    paddingHorizontal: 5,
  },
  dataPointRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  dataPointIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f0f4fa",
    justifyContent: "center",
    alignItems: "center",
  },
  dataPointTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  dataPointLabel: {
    fontWeight: "bold",
    color: "#555",
    fontSize: 12,
  },
  dataPointValue: {
    color: "#333",
    fontSize: 14,
    marginTop: 2,
  },
  pieContainer: {
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
  pieSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    fontFamily: "Montserrat_Regular",
    alignSelf: "flex-start",
  },
  pieLegend: {
    marginTop: 10,
    alignItems: "center",
  },
  pieLegendText: {
    fontSize: 12,
    color: "#888",
    fontFamily: "Montserrat_Regular",
  },
  radarContainer: {
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
  radarSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    fontFamily: "Montserrat_Regular",
    alignSelf: "flex-start",
  },
  radarLegend: {
    marginTop: 10,
    alignItems: "center",
  },
  radarLegendText: {
    fontSize: 12,
    color: "#888",
    fontFamily: "Montserrat_Regular",
  },
  lastActiveContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  lastActiveText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Montserrat_Regular",
    marginLeft: 10,
  },
  timeDistributionLegend: {
    marginTop: 15,
    marginBottom: 10,
    width: "100%",
    paddingHorizontal: 20,
  },
  timeDistributionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  timeDistributionText: {
    fontSize: 13,
    color: "#555",
    fontFamily: "Montserrat_Regular",
  },
  chartsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  chartCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    fontFamily: "Montserrat_Bold",
    color: "#333",
  },
  chartLegend: {
    marginTop: 15,
    width: "100%",
    paddingHorizontal: 10,
  },
  chartNote: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
    fontFamily: "Montserrat_Regular",
  },
  chartsRowSmall: {
    flexDirection: "column",
  },
  chartCardSmall: {
    width: "100%",
    marginBottom: 15,
  },
});
