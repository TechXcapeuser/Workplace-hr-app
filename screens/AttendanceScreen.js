import React, { useEffect, useState, useCallback } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  ScrollView, // Add ScrollView
} from "react-native";
import axios from "axios";
import { API } from '../utils/api';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomHeader from "./components/CustomHeader";

const MONTHS = [
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
];

const AttendanceScreen = ({ navigation }) => {
  const route = useRoute();
  const { token, user } = route.params || {};

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [attendanceList, setAttendanceList] = useState([]);
  const [summary, setSummary] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);

  /* ================= API CALL ================= */
  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        API(`/employees/attendance-detail?month=${month}&user_id=${user.id}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const apiData = res.data.data;

      setAttendanceList(apiData.employee_attendance || []);
      setSummary(apiData.attendance_summary || {});
      setTodayAttendance(apiData.employee_today_attendance || {});
    } catch (err) {
      console.log("Attendance API Error:", err.response?.data || err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [month]);

  /* ================= PULL TO REFRESH ================= */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAttendance();
  }, []);

  /* ================= LIST ITEM ================= */
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() =>
        navigation.navigate("AttendanceDetail", { attendance: item })
      }
      activeOpacity={0.8}
    >
      <Text style={styles.cell}>{item.attendance_date}</Text>
      <Text style={styles.cell}>{item.week_day}</Text>
      <Text style={styles.cell}>{item.check_in}</Text>
      <Text style={styles.cell}>
        {item.check_out && item.check_out !== "-" ? item.check_out : "-"}
      </Text>
      <Icon name="check" size={20} color="#64B5F6" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
     
      <StatusBar backgroundColor="#0b1530" barStyle="light-content" />
      
      {/* WRAP ENTIRE CONTENT IN SCROLLVIEW WITH REFRESH CONTROL */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#64B5F6"]}
            tintColor="#64B5F6"
          />
        }
        showsVerticalScrollIndicator={false}
      > 
      <CustomHeader user={user} />
        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          <Text style={styles.title}>Attendance History</Text>

          <TouchableOpacity
            style={styles.monthBtn}
            onPress={() => setShowMonthModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.monthText}>
              {MONTHS.find(m => m.value === month)?.label}
            </Text>
            <Icon name="keyboard-arrow-down" size={20} color="#000" style={styles.dropdownIcon} />
          </TouchableOpacity>
        </View>

        {/* ===== TODAY STATUS CARD ===== */}
        {todayAttendance && (
          <View style={styles.todayCard}>
            <View style={styles.todayCardHeader}>
              <Icon name="today" size={18} color="#64B5F6" />
              <Text style={styles.todayCardTitle}>Today's Status</Text>
            </View>
            
            <View style={styles.todayCardContent}>
              <View style={styles.todayRow}>
                <View style={styles.todayLabelContainer}>
                  <Icon name="login" size={16} color="#64B5F6" />
                  <Text style={styles.todayLabel}>Check In</Text>
                </View>
                <Text style={styles.todayValue}>
                  {todayAttendance.check_in_at || "-"}
                </Text>
              </View>
              
              <View style={styles.todayRow}>
                <View style={styles.todayLabelContainer}>
                  <Icon name="logout" size={16} color="#FF9800" />
                  <Text style={styles.todayLabel}>Check Out</Text>
                </View>
                <Text style={styles.todayValue}>
                  {todayAttendance.check_out_at || "-"}
                </Text>
              </View>
              
              <View style={styles.todayRow}>
                <View style={styles.todayLabelContainer}>
                  <Icon name="timelapse" size={16} color="#4CAF50" />
                  <Text style={styles.todayLabel}>Productive Time</Text>
                </View>
                <Text style={styles.todayValue}>
                  {todayAttendance.productive_time_in_min || "0"} min
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ===== SUMMARY ===== */}
        {summary && (
          <View style={styles.summaryRow}>
            <View style={[styles.card, styles.cardElevated]}>
              <View style={styles.cardIconContainer}>
                <Icon name="calendar-today" size={24} color="#64B5F6" />
              </View>
              <Text style={styles.cardLabel}>Present Days</Text>
              <Text style={styles.cardValue}>{summary.totalPresent}</Text>
            </View>

            <View style={[styles.card, styles.cardElevated]}>
              <View style={styles.cardIconContainer}>
                <Icon name="access-time" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.cardLabel}>Worked Hours</Text>
              <Text style={styles.cardValue}>
                {summary.totalWorkedHours}
              </Text>
            </View>
          </View>
        )}

        {/* ===== LIST ===== */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#64B5F6" />
            <Text style={styles.loadingText}>Loading attendance data...</Text>
          </View>
        ) : attendanceList.length > 0 ? (
          <FlatList
            data={attendanceList}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            scrollEnabled={false} // Disable scrolling in nested FlatList
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="event-busy" size={60} color="#546E7A" />
                <Text style={styles.emptyText}>No attendance records found</Text>
                <Text style={styles.emptySubText}>Select a different month</Text>
              </View>
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="event-busy" size={60} color="#546E7A" />
            <Text style={styles.emptyText}>No attendance records found</Text>
            <Text style={styles.emptySubText}>Select a different month</Text>
          </View>
        )}

        {/* ===== MONTH MODAL (ORIGINAL WORKING DROPDOWN) ===== */}
        <Modal transparent visible={showMonthModal} animationType="fade">
          <View style={styles.modalOverlay}>
            {/* Background click to close */}
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setShowMonthModal(false)}
            />

            {/* Modal content */}
            <View style={styles.modal}>
              <FlatList
                data={MONTHS}
                keyExtractor={(item) => item.value.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.monthItem,
                      item.value === month && styles.selectedMonthItem,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      setMonth(item.value);
                      setShowMonthModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.monthItemText,
                        item.value === month && styles.selectedMonthItemText,
                      ]}
                    >
                      {item.label}
                    </Text>

                    {item.value === month && (
                      <Icon name="check" size={18} color="#4CAF50" />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AttendanceScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0b1530",
  },
  container: {
    flex: 1,
    backgroundColor: "#0b1530",
  },
  scrollContent: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 30, // Add bottom padding
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  monthBtn: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 120,
  },
  monthText: {
    fontWeight: "600",
    color: "#000",
    fontSize: 14,
  },
  dropdownIcon: {
    marginLeft: 4,
  },
  // Today Card Styles
  todayCard: {
    backgroundColor: "rgb(0, 0, 0)",
    borderRadius: 14,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  todayCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  todayCardTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  todayCardContent: {
    padding: 16,
  },
  todayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  todayLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  todayLabel: {
    color: "#B0BEC5",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 10,
  },
  todayValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  // Summary Styles
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#000000",
    width: "48%",
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  cardElevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(100, 181, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    color: "#B0BEC5",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  cardValue: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    backgroundColor: "rgb(0, 0, 0)",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cell: {
    color: "#fff",
    width: "23%",
    fontSize: 13,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    width: "80%",
    borderRadius: 12,
    maxHeight: "70%",
    overflow: 'hidden',
  },
  monthItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  selectedMonthItem: {
    backgroundColor: 'rgba(100, 181, 246, 0.1)',
  },
  monthItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  selectedMonthItemText: {
    color: "#2196F3",
    fontWeight: "600",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
  loadingText: {
    color: "#B0BEC5",
    fontSize: 14,
    marginTop: 16,
    fontWeight: "500",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
    marginTop: 20,
  },
  emptyText: {
    color: "#B0BEC5",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubText: {
    color: "#78909C",
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 10,
  },
});