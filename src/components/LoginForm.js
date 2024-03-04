// LoginForm.js
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import CookieManager from '@react-native-cookies/cookies';
import { useTranslation } from 'react-i18next';
import { LOGIN_URL } from '../constants/Urls';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const { t } = useTranslation();

  const handleLogin = async () => {
    try {
      // Make a POST request to the login endpoint
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        credentials: 'include', // Include credentials (cookies) in the request
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${username}&password=${password}`,
      });

      // Use CookieManager to get cookies from the response
      const cookies = await CookieManager.get(LOGIN_URL);
      const data = await response.json();

      // Check if the login was successful (status code 200)
      if (data.success) {
        // Get the PHPSESSID from the cookies
        const sessionIdCookie = cookies.PHPSESSID;
        if (sessionIdCookie) {
          const sessionId = sessionIdCookie.value;
          await AsyncStorage.setItem('sessionId', sessionId);
          console.log('PHPSESSID:', sessionId);
          navigation.navigate('Eventerium');
        } else {
          console.error('PHPSESSID cookie not found in the response');
        }
      } else {
        // Handle login error, e.g., show an error message
        console.error(t('Login failed:'), t(data.error));
      }
    } catch (error) {
      // Handle network error or other issues
      console.error('Error during login:', error);
    }
  };

  const goToRegistration = () => {
    navigation.navigate("Registration Form");
  }

  // Disable the back button in the top navigation bar
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => null, // Set headerLeft to null to remove the back button
      headerShown: false,
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t("Login to the Application")}</Text>
      <TextInput style={styles.input} placeholder={t("Username or Email")} value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder={t("Password")} value={password} onChangeText={setPassword} secureTextEntry />
      <Button style={styles.button} title={t("Login")} onPress={handleLogin} />
      <Button style={styles.button} title={t("Go to Registration")} onPress={goToRegistration} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 18,
    marginBottom: 16,
    fontWeight: "bold",
  },
  input: {
    width: '100%',
    padding: 8,
    marginBottom: 16,
  },
  button: {
    width: '100%',
    marginBottom: 16,
  },
});

export default LoginForm;