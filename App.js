import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from "./navigation/BottomTabs";
import LoginScreen from './screens/LoginScreen';
import LoginScreenDark from './screens/LoginScreenDark';
import AttendanceScreen from './screens/AttendanceScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from  './screens/DashboardScreen';
import LeaveScreen from "./screens/LeaveScreen";
import Holidays from "./screens/Holidays";
import { StatusBar } from "expo-status-bar";
const Stack = createNativeStackNavigator();




export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#020B2D" />

      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* LOGIN */}
        <Stack.Screen name="Login" component={LoginScreenDark} />

        {/* APP AFTER LOGIN */}
        <Stack.Screen name="MainTabs" component={BottomTabs} />
        <Stack.Screen name="Leave" component={LeaveScreen} />
        <Stack.Screen name="AttendanceScreen" component={AttendanceScreen} />
        <Stack.Screen name="Holidays" component={Holidays} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}









// export default function App() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="Login">
//         <Stack.Screen name="Login" component={LoginScreen} />
//         <Stack.Screen options={{headerShown: false}} name="Login" component={LoginScreenDark} />
//         <Stack.Screen options={{headerShown: false}} name="Dashboard" component={DashboardScreen} />
//         <Stack.Screen name="Register" component={RegisterScreen} />
//         <Stack.Screen name="Attendance" component={AttendanceScreen} />
//       </Stack.Navigator>
//       <BottomTabs />
//     </NavigationContainer>
//   );
// }
