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
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";

import EndScreen from "../../../../components/EndScreen";
import { useAuth } from "../../../../context/AuthContext";
import { API_URL } from "../../../../api/config";

// Get screen dimensions for responsive sizing
const { width: windowWidth, height: windowHeight } = Dimensions.get("window");

const Level2Screen = () => {
  const [step, setStep] = useState(0);
  const [gamePhase, setGamePhase] = useState("intro"); // intro, selection, search, results, end
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { userInfo } = useAuth();

  // Narrator continuous animation
  const narratorYPosition = useRef(new Animated.Value(0)).current;

  // Patent topics to choose from
  const patentTopics = [
    {
      id: 1,
      title: "Smart Water Bottle",
      description: "A water bottle that tracks hydration levels and reminds you to drink",
      patented: true,
    },
    {
      id: 2,
      title: "Foldable Bicycle Helmet",
      description: "Protective helmet that folds flat for easy storage",
      patented: true,
    },
    {
      id: 3,
      title: "Solar Powered Backpack",
      description: "Backpack with integrated solar panels to charge devices",
      patented: true,
    },
    {
      id: 4,
      title: "Holographic Keyboard",
      description: "Keyboard that projects onto any surface and detects finger movements",
      patented: false, // This is the unique topic without a patent
    },
  ];

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
  }, [step, gamePhase]);

  // Narrator dialogues to introduce patent search
  const dialogues = [
    "Welcome back! Now that you understand what can be patented, let's learn about patent searches.",
    "Before filing for a patent, inventors need to check if something similar already exists.",
    "A Patent Search Report (PSR) helps determine if your invention is truly novel.",
    "If someone has already patented a similar idea, your application might be rejected.",
    "Today, we'll practice conducting a patent search to find an idea that hasn't been patented yet.",
    "I'll give you several invention ideas, and you'll need to find which one doesn't already have a patent.",
    "Let's get started with your patent search journey!",
  ];

  // Move to the next dialogue
  const handleNextDialogue = () => {
    if (step < dialogues.length - 1) {
      setStep(step + 1);
    } else {
      setStartTime(Date.now());
      setGamePhase("selection");
    }
  };

  // Handle topic selection
  const selectTopic = (topic) => {
    setSelectedTopic(topic);
    setGamePhase("search");
    setSearchText(topic.title);
  };

  // Simulate patent search
  const performSearch = () => {
    setIsSearching(true);
    setAttempts(attempts + 1);
    
    // Simulate a delay for the search
    setTimeout(() => {
      setIsSearching(false);
      
      if (!selectedTopic.patented) {
        // Found the non-patented topic
        const endTime = Date.now();
        const totalTime = Math.floor((endTime - startTime) / 1000);
        setTimeTaken(totalTime);
        
        // Calculate score based on attempts (fewer attempts = higher score)
        const calculatedScore = Math.max(100 - ((attempts) * 20), 20);
        setScore(calculatedScore);
        
        setGamePhase("end");
        setShowEndScreen(true);
      } else {
        // This topic is already patented
        generateSearchResults(selectedTopic);
        setGamePhase("results");
      }
    }, 2000);
  };

  // Generate fake search results for patented topics
  const generateSearchResults = (topic) => {
    // Create 3-5 fake search results related to the topic
    const results = [];
    const resultCount = Math.floor(Math.random() * 3) + 3; // 3-5 results
    
    for (let i = 0; i < resultCount; i++) {
      results.push({
        id: `result-${i}`,
        title: `${topic.title} ${["System", "Method", "Apparatus", "Device", "Technology"][i % 5]}`,
        patentNumber: `US${Math.floor(Math.random() * 10000000) + 7000000}`,
        year: 2010 + Math.floor(Math.random() * 14), // 2010-2023
        abstract: `This patent describes a ${topic.description.toLowerCase()} that utilizes ${["advanced sensors", "innovative materials", "AI technology", "proprietary algorithms", "wireless connectivity"][i % 5]}.`,
      });
    }
    
    setSearchResults(results);
  };

  // Go back to topic selection
  const backToSelection = () => {
    setGamePhase("selection");
    setSelectedTopic(null);
    setSearchResults([]);
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
        levelNumber: 2,
        score,
        timeTaken,
      });

      const response = await fetch(`${API_URL}/api/save-level`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userInfo.email,
          chapter: "patent",
          levelNumber: 2,
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
    setGamePhase("intro");
    setSelectedTopic(null);
    setSearchResults([]);
    setAttempts(0);
    setScore(0);
    setTimeTaken(0);
    setShowEndScreen(false);
  };

  // Render patent topic selection
  const renderTopicSelection = () => (
    <View style={styles.selectionContainer}>
      <Text style={styles.title}>Select an Invention to Patent</Text>
      <Text style={styles.subtitle}>
        Choose one topic to conduct a patent search
      </Text>
      
      <View style={styles.topicsGrid}>
        {patentTopics.map((topic) => (
          <TouchableOpacity
            key={topic.id}
            style={styles.topicItem}
            onPress={() => selectTopic(topic)}
          >
            <Text style={styles.topicTitle}>{topic.title}</Text>
            <Text style={styles.topicDescription}>{topic.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.attemptsDisplay}>
        <Text style={styles.attemptsText}>Attempts: {attempts}</Text>
      </View>
    </View>
  );

  // Render patent search screen
  const renderSearchScreen = () => (
    <View style={styles.searchContainer}>
      <Text style={styles.title}>Patent Database Search</Text>
      
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search for patents..."
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={performSearch}
          disabled={isSearching}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
      
      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Searching patent database...</Text>
        </View>
      ) : (
        <View style={styles.searchInstructions}>
          <Text style={styles.instructionText}>Click "Search" to check if this invention already has a patent</Text>
        </View>
      )}
      
      <TouchableOpacity
        style={styles.backButton}
        onPress={backToSelection}
        disabled={isSearching}
      >
        <Text style={styles.backButtonText}>Choose Different Topic</Text>
      </TouchableOpacity>
    </View>
  );

  // Render search results
  const renderSearchResults = () => (
    <View style={styles.resultsContainer}>
      <Text style={styles.title}>Search Results</Text>
      
      {searchResults.length > 0 ? (
        <>
          <Text style={styles.resultMessage}>
            We found {searchResults.length} existing patents for "{selectedTopic.title}"
          </Text>
          
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            style={styles.resultsList}
            renderItem={({ item }) => (
              <View style={styles.resultItem}>
                <Text style={styles.resultTitle}>{item.title}</Text>
                <Text style={styles.resultPatentNum}>Patent #{item.patentNumber} ({item.year})</Text>
                <Text style={styles.resultAbstract}>{item.abstract}</Text>
              </View>
            )}
          />
          
          <Text style={styles.resultConclusion}>
            This invention already has patents. Try a different idea!
          </Text>
        </>
      ) : (
        <Text style={styles.noResultsText}>No results found.</Text>
      )}
      
      <TouchableOpacity
        style={styles.backButton}
        onPress={backToSelection}
      >
        <Text style={styles.backButtonText}>Choose Different Topic</Text>
      </TouchableOpacity>
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
        {showEndScreen ? (
          <EndScreen
            score={score}
            timeTaken={timeTaken}
            resetGame={resetGame}
          />
        ) : gamePhase === "selection" ? (
          /* Topic Selection Screen */
          renderTopicSelection()
        ) : gamePhase === "search" ? (
          /* Search Screen */
          renderSearchScreen()
        ) : gamePhase === "results" ? (
          /* Search Results Screen */
          renderSearchResults()
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
  // Topic Selection Styles
  selectionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: windowWidth * 0.02,
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
    color: "#ecf0f1",
    marginBottom: windowHeight * 0.02,
    textAlign: "center",
    fontFamily: "Montserrat_Regular",
  },
  topicsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "80%",
    marginBottom: windowHeight * 0.02,
  },
  topicItem: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    padding: windowWidth * 0.02,
    margin: windowWidth * 0.01,
    width: "45%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  topicTitle: {
    fontSize: windowWidth * 0.018,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: windowHeight * 0.01,
    textAlign: "center",
    fontFamily: "Montserrat_Bold",
  },
  topicDescription: {
    fontSize: windowWidth * 0.014,
    color: "#7f8c8d",
    textAlign: "center",
    fontFamily: "Montserrat_Regular",
  },
  attemptsDisplay: {
    position: "absolute",
    top: windowHeight * 0.01,
    right: windowWidth * 0.02,
    backgroundColor: "rgba(52, 152, 219, 0.8)",
    paddingVertical: windowHeight * 0.005,
    paddingHorizontal: windowWidth * 0.02,
    borderRadius: 20,
  },
  attemptsText: {
    color: "#fff",
    fontSize: windowWidth * 0.016,
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
  // Search Screen Styles
  searchContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: windowWidth * 0.02,
  },
  searchBox: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 25,
    width: "70%",
    marginVertical: windowHeight * 0.02,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    paddingVertical: windowHeight * 0.01,
    paddingHorizontal: windowWidth * 0.02,
    fontSize: windowWidth * 0.016,
    fontFamily: "Montserrat_Regular",
  },
  searchButton: {
    backgroundColor: "#3498db",
    paddingVertical: windowHeight * 0.01,
    paddingHorizontal: windowWidth * 0.03,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  searchButtonText: {
    color: "#fff",
    fontSize: windowWidth * 0.016,
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
  loadingContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    padding: windowWidth * 0.03,
    width: "70%",
    alignItems: "center",
    marginBottom: windowHeight * 0.02,
  },
  loadingText: {
    marginTop: windowHeight * 0.01,
    fontSize: windowWidth * 0.016,
    color: "#2c3e50",
    fontFamily: "Montserrat_Regular",
  },
  searchInstructions: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    padding: windowWidth * 0.03,
    width: "70%",
    alignItems: "center",
    marginBottom: windowHeight * 0.02,
  },
  instructionText: {
    fontSize: windowWidth * 0.016,
    color: "#2c3e50",
    textAlign: "center",
    fontFamily: "Montserrat_Regular",
  },
  backButton: {
    backgroundColor: "#95a5a6",
    paddingVertical: windowHeight * 0.01,
    paddingHorizontal: windowWidth * 0.03,
    borderRadius: 25,
    alignItems: "center",
    marginTop: windowHeight * 0.02,
  },
  backButtonText: {
    color: "#fff",
    fontSize: windowWidth * 0.016,
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
  // Results Screen Styles
  resultsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: windowWidth * 0.02,
  },
  resultMessage: {
    fontSize: windowWidth * 0.018,
    color: "#ecf0f1",
    marginBottom: windowHeight * 0.02,
    textAlign: "center",
    fontFamily: "Montserrat_Regular",
  },
  resultsList: {
    width: "80%",
    maxHeight: windowHeight * 0.4,
    marginBottom: windowHeight * 0.02,
  },
  resultItem: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    padding: windowWidth * 0.02,
    marginBottom: windowHeight * 0.01,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  resultTitle: {
    fontSize: windowWidth * 0.016,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: windowHeight * 0.005,
    fontFamily: "Montserrat_Bold",
  },
  resultPatentNum: {
    fontSize: windowWidth * 0.014,
    color: "#3498db",
    marginBottom: windowHeight * 0.005,
    fontFamily: "Montserrat_Regular",
  },
  resultAbstract: {
    fontSize: windowWidth * 0.014,
    color: "#7f8c8d",
    fontFamily: "Montserrat_Regular",
  },
  resultConclusion: {
    fontSize: windowWidth * 0.018,
    color: "#e74c3c",
    marginBottom: windowHeight * 0.02,
    textAlign: "center",
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
  noResultsText: {
    fontSize: windowWidth * 0.018,
    color: "#ecf0f1",
    marginBottom: windowHeight * 0.02,
    textAlign: "center",
    fontFamily: "Montserrat_Regular",
  },
});

export default Level2Screen;