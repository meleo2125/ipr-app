import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Dimensions,
  Animated,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");
// Use height for determining mobile screens since app is in landscape mode
const isSmallHeight = height < 500;

const ChaptersScreen = () => {
  const router = useRouter();
  const [screenDimensions, setScreenDimensions] = useState({
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  });

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  // Chapter button animations
  const buttonAnimations = [
    useState(new Animated.Value(0))[0],
    useState(new Animated.Value(0))[0],
    useState(new Animated.Value(0))[0],
    useState(new Animated.Value(0))[0],
  ];

  // Handle screen dimension changes
  useEffect(() => {
    const dimensionsHandler = ({ window }) => {
      setScreenDimensions({
        width: window.width,
        height: window.height,
      });
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

  // Start animations when component mounts
  useEffect(() => {
    // Header animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered button animations
    buttonAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: 400 + index * 150,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  // Check if current screen has small height (mobile in landscape)
  const useGridLayout = screenDimensions.height < 500;

  // Chapter data
  const chapters = [
    {
      id: "patent",
      title: "Patent",
      description: "Protection for inventions and technical innovations",
      icon: "bulb-outline",
      colors: ["#ff7043", "#ff5722"],
      route: "home/chapters/patent",
    },
    {
      id: "copyright",
      title: "Copyright",
      description:
        "Rights for creative and artistic works including literature, music and software",
      icon: "document-text-outline",
      colors: ["#42a5f5", "#2196f3"],
      route: "home/chapters/copyrights",
    },
    {
      id: "trademark",
      title: "Trademark",
      description: "Protection for brands, logos and identifiers",
      icon: "shield-checkmark-outline",
      colors: ["#66bb6a", "#4caf50"],
      route: "home/chapters/trademark",
    },
    {
      id: "design",
      title: "Design Right",
      description: "Protection for visual appearance of products",
      icon: "color-palette-outline",
      colors: ["#fbc02d", "#f9a825"],
      route: "home/chapters/design",
    },
  ];

  // Render a chapter card
  const renderChapterCard = (chapter, index) => (
    <Animated.View
      key={chapter.id}
      style={[
        useGridLayout ? styles.gridItem : styles.listItem,
        {
          opacity: buttonAnimations[index],
          transform: [
            {
              translateY: buttonAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.chapterCard}
        onPress={() => router.push(chapter.route)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={chapter.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Ionicons name={chapter.icon} size={28} color="#fff" />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.chapterTitle}>{chapter.title}</Text>
              <Text style={styles.chapterDescription}>
                {chapter.description}
              </Text>
            </View>

            <View style={styles.arrowContainer}>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <ImageBackground
      source={require("../../../assets/images/bg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient
        colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)"]}
        style={styles.overlay}
      >
        <StatusBar hidden={true} />

        {/* Header */}
        <Animated.View
          style={[
            styles.headerContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.titleContainer}>
            <Ionicons
              name="library"
              size={32}
              color="#fff"
              style={styles.titleIcon}
            />
            <Text style={styles.title}>IPR Learning Modules</Text>
          </View>
          <Text style={styles.subtitle}>
            Select a chapter to begin learning
          </Text>
        </Animated.View>

        {/* Chapters - Grid for small height, List for larger height */}
        {useGridLayout ? (
          // Grid layout for small height screens
          <View style={styles.gridContainer}>
            <View style={styles.gridRow}>
              {renderChapterCard(chapters[0], 0)}
              {renderChapterCard(chapters[1], 1)}
            </View>
            <View style={styles.gridRow}>
              {renderChapterCard(chapters[2], 2)}
              {renderChapterCard(chapters[3], 3)}
            </View>
          </View>
        ) : (
          // List layout for larger height screens
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {chapters.map((chapter, index) =>
              renderChapterCard(chapter, index)
            )}
          </ScrollView>
        )}
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  headerContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  titleIcon: {
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "Montserrat_Bold",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: "Montserrat_Regular",
    textAlign: "center",
  },
  // List view styles (for larger screens)
  scrollContainer: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    paddingBottom: 30,
    alignItems: "center",
  },
  listItem: {
    width: "100%",
    marginBottom: 16,
  },
  // Grid view styles (for small height screens)
  gridContainer: {
    flex: 1,
    justifyContent: "center",
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  gridItem: {
    width: "48%",
  },
  // Card styles
  chapterCard: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  cardGradient: {
    width: "100%",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "Montserrat_Bold",
    marginBottom: 4,
  },
  chapterDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontFamily: "Montserrat_Regular",
  },
  arrowContainer: {
    width: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChaptersScreen;
