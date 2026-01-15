import * as Device from 'expo-device';
import React, {useState, useContext, useRef, useEffect} from 'react';
import {
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Alert, 
  Image, 
  StatusBar,
  Modal,
  Animated,
  Easing
} from 'react-native';
import axios from 'axios';
import {API} from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from "../AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const deviceUUID = Device.osInternalBuildId || Device.osBuildId || "unknown-device";
const deviceType = Device.osName === "Android" ? "android" : "ios";

// Sophisticated Spinner Component
const SophisticatedSpinner = ({ visible }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;
  const dotIndex = useRef(0);
  const [dots, setDots] = useState('.');

  useEffect(() => {
    let dotInterval;
    
    if (visible) {
      // Start fade in animation
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();

      // Continuous spin animation
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Pulse animation for outer ring
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Animated dots (using setInterval instead of Animated)
      dotInterval = setInterval(() => {
        dotIndex.current = (dotIndex.current + 1) % 4;
        setDots('.'.repeat(dotIndex.current + 1));
      }, 500);

    } else {
      // Fade out animation
      Animated.timing(fadeValue, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        spinValue.stopAnimation();
        pulseValue.stopAnimation();
        spinValue.setValue(0);
        pulseValue.setValue(1);
        fadeValue.setValue(0);
        setDots('.');
        dotIndex.current = 0;
      });

      if (dotInterval) {
        clearInterval(dotInterval);
      }
    }

    return () => {
      if (dotInterval) {
        clearInterval(dotInterval);
      }
    };
  }, [visible, spinValue, pulseValue, fadeValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const pulseScale = pulseValue;
  const fadeOpacity = fadeValue;

  // Progress animation (numeric only)
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(progressAnim, {
            toValue: 100,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
          Animated.timing(progressAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      progressAnim.stopAnimation();
      progressAnim.setValue(0);
    }
  }, [visible, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={() => {}}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeOpacity }]}>
        <View style={styles.overlayContent}>
          {/* Outer Pulse Ring */}
          <Animated.View 
            style={[
              styles.outerRing,
              { 
                transform: [{ scale: pulseScale }],
                opacity: 0.3 
              }
            ]} 
          />
          
          {/* Main Spinner Container */}
          <View style={styles.spinnerContainer}>
            {/* Rotating Ring */}
            <Animated.View 
              style={[
                styles.spinningRing,
                { transform: [{ rotate: spin }] }
              ]}
            >
              <View style={styles.ringSegment} />
              <View style={[styles.ringSegment, { transform: [{ rotate: '90deg' }] }]} />
              <View style={[styles.ringSegment, { transform: [{ rotate: '180deg' }] }]} />
              <View style={[styles.ringSegment, { transform: [{ rotate: '270deg' }] }]} />
            </Animated.View>
            
            {/* Center Logo/Icon */}
            <View style={styles.centerIcon}>
              <Image
                source={require("../assets/txt-logo.png")}
                style={styles.centerLogo}
              />
            </View>
          </View>

          {/* Loading Text with Animated Dots */}
          <View style={styles.textContainer}>
            <Text style={styles.overlayTitle}>Authenticating</Text>
            <Text style={styles.overlayDots}>
              {dots}
            </Text>
          </View>
          
          <Text style={styles.overlaySubText}>
            Securely connecting to TechXcape HRS
          </Text>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Animated.View 
              style={[
                styles.progressBar,
                {
                  width: progressWidth,
                }
              ]}
            />
          </View>
        </View>
        
        {/* Subtle Background Pattern */}
        <View style={styles.backgroundPattern}>
          {[...Array(20)].map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.patternDot,
                {
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: 0.05 + Math.random() * 0.1,
                }
              ]} 
            />
          ))}
        </View>
      </Animated.View>
    </Modal>
  );
};

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Validation", "Please enter username & password");
      return;
    }

    setLoading(true);
    setShowOverlay(true);

    try {
      const res = await axios.post(API('/login'), {
        username, 
        password,
        device_type: deviceType,
        uuid: deviceUUID,
        fcm_token: 'f0f0f0f0f0f0f0f0'
      });

      const token = res.data.data.tokens;
      
      // Store token in AsyncStorage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(res.data.data.user));
      
      // Small delay to show success state
      setTimeout(() => {
        setShowOverlay(false);
        navigation.replace('MainTabs', { token, user: res.data.data.user });
      }, 500);
      
    } catch (error) {
      setShowOverlay(false);
      Alert.alert(
        "Login Failed", 
        error.response?.data?.message || error.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar backgroundColor="#000" barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <Image
          source={require("../assets/logo-white.png")}
          style={styles.logo}
        />
        <Text style={styles.logoText}>HRS</Text>
      </View>

      {/* BODY */}
      <LinearGradient
        colors={["#000", "#0B1D4D"]}
        style={styles.container}
      >
        <Text style={styles.title}>Login</Text>

        {/* Username */}
        <Text style={styles.label}>Username</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={22} color="#fff" />
          <TextInput
            placeholder="Enter username"
            placeholderTextColor="#ccc"
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            editable={!loading}
          />
        </View>

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={22} color="#fff" />
          <TextInput
            placeholder="Enter password"
            placeholderTextColor="#ccc"
            style={styles.input}
            secureTextEntry={secureText}
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
          <TouchableOpacity 
            onPress={() => setSecureText(!secureText)}
            disabled={loading}
            style={styles.eyeButton}
          >
            <Ionicons
              name={secureText ? "eye-outline" : "eye-off-outline"}
              size={22}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={loading ? ['#0A6ED1', '#0A6ED1'] : ['#0A6ED1', '#1E90FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>
              {loading ? "Logging in..." : "Login"}
            </Text>
            {loading && (
              <Ionicons 
                name="arrow-forward-circle" 
                size={20} 
                color="#fff" 
                style={styles.buttonIcon}
              />
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity disabled={loading} style={styles.linkButton}>
          <Text style={[styles.link, loading && styles.linkDisabled]}>Forget Password</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          disabled={loading}
          style={styles.linkButton}
        >
          <Text style={[styles.link, loading && styles.linkDisabled]}>← Go Back</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Sophisticated Spinner Overlay */}
      <SophisticatedSpinner visible={showOverlay} />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#000",
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },
  logo: {
    width: 150,
    height: 50,
    resizeMode: "contain",
    marginBottom: 6,
  },
  logoText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  container: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 30,
  },
  title: {
    backgroundColor: "#000",
    color: "#fff",
    fontSize: 24,
    marginBottom: 30,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  label: {
    color: "#fff",
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.9,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  input: {
    flex: 1,
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  eyeButton: {
    padding: 5,
  },
  button: {
    height: 55,
    borderRadius: 12,
    marginTop: 25,
    overflow: 'hidden',
    shadowColor: "#0A6ED1",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  gradientButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonDisabled: {
    opacity: 0.8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 10,
  },
  linkButton: {
    paddingVertical: 5,
  },
  link: {
    color: "#fff",
    textAlign: "center",
    marginTop: 15,
    opacity: 0.8,
    fontSize: 14,
  },
  linkDisabled: {
    opacity: 0.5,
  },
  
  // Overlay Styles
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 11, 45, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    backgroundColor: 'rgba(11, 29, 77, 0.8)',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    width: '85%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: 'rgba(30, 144, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  outerRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#1E90FF',
  },
  spinnerContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  spinningRing: {
    width: 120,
    height: 120,
    position: 'absolute',
  },
  ringSegment: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: '#1E90FF',
    borderLeftColor: '#1E90FF',
  },
  centerIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(30, 144, 255, 0.3)',
  },
  centerLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  overlayTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  overlayDots: {
    color: '#1E90FF',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 5,
    minWidth: 40,
  },
  overlaySubText: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 25,
    opacity: 0.8,
    letterSpacing: 0.3,
  },
  progressContainer: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1E90FF',
    borderRadius: 2,
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  patternDot: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#1E90FF',
  },
});