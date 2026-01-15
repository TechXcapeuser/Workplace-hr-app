import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import {API} from '../utils/api';
import { useRoute, useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PayslipScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { token, user } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payslipData, setPayslipData] = useState(null);
  const [currency, setCurrency] = useState('₨');
  const [earnings, setEarnings] = useState([]);
  const [deductions, setDeductions] = useState([]);

  // Fetch payslip data
  const fetchPayslipData = async () => {
    try {
      // Using employee ID from user object or default to 1
      const employeeId = user?.id || 1;
      const response = await axios.get(API(`employee/payslip/${user.id}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      console.log('Payslip API Response:', response.data);

      if (response.data.status) {
        setPayslipData(response.data.data.payslipData);
        setCurrency(response.data.data.currency || '₨');
        setEarnings(response.data.data.earnings || []);
        setDeductions(response.data.data.deductions || []);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to fetch payslip data');
      }
    } catch (error) {
      console.error('Payslip error:', error);
      
      // For demo purposes, use static data if API fails
      if (!payslipData) {
        setPayslipData({
          company_logo: "http://192.168.18.84:8000/uploads/company/logo/Thumb-6953a9e781eba_logo-dark (1).png",
          payslip_title: "Payslip for the Month of December 2025",
          company_name: "HRS",
          company_address: "shar-e-faisal karachi",
          employee_name: "Mr.Sajidddd",
          designation: "Sr.Manager",
          employee_id: 1,
          joining_date: "",
          total_days: 31,
          present_days: 22,
          absent_days: 2,
          leave_days: 2,
          holidays: 1,
          weekends: 8,
          paid_leave: 2,
          unpaid_leave: 0,
          basic_salary: 30000,
          fixed_allowance: 20000,
          gross_salary: 50000,
          tds: 4166.67,
          tada: 0,
          advance_salary: 0,
          absent_deduction: 4545.45,
          overtime: 500,
          undertime: 100,
          net_salary: 40833.33,
          net_salary_figure: "Forty Thousand Eight Hundred Thirty-three Rupees and Thirty-three Paisa",
          employee_code: "EMP-00001"
        });
        setCurrency('₨');
        setEarnings([
          { name: 'Basic Salary', amount: 30000 },
          { name: 'Fixed Allowance', amount: 20000 }
        ]);
        setDeductions([
          { name: 'SSF Deduction', amount: 1000 }
        ]);
      }
      
      if (error.response?.status === 401) {
        Alert.alert('Error', 'Session expired. Please login again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    if (token) {
      fetchPayslipData();
    }
  }, [token]);

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPayslipData();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `${currency} ${parseFloat(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Calculate actual salary (for display purposes)
  const calculateActualSalary = () => {
    if (!payslipData) return 0;
    const totalEarnings = payslipData.gross_salary || 0;
    const totalDeductions = deductions.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    return totalEarnings - totalDeductions;
  };

  // Calculate salary after tax
  const calculateSalaryAfterTax = () => {
    const actualSalary = calculateActualSalary();
    const tax = payslipData?.tds || 0;
    return actualSalary - tax;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <StatusBar barStyle="light-content" backgroundColor="#0b1c3d" />
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text style={styles.loadingText}>Loading payslip...</Text>
      </SafeAreaView>
    );
  }

  if (!payslipData) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <StatusBar barStyle="light-content" backgroundColor="#0b1c3d" />
        <Text style={styles.errorText}>No payslip data available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPayslipData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const actualSalary = calculateActualSalary();
  const salaryAfterTax = calculateSalaryAfterTax();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0b1c3d" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Payslip</Text>
          <Text style={styles.headerSubtitle}>{payslipData.payslip_title || 'Monthly Salary Statement'}</Text>
        </View>
        
        <TouchableOpacity style={styles.downloadButton}>
          <Ionicons name="download-outline" size={22} color="#1E90FF" />
        </TouchableOpacity>
      </View>

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
        {/* Company Info Card */}
        <View style={styles.companyCard}>
          <View style={styles.companyLogoContainer}>
            <Image
              source={{ uri: payslipData.company_logo }}
              style={styles.companyLogo}
             // defaultSource={require('../assets/default-company-logo.png')} // Add a default logo
            />
          </View>
          <Text style={styles.companyName}>{payslipData.company_name}</Text>
          <Text style={styles.companyAddress}>{payslipData.company_address}</Text>
        </View>

        {/* Employee Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Employee ID</Text>
              <Text style={styles.infoValue}>{payslipData.employee_code}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{payslipData.employee_name}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Designation</Text>
              <Text style={styles.infoValue}>{payslipData.designation}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Joining Date</Text>
              <Text style={styles.infoValue}>{payslipData.joining_date || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Attendance Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendance Summary</Text>
          <View style={styles.attendanceGrid}>
            <View style={styles.attendanceItem}>
              <Text style={styles.attendanceLabel}>Total Days</Text>
              <Text style={styles.attendanceValue}>{payslipData.total_days}</Text>
            </View>
            <View style={styles.attendanceItem}>
              <Text style={styles.attendanceLabel}>Present</Text>
              <Text style={[styles.attendanceValue, styles.presentText]}>{payslipData.present_days}</Text>
            </View>
            <View style={styles.attendanceItem}>
              <Text style={styles.attendanceLabel}>Absent</Text>
              <Text style={[styles.attendanceValue, styles.absentText]}>{payslipData.absent_days}</Text>
            </View>
            <View style={styles.attendanceItem}>
              <Text style={styles.attendanceLabel}>Leave</Text>
              <Text style={[styles.attendanceValue, styles.leaveText]}>{payslipData.leave_days}</Text>
            </View>
            <View style={styles.attendanceItem}>
              <Text style={styles.attendanceLabel}>Holidays</Text>
              <Text style={[styles.attendanceValue, styles.holidayText]}>{payslipData.holidays}</Text>
            </View>
            <View style={styles.attendanceItem}>
              <Text style={styles.attendanceLabel}>Weekends</Text>
              <Text style={[styles.attendanceValue, styles.weekendText]}>{payslipData.weekends}</Text>
            </View>
          </View>
        </View>

        {/* Earnings & Deductions */}
        <View style={styles.tablesContainer}>
          {/* Earnings Table */}
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableTitle}>Earnings</Text>
            </View>
            <View style={styles.tableContent}>
              {earnings.length > 0 ? (
                earnings.map((item, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCellLabel}>{item.name}</Text>
                    <Text style={styles.tableCellValue}>{formatCurrency(item.amount)}</Text>
                  </View>
                ))
              ) : (
                <>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCellLabel}>Basic Salary</Text>
                    <Text style={styles.tableCellValue}>{formatCurrency(payslipData.basic_salary)}</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCellLabel}>Fixed Allowance</Text>
                    <Text style={styles.tableCellValue}>{formatCurrency(payslipData.fixed_allowance)}</Text>
                  </View>
                </>
              )}
              
              {/* Gross Earnings Total */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Gross Earnings</Text>
                <Text style={styles.totalValue}>{formatCurrency(payslipData.gross_salary)}</Text>
              </View>
            </View>
          </View>

          {/* Deductions Table */}
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableTitle}>Deductions</Text>
            </View>
            <View style={styles.tableContent}>
              {deductions.length > 0 ? (
                deductions.map((item, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCellLabel}>{item.name}</Text>
                    <Text style={[styles.tableCellValue, styles.deductionText]}>{formatCurrency(item.amount)}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.tableRow}>
                  <Text style={styles.tableCellLabel}>SSF Deduction</Text>
                  <Text style={[styles.tableCellValue, styles.deductionText]}>{formatCurrency(1000)}</Text>
                </View>
              )}
              
              {/* Total Deductions */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Deductions</Text>
                <Text style={[styles.totalValue, styles.deductionText]}>
                  {formatCurrency(deductions.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) || 1000)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Salary Breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Salary Breakdown</Text>
          
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>
              Actual Salary <Text style={styles.breakdownSubLabel}>(Total Earning - Total Deductions)</Text>
            </Text>
            <Text style={styles.breakdownValue}>{formatCurrency(actualSalary)}</Text>
          </View>
          
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Tax (TDS)</Text>
            <Text style={[styles.breakdownValue, styles.deductionText]}>{formatCurrency(payslipData.tds)}</Text>
          </View>
          
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Salary After Tax</Text>
            <Text style={styles.breakdownValue}>{formatCurrency(salaryAfterTax)}</Text>
          </View>
          
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>
              Absent Deduction <Text style={styles.breakdownSubLabel}>
                ((Gross Salary / Total Days) × Absent Days)
              </Text>
            </Text>
            <Text style={[styles.breakdownValue, styles.deductionText]}>
              {formatCurrency(payslipData.absent_deduction)}
            </Text>
          </View>
          
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Overtime Income</Text>
            <Text style={[styles.breakdownValue, styles.earningText]}>{formatCurrency(payslipData.overtime)}</Text>
          </View>
          
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Undertime</Text>
            <Text style={[styles.breakdownValue, styles.deductionText]}>{formatCurrency(payslipData.undertime)}</Text>
          </View>
          
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Advance Salary</Text>
            <Text style={[styles.breakdownValue, styles.deductionText]}>{formatCurrency(payslipData.advance_salary)}</Text>
          </View>
          
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>TADA</Text>
            <Text style={[styles.breakdownValue, styles.earningText]}>{formatCurrency(payslipData.tada)}</Text>
          </View>
        </View>

        {/* Net Salary Card */}
        <View style={styles.netSalaryCard}>
          <Text style={styles.netSalaryTitle}>Net Salary</Text>
          <Text style={styles.netSalaryAmount}>{formatCurrency(payslipData.net_salary)}</Text>
          <Text style={styles.netSalaryInWords}>{payslipData.net_salary_figure}</Text>
          <Text style={styles.netSalaryFormula}>
            Net Salary = (Salary After Tax - Absent Deduction - Advance Salary + Overtime + TADA)
          </Text>
        </View>

        {/* Footer Notes */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>This is a computer-generated payslip</Text>
          <Text style={styles.footerText}>No signature required</Text>
          <Text style={styles.footerDate}>Generated on: {new Date().toLocaleDateString()}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    paddingTop: 0,
    paddingBottom: 30,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9bb1ff',
    marginTop: 10,
    fontSize: 14,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1E90FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 40,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#9bb1ff',
    fontSize: 12,
    marginTop: 2,
  },
  downloadButton: {
    padding: 8,
  },

  // Company Card
  companyCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  companyLogoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  companyLogo: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  companyName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  companyAddress: {
    color: '#9bb1ff',
    fontSize: 12,
    textAlign: 'center',
  },

  // Info Card
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    color: '#9bb1ff',
    fontSize: 11,
    marginBottom: 4,
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Section
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },

  // Attendance Grid
  attendanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  attendanceItem: {
    width: '30%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  attendanceLabel: {
    color: '#9bb1ff',
    fontSize: 11,
    marginBottom: 4,
  },
  attendanceValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  presentText: {
    color: '#28a745',
  },
  absentText: {
    color: '#dc3545',
  },
  leaveText: {
    color: '#ffc107',
  },
  holidayText: {
    color: '#17a2b8',
  },
  weekendText: {
    color: '#6f42c1',
  },

  // Tables Container
  tablesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tableCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableHeader: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
  },
  tableTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  tableContent: {
    padding: 12,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  tableCellLabel: {
    color: '#cdd7ff',
    fontSize: 12,
    flex: 1,
  },
  tableCellValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deductionText: {
    color: '#ff6b6b',
  },
  earningText: {
    color: '#28a745',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    borderBottomWidth: 0,
    marginTop: 4,
    paddingTop: 12,
  },
  totalLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },

  // Breakdown Card
  breakdownCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  breakdownTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  breakdownLabel: {
    color: '#cdd7ff',
    fontSize: 12,
    flex: 1,
    marginRight: 10,
  },
  breakdownSubLabel: {
    color: '#9bb1ff',
    fontSize: 10,
    fontStyle: 'italic',
  },
  breakdownValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    minWidth: 80,
    textAlign: 'right',
  },

  // Net Salary Card
  netSalaryCard: {
    backgroundColor: 'rgba(30, 144, 255, 0.15)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(30, 144, 255, 0.3)',
  },
  netSalaryTitle: {
    color: '#1E90FF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  netSalaryAmount: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  netSalaryInWords: {
    color: '#9bb1ff',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  netSalaryFormula: {
    color: '#cdd7ff',
    fontSize: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  footerText: {
    color: '#9bb1ff',
    fontSize: 11,
    marginBottom: 4,
  },
  footerDate: {
    color: '#9bb1ff',
    fontSize: 10,
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default PayslipScreen;