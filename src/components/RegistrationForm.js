// RegistrationForm.js
import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const RegistrationForm = ({ onRegister, onAlreadyRegistered }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const { t } = useTranslation();

  const handleRegister = () => {
    fetch('https://crashtest.by/app/register.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
            navigation.navigate("Login Form");
        } else {
          // Handle registration error
        }
      })
      .catch(error => {
        // Handle network error
      });
  };

  return (
    <View>
      <TextInput placeholder={t("Username")} value={username} onChangeText={setUsername} />
      <TextInput placeholder={t("Password")} value={password} onChangeText={setPassword} secureTextEntry />
      <Button title={t("Register")} onPress={handleRegister} />
      <Button title={t("Already Registered?")} onPress={onAlreadyRegistered} />
    </View>
  );
};

export default RegistrationForm;
