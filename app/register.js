import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useAuth } from "../context/AuthContext";
import CustomAlert from "../components/CustomAlert";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(""); // ✅ Alert state
  const [showAlert, setShowAlert] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);

  const router = useRouter();
  const { register } = useAuth();

  // Set screen orientation to landscape
  useEffect(() => {
    async function setOrientation() {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    }
    setOrientation();
  }, []);

  const handleRegister = async () => {
    // Validation
    if (!name || !email || !password || !confirmPassword || !age || !gender) {
      showCustomAlert("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      showCustomAlert("Passwords do not match");
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum)) {
      showCustomAlert("Please enter a valid age");
      return;
    }

    setIsLoading(true);
    const result = await register({
      name,
      email,
      password,
      age: ageNum,
      gender,
    });
    setIsLoading(false);

    if (result.success) {
      showCustomAlert("Account created successfully. Please login.");
      router.replace("/login");
    } else {
      showCustomAlert("Error", result.message);
    }
  };
  const showCustomAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <CustomAlert
        visible={showAlert}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Account</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Age</Text>
              <View style={styles.numberSelector}>
                <TouchableOpacity
                  style={styles.numberButton}
                  onPress={() => {
                    const newAge = parseInt(age || "0") - 1;
                    if (newAge >= 1) setAge(newAge.toString());
                  }}
                >
                  <Text style={styles.numberButtonText}>-</Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.numberInput}
                  value={age}
                  onChangeText={(text) => {
                    // Only allow numeric input
                    if (/^\d*$/.test(text)) setAge(text);
                  }}
                  keyboardType="numeric"
                  textAlign="center"
                />

                <TouchableOpacity
                  style={styles.numberButton}
                  onPress={() => {
                    const newAge = parseInt(age || "0") + 1;
                    setAge(newAge.toString());
                  }}
                >
                  <Text style={styles.numberButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={[
                styles.inputContainer,
                styles.halfWidth,
                styles.dropdownContainer,
              ]}
            >
              <Text style={styles.label}>Gender</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowGenderDropdown(!showGenderDropdown)}
              >
                <Text
                  style={
                    gender ? styles.dropdownText : styles.dropdownPlaceholder
                  }
                >
                  {gender || "Select gender"}
                </Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>

              {showGenderDropdown && (
                <View style={styles.dropdownList}>
                  {["Male", "Female", "Other"].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setGender(option);
                        setShowGenderDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Creating Account..." : "Register"}
            </Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  formContainer: {
    width: "70%",
    backgroundColor: "white",
    padding: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#333",
    fontFamily: "Montserrat_Bold",
  },
  inputContainer: {
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#555",
    fontFamily: "Montserrat_Regular",
  },
  input: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
    fontFamily: "Montserrat_Regular",
  },
  button: {
    backgroundColor: "#4a6da7",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  numberSelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    overflow: "hidden",
  },
  numberButton: {
    backgroundColor: "#4a6da7",
    width: 40,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  numberButtonText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
  numberInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    paddingHorizontal: 8,
    fontFamily: "Montserrat_Regular",
    backgroundColor: "#f9f9f9",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  loginText: {
    color: "#555",
    fontSize: 16,
    fontFamily: "Montserrat_Regular",
  },
  loginLink: {
    color: "#4a6da7",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Montserrat_Bold",
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: "Montserrat_Regular",
    color: "#333",
  },
  dropdownPlaceholder: {
    fontSize: 16,
    fontFamily: "Montserrat_Regular",
    color: "#999",
  },
  dropdownIcon: {
    fontSize: 16,
    color: "#555",
  },
  dropdownContainer: {
    position: "relative",
    zIndex: 10, // Ensures dropdown stays above other elements
  },
  dropdownList: {
    position: "absolute",
    top: 50, // Adjust based on your design
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    zIndex: 1000, // Ensure dropdown appears above other elements
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 2, // Space between button and dropdown
  },
  
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownItemText: {
    fontSize: 16,
    fontFamily: "Montserrat_Regular",
    color: "#333",
  },
});
