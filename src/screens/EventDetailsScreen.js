// src/screens/EventDetailsScreen.js
import React from 'react';
import { View, Text } from 'react-native';

const EventDetailsScreen = ({ route }) => {
  const { event } = route.params;

  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
        Event Details
      </Text>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{event.time}</Text>
      <Text>{`Location: ${event.location}`}</Text>
      <Text>{`Type: ${event.type}`}</Text>
      <Text>{`Description: ${event.description}`}</Text>
    </View>
  );
};

export default EventDetailsScreen;
