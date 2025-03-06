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
  ScrollView,
} from "react-native";

import EndScreen from "../../../../components/EndScreen";
import { useAuth } from "../../../../context/AuthContext";
import { API_URL } from "../../../../api/config";

// Get screen dimensions for responsive sizing
const { width: windowWidth, height: windowHeight } = Dimensions.get("window");

const Level5Screen = () => {
  const [step, setStep] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [selectedInvention, setSelectedInvention] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [timelinePosition, setTimelinePosition] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { userInfo } = useAuth();
  const timelineAnim = useRef(new Animated.Value(0)).current;
  
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
  }, [step, isGameActive, gameResult]);

  // Narrator dialogues about patent validity and expiration
  const dialogues = [
    "Welcome to our final lesson on patents! Today we'll learn about patent validity and expiration.",
    "Patents don't last forever. In most countries, including India, a patent is valid for 20 years from the filing date.",
    "During these 20 years, you have exclusive rights to make, use, and sell your invention.",
    "You also need to pay maintenance fees at regular intervals to keep your patent active.",
    "After 20 years, your patent expires and enters the public domain. This means anyone can freely use the technology without your permission.",
    "This system balances inventor rights with public access to innovation. You get a limited monopoly, then society benefits from open access.",
    "Patent expiration prevents permanent monopolies and ensures that knowledge eventually becomes available to everyone.",
    "After expiration, your invention can't be re-patented by you or anyone else - it remains permanently in the public domain.",
    "Let's play a game called 'Timeline of Innovation' to understand how patents move from private ownership to public domain!",
  ];

  // Data for the mini-game
  const gameData = [
    {
      round: 1,
      title: "Patent Timeline Challenge",
      description: "Slide the timeline to determine when these patented inventions enter the public domain!",
      inventions: [
        { 
          name: "Smartphone Touch Interface", 
          filingYear: 2008,
          hint: "Filed in 2008"
        },
        { 
          name: "Medical Diagnosis AI", 
          filingYear: 2019,
          hint: "Filed in 2019"
        },
        { 
          name: "Solar Panel Technology", 
          filingYear: 2015,
          hint: "Filed in 2015"
        }
      ]
    },
    {
      round: 2,
      title: "Public Domain or Protected?",
      description: "For each invention, determine if it's still patent-protected or in the public domain today.",
      inventions: [
        { 
          name: "Digital Camera Technology", 
          filingYear: 1995,
          hint: "Filed in 1995"
        },
        { 
          name: "Wireless Charging", 
          filingYear: 2012,
          hint: "Filed in 2012"
        },
        { 
          name: "Web Browser Features", 
          filingYear: 2002,
          hint: "Filed in 2002"
        }
      ]
    },
    {
      round: 3,
      title: "Patent Expiration Effects",
      description: "Select what happens after these patents expire.",
      inventions: [
        { 
          name: "Pharmaceutical Drug Formula", 
          options: [
            "The drug can be manufactured by anyone (generic versions)",
            "The drug can be re-patented by the original company",
            "The drug becomes illegal to produce"
          ],
          correctAnswer: 0
        },
        { 
          name: "Smartphone Component Design", 
          options: [
            "Only government agencies can use the design",
            "Anyone can use the design without royalty payments",
            "The design can only be used for research purposes"
          ],
          correctAnswer: 1
        },
        { 
          name: "Industrial Manufacturing Process", 
          options: [
            "The process becomes a trade secret automatically",
            "The process can only be used with permission",
            "The process becomes freely available to implement"
          ],
          correctAnswer: 2
        }
      ]
    }
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

  // Handle timeline movement for invention expiration date
  const handleTimelineChange = (value) => {
    setTimelinePosition(value);
  };

  // Submit answer for timeline rounds (1-2)
  const handleSubmitAnswer = () => {
    const currentData = gameData[currentRound];
    const invention = currentData.inventions[selectedInvention];
    
    if (currentRound < 2) {
      // For timeline-based rounds
      const expirationYear = invention.filingYear + 20;
      const userSelectedYear = Math.floor(2025 + (timelinePosition * 30)); // Timeline spans 30 years from 2025
      const difference = Math.abs(userSelectedYear - expirationYear);
      
      // Calculate points based on accuracy
      let roundScore = 0;
      if (difference === 0) {
        roundScore = 20; // Perfect answer
      } else if (difference <= 2) {
        roundScore = 15; // Close
      } else if (difference <= 5) {
        roundScore = 10; // Somewhat close
      } else {
        roundScore = 5; // At least they tried
      }
      
      setScore(prevScore => prevScore + roundScore);
      
      setGameResult({
        correct: difference <= 2,
        message: `The patent expires in ${expirationYear}. ${difference <= 2 ? "Great job!" : "Keep practicing!"}`,
        score: roundScore,
        explanation: `Patents last for 20 years from the filing date. This invention was filed in ${invention.filingYear}, so it expires in ${expirationYear}.`
      });
    } else {
      // For multiple choice round
      const isCorrect = selectedInvention === invention.correctAnswer;
      const roundScore = isCorrect ? 20 : 0;
      
      setScore(prevScore => prevScore + roundScore);
      
      setGameResult({
        correct: isCorrect,
        message: isCorrect ? "Correct!" : "Not quite right.",
        score: roundScore,
        explanation: `After patent expiration, the invention enters the public domain and ${invention.options[invention.correctAnswer].toLowerCase()}.`
      });
    }
  };

  // Move to next invention or round
  const handleNextInvention = () => {
    const currentData = gameData[currentRound];
    
    if (selectedInvention < currentData.inventions.length - 1) {
      // Move to next invention in current round
      setSelectedInvention(selectedInvention + 1);
      setGameResult(null);
      setTimelinePosition(0);
    } else if (currentRound < gameData.length - 1) {
      // Move to next round
      setCurrentRound(currentRound + 1);
      setSelectedInvention(0);
      setGameResult(null);
      setTimelinePosition(0);
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
        levelNumber: 5,
        score,
        timeTaken,
      });

      const response = await fetch(`${API_URL}/api/save-level`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userInfo.email,
          chapter: "patent",
          levelNumber: 5,
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
    setCurrentRound(0);
    setSelectedInvention(0);
    setGameResult(null);
    setScore(0);
    setTimeTaken(0);
    setTimelinePosition(0);
    setShowEndScreen(false);
  };

  // Render current game content based on round
  const renderGameContent = () => {
    const currentData = gameData[currentRound];
    const invention = currentData.inventions[selectedInvention];
    
    if (currentRound < 2) {
      // Timeline-based rounds
      const currentYear = 2025;
      const selectedYear = Math.floor(currentYear + (timelinePosition * 30));
      
      return (
        <View style={styles.gameContentContainer}>
          <Text style={styles.roundTitle}>{currentData.title}</Text>
          <Text style={styles.roundDescription}>{currentData.description}</Text>
          
          <View style={styles.inventionCard}>
            <Text style={styles.inventionName}>{invention.name}</Text>
            <Text style={styles.inventionHint}>{invention.hint}</Text>
            
            {gameResult ? (
              <View style={styles.resultContainer}>
                <Text style={[styles.resultText, {color: gameResult.correct ? "#2ecc71" : "#e74c3c"}]}>
                  {gameResult.message}
                </Text>
                <Text style={styles.explanationText}>{gameResult.explanation}</Text>
                <Text style={styles.scoreText}>+{gameResult.score} points</Text>
              </View>
            ) : (
              <View style={styles.timelineContainer}>
                <Text style={styles.timelineQuestion}>
                  When will this patent expire and enter the public domain?
                </Text>
                
                <View style={styles.timeline}>
                  <View style={styles.timelineLine} />
                  <Animated.View 
                    style={[
                      styles.timelineMarker,
                      {
                        left: timelineAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%']
                        })
                      }
                    ]} 
                  />
                  <Text style={[styles.timelineYear, {left: '0%'}]}>{currentYear}</Text>
                  <Text style={[styles.timelineYear, {left: '50%'}]}>{currentYear + 15}</Text>
                  <Text style={[styles.timelineYear, {left: '100%'}]}>{currentYear + 30}</Text>
                </View>
                
                <View style={styles.sliderContainer}>
                  <TouchableOpacity 
                    style={styles.sliderButton}
                    onPress={() => {
                      const newPos = Math.max(0, timelinePosition - 0.05);
                      setTimelinePosition(newPos);
                      Animated.timing(timelineAnim, {
                        toValue: newPos,
                        duration: 100,
                        useNativeDriver: false
                      }).start();
                    }}
                  >
                    <Text style={styles.sliderButtonText}>◀</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.yearDisplay}>
                    <Text style={styles.selectedYearText}>Year: {selectedYear}</Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.sliderButton}
                    onPress={() => {
                      const newPos = Math.min(1, timelinePosition + 0.05);
                      setTimelinePosition(newPos);
                      Animated.timing(timelineAnim, {
                        toValue: newPos,
                        duration: 100,
                        useNativeDriver: false
                      }).start();
                    }}
                  >
                    <Text style={styles.sliderButtonText}>▶</Text>
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={handleSubmitAnswer}
                >
                  <Text style={styles.submitButtonText}>Submit Answer</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      );
    } else {
      // Multiple choice round
      return (
        <View style={styles.gameContentContainer}>
          <Text style={styles.roundTitle}>{currentData.title}</Text>
          <Text style={styles.roundDescription}>{currentData.description}</Text>
          
          <View style={styles.inventionCard}>
            <Text style={styles.inventionName}>{invention.name}</Text>
            
            {gameResult ? (
              <View style={styles.resultContainer}>
                <Text style={[styles.resultText, {color: gameResult.correct ? "#2ecc71" : "#e74c3c"}]}>
                  {gameResult.message}
                </Text>
                <Text style={styles.explanationText}>{gameResult.explanation}</Text>
                <Text style={styles.scoreText}>+{gameResult.score} points</Text>
              </View>
            ) : (
              <View style={styles.optionsContainer}>
                <Text style={styles.optionQuestion}>What happens after this patent expires?</Text>
                
                {invention.options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      selectedInvention === index && styles.selectedOption
                    ]}
                    onPress={() => setSelectedInvention(index)}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
                
                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={handleSubmitAnswer}
                >
                  <Text style={styles.submitButtonText}>Submit Answer</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      );
    }
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
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {renderGameContent()}
              
              {gameResult && (
                <TouchableOpacity 
                  style={styles.nextButton}
                  onPress={handleNextInvention}
                >
                  <Text style={styles.nextButtonText}>
                    {selectedInvention < gameData[currentRound].inventions.length - 1 ? 
                      "Next Invention" : 
                      currentRound < gameData.length - 1 ? 
                        "Next Round" : "Finish Game"}
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
            
            <View style={styles.gameInfoBar}>
              <Text style={styles.roundIndicator}>
                Round {currentRound + 1}/{gameData.length} - 
                Invention {selectedInvention + 1}/{gameData[currentRound].inventions.length}
              </Text>
              <Text style={styles.scoreIndicator}>Score: {score}</Text>
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
    width: windowWidth * 0.35,
    height: windowHeight * 0.55,
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
    width: "85%",
    marginBottom: windowHeight * 0.10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 6,
  },
  dialogueText: {
    fontSize: windowWidth * 0.022,
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: windowHeight * 0.015,
    lineHeight: windowWidth * 0.03,
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
    fontSize: windowWidth * 0.018,
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
  gameContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  scrollContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: windowHeight * 0.02,
  },
  gameContentContainer: {
    width: "95%",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    padding: windowWidth * 0.025,
    marginBottom: windowHeight * 0.02,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  roundTitle: {
    fontSize: windowWidth * 0.025,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: windowHeight * 0.01,
    textAlign: "center",
    fontFamily: "Montserrat_Bold",
  },
  roundDescription: {
    fontSize: windowWidth * 0.018,
    color: "#7f8c8d",
    marginBottom: windowHeight * 0.02,
    textAlign: "center",
    fontFamily: "Montserrat_Regular",
  },
  inventionCard: {
    backgroundColor: "rgba(236, 240, 241, 0.8)",
    borderRadius: 10,
    padding: windowWidth * 0.025,
    width: "90%",
    alignItems: "center",
    marginBottom: windowHeight * 0.01,
  },
  inventionName: {
    fontSize: windowWidth * 0.022,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: windowHeight * 0.01,
    textAlign: "center",
    fontFamily: "Montserrat_Bold",
  },
  inventionHint: {
    fontSize: windowWidth * 0.016,
    color: "#7f8c8d",
    marginBottom: windowHeight * 0.02,
    textAlign: "center",
    fontStyle: "italic",
    fontFamily: "Montserrat_Regular",
  },
  timelineContainer: {
    width: "100%",
    alignItems: "center",
  },
  timelineQuestion: {
    fontSize: windowWidth * 0.018,
    color: "#2c3e50",
    marginBottom: windowHeight * 0.02,
    textAlign: "center",
    fontFamily: "Montserrat_Regular",
  },
  timeline: {
    width: "90%",
    height: windowHeight * 0.03,
    marginBottom: windowHeight * 0.03,
    position: "relative",
  },
  timelineLine: {
    position: "absolute",
    width: "100%",
    height: 2,
    backgroundColor: "#95a5a6",
    top: "50%",
  },
  timelineMarker: {
    position: "absolute",
    width: windowWidth * 0.02,
    height: windowWidth * 0.02,
    borderRadius: windowWidth * 0.01,
    backgroundColor: "#e74c3c",
    top: "40%",
    marginLeft: -windowWidth * 0.01,
  },
  timelineYear: {
    position: "absolute",
    fontSize: windowWidth * 0.014,
    color: "#2c3e50",
    top: windowHeight * 0.02,
    textAlign: "center",
    fontFamily: "Montserrat_Regular",
    marginLeft: -windowWidth * 0.02,
  },
  sliderContainer: {
    flexDirection: "row",
    width: "90%",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: windowHeight * 0.02,
  },
  sliderButton: {
    backgroundColor: "#3498db",
    width: windowWidth * 0.05,
    height: windowWidth * 0.05,
    borderRadius: windowWidth * 0.025,
    alignItems: "center",
    justifyContent: "center",
  },
  sliderButtonText: {
    color: "#fff",
    fontSize: windowWidth * 0.025,
    fontWeight: "bold",
  },
  yearDisplay: {
    backgroundColor: "rgba(52, 152, 219, 0.1)",
    paddingVertical: windowHeight * 0.01,
    paddingHorizontal: windowWidth * 0.03,
    borderRadius: 10,
  },
  selectedYearText: {
    fontSize: windowWidth * 0.016,
    color: "#2c3e50",
    fontFamily: "Montserrat_Regular",
  },
  submitButton: {
    backgroundColor: "#2ecc71",
    paddingVertical: windowHeight * 0.01,
    paddingHorizontal: windowWidth * 0.03,
    borderRadius: 25,
    alignItems: "center",
    marginTop: windowHeight * 0.01,
    width: "60%",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: windowWidth * 0.016,
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
  resultContainer: {
    width: "90%",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    padding: windowWidth * 0.02,
  },
  resultText: {
    fontSize: windowWidth * 0.02,
    fontWeight: "bold",
    marginBottom: windowHeight * 0.01,
    textAlign: "center",
    fontFamily: "Montserrat_Bold",
  },
  explanationText: {
    fontSize: windowWidth * 0.016,
    color: "#2c3e50",
    marginBottom: windowHeight * 0.01,
    textAlign: "center",
    fontFamily: "Montserrat_Regular",
  },
  scoreText: {
    fontSize: windowWidth * 0.018,
    color: "#27ae60",
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
  optionsContainer: {
    width: "100%",
    alignItems: "center",
  },
  optionQuestion: {
    fontSize: windowWidth * 0.018,
    color: "#2c3e50",
    marginBottom: windowHeight * 0.02,
    textAlign: "center",
    fontFamily: "Montserrat_Regular",
  },
  optionButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: windowHeight * 0.015,
    paddingHorizontal: windowWidth * 0.02,
    marginVertical: windowHeight * 0.005,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#bdc3c7",
  },
  selectedOption: {
    backgroundColor: "rgba(52, 152, 219, 0.2)",
    borderColor: "#3498db",
  },
  optionText: {
    fontSize: windowWidth * 0.016,
    color: "#2c3e50",
    textAlign: "center",
    fontFamily: "Montserrat_Regular",
  },
  gameInfoBar: {
    position: "absolute",
    top: windowHeight * 0.01,
    width: "95%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: windowWidth * 0.02,
  },
  roundIndicator: {
    backgroundColor: "rgba(52, 152, 219, 0.8)",
    paddingVertical: windowHeight * 0.005,
    paddingHorizontal: windowWidth * 0.02,
    borderRadius: 20,
    color: "#fff",
    fontSize: windowWidth * 0.014,
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
  scoreIndicator: {
    backgroundColor: "rgba(46, 204, 113, 0.8)",
    paddingVertical: windowHeight * 0.005,
    paddingHorizontal: windowWidth * 0.02,
    borderRadius: 20,
    color: "#fff",
    fontSize: windowWidth * 0.014,
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
});

export default Level5Screen;