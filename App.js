import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import SplashScreen from './Components/Screens/SplashScreen';
import LoginScreen from './Components/Screens/LoginScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import HomeScreen from './Components/Screens/HomeScreen';
import Candidates from './Components/Screens/Candidates';

const Stack = createNativeStackNavigator();

export default function App() {
  
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen options={{headerShown:false}} name='sp' component={SplashScreen} />
        <Stack.Screen options={{headerShown:false}} name='Login' component={LoginScreen} />
        <Stack.Screen options={{headerShown:false}} name='Home' component={HomeScreen} />
        <Stack.Screen options={{headerShown:false}} name='Candidates' component={Candidates} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
