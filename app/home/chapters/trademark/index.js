import React from "react";
import { StatusBar, View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, ImageBackground } from "react-native";
import { useRouter } from "expo-router";

const TrademarkScreen = () => {
  const router = useRouter();
  const levels = [1, 2, 3, 4, 5]; // Adjust the number of levels
  const { width, height } = useWindowDimensions(); // Get screen dimensions

  // Calculate button size dynamically to fit in one row when possible
  const buttonSize = Math.min((width - 60) / levels.length, 140); // Max width per button is 140px

  return (
    <ImageBackground
      source={require("../../../../assets/images/trademarkbg.jpg")}
      style={[styles.background, { width, height }]} // ✅ Ensure full screen coverage
      resizeMode="cover"
    >
      <View style={styles.overlay}> {/* ✅ Optional dark overlay for readability */}
        <StatusBar hidden={true} />
        <Text style={styles.title}>Trademark Levels</Text>

        <View style={styles.gridContainer}>
          {levels.map((level) => (
            <TouchableOpacity
              key={level}
              style={[styles.levelButton, { width: buttonSize, height: buttonSize }]}
              onPress={() => router.push(`home/chapters/trademark/level${level}`)}
            >
              <Text style={styles.levelText}>Level {level}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
    backgroundColor: "rgba(0, 0, 0, 0.2)", // ✅ Slight overlay for better text readability
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
  levelButton: {
    backgroundColor: "#ffcc80",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    margin: 8, // Space between buttons
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  levelText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#422800",
    fontFamily: "Montserrat_Bold",
  },
});

export default TrademarkScreen;
