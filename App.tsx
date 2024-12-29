import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Image } from 'react-native';
import { useFonts } from 'expo-font';
import quotesData from './assets/quotes.json';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ReminderScreen from './screens/ReminderScreen';

const Stack = createNativeStackNavigator();

type RootStackParamList = {
  Home: undefined;
  ReminderScreen: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CCC6C0',
    paddingHorizontal: 20,
    paddingTop: 120,
    paddingBottom: 100,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  dateTimeText: {
    fontSize: 18, // Smaller text for date and time
    color: '#413A35',
  },
  quoteText: {
    fontSize: 28, // Slightly bigger quote
    textAlign: 'center',
    color: '#413A35',
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 30, // Push the button further down
  },
  button: {
    backgroundColor: '#CCC6C0', // Same as app background
    borderColor: '#413A35', // Border color same as text
    borderWidth: 1, // Thin frame
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#413A35',
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginVertical: 20,
  },
});

function HomeScreen({ navigation }: Props) {
  const [quote, setQuote] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  const [fontsLoaded] = useFonts({
    'Lora-Regular': require('./assets/fonts/Lora-Regular.ttf'),
  });

  useEffect(() => {
    const today = new Date().getDay();
    setQuote(quotesData[today % quotesData.length].text);

    // Update time immediately and every second
    const updateTime = () => setCurrentTime(new Date());
    updateTime(); // Immediate update
    
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleReminder = () => {
    navigation.navigate('ReminderScreen');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Date and Time */}
        <View style={styles.dateTimeContainer}>
          <Text style={[styles.dateTimeText, { fontFamily: fontsLoaded ? 'Lora-Regular' : undefined }]}>
            {currentTime.toLocaleDateString()}
          </Text>
        </View>

        {/* Quote */}
        <Text style={[styles.quoteText, { fontFamily: fontsLoaded ? 'Lora-Regular' : undefined }]}>
          {quote}
        </Text>
        <Image 
          source={require('./assets/img/peanuts.png')}
          style={styles.image}
        />

        {/* Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleReminder}>
            <Text style={[styles.buttonText, { fontFamily: fontsLoaded ? 'Lora-Regular' : undefined }]}>
              Remind Me
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Helaas Pindakaas' }} 
        />
        <Stack.Screen 
          name="ReminderScreen" 
          component={ReminderScreen} 
          options={{ title: 'Set Reminder' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
