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

const Level4Screen = () => {
  const [step, setStep] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timer, setTimer] = useState(15); // 15 seconds per question
  const [timerRunning, setTimerRunning] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { userInfo } = useAuth();
  const timerInterval = useRef(null);

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

  // Handle timer for game
  useEffect(() => {
    if (timerRunning && timer > 0) {
      timerInterval.current = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && timerRunning) {
      // Time's up for current question, move to next
      handleNextQuestion(false);
    }

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [timerRunning, timer]);

  // Narrator dialogues about patent waiting period and publication
  const dialogues = [
    "Welcome back! Now that you've learned how to file a patent, let's discuss what happens after filing.",
    "After you file a patent application, there's a waiting period before it gets published.",
    "Typically, a patent application is published 18 months after its filing date in a public journal.",
    "This 18-month period allows the patent office to conduct initial examinations while keeping your invention confidential.",
    "If you need your patent to be published sooner, you can submit Form 9 in the Indian patent system.",
    "Form 9 allows for early publication, which can happen within just one month of your request.",
    "After publication, whether normal or early, it takes about 4-5 years for full patent registration and grant.",
    "Let's test your knowledge about the patent publication timeline with a race against time mini-game!",
  ];

  // Questions for the mini-game
  const questions = [
    {
      question:
        "How long does it typically take for a patent to be published after filing?",
      options: ["6 months", "12 months", "18 months", "24 months"],
      correctAnswer: 2, // 18 months (index 2)
      explanation: "Patents are typically published 18 months after filing.",
    },
    {
      question:
        "What form can you submit to request early publication of a patent?",
      options: ["Form 1", "Form 9", "Form 18", "Form 27"],
      correctAnswer: 1, // Form 9 (index 1)
      explanation:
        "Form 9 is used to request early publication of a patent application.",
    },
    {
      question: "How quickly can a patent be published after filing Form 9?",
      options: [
        "Within 1 month",
        "Within 3 months",
        "Within 6 months",
        "Within 9 months",
      ],
      correctAnswer: 0, // Within 1 month (index 0)
      explanation: "With Form 9, publication can happen within just one month.",
    },
    {
      question: "What is one advantage of early publication?",
      options: [
        "Guaranteed patent approval",
        "Reduced filing fees",
        "Earlier public disclosure",
        "Immediate patent grant",
      ],
      correctAnswer: 2, // Earlier public disclosure (index 2)
      explanation:
        "Early publication allows your invention to enter the public domain sooner.",
    },
    {
      question:
        "After publication, how long does it typically take for full patent registration?",
      options: ["1-2 years", "2-3 years", "4-5 years", "7-8 years"],
      correctAnswer: 2, // 4-5 years (index 2)
      explanation:
        "After publication, it takes around 4-5 years for full registration.",
    },
    {
      question: "What happens after a patent application is published?",
      options: [
        "Immediate patent grant",
        "The application enters public domain",
        "The invention can no longer be modified",
        "Competitors are legally barred from viewing it",
      ],
      correctAnswer: 1, // The application enters public domain (index 1)
      explanation:
        "Once published, the application enters the public domain where others can review it.",
    },
    {
      question:
        "Which of these is true about the waiting period before publication?",
      options: [
        "The invention is not protected at all",
        "The invention remains confidential",
        "Competitors can freely use the invention",
        "The inventor must pay monthly fees",
      ],
      correctAnswer: 1, // The invention remains confidential (index 1)
      explanation:
        "During the waiting period, your invention remains confidential.",
    },
    {
      question: "What might be a reason to request early publication?",
      options: [
        "To reduce overall patent costs",
        "To enable earlier enforcement against infringers",
        "To extend the patent term",
        "To bypass examination",
      ],
      correctAnswer: 1, // To enable earlier enforcement against infringers (index 1)
      explanation:
        "Early publication can enable earlier enforcement against potential infringers.",
    },
  ];

  // Move to the next dialogue
  const handleNextDialogue = () => {
    if (step < dialogues.length - 1) {
      setStep(step + 1);
    } else {
      setStartTime(Date.now());
      setIsGameActive(true);
      setTimerRunning(true);
    }
  };

  // Handle when user selects an answer
  const handleOptionSelect = (optionIndex) => {
    if (selectedOption === null) {
      setSelectedOption(optionIndex);
      setTimerRunning(false);

      // Check if answer is correct
      const isCorrect =
        optionIndex === questions[currentQuestion].correctAnswer;

      // Award points based on correctness and remaining time
      if (isCorrect) {
        // Base score of 10 plus up to 5 bonus points for speed
        const timeBonus = Math.ceil((timer / 15) * 5);
        setScore((prevScore) => prevScore + 10 + timeBonus);
      }

      // Auto-proceed to next question after a delay
      setTimeout(() => {
        handleNextQuestion(isCorrect);
      }, 2000);
    }
  };

  // Move to next question or end game
  const handleNextQuestion = (wasCorrect) => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimer(15);
      setSelectedOption(null);
      setTimerRunning(true);
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
        levelNumber: 4,
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
          levelNumber: 4,
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
    setCurrentQuestion(0);
    setScore(0);
    setTimeTaken(0);
    setTimer(15);
    setSelectedOption(null);
    setShowEndScreen(false);
  };

  // Calculate progress percentage for timer
  const timerProgress = (timer / 15) * 100;

  // Get color for timer based on time remaining
  const getTimerColor = () => {
    if (timer > 10) return "#2ecc71"; // Green
    if (timer > 5) return "#f39c12"; // Orange
    return "#e74c3c"; // Red
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
            <Text style={styles.title}>Race Against Time</Text>
            <Text style={styles.subtitle}>
              Answer quickly to earn more points!
            </Text>

            {/* Timer Bar */}
            <View style={styles.timerContainer}>
              <View
                style={[
                  styles.timerBar,
                  {
                    width: `${timerProgress}%`,
                    backgroundColor: getTimerColor(),
                  },
                ]}
              />
              <Text style={styles.timerText}>{timer}s</Text>
            </View>

            {/* Question Container */}
            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>
                {questions[currentQuestion].question}
              </Text>
              <Text style={styles.counter}>
                Question {currentQuestion + 1}/{questions.length}
              </Text>
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
              {questions[currentQuestion].options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    selectedOption === index &&
                      (index === questions[currentQuestion].correctAnswer
                        ? styles.correctOption
                        : styles.incorrectOption),
                    selectedOption !== null &&
                      index === questions[currentQuestion].correctAnswer &&
                      styles.correctOption,
                  ]}
                  onPress={() => handleOptionSelect(index)}
                  disabled={selectedOption !== null}
                >
                  <Text
                    style={[
                      styles.optionText,
                      (selectedOption === index &&
                        index === questions[currentQuestion].correctAnswer) ||
                      (selectedOption !== null &&
                        index === questions[currentQuestion].correctAnswer)
                        ? styles.correctOptionText
                        : selectedOption === index
                        ? styles.incorrectOptionText
                        : null,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Explanation (only shown after selection) */}
            {selectedOption !== null && (
              <View style={styles.explanationContainer}>
                <Text style={styles.explanationText}>
                  {questions[currentQuestion].explanation}
                </Text>
              </View>
            )}

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
    marginBottom: windowHeight * 0.1,
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
  title: {
    fontSize: windowWidth * 0.028,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: windowHeight * 0.01,
    textAlign: "center",
    fontFamily: "Montserrat_Bold",
  },
  subtitle: {
    fontSize: windowWidth * 0.016,
    color: "#7f8c8d",
    marginBottom: windowHeight * 0.02,
    textAlign: "center",
    fontFamily: "Montserrat_Regular",
  },
  timerContainer: {
    width: "75%",
    height: windowHeight * 0.025,
    backgroundColor: "rgba(189, 195, 199, 0.5)",
    borderRadius: 10,
    marginBottom: windowHeight * 0.02,
    overflow: "hidden",
    position: "relative",
  },
  timerBar: {
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
    borderRadius: 10,
  },
  timerText: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    color: "#fff",
    fontSize: windowWidth * 0.014,
    fontWeight: "bold",
    lineHeight: windowHeight * 0.025,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  questionContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    padding: windowWidth * 0.025,
    width: "75%",
    alignItems: "center",
    marginBottom: windowHeight * 0.025,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  questionText: {
    fontSize: windowWidth * 0.022,
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: windowHeight * 0.01,
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
  counter: {
    fontSize: windowWidth * 0.014,
    color: "#7f8c8d",
    fontFamily: "Montserrat_Regular",
  },
  optionsContainer: {
    width: "75%",
    marginBottom: windowHeight * 0.025,
  },
  optionButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: windowHeight * 0.015,
    paddingHorizontal: windowWidth * 0.025,
    marginVertical: windowHeight * 0.008,
    borderRadius: 10,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  optionText: {
    fontSize: windowWidth * 0.018,
    color: "#2c3e50",
    textAlign: "center",
    fontFamily: "Montserrat_Regular",
  },
  correctOption: {
    backgroundColor: "rgba(46, 204, 113, 0.9)",
  },
  incorrectOption: {
    backgroundColor: "rgba(231, 76, 60, 0.9)",
  },
  correctOptionText: {
    color: "#fff",
    fontWeight: "bold",
  },
  incorrectOptionText: {
    color: "#fff",
    fontWeight: "bold",
  },
  explanationContainer: {
    backgroundColor: "rgba(52, 152, 219, 0.1)",
    borderRadius: 10,
    padding: windowWidth * 0.025,
    width: "75%",
    marginBottom: windowHeight * 0.02,
  },
  explanationText: {
    fontSize: windowWidth * 0.016,
    color: "#2c3e50",
    textAlign: "center",
    fontFamily: "Montserrat_Regular",
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
    fontSize: windowWidth * 0.016,
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
});

export default Level4Screen;
