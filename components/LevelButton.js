import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const LevelButton = ({ level, isUnlocked, score, onPress, buttonSize }) => {
  return (
    <View style={styles.buttonWrapper}>
      <TouchableOpacity
        style={[
          styles.levelButton,
          { width: buttonSize, height: buttonSize },
          !isUnlocked && styles.lockedButton,
        ]}
        onPress={onPress}
        disabled={!isUnlocked}
      >
        <Text style={[styles.levelText, !isUnlocked && styles.lockedText]}>
          Level {level}
        </Text>
        
        {isUnlocked && score !== undefined && (
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>{score} pts</Text>
          </View>
        )}
        
        {!isUnlocked && (
          <MaterialIcons name="lock" size={buttonSize * 0.25} color="#422800" style={styles.lockIcon} />
        )}
      </TouchableOpacity>
      {level > 1 && (
        <View 
          style={[
            styles.connector, 
            isUnlocked ? styles.unlockedConnector : styles.lockedConnector
          ]} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  buttonWrapper: {
    alignItems: "center",
    position: "relative",
  },
  levelButton: {
    backgroundColor: "#ffcc80",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    margin: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  lockedButton: {
    backgroundColor: "#d3d3d3",
    opacity: 0.7,
  },
  levelText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#422800",
    fontFamily: "Montserrat_Bold",
  },
  lockedText: {
    color: "#666666",
  },
  lockIcon: {
    position: "absolute",
    top: "60%",
  },
  connector: {
    position: "absolute",
    width: 40,
    height: 4,
    backgroundColor: "#d3d3d3",
    left: -28,
    top: "50%",
    zIndex: -1,
  },
  unlockedConnector: {
    backgroundColor: "#ffcc80",
  },
  lockedConnector: {
    backgroundColor: "#d3d3d3",
  },
  scoreContainer: {
    position: "absolute",
    bottom: 5,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  scoreText: {
    fontSize: 18,
    color: "#422800",
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
});

export default LevelButton;