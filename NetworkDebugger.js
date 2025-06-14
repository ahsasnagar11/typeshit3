// NetworkDebugger.js - Add this as a separate component to test connectivity

import React, { useState } from 'react';
import { View, Text, Button, ScrollView, Alert } from 'react-native';

const API_URL = 'https://api-alpha-nine-75.vercel.app';

const NetworkDebugger = () => {
  const [results, setResults] = useState([]);
  const [testing, setTesting] = useState(false);

  const addResult = (test, success, details) => {
    setResults(prev => [...prev, {
      test,
      success,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  // Test 1: Basic fetch to health endpoint
  const testFetch = async () => {
    try {
      console.log('🧪 Testing basic fetch...');
      const response = await fetch(`${API_URL}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.text(); // Get as text first
      console.log('✅ Fetch response:', response.status, data);
      
      addResult('Basic Fetch', true, `Status: ${response.status}, Data: ${data}`);
      return true;
    } catch (error) {
      console.error('❌ Fetch failed:', error);
      addResult('Basic Fetch', false, `Error: ${error.message}`);
      return false;
    }
  };

  // Test 2: Axios GET request
  const testAxiosGet = async () => {
    try {
      console.log('🧪 Testing Axios GET...');
      const axios = require('axios');
      
      const response = await axios.get(`${API_URL}/health`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      console.log('✅ Axios GET success:', response.status, response.data);
      addResult('Axios GET', true, `Status: ${response.status}, Data: ${JSON.stringify(response.data)}`);
      return true;
    } catch (error) {
      console.error('❌ Axios GET failed:', error);
      const errorDetails = error.response 
        ? `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`
        : `Network Error: ${error.message}`;
      addResult('Axios GET', false, errorDetails);
      return false;
    }
  };

  // Test 3: Axios POST (registration simulation)
  const testAxiosPost = async () => {
    try {
      console.log('🧪 Testing Axios POST...');
      const axios = require('axios');
      
      const testData = {
        fullName: 'Test User',
        email: `test_${Date.now()}@example.com`,
        gender: 'Men',
        dateOfBirth: '01/01/1990',
        introduction: 'Test user',
        type: 'Straight'
      };
      
      const response = await axios.post(`${API_URL}/register`, testData, {
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      console.log('✅ Axios POST success:', response.status, response.data);
      addResult('Axios POST', true, `Status: ${response.status}, User created: ${response.data.user?.fullName}`);
      return true;
    } catch (error) {
      console.error('❌ Axios POST failed:', error);
      const errorDetails = error.response 
        ? `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`
        : `Network Error: ${error.message}, Code: ${error.code}`;
      addResult('Axios POST', false, errorDetails);
      return false;
    }
  };

  // Test 4: XMLHttpRequest (lowest level)
  const testXHR = async () => {
    return new Promise((resolve) => {
      try {
        console.log('🧪 Testing XMLHttpRequest...');
        const xhr = new XMLHttpRequest();
        
        xhr.onreadystatechange = function() {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
              console.log('✅ XHR success:', xhr.status, xhr.responseText);
              addResult('XMLHttpRequest', true, `Status: ${xhr.status}, Response: ${xhr.responseText}`);
              resolve(true);
            } else {
              console.error('❌ XHR failed:', xhr.status, xhr.statusText);
              addResult('XMLHttpRequest', false, `Status: ${xhr.status}, Error: ${xhr.statusText}`);
              resolve(false);
            }
          }
        };
        
        xhr.onerror = function() {
          console.error('❌ XHR network error');
          addResult('XMLHttpRequest', false, 'Network error occurred');
          resolve(false);
        };
        
        xhr.ontimeout = function() {
          console.error('❌ XHR timeout');
          addResult('XMLHttpRequest', false, 'Request timed out');
          resolve(false);
        };
        
        xhr.open('GET', `${API_URL}/health`);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.timeout = 10000;
        xhr.send();
      } catch (error) {
        console.error('❌ XHR setup failed:', error);
        addResult('XMLHttpRequest', false, `Setup error: ${error.message}`);
        resolve(false);
      }
    });
  };

  // Test 5: Network Info
  const testNetworkInfo = async () => {
    try {
      // Try to import NetInfo if available
      const NetInfo = require('@react-native-community/netinfo');
      const netState = await NetInfo.fetch();
      
      addResult('Network Info', true, `Connected: ${netState.isConnected}, Type: ${netState.type}`);
      console.log('📶 Network state:', netState);
    } catch (error) {
      addResult('Network Info', false, 'NetInfo not available or failed');
      console.log('📶 NetInfo not available');
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    clearResults();
    
    console.log('🚀 Starting comprehensive network tests...');
    
    // Run tests sequentially
    await testNetworkInfo();
    await testFetch();
    await testXHR();
    await testAxiosGet();
    await testAxiosPost();
    
    setTesting(false);
    console.log('🏁 All tests completed');
  };

  const testSpecificEndpoint = async (endpoint, method = 'GET', data = null) => {
    try {
      const axios = require('axios');
      const config = {
        method,
        url: `${API_URL}${endpoint}`,
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      };
      
      if (data) {
        config.data = data;
      }
      
      const response = await axios(config);
      Alert.alert('Success', `${method} ${endpoint}: ${response.status}`);
      console.log(`✅ ${method} ${endpoint}:`, response.status, response.data);
    } catch (error) {
      const errorMsg = error.response 
        ? `Status: ${error.response.status}`
        : `Network Error: ${error.message}`;
      Alert.alert('Failed', `${method} ${endpoint}: ${errorMsg}`);
      console.error(`❌ ${method} ${endpoint}:`, error);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
        Network Debugger
      </Text>
      
      <Text style={{ marginBottom: 10 }}>
        API URL: {API_URL}
      </Text>
      
      <View style={{ marginBottom: 20 }}>
        <Button 
          title={testing ? "Running Tests..." : "Run All Tests"} 
          onPress={runAllTests}
          disabled={testing}
        />
      </View>
      
      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <Button 
          title="Test /health" 
          onPress={() => testSpecificEndpoint('/health')}
        />
        <Button 
          title="Test /" 
          onPress={() => testSpecificEndpoint('/')}
        />
      </View>
      
      <Button 
        title="Clear Results" 
        onPress={clearResults}
        color="red"
      />
      
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 }}>
        Test Results:
      </Text>
      
      {results.map((result, index) => (
        <View 
          key={index} 
          style={{ 
            padding: 10, 
            marginBottom: 10, 
            backgroundColor: result.success ? '#d4edda' : '#f8d7da',
            borderRadius: 5 
          }}
        >
          <Text style={{ fontWeight: 'bold', color: result.success ? '#155724' : '#721c24' }}>
            {result.success ? '✅' : '❌'} {result.test} ({result.timestamp})
          </Text>
          <Text style={{ color: result.success ? '#155724' : '#721c24', marginTop: 5 }}>
            {result.details}
          </Text>
        </View>
      ))}
      
      {results.length === 0 && (
        <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>
          No test results yet. Run tests to see results.
        </Text>
      )}
    </ScrollView>
  );
};

export default NetworkDebugger;