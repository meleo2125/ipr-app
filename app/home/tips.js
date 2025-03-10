import React, { useState, useEffect } from "react";
import {
  StatusBar,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Animated,
} from "react-native";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Picker } from "@react-native-picker/picker";
import CustomAlert from "../../components/CustomAlert";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { GEMINI_KEY } from "@env";

const TipsScreen = () => {
  // Form data state
  const [idea, setIdea] = useState("");
  const [field, setField] = useState("");
  const [implementation, setImplementation] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [marketPotential, setMarketPotential] = useState("");
  const [innovationLevel, setInnovationLevel] = useState("");
  const [durationOfProtection, setDurationOfProtection] = useState("");
  const [typeOfContent, setTypeOfContent] = useState("");
  const [publicAvailability, setPublicAvailability] = useState("");
  const [collaboration, setCollaboration] = useState("");
  const [geographicScope, setGeographicScope] = useState("");

  // UI state
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Response state
  const [showResponse, setShowResponse] = useState(false);
  const [responseData, setResponseData] = useState({
    recommendation: "",
    rationale: "",
    details: "",
  });

  // Animation effect when step changes
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    };
  }, [currentStep]);

  // Form steps configuration
  const formSteps = [
    {
      title: "Basic Information",
      fields: [
        {
          label: "Your Idea",
          component: (
            <TextInput
              style={styles.input}
              placeholder="Describe your idea briefly"
              value={idea}
              onChangeText={setIdea}
            />
          ),
          isValid: () => idea.trim().length > 0,
        },
        {
          label: "Field/Industry",
          component: (
            <TextInput
              style={styles.input}
              placeholder="E.g., Technology, Healthcare, Education"
              value={field}
              onChangeText={setField}
            />
          ),
          isValid: () => field.trim().length > 0,
        },
        {
          label: "Implementation Details",
          component: (
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: "top" }]}
              placeholder="How will your idea be implemented?"
              value={implementation}
              onChangeText={setImplementation}
              multiline
              numberOfLines={4}
            />
          ),
          isValid: () => implementation.trim().length > 0,
        },
      ],
    },
    {
      title: "Market & Audience",
      fields: [
        {
          label: "Target Audience",
          component: (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={targetAudience}
                style={styles.picker}
                onValueChange={(itemValue) => setTargetAudience(itemValue)}
              >
                <Picker.Item label="Select Target Audience" value="" />
                <Picker.Item label="General Public" value="General Public" />
                <Picker.Item
                  label="Industry Professionals"
                  value="Industry Professionals"
                />
                <Picker.Item
                  label="Academic Institutions"
                  value="Academic Institutions"
                />
                <Picker.Item
                  label="Startups & Entrepreneurs"
                  value="Startups & Entrepreneurs"
                />
              </Picker>
            </View>
          ),
          isValid: () => targetAudience.length > 0,
        },
        {
          label: "Market Potential",
          component: (
            <TextInput
              style={styles.input}
              placeholder="Describe the market potential"
              value={marketPotential}
              onChangeText={setMarketPotential}
            />
          ),
          isValid: () => marketPotential.trim().length > 0,
        },
        {
          label: "Innovation Level",
          component: (
            <TextInput
              style={styles.input}
              placeholder="How innovative is your idea?"
              value={innovationLevel}
              onChangeText={setInnovationLevel}
            />
          ),
          isValid: () => innovationLevel.trim().length > 0,
        },
      ],
    },
    {
      title: "Protection Details",
      fields: [
        {
          label: "Duration of Protection",
          component: (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={durationOfProtection}
                style={styles.picker}
                onValueChange={(itemValue) =>
                  setDurationOfProtection(itemValue)
                }
              >
                <Picker.Item label="Select Duration" value="" />
                <Picker.Item
                  label="Short-term (1-5 years)"
                  value="Short-term"
                />
                <Picker.Item
                  label="Medium-term (5-10 years)"
                  value="Medium-term"
                />
                <Picker.Item label="Long-term (10+ years)" value="Long-term" />
              </Picker>
            </View>
          ),
          isValid: () => durationOfProtection.length > 0,
        },
        {
          label: "Type of Content",
          component: (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={typeOfContent}
                style={styles.picker}
                onValueChange={(itemValue) => setTypeOfContent(itemValue)}
              >
                <Picker.Item label="Select Content Type" value="" />
                <Picker.Item label="Literary Work" value="Literary Work" />
                <Picker.Item label="Music" value="Music" />
                <Picker.Item label="Software" value="Software" />
                <Picker.Item label="Invention" value="Invention" />
                <Picker.Item label="Design" value="Design" />
                <Picker.Item label="Brand/Logo" value="Brand/Logo" />
              </Picker>
            </View>
          ),
          isValid: () => typeOfContent.length > 0,
        },
      ],
    },
    {
      title: "Additional Information",
      fields: [
        {
          label: "Public Availability",
          component: (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={publicAvailability}
                style={styles.picker}
                onValueChange={(itemValue) => setPublicAvailability(itemValue)}
              >
                <Picker.Item label="Select Availability" value="" />
                <Picker.Item label="Public" value="Public" />
                <Picker.Item label="Confidential" value="Confidential" />
                <Picker.Item label="Limited Access" value="Limited Access" />
              </Picker>
            </View>
          ),
          isValid: () => publicAvailability.length > 0,
        },
        {
          label: "Collaboration Mode",
          component: (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={collaboration}
                style={styles.picker}
                onValueChange={(itemValue) => setCollaboration(itemValue)}
              >
                <Picker.Item label="Select Collaboration" value="" />
                <Picker.Item label="Solo" value="Solo" />
                <Picker.Item label="Team" value="Team" />
                <Picker.Item label="Partnership" value="Partnership" />
              </Picker>
            </View>
          ),
          isValid: () => collaboration.length > 0,
        },
        {
          label: "Geographic Scope",
          component: (
            <TextInput
              style={styles.input}
              placeholder="E.g., Global, US, Europe, Asia"
              value={geographicScope}
              onChangeText={setGeographicScope}
            />
          ),
          isValid: () => geographicScope.trim().length > 0,
        },
      ],
    },
  ];

  const isCurrentStepValid = () => {
    const currentStepFields = formSteps[currentStep].fields;
    return currentStepFields.every((field) => field.isValid());
  };

  const handleNext = () => {
    if (!isCurrentStepValid()) {
      showCustomAlert("Please fill in all fields in this section");
      return;
    }

    if (currentStep < formSteps.length - 1) {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!isCurrentStepValid()) {
      showCustomAlert("Please fill in all fields in this section");
      return;
    }

    setLoading(true);

    const apiKey = GEMINI_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Given the idea: "${idea}", in the field of "${field}", with implementation: "${implementation}", targeting the audience: "${targetAudience}", and considering market potential: "${marketPotential}", innovation level: "${innovationLevel}", protection duration: "${durationOfProtection}", content type: "${typeOfContent}", public availability: "${publicAvailability}", collaboration mode: "${collaboration}", and geographic scope: "${geographicScope}", recommend the most suitable IPR (Patent, Copyright, Design Right, Trademark).

Please format your response in JSON with the following structure:
{
  "recommendation": "The primary IPR type recommended (Patent, Copyright, Design Right, or Trademark)",
  "rationale": "A brief 1-2 sentence summary of why this is recommended",
  "details": "A more detailed explanation (3-5 sentences) about the recommendation and how it applies to this specific idea"
}`;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      try {
        // Try to parse the JSON response
        const jsonResponse = JSON.parse(responseText);
        setResponseData(jsonResponse);
      } catch (parseError) {
        // If parsing fails, try to extract structured data from text
        console.log("Failed to parse JSON, using fallback extraction");

        // Fallback: Extract data from text response
        const recommendation =
          responseText.match(/recommendation["\s:]+([^"]+)/i)?.[1] ||
          "Not specified";
        const rationale =
          responseText.match(/rationale["\s:]+([^"]+)/i)?.[1] || "Not provided";
        const details =
          responseText.match(/details["\s:]+([^"]+)/i)?.[1] || responseText;

        setResponseData({
          recommendation,
          rationale,
          details,
        });
      }

      setShowResponse(true);
    } catch (error) {
      console.error("Error fetching data from Gemini API:", error);
      showCustomAlert("Failed to fetch response. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIdea("");
    setField("");
    setImplementation("");
    setTargetAudience("");
    setMarketPotential("");
    setInnovationLevel("");
    setDurationOfProtection("");
    setTypeOfContent("");
    setPublicAvailability("");
    setCollaboration("");
    setGeographicScope("");
    setCurrentStep(0);
    setShowResponse(false);
  };

  const showCustomAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  // Render the response screen
  if (showResponse) {
    return (
      <View style={styles.container}>
        <StatusBar hidden={true} />
        <LinearGradient
          colors={["#e3f2fd", "#bbdefb"]}
          style={styles.gradientBackground}
        >
          <View style={styles.responseScreenContainer}>
            <Text style={styles.responseTitle}>IPR Recommendation</Text>

            <View style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <Ionicons
                  name="checkmark-circle"
                  size={32}
                  color="#4CAF50"
                  style={styles.recommendationIcon}
                />
                <Text style={styles.recommendationType}>
                  {responseData.recommendation}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.rationaleContainer}>
                <Text style={styles.rationaleLabel}>
                  Why this is recommended:
                </Text>
                <Text style={styles.rationaleText}>
                  {responseData.rationale}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailsContainer}>
                <Text style={styles.detailsLabel}>Detailed Explanation:</Text>
                <Text style={styles.detailsText}>{responseData.details}</Text>
              </View>
            </View>

            <View style={styles.responseButtonsContainer}>
              <TouchableOpacity
                style={[styles.responseButton, styles.newRequestButton]}
                onPress={resetForm}
              >
                <Ionicons
                  name="refresh"
                  size={20}
                  color="white"
                  style={styles.buttonIcon}
                />
                <Text style={styles.responseButtonText}>New Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Render the form steps
  return (
    <View style={styles.container}>
      <CustomAlert
        visible={showAlert}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />
      <StatusBar hidden={true} />
      <LinearGradient
        colors={["#e3f2fd", "#bbdefb"]}
        style={styles.gradientBackground}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons
              name="shield-checkmark"
              size={32}
              color="#1565c0"
              style={styles.titleIcon}
            />
            <Text style={styles.title}>Intellectual Property Advisor</Text>
          </View>
          <Text style={styles.subtitle}>
            Find the right protection for your ideas
          </Text>
          <View style={styles.stepIndicatorContainer}>
            {formSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.stepIndicator,
                  currentStep >= index
                    ? styles.activeStep
                    : styles.inactiveStep,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.stepTitle}>{formSteps[currentStep].title}</Text>

          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Animated.View
              style={[
                styles.formFields,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {formSteps[currentStep].fields.map((field, index) => (
                <View key={index} style={styles.fieldContainer}>
                  <Text style={styles.label}>{field.label}</Text>
                  {field.component}
                </View>
              ))}
            </Animated.View>
          </ScrollView>

          <View style={styles.buttonsContainer}>
            {currentStep > 0 && (
              <TouchableOpacity
                style={[styles.button, styles.backButton]}
                onPress={handleBack}
              >
                <Ionicons
                  name="arrow-back"
                  size={20}
                  color="#1565c0"
                  style={styles.buttonIcon}
                />
                <Text style={[styles.buttonText, styles.backButtonText]}>
                  Back
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.nextButton]}
              onPress={handleNext}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Text style={styles.buttonText}>
                    {currentStep === formSteps.length - 1 ? "Submit" : "Next"}
                  </Text>
                  {currentStep < formSteps.length - 1 ? (
                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color="white"
                      style={styles.buttonIcon}
                    />
                  ) : (
                    <Ionicons
                      name="send"
                      size={20}
                      color="white"
                      style={styles.buttonIcon}
                    />
                  )}
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  titleIcon: {
    marginRight: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1565c0",
    textAlign: "center",
    fontFamily: "Montserrat_Bold",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 15,
    fontFamily: "Montserrat_Regular",
    fontStyle: "italic",
  },
  stepIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  stepIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeStep: {
    backgroundColor: "#1565c0",
  },
  inactiveStep: {
    backgroundColor: "#bbdefb",
  },
  formContainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1565c0",
    marginBottom: 15,
    fontFamily: "Montserrat_Bold",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  formFields: {
    width: "100%",
  },
  fieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    fontFamily: "Montserrat_Regular",
  },
  input: {
    borderColor: "#1565c0",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    fontFamily: "Montserrat_Regular",
    fontSize: 16,
  },
  pickerContainer: {
    borderColor: "#1565c0",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
    fontFamily: "Montserrat_Regular",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButton: {
    backgroundColor: "#1565c0",
    flex: 1,
    marginLeft: 10,
  },
  backButton: {
    backgroundColor: "#f5f5f5",
    flex: 1,
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    fontFamily: "Montserrat_Bold",
  },
  backButtonText: {
    color: "#1565c0",
  },
  buttonIcon: {
    marginLeft: 8,
  },

  // Response screen styles
  responseScreenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  responseTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1565c0",
    marginBottom: 30,
    fontFamily: "Montserrat_Bold",
    textAlign: "center",
  },
  recommendationCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 25,
    width: "100%",
    maxWidth: 600,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  recommendationIcon: {
    marginRight: 10,
  },
  recommendationType: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1565c0",
    fontFamily: "Montserrat_Bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 15,
  },
  rationaleContainer: {
    marginBottom: 15,
  },
  rationaleLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    fontFamily: "Montserrat_Bold",
  },
  rationaleText: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
    fontFamily: "Montserrat_Regular",
  },
  detailsContainer: {
    marginBottom: 10,
  },
  detailsLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    fontFamily: "Montserrat_Bold",
  },
  detailsText: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
    fontFamily: "Montserrat_Regular",
  },
  responseButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
    width: "100%",
    maxWidth: 600,
  },
  responseButton: {
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 200,
  },
  newRequestButton: {
    backgroundColor: "#1565c0",
  },
  responseButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    fontFamily: "Montserrat_Bold",
  },
});

export default TipsScreen;
