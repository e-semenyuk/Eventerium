import React from 'react';
import { Alert, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';

const LanguageScreen = ({ navigation }) => {
  const navigateTo = (screenName) => {
    navigation.navigate(screenName);
  };
  const { t, i18n } = useTranslation();

  const changeLanguage = (language) => {
    Alert.alert(
        t('Change Language'),
        `${t("Are you sure you want to change the language")}`,
        [
          {
            text: t('Cancel'),
            style: 'cancel',
          },
          {
            text: t('Change'),
            onPress: () => i18n.changeLanguage(language),
            style: 'default',
          },
        ]
      );
    
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.item} onPress={() => changeLanguage('en')}>
        <Text style={styles.text}>English</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => changeLanguage('ru')}>
        <Text style={styles.text}>Русский</Text>
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

export default LanguageScreen;
