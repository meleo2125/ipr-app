import React, { useState } from 'react';
import { StatusBar, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Picker } from '@react-native-picker/picker';

const TipsScreen = () => {
  const [idea, setIdea] = useState('');
  const [field, setField] = useState('');
  const [implementation, setImplementation] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [marketPotential, setMarketPotential] = useState('');
  const [innovationLevel, setInnovationLevel] = useState('');
  const [durationOfProtection, setDurationOfProtection] = useState('');
  const [typeOfContent, setTypeOfContent] = useState('');
  const [publicAvailability, setPublicAvailability] = useState('');
  const [collaboration, setCollaboration] = useState('');
  const [geographicScope, setGeographicScope] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!idea || !field || !implementation || !targetAudience || !marketPotential || !innovationLevel || !durationOfProtection || !typeOfContent || !publicAvailability || !collaboration || !geographicScope) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    const apiKey = 'AIzaSyCGM4hMqsS8eTzftl7kF3-M6syOV355xdE';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Given the idea: "${idea}", in the field of "${field}", with implementation: "${implementation}", targeting the audience: "${targetAudience}", and considering market potential: "${marketPotential}", innovation level: "${innovationLevel}", protection duration: "${durationOfProtection}", content type: "${typeOfContent}", public availability: "${publicAvailability}", collaboration mode: "${collaboration}", and geographic scope: "${geographicScope}", recommend the most suitable IPR (Patent, Copyright, Design Right, Trademark) and provide a brief rationale (max 7-8 lines).`;

    try {
      const result = await model.generateContent(prompt);
      const cleanResponse = result.response.text().replace(/\*\*(.*?)\*\*/g, '$1');
      setResponse(cleanResponse);
    } catch (error) {
      console.error('Error fetching data from Gemini API:', error);
      Alert.alert('Error', 'Failed to fetch response. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <Text style={styles.title}>Get IPR Tips</Text>
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <TextInput style={styles.input} placeholder="Enter your idea" value={idea} onChangeText={setIdea} />
        <TextInput style={styles.input} placeholder="Enter the field of your idea" value={field} onChangeText={setField} />
        <TextInput style={styles.input} placeholder="Describe the implementation" value={implementation} onChangeText={setImplementation} multiline />

        <Text style={styles.label}>Target Audience</Text>
        <Picker selectedValue={targetAudience} style={styles.picker} onValueChange={(itemValue) => setTargetAudience(itemValue)}>
          <Picker.Item label="Select Target Audience" value="" />
          <Picker.Item label="General Public" value="General Public" />
          <Picker.Item label="Industry Professionals" value="Industry Professionals" />
          <Picker.Item label="Academic Institutions" value="Academic Institutions" />
          <Picker.Item label="Startups & Entrepreneurs" value="Startups & Entrepreneurs" />
        </Picker>

        <TextInput style={styles.input} placeholder="Market potential" value={marketPotential} onChangeText={setMarketPotential} />
        <TextInput style={styles.input} placeholder="Innovation level" value={innovationLevel} onChangeText={setInnovationLevel} />

        <Text style={styles.label}>Duration of Protection</Text>
        <Picker selectedValue={durationOfProtection} style={styles.picker} onValueChange={(itemValue) => setDurationOfProtection(itemValue)}>
          <Picker.Item label="Select Duration" value="" />
          <Picker.Item label="Short-term (1-5 years)" value="Short-term" />
          <Picker.Item label="Long-term (10+ years)" value="Long-term" />
        </Picker>

        <Text style={styles.label}>Type of Content</Text>
        <Picker selectedValue={typeOfContent} style={styles.picker} onValueChange={(itemValue) => setTypeOfContent(itemValue)}>
          <Picker.Item label="Select Content Type" value="" />
          <Picker.Item label="Literary Work" value="Literary Work" />
          <Picker.Item label="Music" value="Music" />
          <Picker.Item label="Software" value="Software" />
          <Picker.Item label="Invention" value="Invention" />
        </Picker>

        <Text style={styles.label}>Public Availability</Text>
        <Picker selectedValue={publicAvailability} style={styles.picker} onValueChange={(itemValue) => setPublicAvailability(itemValue)}>
          <Picker.Item label="Select Availability" value="" />
          <Picker.Item label="Public" value="Public" />
          <Picker.Item label="Confidential" value="Confidential" />
        </Picker>

        <Text style={styles.label}>Collaboration Mode</Text>
        <Picker selectedValue={collaboration} style={styles.picker} onValueChange={(itemValue) => setCollaboration(itemValue)}>
          <Picker.Item label="Select Collaboration" value="" />
          <Picker.Item label="Solo" value="Solo" />
          <Picker.Item label="Team" value="Team" />
        </Picker>

        <TextInput style={styles.input} placeholder="Geographic scope (e.g., country or region)" value={geographicScope} onChangeText={setGeographicScope} />

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Generating...' : 'Get Recommendations'}</Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color="#ffab00" />}

        {response ? (
          <View style={styles.responseContainer}>
            <Text style={styles.responseText}>{response}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
  },
  scrollContainer: { 
    width: '100%', 
    paddingHorizontal: 10,
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#1565c0', 
    textAlign: 'center', 
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  label: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 5,
  },
  input: { 
    height: 50, 
    borderColor: '#1565c0', 
    borderWidth: 1, 
    borderRadius: 10, 
    padding: 12, 
    width: '100%', 
    marginBottom: 15, 
    backgroundColor: '#ffffff', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  picker: { 
    height: 50, 
    width: '100%', 
    marginBottom: 15, 
    backgroundColor: '#ffffff',
    borderColor: '#1565c0', 
    borderWidth: 1, 
    borderRadius: 10,
  },
  button: { 
    backgroundColor: '#ffab00', 
    borderRadius: 10, 
    padding: 15, 
    alignItems: 'center', 
    elevation: 3, 
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  responseContainer: { 
    marginTop: 20, 
    padding: 15, 
    borderColor: '#1565c0', 
    borderWidth: 1, 
    borderRadius: 10, 
    backgroundColor: '#ffffff', 
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  responseText: { 
    fontSize: 16, 
    color: '#1565c0',
    textAlign: 'center',
    fontWeight: '500',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
});


export default TipsScreen;
