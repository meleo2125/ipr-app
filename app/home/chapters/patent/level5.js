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
  const [selectedOption, setSelectedOption] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
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
    "Let's play a game called 'Patent Perspectives' to understand how patents shape innovation across their lifecycle!",
  ];

  // Enhanced game data with diverse challenges
  const gameData = [
    {
      round: 1,
      title: "Patent Timeline Scenarios",
      description:
        "For each scenario, determine if the patent is still valid or has expired.",
      questions: [
        {
          scenario:
            "A pharmaceutical company patented a life-saving drug in 2010. A generic manufacturer wants to produce it in 2025.",
          options: [
            "The patent is still valid - the generic manufacturer must wait",
            "The patent has expired - the generic manufacturer can produce it now",
            "The patent could be extended for this essential medicine",
          ],
          correctAnswer: 0,
          explanation:
            "Patents last 20 years from filing date. Since it was patented in 2010, it will expire in 2030, so in 2025 it's still protected.",
        },
        {
          scenario:
            "A computer processing technique was patented in 1999 and is now widely used in modern smartphones.",
          options: [
            "Smartphone manufacturers must pay royalties to use this technique",
            "The patent is still in force and could be enforced at any time",
            "The patent has expired and the technique is now in the public domain",
          ],
          correctAnswer: 2,
          explanation:
            "Patents filed in 1999 expired in 2019. This technology is now in the public domain and available for anyone to use without permission.",
        },
        {
          scenario:
            "An inventor patented a solar panel technology in 2015 but failed to pay the required maintenance fees in 2022.",
          options: [
            "The patent remains valid until 2035 regardless of missed fees",
            "The patent has lapsed and is now in the public domain",
            "The patent is suspended but can be reinstated by paying back fees",
          ],
          correctAnswer: 1,
          explanation:
            "Patents require payment of maintenance fees. Failure to pay these fees can cause a patent to lapse, making the invention available to the public.",
        },
      ],
    },
    {
      round: 2,
      title: "Patent Strategy Dilemmas",
      description:
        "As a patent holder, what's the best strategy in each situation?",
      questions: [
        {
          scenario:
            "Your revolutionary battery technology patent expires next year. What's your best strategy?",
          options: [
            "File a new patent with minor improvements to extend protection",
            "Keep some aspects as trade secrets while the patent expires",
            "License the technology widely before it enters public domain",
          ],
          correctAnswer: 1,
          explanation:
            "While you can't extend the patent's life, you can protect certain manufacturing processes or improvements as trade secrets, which never expire as long as they remain confidential.",
        },
        {
          scenario:
            "You discover a competitor is using your patented technology, but your patent expires in just 6 months.",
          options: [
            "Immediately file a lawsuit for patent infringement",
            "Negotiate a settlement for past infringement only",
            "Ignore it since the patent will expire soon anyway",
          ],
          correctAnswer: 1,
          explanation:
            "Even though the patent will expire soon, you can still seek compensation for past infringement. A negotiated settlement is often more cost-effective than litigation.",
        },
        {
          scenario:
            "After your patent expires, you notice multiple companies using your invention but with poor quality. What can you do?",
          options: [
            "File for a patent extension based on quality concerns",
            "Sue the companies for improper use of your invention",
            "Leverage your expertise to offer premium versions or consulting",
          ],
          correctAnswer: 2,
          explanation:
            "Once a patent expires, anyone can use the invention. However, your expertise as the original inventor gives you an advantage in offering improved versions or consulting services.",
        },
      ],
    },
    {
      round: 3,
      title: "Global Patent Challenges",
      description:
        "Navigate the complexities of international patent expiration.",
      questions: [
        {
          scenario:
            "Your company filed a patent in India in 2010, and in the United States in 2012 for the same invention.",
          options: [
            "Your protection expires in both countries in 2030",
            "Protection expires in India in 2030 and in the US in 2032",
            "Filing in multiple countries doesn't affect expiration dates",
          ],
          correctAnswer: 1,
          explanation:
            "Patent expiration is calculated separately for each country based on their filing dates. The Indian patent expires in 2030, while the US patent expires in 2032.",
        },
        {
          scenario:
            "A critical medicine was patented in 2008. In 2025, there's a global health crisis where this medicine is needed.",
          options: [
            "The patent is still valid, but governments can issue compulsory licenses",
            "Patents automatically extend during health emergencies",
            "The patent has expired and anyone can produce the medicine",
          ],
          correctAnswer: 0,
          explanation:
            "Patents filed in 2008 expire in 2028. During health emergencies, governments can issue compulsory licenses allowing others to produce patented medicines while paying reasonable royalties.",
        },
        {
          scenario:
            "A technology patented in 2005 was improved with a new patent in 2020. What's the status in 2026?",
          options: [
            "Both patents are still valid, protecting different aspects",
            "Only the original patent is valid",
            "The original patent has expired, but the improvements remain protected",
          ],
          correctAnswer: 2,
          explanation:
            "The original patent from 2005 expired in 2025. The improvements patented in 2020 remain protected until 2040, but anyone can use the original technology disclosed in the first patent.",
        },
      ],
    },
    {
      round: 4,
      title: "Innovation Impact Simulation",
      description: "Examine how patent expiration affects society and markets.",
      questions: [
        {
          scenario:
            "A life-saving drug patent expires. Five years later, what's the most likely outcome?",
          options: [
            "Drug prices remain similar as the original company maintains market dominance",
            "Drug prices drop by 60-80% as multiple generic manufacturers enter the market",
            "Drug quality declines significantly without patent protection",
          ],
          correctAnswer: 1,
          explanation:
            "Studies show that when pharmaceutical patents expire, generic competition typically reduces prices by 60-80%, making treatments more accessible while maintaining quality standards.",
        },
        {
          scenario:
            "A company's key technology patent expires. What typically happens to innovation in that field?",
          options: [
            "Innovation slows down since there's less financial incentive",
            "Innovation accelerates as more companies can build upon and improve the technology",
            "Innovation patterns remain unchanged by patent expiration",
          ],
          correctAnswer: 1,
          explanation:
            "When foundational patents expire, follow-on innovation often accelerates as more companies can legally build upon the technology, leading to new applications and improvements.",
        },
        {
          scenario:
            "After a smartphone interface patent expires, how does consumer experience likely change?",
          options: [
            "Interface becomes standardized across all devices",
            "User experience degrades as quality control is lost",
            "New interface innovations emerge as companies differentiate",
          ],
          correctAnswer: 2,
          explanation:
            "After a patent expires, companies typically innovate in new directions to differentiate their products, often leading to a burst of new features and improvements that benefit consumers.",
        },
      ],
    },
  ];

  // Move to the next dialogue
  const handleNextDialogue = () => {
    if (step < dialogues.length - 1) {
      setStep(step + 1);
    } else {
      setStartTime(Date.now());
      setIsGameActive(true);
      setSelectedOption(null);
    }
  };

  // Submit answer for multiple choice questions
  const handleSubmitAnswer = () => {
    if (selectedOption === null) {
      return;
    }

    const currentData = gameData[currentRound];
    const currentQuestion = currentData.questions[currentQuestionIndex];

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    const roundScore = isCorrect ? 20 : 0;

    setScore((prevScore) => prevScore + roundScore);

    setGameResult({
      correct: isCorrect,
      message: isCorrect ? "Correct! Great job!" : "Not quite right.",
      score: roundScore,
      explanation: currentQuestion.explanation,
    });
  };
  // Move to next question or round
  const handleNextQuestion = () => {
    const currentData = gameData[currentRound];

    if (currentQuestionIndex < currentData.questions.length - 1) {
      // Move to next question in current round
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setGameResult(null);
    } else if (currentRound < gameData.length - 1) {
      // Move to next round
      setCurrentRound(currentRound + 1);
      setCurrentQuestionIndex(0); // Reset to first question in new round
      setSelectedOption(null);
      setGameResult(null);
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
        chapter: "patent",
        levelNumber: 5,
        score,
        timeTaken,
        completed: isLevelCompleted,
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
    setCurrentRound(0);
    setCurrentQuestionIndex(0); // Add this line
    setSelectedOption(null);
    setGameResult(null);
    setScore(0);
    setTimeTaken(0);
    setShowEndScreen(false);
  };

  // Render current game content based on round
  const renderGameContent = () => {
    if (currentRound >= gameData.length) {
      console.error("Invalid round index:", currentRound);
      return <Text>Error: Invalid game data</Text>;
    }

    const currentData = gameData[currentRound];

    if (
      !currentData ||
      !currentData.questions ||
      currentData.questions.length === 0
    ) {
      console.error("Missing question data for round:", currentRound);
      return <Text>Error: Missing game data</Text>;
    }

    // Get current question based on progress
    const question = currentData.questions[currentQuestionIndex];

    // Calculate progress
    const totalQuestions = gameData.reduce(
      (sum, round) => sum + round.questions.length,
      0
    );
    let completedQuestions = 0;
    for (let i = 0; i < currentRound; i++) {
      completedQuestions += gameData[i].questions.length;
    }
    completedQuestions += currentQuestionIndex;
    const progressPercentage = (completedQuestions / totalQuestions) * 100;

    return (
      <View style={styles.gameContentContainer}>
        <View style={styles.progressBarContainer}>
          <View
            style={[styles.progressBar, { width: `${progressPercentage}%` }]}
          />
        </View>

        <Text style={styles.roundTitle}>{currentData.title}</Text>
        <Text style={styles.roundDescription}>{currentData.description}</Text>

        <View style={styles.scenarioCard}>
          <View style={styles.scenarioHeader}>
            <Text style={styles.scenarioNumber}>
              Scenario {currentQuestionIndex + 1}/{currentData.questions.length}
            </Text>
            <Text style={styles.roundBadge}>Round {currentRound + 1}</Text>
          </View>

          <Text style={styles.scenarioText}>{question.scenario}</Text>

          {gameResult ? (
            <View style={styles.resultContainer}>
              <Text
                style={[
                  styles.resultText,
                  { color: gameResult.correct ? "#2ecc71" : "#e74c3c" },
                ]}
              >
                {gameResult.message}
              </Text>
              <Text style={styles.explanationText}>
                {gameResult.explanation}
              </Text>
              <Text style={styles.scoreText}>+{gameResult.score} points</Text>
            </View>
          ) : (
            <View style={styles.optionsContainer}>
              {question.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    selectedOption === index && styles.selectedOption,
                  ]}
                  onPress={() => setSelectedOption(index)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedOption === index && styles.selectedOptionText,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  selectedOption === null && styles.disabledButton,
                ]}
                onPress={handleSubmitAnswer}
                disabled={selectedOption === null}
              >
                <Text style={styles.submitButtonText}>Submit Answer</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
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
                  onPress={handleNextQuestion}
                >
                  <Text style={styles.nextButtonText}>
                    {(() => {
                      const currentData = gameData[currentRound];
                      const currentQuestionIndex = Math.min(
                        selectedOption,
                        currentData.questions.length - 1
                      );

                      return currentQuestionIndex <
                        currentData.questions.length - 1
                        ? "Next Scenario"
                        : currentRound < gameData.length - 1
                        ? "Next Round"
                        : "Finish Game";
                    })()}
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>

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
    padding: windowWidth * 0.02, // Consistent with level1
  },
  dialogueContainer: {
    flex: 1,
    width: "100%",
    flexDirection: "row", // Consistent with level1
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
    marginLeft: -windowWidth * 0.05, // Consistent with level1
  },
  dialogueBox: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    padding: windowWidth * 0.04,
    alignItems: "center",
    width: "85%",
    marginBottom: windowHeight * 0.1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 6,
  },
  dialogueText: {
    fontSize: windowWidth * 0.022, // Consistent with level1
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
    fontSize: windowWidth * 0.018, // Consistent with level1
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
  progressBarContainer: {
    width: "100%",
    height: windowHeight * 0.01,
    backgroundColor: "#ecf0f1",
    borderRadius: windowHeight * 0.005,
    marginBottom: windowHeight * 0.02,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#3498db",
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
  scenarioCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: windowWidth * 0.025,
    width: "90%",
    alignItems: "center",
    marginBottom: windowHeight * 0.01,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  scenarioHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: windowHeight * 0.02,
    paddingBottom: windowHeight * 0.01,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  scenarioNumber: {
    fontSize: windowWidth * 0.016,
    color: "#3498db",
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
  roundBadge: {
    fontSize: windowWidth * 0.016,
    color: "#fff",
    fontWeight: "bold",
    backgroundColor: "#9b59b6",
    paddingHorizontal: windowWidth * 0.015,
    paddingVertical: windowHeight * 0.002,
    borderRadius: 15,
    fontFamily: "Montserrat_Bold",
  },
  scenarioText: {
    fontSize: windowWidth * 0.02,
    color: "#34495e",
    marginBottom: windowHeight * 0.025,
    textAlign: "center",
    lineHeight: windowWidth * 0.028,
    fontFamily: "Montserrat_Regular",
  },
  optionsContainer: {
    width: "100%",
    alignItems: "center",
  },
  optionButton: {
    backgroundColor: "#fff",
    paddingVertical: windowHeight * 0.015,
    paddingHorizontal: windowWidth * 0.025,
    marginVertical: windowHeight * 0.008,
    borderRadius: 10,
    width: "100%",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#dfe6e9",
    elevation: 1,
  },
  selectedOption: {
    backgroundColor: "rgba(52, 152, 219, 0.15)",
    borderColor: "#3498db",
    borderWidth: 2,
  },
  optionText: {
    fontSize: windowWidth * 0.016,
    color: "#2c3e50",
    fontFamily: "Montserrat_Regular",
  },
  selectedOptionText: {
    fontWeight: "bold",
    color: "#2980b9",
    fontFamily: "Montserrat_Bold",
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButton: {
    backgroundColor: "#2ecc71",
    paddingVertical: windowHeight * 0.012,
    paddingHorizontal: windowWidth * 0.04,
    borderRadius: 25,
    alignItems: "center",
    marginTop: windowHeight * 0.02,
    width: "60%",
    elevation: 3,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: windowWidth * 0.016,
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
  resultContainer: {
    width: "95%",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 10,
    padding: windowWidth * 0.025,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginTop: windowHeight * 0.01,
  },
  resultText: {
    fontSize: windowWidth * 0.022,
    fontWeight: "bold",
    marginBottom: windowHeight * 0.01,
    textAlign: "center",
    fontFamily: "Montserrat_Bold",
  },
  explanationText: {
    fontSize: windowWidth * 0.016,
    color: "#34495e",
    marginBottom: windowHeight * 0.015,
    textAlign: "center",
    lineHeight: windowWidth * 0.024,
    fontFamily: "Montserrat_Regular",
  },
  scoreText: {
    fontSize: windowWidth * 0.018,
    color: "#27ae60",
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
  // Using consistent score display styling from level1
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
    fontSize: windowWidth * 0.016,
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
});

export default Level5Screen;
