import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';

const ViewPersonScreen = ({ navigation, route }) => {
  const event = route.params.event;
  const person = route.params.item;

  const deletePerson = async () => {
    try {
      console.log(person.id)
      const response = await fetch(`https://crashtest.by/data.php?eventId=${event.id}&id=${person.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Add any other headers if needed
        },
        // Add any other options if needed
      });

      if (response.ok) {
        // Successful deletion
        Alert.alert('Success', 'Person deleted successfully.');
        // You can navigate back or perform any other actions
        navigation.goBack();
      } else {
        // Handle error response
        Alert.alert('Error', 'Failed to delete person. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting person:', error);
      Alert.alert('Error', 'An error occurred while deleting person. Please try again.');
    }
  };

  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}></Text>
      <Text>{`First Name: ${person.firstname}`}</Text>
      <Text>{`Last Name: ${person.lastname}`}</Text>
      <Text>{`Phone: ${person.phone}`}</Text>
      <Text>{`Email: ${person.email}`}</Text>

      <Button
        title="Delete Person"
        color="red"
        onPress={deletePerson}
      />
    </View>
  );
};

export default ViewPersonScreen;
