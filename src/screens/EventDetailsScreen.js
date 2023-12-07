// src/screens/EventDetailsScreen.js
import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import SQLite from 'react-native-sqlite-storage';

const EventDetailsScreen = ({ route, navigation }) => {
  const { event } = route.params;

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

export default EventDetailsScreen;
