import React, {useEffect, useState} from 'react';
import {useRoute} from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import axios from 'axios';
import {API} from '../utils/api';

const Holidays = ({navigation}) => {
  const route = useRoute();
  const {token} = route.params || {};

  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get(API(`/holidays`), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      setHolidays(res.data.data || []);
    } catch (error) {
      console.log('Holiday API Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const today = new Date();

  const filteredData = holidays.filter(item => {
    const eventDate = new Date(item.event_date);
    return tab === 'upcoming'
      ? eventDate >= today
      : eventDate < today;
  });

  const renderItem = ({item}) => {
    const date = new Date(item.event_date);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', {month: 'short'});

    return (
      <View style={styles.card}>
        <View
          style={[
            styles.dateBox,
            {backgroundColor: item.is_public_holiday ? '#E74C3C' : '#3498DB'},
          ]}>
          <Text style={styles.day}>{day}</Text>
          <Text style={styles.month}>{month}</Text>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.event}>{item.event}</Text>
          <Text style={styles.subText}>{item.event_date}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1C3D" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Holidays</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, tab === 'upcoming' && styles.activeTab]}
          onPress={() => setTab('upcoming')}>
          <Text style={styles.tabText}>Upcoming</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, tab === 'past' && styles.activeTab]}
          onPress={() => setTab('past')}>
          <Text style={styles.tabText}>Past</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading && !refreshing ? (
        <ActivityIndicator color="#fff" style={{marginTop: 40}} />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={fetchHolidays}
          contentContainerStyle={{paddingBottom: 20}}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default Holidays;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1C3D',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  back: {
    color: '#fff',
    fontSize: 22,
    marginRight: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#1E2F5A',
    borderRadius: 10,
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  activeTab: {
    backgroundColor: '#2C3E75',
    borderRadius: 10,
  },
  tabText: {
    color: '#fff',
    fontSize: 14,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1B2B4F',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  dateBox: {
    width: 55,
    height: 55,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  day: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  month: {
    color: '#fff',
    fontSize: 12,
  },
  textContainer: {
    marginLeft: 15,
    flex: 1,
  },
  event: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  subText: {
    color: '#C0C7E0',
    fontSize: 13,
    marginTop: 4,
  },
});
