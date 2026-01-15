import React, { useEffect, useRef, useState } from "react";
import { Easing } from 'react-native';

import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
  StatusBar,
  AppState,
} from "react-native";
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import CheckInOutPopup from "./CheckInOutPopup";
import CustomHeader from "./components/CustomHeader";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { token, user } = route.params || {};

  const [showPopup, setShowPopup] = useState(false);
  const [time, setTime] = useState(new Date());
  const [progress, setProgress] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Multiple ripple animations
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  const ripple3 = useRef(new Animated.Value(0)).current;
  const ripple4 = useRef(new Animated.Value(0)).current;
  
  const progressBarWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  /* LIVE CLOCK */
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* FINGERPRINT SCALE ANIMATION */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  /* MULTIPLE RIPPLE ANIMATIONS */
  useEffect(() => {
    // First ripple
    Animated.loop(
      Animated.sequence([
        Animated.timing(ripple1, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(ripple1, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Second ripple (starts after delay)
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(ripple2, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
          Animated.timing(ripple2, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 1500);

    // Third ripple (starts after delay)
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(ripple3, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
          Animated.timing(ripple3, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 1000);

    // Fourth ripple (starts after delay)
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(ripple4, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
          Animated.timing(ripple4, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 1500);
  }, []);

  /* PROGRESS BAR ANIMATION */
  const startProgressAnimation = () => {
    // Reset progress
    setProgress(0);
    progressAnim.setValue(0);
    
    // Animate from 1 to 100
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 2000,
      useNativeDriver: false,
      easing: Easing.linear,
    }).start(({ finished }) => {
      if (finished) {
        setProgress(100);
      }
    });
  };

  /* UPDATE PROGRESS VALUE */
  useEffect(() => {
    const listenerId = progressAnim.addListener(({ value }) => {
      setProgress(Math.round(value));
    });

    return () => {
      progressAnim.removeListener(listenerId);
    };
  }, []);

  /* START ANIMATION WHEN SCREEN IS FOCUSED */
  useFocusEffect(
    React.useCallback(() => {
      startProgressAnimation();
      
      return () => {
        // Reset animation when screen loses focus
        progressAnim.stopAnimation();
        setProgress(0);
        progressAnim.setValue(0);
      };
    }, [])
  );

  /* ALSO TRIGGER ON APP STATE CHANGE (FROM BACKGROUND TO FOREGROUND) */
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        startProgressAnimation();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  /* PROGRESS BAR TEXT FORMATTING */
  const getProgressText = () => {
    if (progress < 10) return `0${progress}%`;
    return `${progress}%`;
  };

  return (
    <LinearGradient colors={["#000", "#0B1D4D"]} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#020B2D" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* CUSTOM HEADER */}
        <CustomHeader user={user} />

        {/* TIME */}
        <View style={styles.timeRow}>
          <Text style={styles.pm}>PM</Text>
          <Text style={styles.time}>
            {time.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <Text style={styles.seconds}>{time.getSeconds()}</Text>
        </View>

        <Text style={styles.date}>
          {time.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </Text>

        {/* FINGERPRINT WITH MULTIPLE RIPPLE EFFECTS */}
        <View style={{ alignItems: "center", marginVertical: 20 }}>
          <View style={styles.fingerprintContainer}>
            {/* Ripple 1 */}
            <Animated.View 
              style={[
                styles.ripple,
                {
                  transform: [{
                    scale: ripple1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.8]
                    })
                  }],
                  opacity: ripple1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 0]
                  })
                }
              ]}
            />
            
            {/* Ripple 2 */}
            <Animated.View 
              style={[
                styles.ripple,
                {
                  transform: [{
                    scale: ripple2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.8]
                    })
                  }],
                  opacity: ripple2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 0]
                  })
                }
              ]}
            />
            
            {/* Ripple 3 */}
            <Animated.View 
              style={[
                styles.ripple,
                {
                  transform: [{
                    scale: ripple3.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.8]
                    })
                  }],
                  opacity: ripple3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 0]
                  })
                }
              ]}
            />
            
            {/* Ripple 4 */}
            <Animated.View 
              style={[
                styles.ripple,
                {
                  transform: [{
                    scale: ripple4.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.8]
                    })
                  }],
                  opacity: ripple4.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 0]
                  })
                }
              ]}
            />
            
            {/* Fingerprint Button */}
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                style={styles.fingerprint}
                onPress={() => setShowPopup(true)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="fingerprint"
                  size={50}
                  color="#fff"
                />
              </TouchableOpacity>
            </Animated.View>
          </View>
          <Text style={styles.smallText}>Check In | Check Out</Text>
        </View>

        {/* PROGRESS BAR WITH ANIMATION */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Daily Progress</Text>
            <Text style={styles.progressPercentage}>{getProgressText()}</Text>
          </View>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: progressBarWidth }]} />
            <Text style={styles.progressText}>0 hr 10 min</Text>
          </View>
          <View style={styles.timeSmallRow}>
            <Text style={styles.smallText}>09:00:00</Text>
            <Text style={styles.smallText}>18:00:00</Text>
          </View>
        </View>

        {/* OVERVIEW */}
        <Text style={styles.sectionTitle}>Overview</Text>

        <View style={styles.grid}>
          {overviewButtons.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => {
                if (item.title === "Attendance") {navigation.navigate("AttendanceScreen", {token,user});}
                if (item.title === "Holidays") {navigation.navigate("Holidays", {token,user});}
                if (item.title === "Leave") {navigation.navigate("Leave", {token,user});}
                if (item.title === "PaySlip") {navigation.navigate("PaySlip", {token,user});}
              }}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={22}
                color="#fff"
              />
              <Text style={styles.cardTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* CHECK IN / CHECK OUT POPUP */}
      <CheckInOutPopup
        visible={showPopup}
        onClose={() => setShowPopup(false)}
        onCheckIn={() => {
          setShowPopup(false);
          console.log("CHECK IN API CALL", token, user?.id);
        }}
        onCheckOut={() => {
          setShowPopup(false);
          console.log("CHECK OUT API CALL", token, user?.id);
        }}
      />
    </LinearGradient>
  );
}

