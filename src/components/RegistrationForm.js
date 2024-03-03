// RegistrationForm.js
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { showMessage } from 'react-native-flash-message';

const RegistrationForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const navigation = useNavigation();
  const { t } = useTranslation();

  const handleRegister = () => {
    if (!username || !password || !confirmPassword || !email) {
      Alert.alert(t("Error"), t('Please fill in all fields.'));
      return;
    }

    if (password != confirmPassword) {
      Alert.alert(t("Error"), t("Passwords don't match, please try again"));
      return
    }
  
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('email', email);
  
    fetch('https://crashtest.by/app/register.php', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
            showMessage({
                message: t('User has been created!'),
                type: 'success',
                titleStyle: { textAlign: 'center' },
              });
          navigation.navigate("Login Form");
        } else {
          console.error("Registration Error: ", data.message)
        }
      })
      .catch(error => {
        console.error("Network Error:", error);
      });
  };
  
  const goToLogin = () => {
    navigation.navigate("Login Form");
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
      <Text style={styles.label}>{t("Registration")}</Text>
      <TextInput style={styles.input} placeholder={t("Username")} value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder={t("Email")} value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder={t("Password")} value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput style={styles.input} placeholder={t("Confirm Password")} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
      <Button style={styles.button} title={t("Register")} onPress={handleRegister} />
      <Button style={styles.button} title={t("Already Registered?")} onPress={goToLogin} />
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

export default RegistrationForm;
