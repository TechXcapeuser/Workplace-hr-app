import React, { useEffect, useRef, useState } from "react";
import { useRoute } from "@react-navigation/native";
import {View,Text,StyleSheet,Image,TouchableOpacity,Dimensions,ScrollView,Animated,StatusBar} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import CheckInOutPopup from "./CheckInOutPopup";

const { width } = Dimensions.get("window");



export default function DashboardScreen() {

const [showPopup, setShowPopup] = useState(false);

const [time, setTime] = useState(new Date());
const scaleAnim = useRef(new Animated.Value(1)).current;
const route = useRoute();
const { token, user } = route.params || {};


  /* LIVE CLOCK */
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* FINGERPRINT ANIMATION */
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

  return (
    <LinearGradient colors={["#020B2D", "#0B1D4D"]} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#020B2D" />

      {/* HEADER / STATUS BAR */}
      <View style={styles.topBar}>
        <Ionicons name="home-outline" size={22} color="#fff" />
        <Ionicons name="notifications-outline" size={22} color="#fff" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* USER INFO */}
        <View style={styles.userRow}>
          <Image
            source={{ uri: "https://i.pravatar.cc/100" }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.smallText}>Hello There</Text>
            <Text style={styles.name}>{user.name || "User"}</Text>
            <Text style={styles.smallText}>{user.email || "xixi@dot.com"}</Text>
          </View>
        </View>

        {/* TIME */}
        <View style={styles.timeRow}>
          <Text style={styles.pm}>PM</Text>
          <Text style={styles.time}>
            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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

        {/* ANIMATED FINGERPRINT */}
        <View style={{ alignItems: "center", marginVertical: 20 }}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity  style={styles.fingerprint} onPress={() => setShowPopup(true)}>
              <MaterialCommunityIcons
                name="fingerprint"
                size={50}
                color="#fff"
              />
            </TouchableOpacity>
          </Animated.View>
          <Text style={styles.smallText}>Check In | Check Out</Text>
        </View>

        {/* WORK TIME */}
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
          <Text style={styles.progressText}>0 hr 10 min</Text>
        </View>

        <View style={styles.timeSmallRow}>
          <Text style={styles.smallText}>11:50:40</Text>
          <Text style={styles.smallText}>12:01:08</Text>
        </View>

        {/* OVERVIEW */}
        <Text style={styles.sectionTitle}>Overview</Text>

        <View style={styles.grid}>
          {overviewButtons.map((item, index) => (
            <View key={index} style={styles.card}>
              <MaterialCommunityIcons
                name={item.icon}
                size={22}
                color="#fff"
              />
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.value}</Text>
              </View>
            </View>
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

/* DATA */
const overviewButtons = [
  { title: "Present", value: 416, icon: "account-check" },
  { title: "Holidays", value: 8, icon: "beach" },
  { title: "Leave", value: 47, icon: "emoticon-sad" },
  { title: "Event", value: 0, icon: "calendar" },
  { title: "Projects", value: 2, icon: "briefcase" },
  { title: "Task", value: 1, icon: "flag" },
  { title: "Attendance", value: 12, icon: "fingerprint" },
  { title: "Late", value: 3, icon: "clock-alert" },
  { title: "Absent", value: 6, icon: "account-off" },
  { title: "Overtime", value: 5, icon: "timer-plus" },
];

/* STYLES */
const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
     marginTop: 15
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
  smallText: { color: "#ccc", fontSize: 11 },
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

  fingerprint: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#1E4E79",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  progressBar: {
    height: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 20,
    borderRadius: 20,
    justifyContent: "center",
    marginTop: 10,
  },
  progressFill: {
    width: "30%",
    height: "100%",
    backgroundColor: "#1E90FF",
    borderRadius: 20,
    position: "absolute",
  },
  progressText: {
    color: "#fff",
    fontSize: 11,
    textAlign: "center",
  },
  timeSmallRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
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