/* OVERVIEW DATA */
const overviewButtons = [
  { title: "Attendance", value: 12, icon: "fingerprint" },
  { title: "Leave", value: 47, icon: "emoticon-sad" },
  { title: "Late", value: 3, icon: "clock-alert" },
  { title: "PaySlip", value: 6, icon: "cash-multiple" },
  { title: "Overtime", value: 5, icon: "timer-plus" },
  { title: "Holidays", value: 8, icon: "beach" },
];

/* STYLES */
const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    marginTop: 15,
  },
  userRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22,
    marginRight: 10,
  },
  smallText: { 
    color: "#ccc", 
    fontSize: 11,
    marginTop: 8,
  },
  name: { color: "#fff", fontSize: 15, fontWeight: "600" },

  timeRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  pm: { color: "#fff", fontSize: 14, marginRight: 4 },
  time: { color: "#fff", fontSize: 36, fontWeight: "bold" },
  seconds: { color: "#ccc", fontSize: 12, marginLeft: 5 },

  date: { color: "#ccc", textAlign: "center", fontSize: 12 },

  fingerprintContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  ripple: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 65,
    backgroundColor: "#1E4E79",
    borderWidth: 2,
    
  },

  fingerprint: {
    width: 100,
    height: 100,
    borderRadius: 55,
    backgroundColor: "#1E4E79",
    justifyContent: "center",
    alignItems: "center",

  },

  // Progress Container
  progressContainer: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  progressPercentage: {
    color: "#1E4E79",
    fontSize: 14,
    fontWeight: "bold",
  },
  progressBar: {
    height: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    justifyContent: "center",
    overflow: 'hidden',
    position: 'relative',
  },
  progressText: {
    color: "#fff",
    fontSize: 13,
    textAlign: "center",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1E4E79",
    borderRadius: 20,
    position: "absolute",
    left: 0,
    top: 0,
  },
  timeSmallRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 15,
    margin: 20,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    width: (width - 60) / 2,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: { color: "#fff", fontSize: 12, marginTop: 5 },
  badge: {
    position: "absolute",
    right: 10,
    top: 10,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: { color: "#fff", fontSize: 11 },
});