import { React, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import EventViewScreen from './events/EventViewScreen'; // Update the path based on your project structure
import Icon from 'react-native-vector-icons/FontAwesome'; // Use any icon library you prefer
import AllTasksScreen from './tasks/AllTasksScreen';
import { useTranslation } from 'react-i18next'; 
import { useNavigation } from '@react-navigation/native';
import SettingsScreen from './settings/SettingsScreen';

const Tab = createBottomTabNavigator();

const MainScreen = () => {
  const { t } = useTranslation(); // Use useTranslation hook
  const navigation = useNavigation();

  // Disable the back button in the top navigation bar
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => null, // Set headerLeft to null to remove the back button
    });
  }, [navigation]);

  return (
    <Tab.Navigator>
      <Tab.Screen 
        name={t("events")} 
        component={EventViewScreen}
        options={{
            tabBarIcon: ({ color, size }) => <Icon name="calendar" color={color} size={size} />,
          }}
        />
        <Tab.Screen 
        name={t("All Tasks")}
        component={AllTasksScreen}
        options={{
            tabBarIcon: ({ color, size }) => <Icon name="tasks" color={color} size={size} />,
          }}
        />
        <Tab.Screen 
        name={t("Settings")}
        component={SettingsScreen}
        options={{
            tabBarIcon: ({ color, size }) => <Icon name="gears" color={color} size={size} />,
          }}
        />
      {/* Add more screens as needed */}
    </Tab.Navigator>
  );
};

export default MainScreen;
