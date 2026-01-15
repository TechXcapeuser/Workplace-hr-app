// components/CustomHeader.js
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Image,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native'; // Add useRoute



// add this in each screen where header is needed
//  <CustomHeader user={user} />



const CustomHeader = ({ 
  
  title, 
  onBackPress, 
  showBackButton = true,
  backgroundColor = 'transparent',
  textColor = '#fff',
  rightIcons = true,
  user, // Add user prop to show avatar
  showAvatar = false,
}) => {
    const navigation = useNavigation(); // Get navigation from hook
     const route = useRoute(); // Get route from hook, not from props
//console.log(route.name);
const isNotHome = route.name !== 'Home';
     const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleHomePress = () => {
    // Navigate to Dashboard or home screen

  };

  const handleNotificationPress = () => {
    // Handle notification press
   // console.log('Notification pressed');
  };

  return (
    <SafeAreaView  edges={['top']} style={{ backgroundColor }} >

        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity   style={styles.backButton}   onPress={() => navigation.goBack()}  >
         
  <View>
  {isNotHome && (
    <Ionicons name="arrow-back" size={24} color="#fff" />
  )}
</View>
         
          </TouchableOpacity>
          
          <View style={styles.profileRow}>
            <Image
              source={{ uri: user?.avatar || 'https://via.placeholder.com/60' }}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.hello}>Hello There</Text>
              <Text style={styles.name}>{user?.name || 'User'}</Text>
              <Text style={styles.email}>{user?.email}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>


          {/* <View style={styles.topBar}>
        <Ionicons name="home-outline" size={22} color="#fff" />
        <Ionicons name="notifications-outline" size={22} color="#fff" />
      </View>
        <View style={styles.userRow}>
          <Image
            // source={{ uri: "https://i.pravatar.cc/100" }}
            source={{ uri:user.avatar }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.smallText}>Hello There</Text>
            <Text style={styles.name}>{user?.name || "User"}</Text>
            <Text style={styles.smallText}>{user?.email}</Text>
          </View>
          </View> */}



          </SafeAreaView>
  );
};

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
  smallText: { color: "#ccc", fontSize: 11 },
  name: { color: "#fff", fontSize: 15, fontWeight: "600" },
header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
    marginTop: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
    profileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
  },
  profileInfo: {
      flex: 1,
    },
    avatar: {
      width: 45,
      height: 45,
      borderRadius: 22.5,
      marginRight: 12,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    hello: { 
      color: '#9bb1ff', 
      fontSize: 11,
      marginBottom: 2,
    },
    name: { 
      color: '#fff', 
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 2,
    },
    email: { 
      color: '#aab6ff', 
      fontSize: 11,
      opacity: 0.9,
  },
});

export default CustomHeader;