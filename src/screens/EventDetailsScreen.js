import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Button, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Use any icon library you prefer
import SQLite from 'react-native-sqlite-storage';

const Tab = createBottomTabNavigator();

const DetailsScreen = ({ route, navigation }) => {
  const { event } = route.params;

    // Function to perform the actual deletion of the event from the database
    const performDeleteEvent = () => {
      const db = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });
  
      // SQL statement to delete the event from the database
      const deleteEventStatement = 'DELETE FROM events WHERE id = ?';
  
      db.transaction((tx) => {
        tx.executeSql(
          deleteEventStatement,
          [event.id],
          (tx, results) => {
            // Check if the event was successfully deleted
            if (results.rowsAffected > 0) {
              Alert.alert('Event Deleted', 'The event has been successfully deleted.', [
                {
                  text: 'OK',
                  onPress: () => navigation.navigate('EventView'),
                },
              ]);
            } else {
              Alert.alert('Error', 'Failed to delete the event. Please try again.');
            }
          },
          (error) => {
            console.error('Error executing SQL statement:', error);
          }
        );
      });
    };
  
    // Function to handle the delete event action
    const handleDeleteEvent = () => {
      // Show a confirmation prompt before deleting the event
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
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
        Event Details
      </Text>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{`Title: ${event.title}`}</Text>
      <Text>{`Date: ${event.date}`}</Text>
      <Text>{`Time: ${event.time}`}</Text>
      <Text>{`Type: ${event.type}`}</Text>
      <Text>{`Description: ${event.description}`}</Text>

      {/* Add the "Delete Event" button */}
      <Button
        title="Delete Event"
        onPress={handleDeleteEvent}
        color="red"
      />
    </View>
  );
};

const ActionsScreen = () => (
  <View>
    <Text>Actions Screen</Text>
    {/* Add content for the "Actions" tab */}
  </View>
);

const TeamScreen = () => (
  <View>
    <Text>Team Screen</Text>
    {/* Add content for the "Team" tab */}
  </View>
);

const EventDetailsScreen = ({ route, navigation }) => {
  const { event } = route.params;

  return (
    
    <Tab.Navigator initialRouteName="Details">
      <Tab.Screen
        name="Details"
        component={DetailsScreen}
        initialParams={{ event }}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="info" color={color} size={size} />, // Change icon name and style
        }}
      />
      <Tab.Screen
        name="Actions"
        component={ActionsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="cogs" color={color} size={size} />, // Change icon name and style
        }}
      />
      <Tab.Screen
        name="Team"
        component={TeamScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="users" color={color} size={size} />, // Change icon name and style
        }}
      />
    </Tab.Navigator>
  );
};

export default EventDetailsScreen;
