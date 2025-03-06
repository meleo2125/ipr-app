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
  const [step, setStep] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [currentForm, setCurrentForm] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [draggableItems, setDraggableItems] = useState([]);
  const [dropZones, setDropZones] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const { userInfo } = useAuth();

  // Narrator continuous animation
  const narratorYPosition = useRef(new Animated.Value(0)).current;

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
  }, [step, isGameActive]);

  // Narrator dialogues to introduce patent filing process
  const dialogues = [
    "Now it's time to file your patent! Let me guide you through the process.",
    "You'll need to fill out several important forms, each with a specific purpose.",
    "Form 1 contains details about the applicant and basic information about your patent.",
    "Form 2 includes diagrams and technical specifications of your invention.",
    "Form 3 is a statement and undertaking under Section 8 of the Patents Act.",
    "Form 4 provides information about inventorship and requires supporting documents.",
    "If you're a startup or small entity, Form 28 allows for an 80% fee reduction!",
    "Let's practice filling these forms correctly in our mini-game!",
  ];

  // Forms and their fields data
  const forms = [
    {
      name: "Form 1: Application for Patent",
      description: "Contains applicant details and basic patent information",
      fields: [
        {
          id: "applicantName",
          label: "Applicant Name",
          correctItem: "inventorName",
          hint: "The person or company applying for the patent",
        },
        {
          id: "inventionTitle",
          label: "Invention Title",
          correctItem: "patentTitle",
          hint: "The official name of your invention",
        },
        {
          id: "applicantAddress",
          label: "Applicant Address",
          correctItem: "address",
          hint: "Legal address of the applicant",
        },
      ],
    },
    {
      name: "Form 2: Provisional/Complete Specification",
      description: "Technical details and diagrams of the invention",
      fields: [
        {
          id: "technicalField",
          label: "Technical Field",
          correctItem: "fieldDescription",
          hint: "Area of technology the invention belongs to",
        },
        {
          id: "inventionDiagram",
          label: "Invention Diagram",
          correctItem: "diagram",
          hint: "Visual representation of your invention",
        },
        {
          id: "workingMethod",
          label: "Working Method",
          correctItem: "process",
          hint: "How the invention operates or functions",
        },
      ],
    },
    {
      name: "Form 4: Statement of Inventorship",
      description:
        "Details about who invented the patent and supporting documents",
      fields: [
        {
          id: "inventorDeclaration",
          label: "Inventor Declaration",
          correctItem: "declaration",
          hint: "Statement confirming true inventorship",
        },
        {
          id: "employmentProof",
          label: "Employment Proof",
          correctItem: "employmentDocument",
          hint: "Document showing employment relationship if applicable",
        },
        {
          id: "assignmentDeed",
          label: "Assignment Deed",
          correctItem: "legalAssignment",
          hint: "Document transferring ownership rights if applicable",
        },
      ],
    },
    {
      name: "Form 28: Small Entity Status",
      description:
        "For startups and small entities to get an 80% fee reduction",
      fields: [
        {
          id: "entityCategory",
          label: "Entity Category",
          correctItem: "category",
          hint: "Whether you're a startup, small entity, or individual",
        },
        {
          id: "revenueProof",
          label: "Revenue Proof",
          correctItem: "financialDocument",
          hint: "Document showing your annual revenue",
        },
        {
          id: "certifications",
          label: "Certifications",
          correctItem: "officialCertificate",
          hint: "Any official recognition as a startup or small entity",
        },
      ],
    },
  ];

  // Draggable items for the current form
  const formItems = [
    // Form 1 items
    [
      { id: "inventorName", label: "TechGenius Inc." },
      { id: "patentTitle", label: "Smart Energy Converter" },
      { id: "address", label: "123 Innovation St, Tech City" },
      { id: "wrongItem1", label: "Patent Application Fee" },
      { id: "wrongItem2", label: "Diagram of Invention" },
    ],
    // Form 2 items
    [
      { id: "fieldDescription", label: "Renewable Energy Technology" },
      { id: "diagram", label: "[Technical Diagram]" },
      { id: "process", label: "Converts kinetic energy to electricity" },
      { id: "wrongItem1", label: "Investor Details" },
      { id: "wrongItem2", label: "Marketing Strategy" },
    ],
    // Form 4 items
    [
      { id: "declaration", label: "I am the true inventor" },
      { id: "employmentDocument", label: "Employment Contract" },
      { id: "legalAssignment", label: "Rights Transfer Agreement" },
      { id: "wrongItem1", label: "Patent Renewal Fee" },
      { id: "wrongItem2", label: "User Manual" },
    ],
    // Form 28 items
    [
      { id: "category", label: "Startup" },
      { id: "financialDocument", label: "Annual Revenue Statement" },
      { id: "officialCertificate", label: "Startup Recognition Certificate" },
      { id: "wrongItem1", label: "International Patent Application" },
      { id: "wrongItem2", label: "Product Brochure" },
    ],
  ];

  // Initialize draggable items and drop zones with improved positioning
  useEffect(() => {
    if (isGameActive) {
      // Adjust spacing for better visibility - ensure items are fully visible
      const itemWidth = windowWidth * 0.35; // Reduced width to fit better
      const itemHeight = baseUnit * 8;
      const itemMargin = baseUnit * 1.5; // Reduced margin for more compact layout

      // Left side for draggable items - adjusted to ensure all items are visible
      const itemsStartX = windowWidth * 0.05; // Start closer to the left edge
      const itemsStartY = windowHeight * 0.2; // Start higher on the screen

      // Shuffle the items for the current form
      const shuffledItems = [...formItems[currentForm]].sort(
        () => Math.random() - 0.5
      );

      // Then use shuffledItems instead of formItems[currentForm]
      const currentItems = shuffledItems.map((item, index) => ({
        ...item,
        position: new Animated.ValueXY({
          x: itemsStartX,
          y: itemsStartY + index * (itemHeight + itemMargin),
        }),
        isDropped: false,
        originalPosition: {
          x: itemsStartX,
          y: itemsStartY + index * (itemHeight + itemMargin),
        },
      }));

      setDraggableItems(currentItems);

      // Right side for drop zones - adjusted to improve visibility
      const zoneWidth = windowWidth * 0.4;
      const zoneHeight = baseUnit * 8; // Reduced height
      const zoneMargin = baseUnit * 3; // Reduced margin
      const zonesStartX = windowWidth * 0.55; // More space between columns
      const zonesStartY = windowHeight * 0.2; // Start higher

      const newDropZones = forms[currentForm].fields.map((field, index) => ({
        ...field,
        position: {
          x: zonesStartX,
          y: zonesStartY + index * (zoneHeight + zoneMargin),
          width: zoneWidth,
          height: zoneHeight,
        },
        filled: false,
        filledBy: null,
      }));

      setDropZones(newDropZones);
    }
  }, [isGameActive, currentForm]);

  // Improved PanResponder to completely prevent text selection
  const createPanResponder = (index) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false, // Prevent termination
      onPanResponderGrant: () => {
        // Make sure we're not trying to drag an already dropped item
        if (draggableItems[index].isDropped) return;

        // Prevent selection by disabling default behavior
        draggableItems[index].position.setOffset({
          x: draggableItems[index].position.x._value,
          y: draggableItems[index].position.y._value,
        });
        draggableItems[index].position.setValue({ x: 0, y: 0 });

        // Bring the dragged item to front with elevated zIndex
        const updatedItems = [...draggableItems];
        updatedItems.forEach((item, i) => {
          item.zIndex = i === index ? 1000 : 100;
        });
        setDraggableItems(updatedItems);
      },
      onPanResponderMove: (_, gesture) => {
        // Manual update of position to have more control
        if (draggableItems[index].isDropped) return;

        Animated.event(
          [
            null,
            {
              dx: draggableItems[index].position.x,
              dy: draggableItems[index].position.y,
            },
          ],
          { useNativeDriver: false }
        )(_, gesture);
      },
      onPanResponderRelease: (_, gesture) => {
        if (draggableItems[index].isDropped) return;

        draggableItems[index].position.flattenOffset();

        // Calculate the item's center position
        const itemCenter = {
          x: draggableItems[index].position.x._value + windowWidth * 0.175, // Half of item width
          y: draggableItems[index].position.y._value + baseUnit * 4, // Half of item height
        };

        // Check if the item is dropped in a valid zone
        let droppedZone = null;
        let droppedZoneIndex = -1;

        dropZones.forEach((zone, zoneIndex) => {
          if (
            itemCenter.x > zone.position.x &&
            itemCenter.x < zone.position.x + zone.position.width &&
            itemCenter.y > zone.position.y &&
            itemCenter.y < zone.position.y + zone.position.height &&
            !zone.filled // Only allow dropping in unfilled zones
          ) {
            droppedZone = zone;
            droppedZoneIndex = zoneIndex;
          }
        });

        if (droppedZone) {
          // Item dropped in a zone, check if correct
          const isCorrect =
            droppedZone.correctItem === draggableItems[index].id;

          if (isCorrect) {
            // Correct match
            setScore((prevScore) => prevScore + 10);

            // Show feedback
            setFeedbackMessage("Correct! +10 points");
            setShowFeedback(true);
            setTimeout(() => setShowFeedback(false), 1500);

            // Snap to the center of the drop zone
            Animated.spring(draggableItems[index].position, {
              toValue: {
                x:
                  droppedZone.position.x +
                  droppedZone.position.width / 2 -
                  windowWidth * 0.175,
                y:
                  droppedZone.position.y +
                  droppedZone.position.height / 2 -
                  baseUnit * 4,
              },
              useNativeDriver: false,
            }).start();

            // Mark item as dropped and update zone as filled
            const updatedItems = [...draggableItems];
            updatedItems[index].isDropped = true;
            setDraggableItems(updatedItems);

            const updatedZones = [...dropZones];
            updatedZones[droppedZoneIndex].filled = true;
            updatedZones[droppedZoneIndex].filledBy = draggableItems[index].id;
            setDropZones(updatedZones);

            // Check if all correct items are dropped
            const allCorrectDropped = updatedZones.every(
              (zone) => zone.filled && zone.filledBy === zone.correctItem
            );

            if (allCorrectDropped) {
              // All correct items placed, move to next form
              setTimeout(() => {
                if (currentForm < forms.length - 1) {
                  setCurrentForm(currentForm + 1);
                } else {
                  // Game completed
                  const endTime = Date.now();
                  const totalTime = Math.floor((endTime - startTime) / 1000);
                  setTimeTaken(totalTime);
                  setIsGameActive(false);
                  setShowEndScreen(true);
                }
              }, 1500);
            }
          } else {
            // Wrong match
            setScore((prevScore) => Math.max(0, prevScore - 5));

            // Show feedback
            setFeedbackMessage("Incorrect! -5 points");
            setShowFeedback(true);
            setTimeout(() => setShowFeedback(false), 1500);

            // Return to original position
            Animated.spring(draggableItems[index].position, {
              toValue: {
                x: draggableItems[index].originalPosition.x,
                y: draggableItems[index].originalPosition.y,
              },
              useNativeDriver: false,
            }).start();
          }
        } else {
          // Not dropped in any zone, return to original position
          Animated.spring(draggableItems[index].position, {
            toValue: {
              x: draggableItems[index].originalPosition.x,
              y: draggableItems[index].originalPosition.y,
            },
            useNativeDriver: false,
          }).start();
        }
      },
    });
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

      console.log("Sending level data:", {
        email: userInfo.email,
        chapter: "patent",
        levelNumber: 3,
        score,
        timeTaken,
      });

      const response = await fetch(`${API_URL}/api/save-level`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userInfo.email,
          chapter: "patent",
          levelNumber: 3,
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
    setCurrentForm(0);
    setScore(0);
    setTimeTaken(0);
    setShowEndScreen(false);
    setDraggableItems([]);
    setDropZones([]);
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
            <Text style={styles.title}>Complete the Forms</Text>
            <Text style={styles.subtitle}>
              Drag the correct information to each form field
            </Text>

            <View style={styles.formTitleContainer}>
              <Text style={styles.formTitle}>{forms[currentForm].name}</Text>
              <Text style={styles.formDescription}>
                {forms[currentForm].description}
              </Text>
              <Text style={styles.counter}>
                Form {currentForm + 1}/{forms.length}
              </Text>
            </View>

            {/* Game Area with improved left-right separation */}
            <View style={styles.gameArea}>
              {/* Left side label */}
              <View style={styles.sideLabel}>
                <Text style={styles.sideLabelText}>Available Information</Text>
              </View>

              {/* Right side label */}
              <View style={[styles.sideLabel, styles.rightSideLabel]}>
                <Text style={styles.sideLabelText}>Form Fields</Text>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Drop Zones - Right side */}
              {dropZones.map((zone, index) => (
                <View
                  key={zone.id}
                  style={[
                    styles.dropZone,
                    {
                      left: zone.position.x,
                      top: zone.position.y,
                      width: zone.position.width,
                      height: zone.position.height,
                    },
                    zone.filled && styles.filledZone,
                  ]}
                >
                  <Text style={styles.dropZoneLabel}>{zone.label}</Text>
                  <Text style={styles.dropZoneHint}>{zone.hint}</Text>
                </View>
              ))}

              {/* Draggable Items - Left side */}
              {draggableItems.map((item, index) => (
                <Animated.View
                  key={item.id}
                  style={[
                    styles.draggableItem,
                    {
                      transform: item.position.getTranslateTransform(),
                      zIndex: item.zIndex || 100,
                      width: windowWidth * 0.35, // Consistent width
                      height: baseUnit * 8,
                    },
                    item.isDropped && styles.droppedItem,
                  ]}
                  {...(!item.isDropped
                    ? createPanResponder(index).panHandlers
                    : {})}
                >
                  <Text
                    style={styles.draggableItemText}
                    selectable={false} // Explicitly disable text selection
                  >
                    {item.label}
                  </Text>
                </Animated.View>
              ))}
            </View>

            {/* Feedback Message */}
            {showFeedback && (
              <View style={styles.feedbackContainer}>
                <Text style={styles.feedbackText}>{feedbackMessage}</Text>
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
      marginBottom: baseUnit * 1.2,
      textAlign: "center",
      fontFamily: "Montserrat_Regular",
      userSelect: "none",
    },
    formTitleContainer: {
      backgroundColor: "rgba(41, 128, 185, 0.9)",
      borderRadius: baseUnit * 2,
      padding: baseUnit * 2, 
      width: "80%",
      alignItems: "center",
      marginBottom: baseUnit * 1.8, 
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 6,
    },
    formTitle: {
      fontSize: baseUnit * 2.8,
      color: "#ffffff",
      textAlign: "center",
      fontWeight: "bold",
      fontFamily: "Montserrat_Bold",
      userSelect: "none",
    },
    formDescription: {
      fontSize: baseUnit * 2.3, 
      color: "#ecf0f1",
      textAlign: "center",
      marginTop: baseUnit * 0.8, 
      fontFamily: "Montserrat_Regular",
      userSelect: "none",
    },
    counter: {
      fontSize: baseUnit * 2, 
      color: "#ecf0f1",
      marginTop: baseUnit * 0.8, 
      fontFamily: "Montserrat_Regular",
      userSelect: "none",
    },
    gameArea: {
      width: "100%",
      height: "70%",
      position: "relative",
    },
    sideLabel: {
      position: "absolute",
      top: baseUnit * 1,
      left: windowWidth * 0.15,
      backgroundColor: "rgba(41, 128, 185, 0.8)",
      paddingVertical: baseUnit * 1, 
      paddingHorizontal: baseUnit * 2, 
      borderRadius: baseUnit * 1,
      zIndex: 10,
    },
    rightSideLabel: {
      left: windowWidth * 0.65,
    },
    sideLabelText: {
      color: "#ffffff",
      fontSize: baseUnit * 2.5, 
      fontWeight: "bold",
      fontFamily: "Montserrat_Bold",
      userSelect: "none",
    },
    divider: {
      position: "absolute",
      top: baseUnit * 6,
      left: windowWidth * 0.48,
      width: 2,
      height: "90%",
      backgroundColor: "rgba(255, 255, 255, 0.5)",
      zIndex: 5,
    },
    dropZone: {
      position: "absolute",
      backgroundColor: "rgba(255, 255, 255, 0.85)",
      borderRadius: baseUnit * 1.5,
      borderWidth: 2,
      borderColor: "#3498db",
      borderStyle: "dashed",
      padding: baseUnit * 1.8, 
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1,
    },
    filledZone: {
      borderStyle: "solid",
      borderColor: "#27ae60",
      backgroundColor: "rgba(255, 255, 255, 0.7)",
    },
    dropZoneLabel: {
      fontSize: baseUnit * 3,
      fontWeight: "bold",
      color: "#2c3e50",
      marginBottom: baseUnit * 0.7, 
      fontFamily: "Montserrat_Bold",
      textAlign: "center",
      userSelect: "none",
    },
    dropZoneHint: {
      fontSize: baseUnit * 2, 
      color: "#7f8c8d",
      textAlign: "center",
      fontFamily: "Montserrat_Regular",
      userSelect: "none",
    },
    draggableItem: {
      position: "absolute",
      backgroundColor: "#3498db",
      borderRadius: baseUnit * 1.5,
      padding: baseUnit * 1.8, 
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5,
      touchAction: "none",
    },
    draggableItemText: {
      fontSize: baseUnit * 3, 
      color: "#ffffff",
      textAlign: "center",
      fontFamily: "Montserrat_Regular",
      fontWeight: "500",
      userSelect: "none",
      pointerEvents: "none",
    },
    droppedItem: {
      backgroundColor: "#27ae60",
      pointerEvents: "none",
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
