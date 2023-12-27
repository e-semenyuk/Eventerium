import RegistrationForm from "../components/RegistrationForm";
import LoginForm from "../components/LoginForm";
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { View, Button } from 'react-native';
import Session  from '../helpers/SessionManager';

const Login = () => {
    const [showRegistration, setShowRegistration] = useState(true);
    const [showLogin, setShowLogin] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        const handleInitialNavigation = async () => {
          const hasValidSession = await Session.checkSession();
          console.log("session :"+hasValidSession);

    
          if (hasValidSession) {
            // Navigate to MainScreen if a valid session exists
            // Replace 'MainScreen' with the actual name of your MainScreen component
            navigation.navigate('Event Maker');
          } else {
            // Navigate to LoginForm if no valid session exists
            // Replace 'LoginForm' with the actual name of your LoginForm component
            navigation.navigate('Login Form');
          }
        };
    
        handleInitialNavigation();
      }, []);

    const handleRegister = () => {
        setShowRegistration(false);
        setShowLogin(true);
      };
    
      const handleAlreadyRegistered = () => {
        setShowRegistration(false);
        setShowLogin(true);
      };
    
      const handleLogin = () => {
        // Store session ID and navigate to MainScreen
        navigation.navigate("Event Maker");
      };
    
      const handleGoToRegistration = () => {
        setShowLogin(false);
        setShowRegistration(true);
      };
    
      return (
        <View>
          {showRegistration && (
            <RegistrationForm onRegister={handleRegister} onAlreadyRegistered={handleAlreadyRegistered} />
          )}
          {showLogin && <LoginForm onLogin={handleLogin} onGoToRegistration={handleGoToRegistration} />}
        </View>
      );
    };

export default Login;