// src/screens/EventManagerScreen.js
import React from 'react';
import { View, Text } from 'react-native';
import TodoList from '../components/TodoList';
import TeamList from '../components/TeamList';
import TemplatesList from '../components/TemplatesList';

const EventManagerScreen = () => {
  return (
    <View>
      <Text>Event Manager Screen</Text>
      <TodoList />
      <TeamList />
      <TemplatesList />
    </View>
  );
};

export default EventManagerScreen;
