// For example, in TodoList.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const TodoList = () => {
  const [activity, setActivity] = useState('');

  const handleAddActivity = () => {
    const activityData = { activity };
    console.log('Activity Added:', activityData);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>To-Do List</Text>
      <TextInput
        style={styles.input}
        placeholder="Activity"
        value={activity}
        onChangeText={setActivity}
      />
      <Button title="Add Activity" onPress={handleAddActivity} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
});

export default TodoList;
