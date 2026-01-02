import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  StatusBar,
  Modal,
  TextInput,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { API } from '../utils/api';
import { useRoute, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const LeaveScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { token, user } = route.params || {};

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('This Month');
  
  // Regular Leave Modal states
  const [regularModalVisible, setRegularModalVisible] = useState(false);
  const [regularSlideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reason, setReason] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [leaveTypeDropdownOpen, setLeaveTypeDropdownOpen] = useState(false);

  // Time Leave Modal states
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [timeSlideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));
  const [timeLeaveDate, setTimeLeaveDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [timeReason, setTimeReason] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Fetch leave types
  const fetchLeaveTypes = async () => {
    try {
      const response = await axios.get(API('/leave-types'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.data.status) {
        setLeaveTypes(response.data.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch leave types');
      console.error('Leave types error:', error);
    }
  };

  // Fetch leave requests
  const fetchLeaveRequests = async () => {
    try {
      const response = await axios.get(API('/leave-requests/employee-leave-requests?year=2025'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.data.status) {
        setLeaveRequests(response.data.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch leave requests');
      console.error('Leave requests error:', error);
    }
  };

  // Load all data
  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchLeaveTypes(), fetchLeaveRequests()]);
    setLoading(false);
  };

  // Initial load
  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [token]);

  // Handle leave card press
  const handleLeaveCardPress = (leaveType) => {
    Alert.alert(
      leaveType.leave_type_name,
      `Allocated: ${leaveType.total_leave_allocated}\nTaken: ${leaveType.leave_taken}\nRemaining: ${leaveType.total_leave_allocated - leaveType.leave_taken}`
    );
  };

  // Handle regular issue leave button - Show modal
  const handleIssueLeave = () => {
    setRegularModalVisible(true);
    Animated.timing(regularSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Handle time leave button - Show modal
  const handleTimeLeave = () => {
    setTimeModalVisible(true);
    Animated.timing(timeSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Handle close regular modal
  const handleCloseRegularModal = () => {
    Animated.timing(regularSlideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setRegularModalVisible(false);
      resetRegularForm();
    });
  };

  // Handle close time modal
  const handleCloseTimeModal = () => {
    Animated.timing(timeSlideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeModalVisible(false);
      resetTimeForm();
    });
  };

  // Reset regular form
  const resetRegularForm = () => {
    setSelectedLeaveType(null);
    setStartDate(new Date());
    setEndDate(new Date());
    setReason('');
    setLeaveTypeDropdownOpen(false);
  };

  // Reset time form
  const resetTimeForm = () => {
    setTimeLeaveDate(new Date());
    setStartTime(new Date());
    setEndTime(new Date());
    setTimeReason('');
  };

  // Handle regular leave request - UPDATED FOR NEW API
  const handleRequestLeave = async () => {
    if (!selectedLeaveType) {
      Alert.alert('Error', 'Please select a leave type');
      return;
    }

    if (!reason.trim()) {
      Alert.alert('Error', 'Please enter a reason');
      return;
    }

    try {
      // Prepare data according to the API specification
      const leaveData = {
        leave_type_id: selectedLeaveType.id,
        leave_from: startDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
        leave_to: endDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
        reasons: reason.trim(), // Note: field name is "reasons" not "leave_reason"
        early_exit: 0, // Default value as per API spec
        title: selectedLeaveType.leave_type_name // Using leave type name as title
      };

      console.log('Sending leave request data:', leaveData);

      const response = await axios.post(API('/leave-requests/store'), leaveData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('API Response:', response.data);

      if (response.data.status === true || response.data.success === true) {
        Alert.alert('Success', response.data.message || 'Leave request submitted successfully');
        handleCloseRegularModal();
        loadData(); // Refresh leave requests
      } else {
        Alert.alert(
          'Error', 
          response.data.message || 
          response.data.error || 
          'Failed to submit leave request'
        );
      }
    } catch (error) {
      console.error('Submit leave error:', error);
      
      // More detailed error handling
      if (error.response) {
        // Server responded with error status
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
        
        Alert.alert(
          'Error', 
          error.response.data?.message || 
          error.response.data?.error || 
          `Request failed with status ${error.response.status}`
        );
      } else if (error.request) {
        // Request was made but no response
        Alert.alert('Error', 'No response from server. Please check your connection.');
      } else {
        // Something else happened
        Alert.alert('Error', error.message || 'Failed to submit leave request');
      }
    }
  };

  // Handle time leave request
  const handleRequestTimeLeave = async () => {
    if (!timeReason.trim()) {
      Alert.alert('Error', 'Please enter a reason');
      return;
    }

    // Check if end time is after start time
    if (endTime <= startTime) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    try {
      const timeLeaveData = {
        leave_type_id: leaveTypes.find(type => type.leave_type_name === "Time Leave")?.id,
        leave_date: timeLeaveDate.toISOString().split('T')[0],
        start_time: startTime.toTimeString().split(' ')[0],
        end_time: endTime.toTimeString().split(' ')[0],
        leave_reason: timeReason,
        is_time_leave: true,
      };

      const response = await axios.post(API('/time-leave-requests'), timeLeaveData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.status) {
        Alert.alert('Success', 'Time leave request submitted successfully');
        handleCloseTimeModal();
        loadData(); // Refresh leave requests
      } else {
        Alert.alert('Error', response.data.message || 'Failed to submit time leave request');
      }
    } catch (error) {
      console.error('Submit time leave error:', error);
      Alert.alert('Error', 'Failed to submit time leave request');
    }
  };

  // Handle date change for regular leave
  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      // If end date is before start date, update end date
      if (endDate < selectedDate) {
        setEndDate(selectedDate);
      }
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate && selectedDate >= startDate) {
      setEndDate(selectedDate);
    } else if (selectedDate) {
      Alert.alert('Error', 'End date cannot be before start date');
    }
  };

  // Handle date/time change for time leave
  const onTimeDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setTimeLeaveDate(selectedDate);
    }
  };

  const onStartTimeChange = (event, selectedTime) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      setStartTime(selectedTime);
    }
  };

  const onEndTimeChange = (event, selectedTime) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      setEndTime(selectedTime);
    }
  };

  // Filter leave requests by tab
  const filteredLeaveRequests = leaveRequests.filter(request => {
    if (activeTab === 'This Year') {
      return true; // Show all for this year
    }
    // For "This Month" filter - you can implement actual month filtering
    return true;
  });

  // Generate unique key function
  const generateUniqueKey = (item, index, prefix = '') => {
    if (item && item.id) {
      return `${prefix}-${item.id}-${index}`;
    }
    return `${prefix}-${Date.now()}-${Math.random()}-${index}`;
  };

  // Format time to HH:MM AM/PM
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <StatusBar barStyle="light-content" backgroundColor="#0b1c3d" />
        <ActivityIndicator size="large" color="#1E90FF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0b1c3d" />
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1E90FF']}
            tintColor="#1E90FF"
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
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

        <Text style={styles.sectionTitle}>Leave Balance</Text>

        {/* Leave Cards */}
        <View style={styles.grid}>
          {leaveTypes.map((type, index) => (
            <TouchableOpacity 
              key={generateUniqueKey(type, index, 'leaveType')}
              style={styles.leaveCard}
              onPress={() => handleLeaveCardPress(type)}
              activeOpacity={0.7}
            >
              <Text style={styles.cardTitle}>{type.leave_type_name}</Text>
              <Text style={styles.cardValue}>
                {type.leave_taken || 0}/{type.total_leave_allocated || 0}
              </Text>
              {type.leave_type_name === "Time Leave" && (
                <Text style={styles.timeLeaveText}>Time based</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.primaryBtn}
            onPress={handleIssueLeave}
          >
            <Text style={styles.btnText}>Issue Leave</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.secondaryBtn}
            onPress={handleTimeLeave}
          >
            <Text style={styles.btnText}>Time Leave</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Leave Activity</Text>

        {/* Leave Requests List */}
        {filteredLeaveRequests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No leave requests found</Text>
          </View>
        ) : (
          filteredLeaveRequests.map((request, index) => (
            <ActivityCard
              key={generateUniqueKey(request, index, 'leaveRequest')}
              title={request.leave_type_name}
              from={`${request.leave_from} - ${request.leave_to}`}
              applied={`Applied: ${request.leave_requested_date}`}
              status={request.status}
              reason={request.leave_reason}
              adminRemark={request.admin_remark}
              earlyExit={request.early_exit}
              updatedBy={request.status_updated_by}
            />
          ))
        )}
      </ScrollView>

      {/* Apply Leave Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={regularModalVisible}
        onRequestClose={handleCloseRegularModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleCloseRegularModal}
          />
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                transform: [{ translateY: regularSlideAnim }]
              }
            ]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Text style={styles.modalTitle}>Apply Leave</Text>
                <TouchableOpacity onPress={handleCloseRegularModal} style={styles.closeButton}>
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView 
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Select Leave Type Dropdown */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Select Leave Type</Text>
                <TouchableOpacity 
                  style={styles.dropdownButton}
                  onPress={() => setLeaveTypeDropdownOpen(!leaveTypeDropdownOpen)}
                >
                  <View style={styles.dropdownButtonContent}>
                    <Text style={selectedLeaveType ? styles.dropdownTextSelected : styles.dropdownText} numberOfLines={1}>
                      {selectedLeaveType ? selectedLeaveType.leave_type_name : 'Choose leave type'}
                    </Text>
                  </View>
                  <Ionicons 
                    name={leaveTypeDropdownOpen ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color="#9bb1ff" 
                  />
                </TouchableOpacity>
                
                {leaveTypeDropdownOpen && (
                  <View style={styles.dropdownListContainer}>
                    <ScrollView 
                      style={styles.dropdownList}
                      nestedScrollEnabled={true}
                      showsVerticalScrollIndicator={true}
                    >
                      {leaveTypes.map((type, index) => (
                        <TouchableOpacity
                          key={type.id || `leave-type-${index}`}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setSelectedLeaveType(type);
                            setLeaveTypeDropdownOpen(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText} numberOfLines={1}>
                            {type.leave_type_name}
                          </Text>
                          <Text style={styles.dropdownItemSubText}>
                            Remaining: {type.total_leave_allocated - type.leave_taken}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Start Date */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Select Start Date</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={16} color="#1E90FF" />
                  <Text style={styles.dateText} numberOfLines={1} ellipsizeMode="tail">
                    {startDate.toDateString()}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* End Date */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Select End Date</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={16} color="#1E90FF" />
                  <Text style={styles.dateText} numberOfLines={1} ellipsizeMode="tail">
                    {endDate.toDateString()}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Reason */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Reason</Text>
                <TextInput
                  style={styles.reasonInput}
                  value={reason}
                  onChangeText={setReason}
                  placeholder="Enter reason for leave"
                  placeholderTextColor="#6c757d"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleRequestLeave}
              >
                <Text style={styles.submitButtonText}>Request Leave</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>

        {/* Regular Leave Date Pickers */}
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onStartDateChange}
            minimumDate={new Date()}
            themeVariant="dark"
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onEndDateChange}
            minimumDate={startDate}
            themeVariant="dark"
          />
        )}
      </Modal>

      {/* Time Leave Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={timeModalVisible}
        onRequestClose={handleCloseTimeModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleCloseTimeModal}
          />
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                transform: [{ translateY: timeSlideAnim }]
              }
            ]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Text style={styles.modalTitle}>Time Leave</Text>
                <TouchableOpacity onPress={handleCloseTimeModal} style={styles.closeButton}>
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView 
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Select Date */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Select Date</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={16} color="#1E90FF" />
                  <Text style={styles.dateText} numberOfLines={1} ellipsizeMode="tail">
                    {timeLeaveDate.toDateString()}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Select Start Time */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Select Start Time</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowStartTimePicker(true)}
                >
                  <Ionicons name="time-outline" size={16} color="#1E90FF" />
                  <Text style={styles.dateText} numberOfLines={1} ellipsizeMode="tail">
                    {formatTime(startTime)}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Select End Time */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Select End Time</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowEndTimePicker(true)}
                >
                  <Ionicons name="time-outline" size={16} color="#1E90FF" />
                  <Text style={styles.dateText} numberOfLines={1} ellipsizeMode="tail">
                    {formatTime(endTime)}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Reason */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Reason</Text>
                <TextInput
                  style={styles.reasonInput}
                  value={timeReason}
                  onChangeText={setTimeReason}
                  placeholder="Enter reason for time leave"
                  placeholderTextColor="#6c757d"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleRequestTimeLeave}
              >
                <Text style={styles.submitButtonText}>Request Leave</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>

        {/* Time Leave Pickers */}
        {showDatePicker && (
          <DateTimePicker
            value={timeLeaveDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onTimeDateChange}
            minimumDate={new Date()}
            themeVariant="dark"
          />
        )}

        {showStartTimePicker && (
          <DateTimePicker
            value={startTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onStartTimeChange}
            themeVariant="dark"
          />
        )}

        {showEndTimePicker && (
          <DateTimePicker
            value={endTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onEndTimeChange}
            themeVariant="dark"
          />
        )}
      </Modal>
    </SafeAreaView>
  );
};

