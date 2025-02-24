import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { userInfo, logout, userToken } = useAuth();
  
  // Set screen orientation to landscape
  useEffect(() => {
    async function setOrientation() {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    }
    setOrientation();
    
    // Redirect to login if not authenticated
    if (!userToken) {
      router.replace('/login');
    }
  }, [userToken]);
  
  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };
  
  if (!userToken) {
    return null; // Don't render anything while checking authentication
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>IPR App</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.welcomeText}>
          Welcome, {userInfo?.name || 'User'}!
        </Text>
        <Text style={styles.infoText}>
          You are now logged in to the protected home page.
        </Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Profile</Text>
          <View style={styles.profileInfo}>
            <Text style={styles.profileItem}>Name: {userInfo?.name}</Text>
            <Text style={styles.profileItem}>Email: {userInfo?.email}</Text>
            <Text style={styles.profileItem}>Age: {userInfo?.age}</Text>
            <Text style={styles.profileItem}>Gender: {userInfo?.gender}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4a6da7',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  profileInfo: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
  },
  profileItem: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
});
