import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import SessionManager from '../../helpers/SessionManager';
import { useTranslation } from 'react-i18next';

const SettingsScreen = ({ navigation }) => {
  const navigateTo = (screenName) => {
    navigation.navigate(screenName);
  };
  const { t } = useTranslation();

  const logOut = () => {
    console.log(2);
    SessionManager.killSession();
    navigation.navigate("Login Form");
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.item} onPress={() => navigateTo('AccountInfo')}>
        <Icon name="user" size={20} color="black" />
        <Text style={styles.text}>Account Info</Text>
        <Icon name="chevron-right" size={20} color="grey" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => navigateTo('PasswordManagement')}>
        <Icon name="lock" size={20} color="black" />
        <Text style={styles.text}>Password Management</Text>
        <Icon name="chevron-right" size={20} color="grey" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => navigateTo('Notifications')}>
        <Icon name="bell" size={16} color="black" />
        <Text style={styles.text}>Notifications</Text>
        <Icon name="chevron-right" size={20} color="grey" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => navigateTo('Preferences')}>
        <Icon name="cog" size={20} color="black" />
        <Text style={styles.text}>Preferences</Text>
        <Icon name="chevron-right" size={20} color="grey" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => navigateTo(t('Language'))}>
        <Icon name="language" size={20} color="black" />
        <Text style={styles.text}>{t('Language')}</Text>
        <Icon name="chevron-right" size={20} color="grey" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={logOut}>
        <Icon name="sign-out" size={20} color="red" />
        <Text style={[styles.text, { color: 'red' }]}>{t('Logout')}</Text>
        <Icon name="chevron-right" size={20} color="grey" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    marginLeft: 10, // Adjust as needed
    flex: 1, // Allows the text to take up remaining space
  },
});

export default SettingsScreen;
