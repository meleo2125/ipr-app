import React, { useEffect, useState } from "react";
import { StatusBar, View, Text, StyleSheet, useWindowDimensions, ImageBackground, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../../../context/AuthContext";
import { API_URL } from "../../../../api/config";
import LevelButton from "../../../../components/LevelButton";

const PatentScreen = () => {
  const router = useRouter();
  const { userInfo, userToken } = useAuth();
  const [unlockedLevels, setUnlockedLevels] = useState([1]); // Level 1 always unlocked
  const [levelScores, setLevelScores] = useState({}); // Store scores for each level
  const [isLoading, setIsLoading] = useState(true);
  const levels = [1, 2, 3, 4, 5]; // All levels
  const { width, height } = useWindowDimensions();

  // Calculate button size dynamically to fit in one row when possible
  const buttonSize = Math.min((width - 60) / levels.length, 140); // Max width per button is 140px

  useEffect(() => {
    // Fetch user's completed levels
    const fetchUserLevels = async () => {
      if (!userInfo?.email) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/user-levels?email=${userInfo.email}&chapter=patent`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": userToken,
          },
        });

        if (!response.ok) {
          console.error("Failed to fetch user levels");
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        const completedLevels = data.completedLevels || [];
        
        // Create scores object from the API response
        const scores = {};
        if (data.completedLevelsData) {
          data.completedLevelsData.forEach(levelData => {
            scores[levelData.levelNumber] = levelData.score;
          });
        }
        setLevelScores(scores);
        
        // Determine which levels are unlocked based on completion
        // A level is unlocked if it's level 1 or if the previous level is completed
        const newUnlockedLevels = [];
        levels.forEach(level => {
          if (level === 1) {
            newUnlockedLevels.push(level);
          } else if (completedLevels.includes(level - 1)) {
            newUnlockedLevels.push(level);
          }
        });
        
        setUnlockedLevels(newUnlockedLevels);
      } catch (error) {
        console.error("Error fetching user levels:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserLevels();
  }, [userInfo]);

  const handleLevelPress = (level) => {
    router.push(`/home/chapters/patent/level${level}`);
  };

  return (
    <ImageBackground
      source={require("../../../../assets/images/patentbg.png")}
      style={[styles.background, { width, height }]}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <StatusBar hidden={true} />
        <Text style={styles.title}>Patent Levels</Text>

        {isLoading ? (
          <ActivityIndicator size="large" color="#ffcc80" />
        ) : (
          <View style={styles.gridContainer}>
            {levels.map((level) => (
              <LevelButton
                key={level}
                level={level}
                isUnlocked={unlockedLevels.includes(level)}
                score={levelScores[level]}
                onPress={() => handleLevelPress(level)}
                buttonSize={buttonSize}
              />
            ))}
          </View>
        )}
      </View>
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
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    padding: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 20,
    fontFamily: "Montserrat_Bold",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
    maxWidth: 800, // Ensures levels align properly
  },
});

export default PatentScreen;