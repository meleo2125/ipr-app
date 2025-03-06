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
  const [screenDimensions, setScreenDimensions] = useState(
    Dimensions.get("window")
  );

  // Handle screen dimension changes
  useEffect(() => {
    const dimensionsHandler = ({ window }) => {
      setScreenDimensions(window);
    };

    Dimensions.addEventListener("change", dimensionsHandler);
    return () => {
      // Clean up event listener properly based on Expo SDK version
      const dimensionsObject = Dimensions;
      if (dimensionsObject.removeEventListener) {
        dimensionsObject.removeEventListener("change", dimensionsHandler);
      }
    };
  }, []);

  // Calculate responsive sizes based on screen dimensions
  const { width, height } = screenDimensions;
  const isSmallScreen = width < 600;

  // Narrator continuous animation
  const narratorYPosition = useRef(new Animated.Value(0)).current;

  // Setup narrator breathing/floating animation
  useEffect(() => {
    const startNarratorAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(narratorYPosition, {
            toValue: 5, // Reduced movement amplitude
            duration: 500,
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

  // Narrator dialogues to introduce copyright
  const dialogues = [
    "Welcome to the world of copyright! I'm Cory, your guide through creative rights protection.",
    "Did you know that as soon as you create a work, it is automatically protected by copyright?",
    "Copyright gives you exclusive rights to use, reproduce, distribute, display, and modify your creative work.",
    "While protection is automatic, registering your copyright provides important legal benefits and proof of ownership.",
    "Copyright protects original works like books, music, art, photographs, software, and films.",
    "However, copyright doesn't protect ideas, facts, methods, or systems - only the original expression of those ideas.",
    "Let's test your knowledge with a mini-game about copyright protection!",
  ];

  // Mini-game items
  const gameItems = [
    { 
      item: "A novel you just finished writing", 
      answer: "Automatically Protected", 
      isAutoProtected: true 
    },
    { 
      item: "A general business idea for a delivery app", 
      answer: "Not Protected by Copyright", 
      isAutoProtected: false 
    },
    { 
      item: "A historical fact about World War II", 
      answer: "Not Protected by Copyright", 
      isAutoProtected: false 
    },
    { 
      item: "A song you composed and recorded", 
      answer: "Automatically Protected", 
      isAutoProtected: true 
    },
    { 
      item: "A photograph you took of a sunset", 
      answer: "Automatically Protected", 
      isAutoProtected: true 
    },
    { 
      item: "A cooking recipe listing ingredients", 
      answer: "Not Protected by Copyright", 
      isAutoProtected: false 
    },
    { 
      item: "A screenplay for a film", 
      answer: "Automatically Protected", 
      isAutoProtected: true 
    },
    { 
      item: "A specific method of teaching math", 
      answer: "Not Protected by Copyright", 
      isAutoProtected: false 
    },
    { 
      item: "Software code you wrote for an app", 
      answer: "Automatically Protected", 
      isAutoProtected: true 
    },
    { 
      item: "A scientific principle or discovery", 
      answer: "Not Protected by Copyright", 
      isAutoProtected: false 
    },
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

  const handleSwipe = (isAutoProtected) => {
    const current = gameItems[currentItem];

    // Check if answer is correct and add points
    if (isAutoProtected === current.isAutoProtected) {
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
  
      // Mark level as completed regardless of score
      const isLevelCompleted = true;
  
      console.log("Sending level data:", {
        email: userInfo.email,
        chapter: "copyrights",
        levelNumber: 1,
        score,
        timeTaken,
        completed: isLevelCompleted,
      });
  
      const response = await fetch(`${API_URL}/api/save-level`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userInfo.email,
          chapter: "copyrights",
          levelNumber: 1,
          score,
          timeTaken,
          completed: isLevelCompleted,
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

  // Compute dynamic sizes based on screen dimensions
  const narratorWidth = isSmallScreen ? width * 0.3 : width * 0.35;
  const narratorHeight = isSmallScreen ? height * 0.45 : height * 0.55;
  const dialogueFontSize = isSmallScreen ? width * 0.018 : width * 0.022;
  const dialogueLineHeight = isSmallScreen ? width * 0.025 : width * 0.03;
  const buttonFontSize = isSmallScreen ? width * 0.015 : width * 0.018;
  const titleFontSize = isSmallScreen ? width * 0.022 : width * 0.028;
  const subtitleFontSize = isSmallScreen ? width * 0.013 : width * 0.016;
  const gameItemFontSize = isSmallScreen ? width * 0.018 : width * 0.022;
  const counterFontSize = isSmallScreen ? width * 0.012 : width * 0.014;
  const swipeButtonFontSize = isSmallScreen ? width * 0.015 : width * 0.018;
  const scoreFontSize = isSmallScreen ? width * 0.013 : width * 0.016;
  const containerWidth = isSmallScreen ? "80%" : "75%";
  const dialogueWidth = isSmallScreen ? "90%" : "85%";

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
            <Text style={[styles.title, { fontSize: titleFontSize }]}>
              Copyright Protection
            </Text>
            <Text style={[styles.subtitle, { fontSize: subtitleFontSize }]}>
              Select whether the item is automatically protected by copyright
            </Text>

            <View style={[styles.itemContainer, { width: containerWidth }]}>
              <Text
                style={[styles.gameItemText, { fontSize: gameItemFontSize }]}
              >
                {gameItems[currentItem].item}
              </Text>
              <Text style={[styles.counter, { fontSize: counterFontSize }]}>
                {currentItem + 1}/{gameItems.length}
              </Text>
            </View>

            <View style={[styles.swipeContainer, { width: containerWidth }]}>
              <TouchableOpacity
                style={[styles.swipeButton, styles.swipeLeft]}
                onPress={() => handleSwipe(false)}
              >
                <Text
                  style={[
                    styles.swipeButtonText,
                    { fontSize: swipeButtonFontSize },
                  ]}
                >
                  Not Protected
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.swipeButton, styles.swipeRight]}
                onPress={() => handleSwipe(true)}
              >
                <Text
                  style={[
                    styles.swipeButtonText,
                    { fontSize: swipeButtonFontSize },
                  ]}
                >
                  Automatically Protected
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.scoreDisplay}>
              <Text style={[styles.currentScore, { fontSize: scoreFontSize }]}>
                Score: {score}
              </Text>
            </View>
          </View>
        ) : (
          /* Introduction with Narrator */
          <View style={styles.dialogueContainer}>
            <Animated.Image
              source={require("../../../../assets/images/cory.png")}
              style={[
                styles.narratorImage,
                {
                  transform: [{ translateY: narratorYPosition }],
                  width: narratorWidth,
                  height: narratorHeight,
                },
              ]}
            />
            <View style={styles.dialogueWrapper}>
              <Animated.View
                style={[
                  styles.dialogueBox,
                  {
                    opacity: fadeAnim,
                    width: dialogueWidth,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dialogueText,
                    {
                      fontSize: dialogueFontSize,
                      lineHeight: dialogueLineHeight,
                    },
                  ]}
                >
                  {dialogues[step]}
                </Text>
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={handleNextDialogue}
                >
                  <Text
                    style={[
                      styles.nextButtonText,
                      { fontSize: buttonFontSize },
                    ]}
                  >
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
    padding: windowWidth * 0.02,
  },
  dialogueContainer: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingBottom: windowHeight * 0.05,
  },

  narratorImage: {
    resizeMode: "contain",
    marginLeft: windowWidth * 0.05,
    left: windowWidth * 0.001,
  },

  dialogueWrapper: {
    flex: 1,
    alignItems: "flex-start",
    marginLeft: -windowWidth * 0.05,
  },

  dialogueBox: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    padding: windowWidth * 0.04,
    alignItems: "center",
    marginBottom: windowHeight * 0.1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 6,
  },
  dialogueText: {
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: windowHeight * 0.015,
    fontFamily: "Montserrat_Regular",
  },
  nextButton: {
    backgroundColor: "#3498db",
    paddingVertical: windowHeight * 0.01,
    paddingHorizontal: windowWidth * 0.03,
    borderRadius: 25,
    alignItems: "center",
    elevation: 8,
  },
  nextButtonText: {
    color: "#fff",
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
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: windowHeight * 0.01,
    textAlign: "center",
    fontFamily: "Montserrat_Bold",
  },
  subtitle: {
    color: "#7f8c8d",
    marginBottom: windowHeight * 0.02,
    textAlign: "center",
    fontFamily: "Montserrat_Regular",
  },
  itemContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    padding: windowWidth * 0.025,
    alignItems: "center",
    marginBottom: windowHeight * 0.025,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  gameItemText: {
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: windowHeight * 0.01,
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
  counter: {
    color: "#7f8c8d",
    fontFamily: "Montserrat_Regular",
  },
  swipeContainer: {
    justifyContent: "space-between",
    marginBottom: windowHeight * 0.025,
  },
  swipeButton: {
    paddingVertical: windowHeight * 0.01,
    paddingHorizontal: windowWidth * 0.025,
    marginVertical: windowHeight * 0.008,
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
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
  scoreDisplay: {
    position: "absolute",
    top: windowHeight * 0.01,
    right: windowWidth * 0.02,
    backgroundColor: "rgba(52, 152, 219, 0.8)",
    paddingVertical: windowHeight * 0.005,
    paddingHorizontal: windowWidth * 0.02,
    borderRadius: 20,
  },
  currentScore: {
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
});

export default Level1Screen;