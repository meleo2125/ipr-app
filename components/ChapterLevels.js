import React, { useEffect, useState } from "react";
import {
  StatusBar,
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  ImageBackground,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../api/config";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

/**
 * A reusable component for displaying chapter levels with progression in a gamified way
 *
 * @param {Object} props
 * @param {string} props.chapterName - The name of the chapter (patent, copyrights, trademark, design)
 * @param {string} props.title - The title to display at the top
 * @param {number[]} props.levels - Array of level numbers (default: [1, 2, 3, 4, 5])
 * @param {Object} props.backgroundImage - The background image for the chapter
 * @param {string} props.loadingColor - Color for the loading indicator (default: "#FFD700")
 * @param {Object} props.titleStyle - Additional styles for the title
 * @param {string} props.primaryColor - Primary color for buttons and UI elements (default: "#ffcc80")
 * @param {string} props.secondaryColor - Secondary color for UI elements (default: "#422800")
 */
const ChapterLevels = ({
  chapterName,
  title,
  levels = [1, 2, 3, 4, 5],
  backgroundImage,
  loadingColor = "#FFD700",
  titleStyle = {},
  primaryColor = "#ffcc80",
  secondaryColor = "#422800",
}) => {
  const router = useRouter();
  const { userInfo, userToken } = useAuth();
  const [unlockedLevels, setUnlockedLevels] = useState([1]); // Level 1 always unlocked
  const [levelScores, setLevelScores] = useState({}); // Store scores for each level
  const [isLoading, setIsLoading] = useState(true);
  const { width, height } = useWindowDimensions();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  // Determine if we should use two rows based on screen width
  const useTwoRows = width < 600; // Use two rows for screens narrower than 600px

  // Calculate button size dynamically based on layout
  const calculateButtonSize = () => {
    // For two-row layout
    if (useTwoRows) {
      const rowLevels = Math.ceil(levels.length / 2); // Levels per row (3 in first row, 2 in second for 5 levels)
      const availableWidth = width - 40; // 20px padding on each side
      const buttonMargins = rowLevels * 30; // 15px margin on each side of each button
      const maxButtonSize = (availableWidth - buttonMargins) / rowLevels;
      return Math.min(Math.max(maxButtonSize, 60), 100); // Min 60px, Max 100px
    }
    // For single-row layout
    else {
      const availableWidth = width - 40; // 20px padding on each side
      const buttonMargins = levels.length * 30; // 15px margin on each side of each button
      const maxButtonSize = (availableWidth - buttonMargins) / levels.length;
      return Math.min(Math.max(maxButtonSize, 60), 120); // Min 60px, Max 120px
    }
  };

  const buttonSize = calculateButtonSize();

  // Split levels into two rows for smaller screens
  const getRowLevels = () => {
    if (!useTwoRows) {
      return [levels]; // Single row with all levels
    }

    // Split into two rows
    const firstRow = levels.slice(0, Math.ceil(levels.length / 2));
    const secondRow = levels.slice(Math.ceil(levels.length / 2));
    return [firstRow, secondRow];
  };

  const rowLevels = getRowLevels();

  // Start animations when component mounts
  useEffect(() => {
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
    ]).start();
  }, []);

  useEffect(() => {
    // Fetch user's completed levels
    const fetchUserLevels = async () => {
      if (!userInfo?.email) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/user-levels?email=${userInfo.email}&chapter=${chapterName}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-auth-token": userToken,
            },
          }
        );

        if (!response.ok) {
          console.error(`Failed to fetch user levels for ${chapterName}`);
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        const completedLevels = data.completedLevels || [];

        // Create scores object from the API response
        const scores = {};
        if (data.completedLevelsData) {
          data.completedLevelsData.forEach((levelData) => {
            scores[levelData.levelNumber] = levelData.score;
          });
        }
        setLevelScores(scores);

        // Determine which levels are unlocked based on completion
        // A level is unlocked if it's level 1 or if the previous level is completed
        const newUnlockedLevels = [];
        levels.forEach((level) => {
          if (level === 1) {
            newUnlockedLevels.push(level);
          } else if (completedLevels.includes(level - 1)) {
            newUnlockedLevels.push(level);
          }
        });

        setUnlockedLevels(newUnlockedLevels);
      } catch (error) {
        console.error(`Error fetching user levels for ${chapterName}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserLevels();
  }, [userInfo, chapterName]);

  const handleLevelPress = (level) => {
    router.push(`/home/chapters/${chapterName}/level${level}`);
  };

  // Render a level button
  const renderLevelButton = (level, index, isFirstInRow) => {
    const isUnlocked = unlockedLevels.includes(level);
    const score = levelScores[level];
    const isCompleted = score !== undefined;

    return (
      <View key={level} style={styles.levelButtonWrapper}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          }}
        >
          <TouchableOpacity
            style={[
              styles.levelButton,
              { width: buttonSize, height: buttonSize },
              !isUnlocked && styles.lockedButton,
              isCompleted && styles.completedButton,
              { backgroundColor: isUnlocked ? primaryColor : "#d3d3d3" },
            ]}
            onPress={() => handleLevelPress(level)}
            disabled={!isUnlocked}
            activeOpacity={0.8}
          >
            {/* Level number */}
            <Text
              style={[
                styles.levelText,
                !isUnlocked && styles.lockedText,
                { color: secondaryColor },
              ]}
            >
              {level}
            </Text>

            {/* Status indicators */}
            {isCompleted ? (
              <View style={styles.statusIndicator}>
                <Ionicons
                  name="checkmark-circle"
                  size={buttonSize * 0.25}
                  color="#4CAF50"
                />
              </View>
            ) : isUnlocked ? (
              <View style={styles.statusIndicator}>
                <Ionicons
                  name="arrow-forward-circle"
                  size={buttonSize * 0.25}
                  color={secondaryColor}
                />
              </View>
            ) : (
              <View style={styles.statusIndicator}>
                <MaterialIcons
                  name="lock"
                  size={buttonSize * 0.25}
                  color="#666"
                />
              </View>
            )}

            {/* Score display */}
            {isCompleted && (
              <View
                style={[
                  styles.scoreContainer,
                  { backgroundColor: "rgba(255, 255, 255, 0.7)" },
                ]}
              >
                <Text style={[styles.scoreText, { color: secondaryColor }]}>
                  {score} pts
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Path indicator between levels - only show if not first in row */}
        {!isFirstInRow && level > 1 && (
          <View style={styles.pathContainer}>
            <View
              style={[
                styles.pathLine,
                isUnlocked
                  ? { backgroundColor: primaryColor }
                  : { backgroundColor: "#d3d3d3" },
              ]}
            />
            <View
              style={[
                styles.pathDot,
                isUnlocked
                  ? { backgroundColor: primaryColor }
                  : { backgroundColor: "#d3d3d3" },
              ]}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <ImageBackground
      source={backgroundImage}
      style={[styles.background, { width, height }]}
      resizeMode="cover"
    >
      <LinearGradient
        colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.5)"]}
        style={styles.overlay}
      >
        <StatusBar hidden={true} />

        {/* Title with game-like styling */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            marginBottom: 20,
          }}
        >
          <View style={styles.titleContainer}>
            <LinearGradient
              colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.8)"]}
              style={styles.titleGradient}
            >
              <Text style={[styles.title, titleStyle]}>{title}</Text>
              <View style={styles.titleDecoration}>
                <View
                  style={[styles.titleLine, { backgroundColor: primaryColor }]}
                />
                <Ionicons name="trophy" size={24} color={primaryColor} />
                <View
                  style={[styles.titleLine, { backgroundColor: primaryColor }]}
                />
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={loadingColor} />
            <Text style={styles.loadingText}>Loading your progress...</Text>
          </View>
        ) : (
          <View style={styles.levelsContainer}>
            {rowLevels.map((rowItems, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.gridContainer}>
                {rowItems.map((level, index) => {
                  // For two-row layout, only show path lines for levels in the same row
                  const isFirstInRow = index === 0;
                  return renderLevelButton(level, index, isFirstInRow);
                })}
              </View>
            ))}
          </View>
        )}

        {/* Game instructions */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            marginTop: 20,
          }}
        >
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsText}>
              Complete each level to unlock the next one!
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  titleContainer: {
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  titleGradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
    fontFamily: "Montserrat_Bold",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  titleDecoration: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  titleLine: {
    height: 2,
    width: 50,
    marginHorizontal: 10,
  },
  loadingContainer: {
    alignItems: "center",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: "#ffffff",
    fontFamily: "Montserrat_Regular",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  levelsContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  gridContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  levelButtonWrapper: {
    alignItems: "center",
    position: "relative",
    marginHorizontal: 15,
  },
  levelButton: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    margin: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    position: "relative",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  lockedButton: {
    opacity: 0.7,
  },
  completedButton: {
    borderColor: "#4CAF50",
    borderWidth: 2,
  },
  levelText: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
  lockedText: {
    color: "#666666",
  },
  statusIndicator: {
    position: "absolute",
    bottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreContainer: {
    position: "absolute",
    top: 8,
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
  pathContainer: {
    position: "absolute",
    left: -30,
    top: "50%",
    width: 30,
    height: 4,
    flexDirection: "row",
    alignItems: "center",
    zIndex: -1,
  },
  pathLine: {
    flex: 1,
    height: 2,
  },
  pathDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: "absolute",
    left: -3,
  },
  instructionsContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  instructionsText: {
    color: "#ffffff",
    fontFamily: "Montserrat_Regular",
    fontSize: 14,
    textAlign: "center",
  },
});

export default ChapterLevels;
