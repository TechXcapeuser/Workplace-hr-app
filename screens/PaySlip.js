import React, { useState, useEffect, useCallback } from 'react'; // Add useCallback
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  RefreshControl, // Add RefreshControl
} from 'react-native';
import axios from 'axios';
import { API } from '../utils/api';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from "expo-linear-gradient";
import CustomHeader from "./components/CustomHeader";

const Row = ({ label, value, valueStyle }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, valueStyle]}>{value}</Text>
  </View>
);

const PayslipScreen = () => {
  const route = useRoute();
  const { token, user } = route.params || {};
  
  const [payslipData, setPayslipData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('₹');
  const [earnings, setEarnings] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [refreshing, setRefreshing] = useState(false); // Add refreshing state

  // Fetch payslip data
  const fetchPayslipData = async () => {
    try {
      const response = await axios.get(API(`employee/payslip/${user.id}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.data.status && response.data.data) {
        setPayslipData(response.data.data.payslipData);
        setCurrency(response.data.data.currency || '₹');
        setEarnings(response.data.data.earnings || []);
        setDeductions(response.data.data.deductions || []);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch payslip data');
      console.error('Payslip fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false); // Stop refreshing
    }
  };

  useEffect(() => {
    fetchPayslipData();
  }, []);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPayslipData();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return `${currency} 0.00`;
    
    return `${currency} ${numAmount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  if (loading && !refreshing) {
    return (
      <LinearGradient colors={["#000", "#0B1D4D"]} style={{ flex: 1 }}>
        <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: '#fff' }}>Loading...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!payslipData && !refreshing) {
    return (
      <LinearGradient colors={["#000", "#0B1D4D"]} style={{ flex: 1 }}>
        <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: '#fff' }}>No payslip data available</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#000", "#0B1D4D"]} style={{ flex: 1 }}>
     
      
      {/* Wrap entire content in ScrollView with RefreshControl */}
      <ScrollView 
        contentContainerStyle={styles.scroll}
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
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <Text style={styles.month}>{payslipData.payslip_title}</Text>

          {/* Employee Info */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Emp Id : {payslipData.employee_code}</Text>
            <Text style={styles.infoName}>{payslipData.employee_name}</Text>
            <Text style={styles.infoText}>{payslipData.designation}</Text>
            <Text style={styles.infoText}>Joining Date : {payslipData.joining_date}</Text>
          </View>

          <View style={styles.lineStyle} />

          {/* Earnings */}
          <Text style={styles.sectionTitle}>Earnings</Text>
          <View style={styles.card}>
            {/* Basic Salary */}
            <Row label="Basic Salary" value={formatCurrency(payslipData.basic_salary)} />
            
            {/* Fixed Allowance */}
            <Row label="Fixed Allowance" value={formatCurrency(payslipData.fixed_allowance)} />
            
            {/* Loop through earnings array */}
            {earnings.map((earning, index) => (
              <Row 
                key={`earning-${earning.salary_component_id || index}`}
                label={earning.name} 
                value={formatCurrency(earning.amount)} 
              />
            ))}
            
            {/* Gross Salary Total */}
            <View style={styles.row}>
              <Text style={[styles.label, { fontWeight: 'bold' }]}>Gross Earnings</Text>
              <Text style={[styles.value, { fontWeight: 'bold' }]}>
                {formatCurrency(payslipData.gross_salary)}
              </Text>
            </View>
          </View>

          <View style={styles.lineStyle} />

          {/* Deductions */}
          <Text style={styles.sectionTitle}>Deductions</Text>
          <View style={styles.card}>
            {/* TDS */}
            <Row label="TDS" value={formatCurrency(payslipData.tds)} />
            
            {/* PF Deduction */}
            {parseFloat(payslipData.pf_deduction || 0) > 0 && (
              <Row label="PF Deduction" value={formatCurrency(payslipData.pf_deduction)} />
            )}
            
            {/* SSF Deduction */}
            {parseFloat(payslipData.ssf_deduction || 0) > 0 && (
              <Row label="SSF Deduction" value={formatCurrency(payslipData.ssf_deduction)} />
            )}
            
            {/* Loop through deductions array */}
            {deductions.map((deduction, index) => (
              <Row 
                key={`deduction-${deduction.salary_component_id || index}`}
                label={deduction.name} 
                value={formatCurrency(deduction.amount)} 
              />
            ))}
            
            {/* Total Deductions */}
            <View style={styles.row}>
              <Text style={[styles.label, { fontWeight: 'bold' }]}>Total Deductions</Text>
              <Text style={[styles.value, { fontWeight: 'bold' }]}>
                {(() => {
                  // Calculate total deductions
                  const tds = parseFloat(payslipData.tds || 0);
                  const pf = parseFloat(payslipData.pf_deduction || 0);
                  const ssf = parseFloat(payslipData.ssf_deduction || 0);
                  const deductionsTotal = deductions.reduce((sum, deduction) => 
                    sum + parseFloat(deduction.amount || 0), 0);
                  
                  const total = tds + pf + ssf + deductionsTotal;
                  return formatCurrency(total);
                })()}
              </Text>
            </View>
          </View>

          {/* Actual Salary */}
          <View style={styles.card}>
            <Row 
              label="Actual Salary" 
              value={formatCurrency(
                parseFloat(payslipData.gross_salary || 0) - 
                parseFloat(payslipData.tds || 0) - 
                parseFloat(payslipData.pf_deduction || 0) - 
                parseFloat(payslipData.ssf_deduction || 0)
              )} 
            />
          </View>

          <View style={styles.lineStyle} />

          {/* Adjustments */}
          <View style={styles.card}>
            <Row
              label="Absent Deduction"
              value={`${currency} ${parseFloat(payslipData.absent_deduction || 0).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`}
              valueStyle={parseFloat(payslipData.absent_deduction) < 0 ? styles.green : styles.red}
            />
            <Row
              label="Overtime"
              value={formatCurrency(payslipData.overtime)}
              valueStyle={styles.green}
            />
            <Row
              label="Undertime"
              value={formatCurrency(payslipData.undertime)}
              valueStyle={styles.red}
            />
          </View>

          {/* Net Salary */}
          <View style={styles.netSalaryBox}>
            <Text style={styles.netTitle}>Net Salary</Text>
            <Text style={styles.netAmount}>
              {formatCurrency(payslipData.net_salary)} <Text style={styles.netSmall}>({payslipData.net_salary_figure})</Text>
            </Text>
          </View>
        </SafeAreaView>
      </ScrollView>
    </LinearGradient>
  );
};

export default PayslipScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 1,
  },
  lineStyle: {
    borderWidth: 0.5,
    borderColor: 'white',
    margin: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 30, // Increased bottom padding for better scrolling
    paddingTop: 10, // Adjusted top padding
  },
  title: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 6,
  },
  logoxx: {
    color: '#ff2d2d',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  logo: {
    width: 170,
    height: 60,
    marginBottom: 0,
    alignSelf: 'center',
  },
  subTitle: {
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 16,
  },
  month: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
    marginTop: 10, // Added margin top
  },
  infoBox: {
    marginBottom: 16,
  },
  infoText: {
    color: '#ccc',
    fontSize: 14,
  },
  infoName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 4,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    marginVertical: 10,
    fontWeight: '600',
  },
  card: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  label: {
    color: '#ccc',
    fontSize: 14,
  },
  value: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  green: {
    color: '#3ddc84',
  },
  red: {
    color: '#ff4d4d',
  },
  netSalaryBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    marginBottom: 20, // Added bottom margin
  },
  netTitle: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 6,
  },
  netAmount: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  netSmall: {
    fontSize: 12,
    color: '#aaa',
  },
});