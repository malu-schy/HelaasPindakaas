import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Image, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { requestNotificationPermissions, scheduleDailyNotification, cancelNotifications } from '../utils/notifications';
import quotesData from '../assets/quotes.json';

export default function ReminderScreen() {
  const [date, setDate] = useState<Date>(new Date());
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [fontsLoaded] = useFonts({
    'Lora-Regular': require('../assets/fonts/Lora-Regular.ttf'),
  });

  // Load saved time when screen opens
  useEffect(() => {
    loadSavedTime();
    requestNotificationPermissions();
  }, []);

  const loadSavedTime = async () => {
    try {
      const [savedTime, savedToggleState] = await Promise.all([
        AsyncStorage.getItem('reminderTime'),
        AsyncStorage.getItem('reminderEnabled')
      ]);
      
      if (savedTime) {
        const timeValue = new Date(parseInt(savedTime));
        setDate(timeValue);
        setTempDate(timeValue);
      }
      
      if (savedToggleState !== null) {
        setIsEnabled(savedToggleState === 'true');
      }
    } catch (error) {
      console.log('Error loading saved settings:', error);
    }
  };

  const onChange = (event: any, selectedDate?: Date) => {
    setTempDate(selectedDate || tempDate);
  };

  const toggleSwitch = async () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    
    try {
      if (newState) {
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive daily quotes.'
          );
          setIsEnabled(false);
          return;
        }
        
        // Get today's quote
        const today = new Date().getDay();
        const quote = quotesData[today % quotesData.length].text;
        
        // Schedule notification for the saved time
        await scheduleDailyNotification(
          date.getHours(),
          date.getMinutes(),
          quote
        );
      } else {
        // Cancel notifications when toggle is turned off
        await cancelNotifications();
      }
    } catch (error) {
      console.log('Error handling notifications:', error);
    }
  };

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem('reminderTime', tempDate.getTime().toString());
      setDate(tempDate);
      setShowPicker(false);
      setIsEnabled(true);
      
      // Schedule notification for the new time
      const today = new Date().getDay();
      const quote = quotesData[today % quotesData.length].text;
      
      await scheduleDailyNotification(
        tempDate.getHours(),
        tempDate.getMinutes(),
        quote
      );
    } catch (error) {
      console.log('Error saving time:', error);
    }
  };

  const handleCancel = () => {
    setTempDate(date);
    setShowPicker(false);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { fontFamily: fontsLoaded ? 'Lora-Regular' : undefined }]}>
        Set Daily Reminder Time
      </Text>
      <Image 
        source={require('../assets/img/notification.png')}
        style={styles.image}
      />
      
      <View style={styles.reminderContainer}>
        <TouchableOpacity 
          style={styles.timeContainer} 
          onPress={() => setShowPicker(true)}
        >
          <Text style={[styles.timeText, { fontFamily: fontsLoaded ? 'Lora-Regular' : undefined }]}>
            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
        <Switch
          value={isEnabled}
          onValueChange={toggleSwitch}
          trackColor={{ false: '#767577', true: '#413A35' }}
        />
      </View>

      {showPicker && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            testID="timePicker"
            value={tempDate}
            mode="time"
            is24Hour={false}
            display="spinner"
            onChange={onChange}
            style={styles.picker}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleCancel}
            >
              <Text style={[styles.buttonText, { fontFamily: fontsLoaded ? 'Lora-Regular' : undefined }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleSave}
            >
              <Text style={[styles.buttonText, { fontFamily: fontsLoaded ? 'Lora-Regular' : undefined }]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CCC6C0',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#413A35',
    marginBottom: 20,
    textAlign: 'center',
  },
  reminderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 20,
  },
  timeText: {
    fontSize: 24,
    color: '#413A35',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
  },
  picker: {
    height: 200,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  button: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#413A35',
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: '#413A35',
    fontSize: 16,
  },
  timeContainer: {
    flex: 1,
    paddingVertical: 5,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 20,
  },
}); 