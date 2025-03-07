import React, { useEffect, useState, useRef } from "react";
import {
  StatusBar,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Animated,
  Dimensions,
  Image,
  PanResponder,
} from "react-native";
import EndScreen from "../../../../components/EndScreen";
import { useAuth } from "../../../../context/AuthContext";
import { API_URL } from "../../../../api/config";

// Get screen dimensions for responsive sizing
const { width: windowWidth, height: windowHeight } = Dimensions.get("window");

// Calculate base size units for consistent scaling
const baseUnit = Math.min(windowWidth, windowHeight) / 100;

const Level3Screen = () => {
  const panResponders = useRef([]).current;
  const [step, setStep] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameStage, setGameStage] = useState(0); // 0 = document collection, 1 = fee selection
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { userInfo } = useAuth();

  // Animation values
  const narratorYPosition = useRef(new Animated.Value(0)).current;

  // Improved positioning for documents and mailbox
  // Left side for documents (40% of screen width)
  // Right side for mailbox (60% of screen width)
  const documentPositions = useRef([
    new Animated.ValueXY({ x: windowWidth * 0.05, y: windowHeight * 0.25 }),
    new Animated.ValueXY({ x: windowWidth * 0.05, y: windowHeight * 0.5 }),
    new Animated.ValueXY({ x: windowWidth * 0.25, y: windowHeight * 0.25 }),
    new Animated.ValueXY({ x: windowWidth * 0.25, y: windowHeight * 0.5 }),
  ]).current;

  // Position mailbox on the right side of the screen
  const mailboxPosition = useRef(
    new Animated.ValueXY({ x: windowWidth * 0.6, y: windowHeight * 0.35 })
  ).current;
  const mailboxScale = useRef(new Animated.Value(1)).current;

  // Setup narrator breathing/floating animation
  useEffect(() => {
    const startNarratorAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(narratorYPosition, {
            toValue: 5,
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
  }, [step, isGameActive, gameStage]);

  // Initialize pan responders
  useEffect(() => {
    // Create pan responders only once when component mounts
    documents.forEach((doc, index) => {
      panResponders[index] = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          documentPositions[index].setOffset({
            x: documentPositions[index].x._value,
            y: documentPositions[index].y._value,
          });
          documentPositions[index].setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: (event, gesture) => {
          onDragDocument(index, gesture);
        },
        onPanResponderRelease: () => {
          documentPositions[index].flattenOffset();
          onReleaseDocument(index);
        },
      });
    });
  }, []);

  // Narrator dialogues for the submission process
  const dialogues = [
    "Welcome to the final step in the copyright registration process: submitting your application and paying the required fees!",
    "After completing Form XIV, you'll need to gather all your documents and submit them to the Copyright Office.",
    "In India, you can submit your application either online through the e-Filing portal or offline at the Copyright Office.",
    "Online submission has become the preferred method as it's faster and more convenient.",
    "Along with your application form, you'll need to include copies of your work, proof of identity, and any additional supporting documents.",
    "You'll also need to pay the prescribed fee, which varies depending on the type of work being registered.",
    "For literary, dramatic, musical, or artistic works, the standard fee is ₹500, while it's ₹2,000 for software and ₹5,000 for cinematograph films.",
    "Once submitted with the correct fee, your application will be processed by the Copyright Office.",
    "Let's practice the submission process to ensure your copyright application goes smoothly!",
  ];

  // Game documents data
  const documents = [
    {
      id: "application",
      name: "Form XIV Application",
      required: true,
      image: require("../../../../assets/images/document1.png"),
    },
    {
      id: "workCopy",
      name: "Copy of the Work",
      required: true,
      image: require("../../../../assets/images/document2.png"),
    },
    {
      id: "idProof",
      name: "ID Proof",
      required: true,
      image: require("../../../../assets/images/document3.png"),
    },
    {
      id: "unrelated",
      name: "Unrelated Document",
      required: false,
      image: require("../../../../assets/images/document4.png"),
    },
  ];

  // Fee options data
  const feeOptions = [
    {
      id: "fee500",
      amount: "₹500",
      label: "Literary Works",
      correct: true,
    },
    {
      id: "fee2000",
      amount: "₹2,000",
      label: "Software",
      correct: false,
    },
    {
      id: "fee5000",
      amount: "₹5,000",
      label: "Films",
      correct: false,
    },
    {
      id: "fee0",
      amount: "Free",
      label: "No Fee Required",
      correct: false,
    },
  ];

  // Document drag and drop handlers
  const onDragDocument = (index, gesture) => {
    Animated.event(
      [
        null,
        {
          dx: documentPositions[index].x,
          dy: documentPositions[index].y,
        },
      ],
      { useNativeDriver: false }
    )(null, gesture);
  };
  const onReleaseDocument = (index) => {
    // Check if document is over the mailbox
    const docX = documentPositions[index].x._value + windowWidth * 0.1;
    const docY = documentPositions[index].y._value + windowHeight * 0.1;
  
    const mailboxX = mailboxPosition.x._value;
    const mailboxY = mailboxPosition.y._value;
    const mailboxWidth = windowWidth * 0.25;
    const mailboxHeight = windowHeight * 0.3;
  
    if (
      docX > mailboxX &&
      docX < mailboxX + mailboxWidth &&
      docY > mailboxY &&
      docY < mailboxY + mailboxHeight
    ) {
      // Document dropped in mailbox
      if (documents[index].required) {
        // Correct document
        setScore((prevScore) => prevScore + 10);
        showFeedbackMessage("Correct document! +10 points");
  
        // Animate document into mailbox and hide it
        Animated.parallel([
          Animated.timing(documentPositions[index], {
            toValue: {
              x: mailboxX + mailboxWidth / 2 - windowWidth * 0.1,
              y: mailboxY + mailboxHeight / 2 - windowHeight * 0.1,
            },
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.sequence([
            Animated.timing(mailboxScale, {
              toValue: 1.1,
              duration: 150,
              useNativeDriver: false,
            }),
            Animated.timing(mailboxScale, {
              toValue: 1,
              duration: 150,
              useNativeDriver: false,
            }),
          ]),
        ]).start(() => {
          // Move document off-screen
          documentPositions[index].setValue({ x: -1000, y: -1000 });
          
          // Check if all required documents are submitted
          const submittedCount = documents
            .filter(doc => doc.required)
            .reduce((count, doc, docIndex) => {
              // Check if this document's position is off-screen
              const isSubmitted = 
                documentPositions[docIndex].x._value === -1000 &&
                documentPositions[docIndex].y._value === -1000;
              return isSubmitted ? count + 1 : count;
            }, 0);
            
          // Count how many required documents we have total
          const requiredCount = documents.filter(doc => doc.required).length;
          
          // If all required documents are submitted, move to fee selection
          if (submittedCount === requiredCount) {
            setTimeout(() => {
              setGameStage(1);
            }, 1000);
          }
        });
      } else {
        // Incorrect document
        setScore((prevScore) => Math.max(0, prevScore - 5));
        showFeedbackMessage("That document is not needed! -5 points");
  
        // Return document to original position with adaptive positioning
        resetDocumentPosition(index);
      }
    } else {
      // Return document to original position with adaptive positioning
      resetDocumentPosition(index);
    }
  };

  // Helper function to reset document to original position based on index
  const resetDocumentPosition = (index) => {
    const positions = [
      { x: windowWidth * 0.05, y: windowHeight * 0.25 },
      { x: windowWidth * 0.05, y: windowHeight * 0.5 },
      { x: windowWidth * 0.25, y: windowHeight * 0.25 },
      { x: windowWidth * 0.25, y: windowHeight * 0.5 },
    ];

    Animated.spring(documentPositions[index], {
      toValue: positions[index],
      useNativeDriver: false,
    }).start();
  };

  // Fee selection handler
  const selectFee = (option) => {
    if (option.correct) {
      // Correct fee
      setScore((prevScore) => prevScore + 20);
      showFeedbackMessage("Correct fee selection! +20 points");

      // End the game after a delay
      setTimeout(() => {
        const endTime = Date.now();
        const totalTime = Math.floor((endTime - startTime) / 1000);
        setTimeTaken(totalTime);
        setIsGameActive(false);
        setShowEndScreen(true);
      }, 1500);
    } else {
      // Incorrect fee
      setScore((prevScore) => Math.max(0, prevScore - 10));
      showFeedbackMessage("Incorrect fee! -10 points");
    }
  };

  // Helper to show feedback messages
  const showFeedbackMessage = (message) => {
    setFeedbackMessage(message);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 1500);
  };

  // Move to the next dialogue
  const handleNextDialogue = () => {
    if (step < dialogues.length - 1) {
      setStep(step + 1);
    } else {
      setStartTime(Date.now());
      setIsGameActive(true);
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
        levelNumber: 3,
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
          levelNumber: 3,
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
    setGameStage(0);
    setScore(0);
    setTimeTaken(0);
    setShowEndScreen(false);

    // Reset document positions with the updated positions
    documentPositions.forEach((pos, index) => {
      const positions = [
        { x: windowWidth * 0.05, y: windowHeight * 0.25 },
        { x: windowWidth * 0.05, y: windowHeight * 0.5 },
        { x: windowWidth * 0.25, y: windowHeight * 0.25 },
        { x: windowWidth * 0.25, y: windowHeight * 0.5 },
      ];
      pos.setValue(positions[index]);
    });
  };

  // Create document draggable components
  const renderDraggableDocuments = () => {
    return documents.map((doc, index) => (
      <Animated.View
        key={doc.id}
        style={[
          styles.document,
          {
            transform: [
              { translateX: documentPositions[index].x },
              { translateY: documentPositions[index].y },
            ],
          },
        ]}
        {...(panResponders[index] ? panResponders[index].panHandlers : {})}
      >
        <Image source={doc.image} style={styles.documentImage} />
        <Text style={styles.documentText}>{doc.name}</Text>
      </Animated.View>
    ));
  };

  // Render fee selection UI
  const renderFeeSelection = () => {
    return (
      <View style={styles.feeContainer}>
        <Text style={styles.feeTitle}>
          Select the Correct Fee for a Musical Composition
        </Text>

        <View style={styles.feeOptionsContainer}>
          {feeOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.feeOption}
              onPress={() => selectFee(option)}
            >
              <Text style={styles.feeAmount}>{option.amount}</Text>
              <Text style={styles.feeLabel}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.feeInstructions}>
          Choose the appropriate fee for registering a musical composition
          copyright
        </Text>
      </View>
    );
  };

  // Render the game screen layout with improved split view
  const renderGameScreen = () => (
    <View style={styles.gameContainer}>
      <Text style={styles.title}>
        {gameStage === 0 ? "Submit Your Documents" : "Pay Registration Fee"}
      </Text>
      <Text style={styles.subtitle}>
        {gameStage === 0
          ? "Drag the required documents into the mailbox"
          : "Select the correct fee amount for your copyright application"}
      </Text>

      {/* Game content based on stage */}
      {gameStage === 0 ? (
        <View style={styles.splitContainer}>
          <View style={styles.documentsArea}>{renderDraggableDocuments()}</View>

          <View style={styles.mailboxArea}>
            <Animated.View
              style={[
                styles.mailbox,
                {
                  transform: [{ scale: mailboxScale }],
                },
              ]}
            >
              <Image
                source={require("../../../../assets/images/mailbox.png")}
                style={styles.mailboxImage}
              />
              <Text style={styles.mailboxText}>Drop Documents Here</Text>
            </Animated.View>
          </View>
        </View>
      ) : (
        renderFeeSelection()
      )}

      {/* Feedback Message */}
      {showFeedback && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>{feedbackMessage}</Text>
        </View>
      )}

      <View style={styles.scoreDisplay}>
        <Text style={styles.currentScore}>Score: {score}</Text>
      </View>

      {gameStage === 0 && (
        <View style={styles.instructionBox}>
          <Text style={styles.instructionText}>
            Submit only the required documents for copyright registration
          </Text>
        </View>
      )}
    </View>
  );

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
          renderGameScreen()
        ) : (
          /* Introduction with Narrator */
          <View style={styles.dialogueContainer}>
            <Animated.Image
              source={require("../../../../assets/images/cory.png")}
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
    padding: baseUnit * 2,
  },
  dialogueContainer: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingBottom: baseUnit * 5,
  },
  narratorImage: {
    width: windowWidth * 0.38,
    height: windowHeight * 0.65,
    resizeMode: "contain",
    marginLeft: baseUnit * 4,
  },
  dialogueWrapper: {
    flex: 1,
    alignItems: "flex-start",
    marginLeft: baseUnit * 2,
  },
  dialogueBox: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: baseUnit * 2,
    padding: baseUnit * 4.5,
    alignItems: "center",
    width: "95%",
    marginBottom: baseUnit * 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 6,
  },
  dialogueText: {
    fontSize: baseUnit * 3.2,
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: baseUnit * 2.5,
    lineHeight: baseUnit * 4.2,
    fontFamily: "Montserrat_Regular",
    userSelect: "none",
  },
  nextButton: {
    backgroundColor: "#3498db",
    paddingVertical: baseUnit * 1.8,
    paddingHorizontal: baseUnit * 3.5,
    borderRadius: baseUnit * 3,
    alignItems: "center",
    elevation: 8,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: baseUnit * 2.4,
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
    userSelect: "none",
  },
  gameContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    paddingTop: baseUnit * 3,
  },
  // New split container for documents area and mailbox area
  splitContainer: {
    flex: 1,
    flexDirection: "row",
    width: "100%",
  },
  documentsArea: {
    flex: 1, // Takes 50% of the splitContainer width
    position: "relative",
  },
  mailboxArea: {
    flex: 1, // Takes 50% of the splitContainer width
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: baseUnit * 3.5,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: baseUnit * 0.8,
    textAlign: "center",
    fontFamily: "Montserrat_Bold",
    userSelect: "none",
  },
  subtitle: {
    fontSize: baseUnit * 2.4,
    color: "#ffffff",
    marginBottom: baseUnit * 3,
    textAlign: "center",
    fontFamily: "Montserrat_Regular",
    userSelect: "none",
  },
  document: {
    position: "absolute",
    width: windowWidth * 0.15, // Slightly smaller to fit better in the split view
    height: windowHeight * 0.15,
    backgroundColor: "#ffffff",
    borderRadius: baseUnit * 1.5,
    padding: baseUnit * 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  documentImage: {
    width: "70%",
    height: "70%",
    resizeMode: "contain",
  },
  documentText: {
    fontSize: baseUnit * 1.8, // Slightly smaller for better fit
    color: "#2c3e50",
    textAlign: "center",
    marginTop: baseUnit * 0.5,
    fontFamily: "Montserrat_Regular",
    userSelect: "none",
  },
  mailbox: {
    width: windowWidth * 0.25,
    height: windowHeight * 0.3,
    alignItems: "center",
    justifyContent: "center",
  },
  mailboxImage: {
    width: "100%",
    height: "80%",
    resizeMode: "contain",
  },
  mailboxText: {
    fontSize: baseUnit * 2.2,
    color: "#ffffff",
    textAlign: "center",
    backgroundColor: "rgba(41, 128, 185, 0.8)",
    paddingVertical: baseUnit * 0.8,
    paddingHorizontal: baseUnit * 1.5,
    borderRadius: baseUnit * 1.5,
    marginTop: baseUnit * 1,
    fontFamily: "Montserrat_Regular",
    userSelect: "none",
  },
  instructionBox: {
    position: "absolute",
    bottom: baseUnit * 5,
    backgroundColor: "rgba(41, 128, 185, 0.9)",
    padding: baseUnit * 2,
    borderRadius: baseUnit * 2,
    width: "80%",
  },
  instructionText: {
    fontSize: baseUnit * 2.4,
    color: "#ffffff",
    textAlign: "center",
    fontFamily: "Montserrat_Regular",
    userSelect: "none",
  },
  feeContainer: {
    width: "80%",
    alignItems: "center",
  },
  feeTitle: {
    fontSize: baseUnit * 3,
    color: "#ffffff",
    textAlign: "center",
    marginBottom: baseUnit * 4,
    fontFamily: "Montserrat_Bold",
    userSelect: "none",
  },
  feeOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
  },
  feeOption: {
    width: "40%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: baseUnit * 2,
    padding: baseUnit * 2.5,
    margin: baseUnit * 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  feeAmount: {
    fontSize: baseUnit * 3.2,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: baseUnit * 1,
    fontFamily: "Montserrat_Bold",
    userSelect: "none",
  },
  feeLabel: {
    fontSize: baseUnit * 2.2,
    color: "#2c3e50",
    textAlign: "center",
    fontFamily: "Montserrat_Regular",
    userSelect: "none",
  },
  feeInstructions: {
    fontSize: baseUnit * 2.4,
    color: "#ffffff",
    textAlign: "center",
    marginTop: baseUnit * 4,
    backgroundColor: "rgba(41, 128, 185, 0.9)",
    paddingVertical: baseUnit * 2,
    paddingHorizontal: baseUnit * 3,
    borderRadius: baseUnit * 2,
    fontFamily: "Montserrat_Regular",
    userSelect: "none",
  },
  feedbackContainer: {
    position: "absolute",
    top: baseUnit * 15,
    alignSelf: "center",
    backgroundColor: "rgba(52, 152, 219, 0.9)",
    paddingVertical: baseUnit * 1.2,
    paddingHorizontal: baseUnit * 3.5,
    borderRadius: baseUnit * 2,
    zIndex: 200,
  },
  feedbackText: {
    color: "#ffffff",
    fontSize: baseUnit * 2.4,
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
    userSelect: "none",
  },
  scoreDisplay: {
    position: "absolute",
    top: baseUnit * 1,
    right: baseUnit * 2,
    backgroundColor: "rgba(52, 152, 219, 0.8)",
    paddingVertical: baseUnit * 0.8,
    paddingHorizontal: baseUnit * 2.5,
    borderRadius: baseUnit * 2,
  },
  currentScore: {
    color: "#fff",
    fontSize: baseUnit * 2.4,
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
});

export default Level3Screen;
