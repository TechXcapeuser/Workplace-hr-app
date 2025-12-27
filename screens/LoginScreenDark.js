import * as Device from 'expo-device';
import React, {useState,useContext} from 'react';
import {View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, Image, StatusBar} from 'react-native';
import axios from 'axios';
import {API} from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import {View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert} from "react-native";
// import axios from "axios";
import { AuthContext } from "../AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
const deviceUUID = Device.osInternalBuildId || Device.osBuildId || "unknown-device";
const deviceType = Device.osName === "Android" ? "android" : "ios";

export default function LoginScreen({ navigation }) {
 // const { login } = useContext(AuthContext); // ✅ INSIDE component
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);

 

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Validation", "Please enter username & password");
      return;
    }

    setLoading(true);

 try{
      const res = await axios.post(API('/login'), {
        username, 
        password,
        device_type: deviceType,
        uuid: deviceUUID,
        fcm_token: 'f0f0f0f0f0f0f0f0'

      });
//Alert.alert('This Login failed', res.data.tokens);
//console.log(res.data.data.user.name);
//return;

      const token = res.data.data.tokens;
 

      //navigation.navigate('Attendance', { token, user: res.data.data.user});
      navigation.replace('MainTabs', { token, user: res.data.data.user});
    } catch (error) {
      Alert.alert(
        "Login Failed", error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar backgroundColor="#020B2D" barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <Image
          source={require("../assets/txt-logo.png")}
          style={styles.logo}
        />
        <Text style={styles.logoText}>TechXcape HRS</Text>
      </View>

      {/* BODY */}
      <LinearGradient
        colors={["#020B2D", "#0B1D4D"]}
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
          />
          <TouchableOpacity onPress={() => setSecureText(!secureText)}>
            <Ionicons
              name={secureText ? "eye-outline" : "eye-off-outline"}
              size={22}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.link}>Forget Password</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.link}>← Go Back</Text>
        </TouchableOpacity>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#020B2D", // DARK HEADER
    height: 140,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 30,
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    marginBottom: 6,
  },
  logoText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 30,
  },
  title: {
    backgroundColor: "#020B2D",
    color: "#fff",
    fontSize: 20,
    marginBottom: 20,
  },
  label: {
    color: "#fff",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    color: "#fff",
    marginLeft: 10,
  },
  button: {
    backgroundColor: "#0A6ED1",
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  link: {
    color: "#fff",
    textAlign: "center",
    marginTop: 15,
    opacity: 0.8,
  },
});