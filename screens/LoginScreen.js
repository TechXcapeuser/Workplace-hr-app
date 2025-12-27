import * as Device from 'expo-device';
import React, {useState} from 'react';
import {View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, Image} from 'react-native';
import axios from 'axios';
import {API} from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

//const fcmToken = await AsyncStorage.getItem("fcm_token");
const deviceUUID = Device.osInternalBuildId || Device.osBuildId || "unknown-device";
const deviceType = Device.osName === "Android" ? "android" : "ios";
// Alert.alert(deviceUUID);
 


export default function LoginScreen({navigation}){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  

  const login = async () => {
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
      const avatar = res.data.data.user.avatar;
      navigation.navigate('Attendance', { token, user: res.data.data.user, avatarimg: avatar });
    }catch(e){
      Alert.alert('Login failed', e.response?.data?.message || e.message);
    }
  }

  return (
    <View style={styles.container}>
      <Image source={require('../assets/txt-logo.png')} style={styles.logo} />
      <Text style={styles.title}>Field Attendance</Text>

      <TextInput 
        placeholder="Email" 
        style={styles.input} 
        value={username} 
        onChangeText={setUsername} 
        keyboardType="email-address" 
      />

      <TextInput 
        placeholder="Password" 
        style={styles.input} 
        secureTextEntry 
        value={password} 
        onChangeText={setPassword} 
      />

      <TouchableOpacity style={styles.button} onPress={login}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* 🔥 Register Link */}
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container:{ flex:1, justifyContent:'center', padding:20, backgroundColor:'#f7f8fb' },
  logo:{ width:100, height:100, alignSelf:'center', marginBottom:50 },
  input:{ borderWidth:1, marginBottom:12, padding:12, borderRadius:10, backgroundColor:'#fff', borderColor:'#eceff3' },
  title:{ fontSize:24, marginBottom:10, textAlign:'center', color:'#333' },
  button:{ backgroundColor:'#4b7bec', padding:14, borderRadius:10 },
  buttonText:{ color:'#fff', textAlign:'center', fontWeight:'600' },
  registerText:{ color:'#4b7bec', textAlign:'center', marginTop:15, fontSize:15 }
});
