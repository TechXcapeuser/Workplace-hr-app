import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert, FlatList} from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import {API} from '../utils/api';


export default function AttendanceScreen({route, navigation}){
  const { token, user } = route.params;
  const [location, setLocation] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(()=>{
    (async ()=>{
      let {status} = await Location.requestForegroundPermissionsAsync();
      if(status !== 'granted'){
        Alert.alert('Permission denied','Allow location to use this app');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      fetchHistory();
    })();
  }, []);

  const fetchHistory = async () => {
    try{
    // Alert.alert(API_BASE);
     const res  = await axios.get(API('/employees/attendance-detail?month=12&user_id=' + user.id) , { headers: { Authorization: 'Bearer '+token , Accept: 'application/json' } });
 //    const res = await axios.get(API('employees/attendance-detail?month=12&user_id=1'), { headers: { Authorization: 'Bearer '+token } });
      setHistory(res.data.data.employee_attendance);
    }catch(e){
      console.log(e);
    }
  }

  const sendAttendance = async (type) => {
    if(!location){ Alert.alert('Location not ready'); return; }
    
    try{
      const url = type === 'in' ? API('/employees/check-in') : API('/employees/check-out');
     // Alert.alert('Success', user.id);
     await axios.post(url, {
        check_in_latitude: location.latitude,
        check_in_longitude: location.longitude,
        check_out_latitude: location.latitude,
        check_out_longitude: location.longitude,
        device_info: 'Workplace App',
        router_bssid: '00:00:00:00:00:00',
        allow_holiday_check_in:1


      }, { 
        headers: { 
          Authorization: 'Bearer '+token 
          
        }});
     Alert.alert('Success', type+' recorded');
      fetchHistory();
    }catch(e){
      Alert.alert('Error', e.response?.data?.message || e.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Welcome, {user.name}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Location</Text>
        <Text style={styles.cardText}>{location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : 'Locating...'}</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.btnPrimary} onPress={()=>sendAttendance('in')}>
            <Text style={styles.btnText}>Check In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={()=>sendAttendance('out')}>
            <Text style={styles.btnTextSecondary}>Check Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={{marginTop:16, fontSize:18}}>Recent Activity</Text>
      <FlatList data={history} keyExtractor={item=>String(item.id)} renderItem={({item})=>(
        <View style={styles.rowItem}>
          <Text style={{fontWeight:'600'}}>{item.type}</Text>
          <Text>Date: {item.mark_date}</Text>
          <Text>In: {item.check_in} Out: {item.check_out}</Text>
          {/* <Text>Check Out: {item.check_out}</Text> */}
          {/* <Text>{item.latitude}, {item.longitude}</Text> */}
        </View>
      )} />
    </View>
  )
}

const styles = StyleSheet.create({
  container:{flex:1, padding:16, backgroundColor:'#f7f8fb'},
  greeting:{fontSize:20, fontWeight:'600', marginBottom:8},
  card:{ backgroundColor:'#fff', padding:16, borderRadius:12, shadowColor:'#000', shadowOpacity:0.05, elevation:3 },
  cardTitle:{ fontSize:16, fontWeight:'700' },
  cardText:{ marginTop:8, marginBottom:12, color:'#555' },
  row:{ flexDirection:'row', justifyContent:'space-between' },
  btnPrimary:{ backgroundColor:'#28a745', padding:12, borderRadius:10, flex:1, marginRight:8 },
  btnSecondary:{ borderWidth:1, borderColor:'#28a745', padding:12, borderRadius:10, flex:1 },
  btnText:{ color:'#fff', textAlign:'center', fontWeight:'700' },
  btnTextSecondary:{ color:'#28a745', textAlign:'center', fontWeight:'700' },
  rowItem:{ backgroundColor:'#fff', padding:12, borderRadius:8, marginTop:8 }
});
