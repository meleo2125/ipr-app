import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";

const ChaptersScreen = () => {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../../../assets/images/bg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <StatusBar hidden={true} />
        <Text style={styles.title}>Chapters</Text>

        {/* Chapter Buttons */}
        <TouchableOpacity
          style={[styles.button, styles.patent]}
          onPress={() => router.push("home/chapters/patent")}
        >
          <Text style={styles.buttonText}>Patent</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.copyright]}
          onPress={() => router.push("home/chapters/copyrights")}
        >
          <Text style={styles.buttonText}>Copyright</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.trademark]}
          onPress={() => router.push("home/chapters/trademark")}
        >
          <Text style={styles.buttonText}>Trademark</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.designRight]}
          onPress={() => router.push("home/chapters/design")}
        >
          <Text style={styles.buttonText}>Design Right</Text>
        </TouchableOpacity>
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
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)", // Dark overlay for better contrast
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    fontFamily: "Montserrat_Bold",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  button: {
    width: "80%",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Montserrat_Bold",
    color: "#fff",
  },
  patent: {
    backgroundColor: "#ff7043",
  },
  copyright: {
    backgroundColor: "#42a5f5",
  },
  trademark: {
    backgroundColor: "#66bb6a",
  },
  designRight: {
    backgroundColor: "#fbc02d",
  },
});

export default ChaptersScreen;
