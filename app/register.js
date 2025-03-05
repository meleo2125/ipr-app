import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useAuth } from "../context/AuthContext";
import CustomAlert from "../components/CustomAlert";
import axios from "axios";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");

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

  // Clear validation errors when user types
  useEffect(() => {
    if (password) setPasswordError("");
  }, [password]);

  useEffect(() => {
    if (email) setEmailError("");
  }, [email]);

  // Add handler to close dropdown when clicking outside
  const handleOutsidePress = () => {
    if (showGenderDropdown) {
      setShowGenderDropdown(false);
    }
    // Keyboard dismiss removed
  };

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    let errors = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push(
        "Password must contain at least one special character (!@#$%^&*)"
      );
    }

    return errors.length > 0 ? errors.join("\n") : "";
  };

  const handleRegister = async () => {
    // Reset previous errors
    setPasswordError("");
    setEmailError("");

    // Validation
    if (!name || !email || !password || !confirmPassword || !age || !gender) {
      showCustomAlert("Please fill in all fields");
      return;
    }

    // Basic email format validation
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    // Password format validation
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
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

    // Validate email with Abstract API
    setIsLoading(true);
    try {
      const emailValidation = await validateEmailWithAbstractAPI(email);
      if (!emailValidation.valid) {
        setEmailError(emailValidation.message);
        setIsLoading(false);
        return;
      }

      // Send registration data to get OTP
      const result = await register({
        name,
        email,
        password,
        age: ageNum,
        gender,
      });
      setIsLoading(false);

      if (result.success) {
        // Store user data as JSON to pass to the OTP screen
        const userData = JSON.stringify({
          name,
          email,
          password,
          age: ageNum,
          gender,
        });

        // Navigate to OTP verification screen
        router.push({
          pathname: "/verify-otp",
          params: { email, userData },
        });
      } else {
        // Handle specific error messages
        if (result.message && result.message.includes("email already exists")) {
          setEmailError(
            "This email is already registered. Please use a different email or try logging in."
          );
        } else {
          showCustomAlert(
            result.message || "Registration failed. Please try again."
          );
        }
      }
    } catch (error) {
      setIsLoading(false);
      showCustomAlert(
        "An error occurred during registration. Please try again."
      );
      console.error("Registration error:", error);
    }
  };

  // Updated function to validate email using the Abstract API with axios
  const validateEmailWithAbstractAPI = async (email) => {
    try {
      const response = await axios.get(
        `https://emailvalidation.abstractapi.com/v1/`,
        {
          params: {
            api_key: "2554582a1df641cbacf6b3915eb8490e",
            email: email,
          },
        }
      );

      const data = response.data;

      // Check if the email format is valid
      if (!data.is_valid_format.value) {
        return { valid: false, message: "Email format is invalid" };
      }

      // Check if it's a disposable email
      if (data.is_disposable_email.value) {
        return {
          valid: false,
          message: "Please use a non-disposable email address",
        };
      }

      // Check if there's a suggested correction to the domain
      if (data.autocorrect) {
        return {
          valid: false,
          message: `Did you mean ${data.autocorrect}?`,
        };
      }

      // Check if the email is deliverable
      if (data.deliverability === "UNDELIVERABLE") {
        return {
          valid: false,
          message: "This email address appears to be undeliverable",
        };
      }

      return { valid: true };
    } catch (error) {
      console.error("Email validation failed:", error);
      return { valid: false, message: "Email validation service unavailable" };
    }
  };

  const showCustomAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
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
                style={[styles.input, emailError ? styles.inputError : null]}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
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
                  styles.genderContainer,
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
                style={[styles.input, passwordError ? styles.inputError : null]}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
              <Text style={styles.passwordHint}>
                Password must contain at least 8 characters, one uppercase
                letter, one lowercase letter, and one special character.
              </Text>
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
    </TouchableWithoutFeedback>
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
    position: "relative",
    zIndex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 2, // Ensure row has higher z-index
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
  inputError: {
    borderColor: "#ff6b6b",
    borderWidth: 1,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
    marginTop: 4,
    fontFamily: "Montserrat_Regular",
  },
  passwordHint: {
    color: "#888",
    fontSize: 12,
    marginTop: 4,
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
  genderContainer: {
    marginBottom: 16,
    position: "relative",
    zIndex: 10, // Increased z-index to make sure dropdown is visible
  },
  dropdownList: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    zIndex: 1000, // Higher z-index ensures it appears above other elements
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
