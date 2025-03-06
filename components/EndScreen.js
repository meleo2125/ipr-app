import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from "react-native";
import { useRouter, usePathname } from "expo-router";

// Get screen dimensions for responsive sizing
const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

const EndScreen = ({ score, timeTaken, resetGame }) => {
  const router = useRouter();
  const pathname = usePathname(); // Get the current route
  
  // Get current level from the pathname
  const pathSegments = pathname.split("/"); // Split the path into parts
  const currentLevel = pathSegments[pathSegments.length - 1]; // Get last segment (e.g., 'level1')
  const levelsPath = pathSegments.slice(0, -1).join("/"); // Path to the levels directory
  const chaptersPath = pathSegments.slice(0, -1).join("/"); // Path to the chapters
  
  // Get next level dynamically
  const levelNumber = parseInt(currentLevel.replace("level", ""), 10);
  const nextLevel = isNaN(levelNumber) ? null : `${levelsPath}/level${levelNumber + 1}`;

  // Handle next level navigation
  const handleNextLevel = () => {
    // Check if next level exists (highest level is 5)
    if (levelNumber >= 5) {
      Alert.alert(
        "Congratulations!",
        "You've completed all levels in this chapter!",
        [{ text: "OK", onPress: () => router.push(chaptersPath) }]
      );
    } else {
      router.push(nextLevel);
    }
  };

  // Calculate stars based on score
  const renderStars = () => {
    if (score >= 80) return "⭐⭐⭐⭐⭐";
    if (score >= 60) return "⭐⭐⭐⭐";
    if (score >= 40) return "⭐⭐⭐";
    if (score >= 20) return "⭐⭐";
    return "⭐";
  };

  // Remove passing score restriction - all attempts are considered as completed
  const isPassingScore = true; // Changed from score >= 40

  return (
    <View style={styles.container}>
      <View style={styles.contentBox}>
        <Text style={styles.title}>
          {score >= 40 ? "🎉 Level Complete!" : "Level Completed"}
        </Text>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Score: {score}</Text>
          <Text style={styles.stars}>{renderStars()}</Text>
        </View>
        
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>Time: {timeTaken} seconds</Text>
        </View>
        
        {/* Removed the message about needing 40 points */}
        
        <View style={styles.buttonContainer}>
          {/* Next Level Button - show for all completions */}
          {nextLevel && (
            <TouchableOpacity 
              style={[styles.button, styles.nextButton]} 
              onPress={handleNextLevel}
            >
              <Text style={styles.buttonText}>Next Level</Text>
            </TouchableOpacity>
          )}
          
          {/* Play Again Button */}
          <TouchableOpacity style={[styles.button, styles.replayButton]} onPress={resetGame}>
            <Text style={styles.buttonText}>Play Again</Text>
          </TouchableOpacity>
          
          {/* Go to Chapter Screen */}
          <TouchableOpacity style={[styles.button, styles.menuButton]} onPress={() => router.push(chaptersPath)}>
            <Text style={styles.buttonText}>Level Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: windowWidth * 0.05,
  },
  contentBox: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    padding: windowWidth * 0.04,
    alignItems: "center",
    width: "55%",
    maxWidth: windowWidth * 0.4,
    maxHeight: windowHeight * 0.8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  title: {
    fontSize: windowWidth * 0.025,
    fontWeight: "bold",
    marginBottom: windowHeight * 0.02,
    color: "#2c3e50",
    textAlign: "center",
    fontFamily: "Montserrat_Bold",
  },
  scoreContainer: {
    backgroundColor: "rgba(52, 152, 219, 0.1)",
    borderRadius: 10,
    padding: windowWidth * 0.02,
    width: "90%",
    alignItems: "center",
    marginBottom: windowHeight * 0.02,
  },
  scoreText: {
    fontSize: windowWidth * 0.022,
    fontWeight: "bold",
    marginBottom: windowHeight * 0.01,
    color: "#2c3e50",
    fontFamily: "Montserrat_Bold",
  },
  stars: {
    fontSize: windowWidth * 0.03,
    marginBottom: windowHeight * 0.01,
  },
  timeContainer: {
    backgroundColor: "rgba(46, 204, 113, 0.1)",
    borderRadius: 10,
    padding: windowWidth * 0.02,
    width: "90%",
    alignItems: "center",
    marginBottom: windowHeight * 0.01,
    maxHeight: windowHeight * 0.1,
  },
  timeText: {
    fontSize: windowWidth * 0.018,
    color: "#2c3e50",
    fontFamily: "Montserrat_Regular",
  },
  message: {
    fontSize: windowWidth * 0.016,
    color: "#e74c3c",
    textAlign: "center",
    marginBottom: windowHeight * 0.02,
    fontFamily: "Montserrat_Regular",
  },
  buttonContainer: {
    width: "90%",
    alignItems: "center",
  },
  button: {
    paddingVertical: windowHeight * 0.01,
    paddingHorizontal: windowWidth * 0.03,
    borderRadius: 25,
    alignItems: "center",
    marginVertical: windowHeight * 0.008,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  nextButton: {
    backgroundColor: "#2ecc71", // Green for next level
  },
  replayButton: {
    backgroundColor: "#3498db", // Blue for replay
  },
  menuButton: {
    backgroundColor: "#9b59b6", // Purple for menu
  },
  buttonText: {
    color: "#fff",
    fontSize: windowWidth * 0.018,
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
});

export default EndScreen;