/* ---------------- Components ---------------- */

const ActivityCard = ({ 
  title, 
  from, 
  applied, 
  status, 
  reason,
  adminRemark,
  earlyExit,
  updatedBy 
}) => {
  const statusStyle = status === 'Approved'
    ? styles.approved
    : status === 'Rejected'
    ? styles.rejected
    : status === 'Cancelled'
    ? styles.cancelled
    : styles.pending;

  return (
    <View style={styles.activityCard}>
      <View style={styles.activityHeader}>
        <Text style={styles.activityTitle}>{title}</Text>
        <View style={[styles.statusBadge, statusStyle]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>
      
      <Text style={styles.activityText}>{from}</Text>
      <Text style={styles.activityText}>{applied}</Text>
      
      {reason && (
        <Text style={styles.activityText}>
          <Text style={styles.label}>Reason: </Text>{reason}
        </Text>
      )}
      
      {adminRemark && adminRemark !== '-' && (
        <Text style={styles.activityText}>
          <Text style={styles.label}>Admin Remark: </Text>{adminRemark}
        </Text>
      )}
      
      {earlyExit && (
        <Text style={[styles.activityText, styles.earlyExit]}>
          ⚡ Early Exit Request
        </Text>
      )}
      
      <View style={styles.activityFooter}>
        <Text style={styles.activityText}>
          Updated by: {updatedBy || 'Admin'}
        </Text>
      </View>
    </View>
  );
};

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0b1c3d',
  },
  container: {
    flex: 1,
    backgroundColor: '#0b1c3d',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  notificationButton: {
    padding: 8,
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

  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    marginTop: 8,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  leaveCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    color: '#cdd7ff',
    fontSize: 13,
    marginBottom: 4,
  },
  cardValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  timeLeaveText: {
    color: '#1E90FF',
    fontSize: 10,
    marginTop: 4,
    fontStyle: 'italic',
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  primaryBtn: {
    backgroundColor: '#0b5ed7',
    borderRadius: 10,
    paddingVertical: 14,
    width: '48%',
    alignItems: 'center',
  },
  secondaryBtn: {
    backgroundColor: '#1b2f6b',
    borderRadius: 10,
    paddingVertical: 14,
    width: '48%',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },

  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#9bb1ff',
    fontSize: 14,
    textAlign: 'center',
  },

  activityCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  activityText: {
    color: '#cdd7ff',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
  },
  label: {
    fontWeight: '600',
    color: '#fff',
  },
  earlyExit: {
    color: '#FFD700',
    fontWeight: '600',
    fontSize: 10,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  approved: { backgroundColor: '#28a745' },
  rejected: { backgroundColor: '#dc3545' },
  cancelled: { backgroundColor: '#ff6b6b' },
  pending: { backgroundColor: '#ffc107' },
  statusText: { 
    color: '#fff', 
    fontSize: 11,
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    backgroundColor: '#0b1c3d',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalLabel: {
    color: '#9bb1ff',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  dropdownButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minHeight: 46,
  },
  dropdownButtonContent: {
    flex: 1,
    marginRight: 8,
  },
  dropdownText: {
    color: '#6c757d',
    fontSize: 13,
    lineHeight: 18,
  },
  dropdownTextSelected: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  dropdownListContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 999,
    elevation: 999,
    maxHeight: 200,
  },
  dropdownList: {
    backgroundColor: '#1b2f6b',
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    minHeight: 48,
    justifyContent: 'center',
  },
  dropdownItemContent: {
    flex: 1,
  },
  dropdownItemText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
    lineHeight: 16,
  },
  dropdownItemSubText: {
    color: '#9bb1ff',
    fontSize: 11,
    lineHeight: 14,
  },
  dateButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minHeight: 46,
  },
  dateText: {
    color: '#fff',
    fontSize: 13,
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
  reasonInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    textAlignVertical: 'top',
    minHeight: 100,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: '#0b5ed7',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default LeaveScreen;