// LoginForm.js
import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import CookieManager from '@react-native-cookies/cookies';
import { useTranslation } from 'react-i18next';

const LoginForm = ({ onLogin, onGoToRegistration }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const { t } = useTranslation();

  const handleLogin = async () => {
    try {
      // Make a POST request to the login endpoint
      const response = await fetch('https://crashtest.by/app/login.php', {
        method: 'POST',
        credentials: 'include', // Include credentials (cookies) in the request
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${username}&password=${password}`,
      });

      // Use CookieManager to get cookies from the response
      const cookies = await CookieManager.get('https://crashtest.by/app/login.php');
      
      // Check if the login was successful (status code 200)
      if (response.ok) {
        // Get the PHPSESSID from the cookies
        const sessionIdCookie = cookies.PHPSESSID;
        if (sessionIdCookie) {
          const sessionId = sessionIdCookie.value;
          await AsyncStorage.setItem('sessionId', sessionId);
          console.log('PHPSESSID:', sessionId);
          navigation.navigate('Event Maker');
        } else {
          console.error('PHPSESSID cookie not found in the response');
        }
      } else {
        // Handle login error, e.g., show an error message
        console.error('Login failed:', response.status);
      }
    } catch (error) {
      // Handle network error or other issues
      console.error('Error during login:', error);
    }
  };

  return (
    <View>
      <TextInput placeholder={t("Username")} value={username} onChangeText={setUsername} />
      <TextInput placeholder={t("Password")} value={password} onChangeText={setPassword} secureTextEntry />
      <Button title={t("Login")} onPress={handleLogin} />
      <Button title={t("Go to Registration")} onPress={onGoToRegistration} />
    </View>
  );
};

export default LoginForm;
