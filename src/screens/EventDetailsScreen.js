import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Button, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Use any icon library you prefer
import SQLite from 'react-native-sqlite-storage';
import TeamScreen from './team/TeamScreen';
import TasksScreen from './tasks/TasksScreen';
import TemplatesScreen from './templates/TemplatesScreen';

const Tab = createBottomTabNavigator();

const DetailsScreen = ({ route, navigation }) => {
  const { event } = route.params;

  const performDeleteEvent = () => {
    const db = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });
  
    const deleteEventStatement = 'DELETE FROM events WHERE id = ?';
  
    db.transaction((tx) => {
      tx.executeSql(
        deleteEventStatement,
        [event.id],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            Alert.alert('Event Deleted', 'The event has been successfully deleted.', [
              {
                text: 'OK',
                onPress: () => navigation.navigate('Upcoming Events'),
              },
            ]);
          } else {
            Alert.alert('Error', 'Failed to delete the event. Please try again.');
          }
        },
        (error) => {
          console.log('Error executing SQL statement:', error);
        }
      );
    });
  };

  const handleDeleteEvent = () => {
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete the event "${event.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => performDeleteEvent(),
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center'}}>
      </Text>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{`Title: ${event.title}`}</Text>
      <Text>{`Date: ${event.date}`}</Text>
      <Text>{`Time: ${event.time}`}</Text>
      <Text>{`Type: ${event.type}`}</Text>
      <Text>{`Location: ${event.location}`}</Text>
      <Text>{`Description: ${event.description}`}</Text>

      <Button
        title="Delete Event"
        onPress={handleDeleteEvent}
        color="red"
      />
    </View>
  );
};

const EventDetailsScreen = ({ route }) => {
  const { event } = route.params;

  return (
    <Tab.Navigator initialRouteName="Tasks">
      <Tab.Screen
        name="Details"
        component={DetailsScreen}
        initialParams={{ event }}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="info" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        initialParams={{ event }}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="th-list" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Team"
        component={TeamScreen}
        initialParams={{ event }}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="users" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Templates"
        component={TemplatesScreen}
        initialParams={{ event }}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="clone" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default EventDetailsScreen;
