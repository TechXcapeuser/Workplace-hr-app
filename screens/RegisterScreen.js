import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import axios from 'axios';
import {API} from '../utils/api';

export default function RegisterScreen({navigation}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const register = async () => {
    try {
      const res = await axios.post(API('/register'), {name, email, password});
      Alert.alert("Success", "Account created successfully");
      navigation.navigate("Login");
    } catch (e) {
      Alert.alert("Error", e.response?.data?.message || e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput 
        placeholder="Full Name" 
        style={styles.input} 
        value={name} 
        onChangeText={setName} 
      />

      <TextInput 
        placeholder="Email Address" 
        style={styles.input} 
        keyboardType="email-address" 
        value={email} 
        onChangeText={setEmail} 
      />

      <TextInput 
        placeholder="Password" 
        secureTextEntry 
        style={styles.input} 
        value={password} 
        onChangeText={setPassword} 
      />

      <TouchableOpacity style={styles.button} onPress={register}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, justifyContent:'center', padding:20, backgroundColor:'#f7f8fb' },
  title:{ fontSize:26, textAlign:'center', marginBottom:20, fontWeight:'700' },
  input:{ borderWidth:1, borderColor:'#ddd', padding:12, borderRadius:10, marginBottom:15, backgroundColor:'#fff' },
  button:{ backgroundColor:'#4b7bec', padding:14, borderRadius:10 },
  buttonText:{ textAlign:'center', color:'#fff', fontWeight:'700' },
  loginText:{ marginTop:15, textAlign:'center', color:'#4b7bec' }
});
