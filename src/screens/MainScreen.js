import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import EventViewScreen from './events/EventViewScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import AllTasksScreen from './tasks/AllTasksScreen';
import { useTranslation } from 'react-i18next'; 
import { useNavigation } from '@react-navigation/native';
import SettingsScreen from './settings/SettingsScreen';
import NotificationsScreen from './notifications/NotificationsScreen';
import { NOTIFICATIONS_COUNT_URL } from '../constants/Urls';

const Tab = createBottomTabNavigator();

const MainScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [notificationsCount, setNotificationsCount] = useState(0); // State variable to store the count of notifications

  useEffect(() => {
    // Function to fetch the count of notifications from your API endpoint
    const fetchNotificationsCount = async () => {
      try {
        const response = await fetch(NOTIFICATIONS_COUNT_URL);
        const data = await response.json();
        setNotificationsCount(data); // Assuming your API returns the count of unseen notifications
      } catch (error) {
        console.error('Error fetching notifications count:', error);
      }
    };

    // Call fetchNotificationsCount initially when the component mounts
    fetchNotificationsCount();

    // Set up an interval to fetch the count of notifications every 30 seconds
    const interval = setInterval(fetchNotificationsCount, 30000);

    // Clear the interval on component unmount to prevent memory leaks
    return () => clearInterval(interval);
  }, []);

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
        name={t("Notifications")} // Name the tab as "Notifications"
        options={{
            tabBarIcon: ({ color, size }) => <Icon name="bell" color={color} size={size} />,
            tabBarBadge: notificationsCount > 0 ? notificationsCount : null, // Show badge with notifications count
          }}
      >
        {() => <NotificationsScreen setNotificationsCount={setNotificationsCount} />}
      </Tab.Screen>
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
