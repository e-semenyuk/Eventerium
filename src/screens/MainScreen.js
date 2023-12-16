import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import EventViewScreen from './events/EventViewScreen'; // Update the path based on your project structure
import Icon from 'react-native-vector-icons/FontAwesome'; // Use any icon library you prefer
import AllTasksScreen from './tasks/AllTasksScreen';

const Tab = createBottomTabNavigator();

const MainScreen = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Events" 
        component={EventViewScreen}
        options={{
            tabBarIcon: ({ color, size }) => <Icon name="calendar" color={color} size={size} />,
          }}
        />
        <Tab.Screen 
        name="All Tasks" 
        component={AllTasksScreen}
        options={{
            tabBarIcon: ({ color, size }) => <Icon name="tasks" color={color} size={size} />,
          }}
        />
      {/* Add more screens as needed */}
    </Tab.Navigator>
  );
};

export default MainScreen;
