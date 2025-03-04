import React, { useEffect, useState, useRef } from "react";
import {
  StatusBar,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Animated,
  Image,
  Dimensions,
} from "react-native";

import EndScreen from "../../../../components/EndScreen";
import { useAuth } from "../../../../context/AuthContext";
import { API_URL } from "../../../../api/config";

// Get screen dimensions for responsive sizing
const { width: windowWidth, height: windowHeight } = Dimensions.get("window");

const Level1Screen = () => {
  const [step, setStep] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [currentItem, setCurrentItem] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const { userInfo } = useAuth();

  // Narrator continuous animation
  const narratorYPosition = useRef(new Animated.Value(0)).current;

  // Setup narrator breathing/floating animation
  useEffect(() => {
    const startNarratorAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(narratorYPosition, {
            toValue: 5, // Reduced movement amplitude
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(narratorYPosition, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startNarratorAnimation();

    return () => {
      narratorYPosition.stopAnimation();
    };
  }, []);

  useEffect(() => {
    if (showEndScreen) {
      saveLevelData();
    }
  }, [showEndScreen]);

  // Fade-in effect for dialogues
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [step, isGameActive]);

  // Narrator dialogues to introduce patents
  const dialogues = [
    "Welcome to the world of patents! I'm Nari, your guide through this exciting journey.",
    "A patent is a special right given to inventors for their new and innovative ideas.",
    "Think of it as a shield that protects your invention so others can't use it without your permission.",
    "In this chapter, we'll explore how to apply for a patent, and why it's important for protecting your inventions.",
    "Patents encourage innovation by rewarding inventors for their creativity and hard work.",
    "However, not everything can be patented. Natural discoveries, abstract ideas, and basic scientific principles aren't patentable.",
    "Let's test your knowledge with a mini-game about what can and cannot be patented!",
  ];

  // Mini-game items
  const gameItems = [
    { item: "A new smartphone design", patentable: true },
    { item: "A naturally occurring plant", patentable: false },
    { item: "A mathematical formula", patentable: false },
    { item: "A new manufacturing process", patentable: true },
    { item: "A genetically modified organism", patentable: true },
    { item: "The law of gravity", patentable: false },
    { item: "A unique software algorithm", patentable: true },
    { item: "A new pharmaceutical drug", patentable: true },
    { item: "A business method for online retail", patentable: true },
    { item: "A discovered element on the periodic table", patentable: false },
  ];

  // Move to the next dialogue
  const handleNextDialogue = () => {
    if (step < dialogues.length - 1) {
      setStep(step + 1);
    } else {
      setStartTime(Date.now());
      setIsGameActive(true);
    }
  };

  const handleSwipe = (patentable) => {
    const current = gameItems[currentItem];

    // Check if answer is correct and add points
    if (patentable === current.patentable) {
      setScore((prevScore) => prevScore + 10);
    }

    // Move to next item or end game if finished
    if (currentItem < gameItems.length - 1) {
      setCurrentItem(currentItem + 1);
    } else {
      // Game finished - calculate time and show end screen
      const endTime = Date.now();
      const totalTime = Math.floor((endTime - startTime) / 1000);
      setTimeTaken(totalTime);
      setIsGameActive(false);
      setShowEndScreen(true);
    }
  };

  const saveLevelData = async () => {
    try {
      if (!userInfo?.email) {
        console.error("❌ No user email found in AuthContext");
        return;
      }

      console.log("Sending level data:", {
        email: userInfo.email,
        chapter: "patent",
        levelNumber: 1,
        score,
        timeTaken,
      });

      const response = await fetch(`${API_URL}/api/save-level`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userInfo.email,
          chapter: "patent",
          levelNumber: 1,
          score,
          timeTaken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Server error:", errorData);
        return;
      }

      const data = await response.json();
      console.log("✅ Success:", data.message);
    } catch (error) {
      console.error("❌ Error saving level data:", error);
    }
  };

  // Reset game to play again
  const resetGame = () => {
    setStep(0);
    setIsGameActive(false);
    setCurrentItem(0);
    setScore(0);
    setTimeTaken(0);
    setShowEndScreen(false);
  };

  return (
    <ImageBackground
      source={require("../../../../assets/images/levelbg.jpg")}
      style={styles.background}
    >
      <View style={styles.container}>
        <StatusBar hidden={true} />

        {/* End Screen */}
        {!isGameActive && showEndScreen ? (
          <EndScreen
            score={score}
            timeTaken={timeTaken}
            resetGame={resetGame}
          />
        ) : isGameActive ? (
          /* Game Screen */
          <View style={styles.gameContainer}>
            <Text style={styles.title}>What is Patentable?</Text>
            <Text style={styles.subtitle}>
              Swipe right for patentable, left for not patentable
            </Text>

            <View style={styles.itemContainer}>
              <Text style={styles.gameItemText}>
                {gameItems[currentItem].item}
              </Text>
              <Text style={styles.counter}>
                {currentItem + 1}/{gameItems.length}
              </Text>
            </View>

            <View style={styles.swipeContainer}>
              <TouchableOpacity
                style={[styles.swipeButton, styles.swipeLeft]}
                onPress={() => handleSwipe(false)}
              >
                <Text style={styles.swipeButtonText}>Not Patentable</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.swipeButton, styles.swipeRight]}
                onPress={() => handleSwipe(true)}
              >
                <Text style={styles.swipeButtonText}>Patentable</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.scoreDisplay}>
              <Text style={styles.currentScore}>Score: {score}</Text>
            </View>
          </View>
        ) : (
          /* Introduction with Narrator */
          <View style={styles.dialogueContainer}>
            <Animated.Image
              source={require("../../../../assets/images/nari.png")}
              style={[
                styles.narratorImage,
                { transform: [{ translateY: narratorYPosition }] },
              ]}
            />
            <View style={styles.dialogueWrapper}>
              <Animated.View
                style={[styles.dialogueBox, { opacity: fadeAnim }]}
              >
                <Text style={styles.dialogueText}>{dialogues[step]}</Text>
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={handleNextDialogue}
                >
                  <Text style={styles.nextButtonText}>
                    {step < dialogues.length - 1 ? "Next" : "Start Game"}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: windowWidth * 0.02, // Reduced from 0.05
  },
  dialogueContainer: {
    flex: 1,
    width: "100%",
    flexDirection: "row", // Changed to row to position elements side by side
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingBottom: windowHeight * 0.05,
  },
  
  narratorImage: {
    width: windowWidth * 0.350,
    height: windowHeight * 0.55,
    resizeMode: "contain",
    marginLeft: windowWidth * 0.05,
    left: windowWidth * 0.001,
  },
  
  dialogueWrapper: {
    flex: 1,
    alignItems: "flex-start",
    marginLeft: -windowWidth * 0.05, // Negative margin to overlap with narrator
  },
  
  dialogueBox: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    padding: windowWidth * 0.04,
    alignItems: "center",
    width: "85%",
    marginBottom: windowHeight * 0.10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 6,
  },
  dialogueText: {
    fontSize: windowWidth * 0.022, // Reduced from 0.045
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: windowHeight * 0.015, // Reduced from 0.02
    lineHeight: windowWidth * 0.03, // Reduced from 0.06
    fontFamily: "Montserrat_Regular",
  },
  nextButton: {
    backgroundColor: "#3498db",
    paddingVertical: windowHeight * 0.01, // Reduced from 0.015
    paddingHorizontal: windowWidth * 0.03, // Reduced from 0.06
    borderRadius: 25,
    alignItems: "center",
    elevation: 8,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: windowWidth * 0.018, // Reduced from 0.04
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
  gameContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  title: {
    fontSize: windowWidth * 0.028, // Reduced from 0.07
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: windowHeight * 0.01, // Reduced from 0.015
    textAlign: "center",
    fontFamily: "Montserrat_Bold",
  },
  subtitle: {
    fontSize: windowWidth * 0.016, // Reduced from 0.04
    color: "#7f8c8d",
    marginBottom: windowHeight * 0.02, // Reduced from 0.04
    textAlign: "center",
    fontFamily: "Montserrat_Regular",
  },
  itemContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    padding: windowWidth * 0.025, // Reduced from 0.05
    width: "75%", // Reduced from 90%
    alignItems: "center",
    marginBottom: windowHeight * 0.025, // Reduced from 0.04
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  gameItemText: {
    fontSize: windowWidth * 0.022, // Reduced from 0.055
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: windowHeight * 0.01, // Reduced from 0.02
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
  counter: {
    fontSize: windowWidth * 0.014, // Reduced from 0.035
    color: "#7f8c8d",
    fontFamily: "Montserrat_Regular",
  },
  swipeContainer: {
    width: "75%", // Reduced from 90%
    justifyContent: "space-between",
    marginBottom: windowHeight * 0.025, // Reduced from 0.04
  },
  swipeButton: {
    paddingVertical: windowHeight * 0.01, // Reduced from 0.02
    paddingHorizontal: windowWidth * 0.025, // Reduced from 0.05
    marginVertical: windowHeight * 0.008, // Reduced from 0.015
    borderRadius: 25,
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  swipeLeft: {
    backgroundColor: "#e74c3c",
  },
  swipeRight: {
    backgroundColor: "#2ecc71",
  },
  swipeButtonText: {
    color: "#fff",
    fontSize: windowWidth * 0.018, // Reduced from 0.045
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
  scoreDisplay: {
    position: "absolute",
    top: windowHeight * 0.01, // Reduced from 0.025
    right: windowWidth * 0.02, // Reduced from 0.05
    backgroundColor: "rgba(52, 152, 219, 0.8)",
    paddingVertical: windowHeight * 0.005, // Reduced from 0.01
    paddingHorizontal: windowWidth * 0.02, // Reduced from 0.04
    borderRadius: 20,
  },
  currentScore: {
    color: "#fff",
    fontSize: windowWidth * 0.016, // Reduced from 0.04
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
});

export default Level1Screen;
