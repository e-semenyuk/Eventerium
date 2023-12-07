// src/components/EventForm.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import SQLite from 'react-native-sqlite-storage';
import { useNavigation } from '@react-navigation/native';


const EventForm = ({ route }) => {
  const { params } = route;
  const navigation = useNavigation();
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [db, setDb] = useState(null);

  useEffect(() => {
    // Open or create the SQLite database when the component mounts
    const database = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });
    setDb(database);

    // Create the events table if it doesn't exist
    const createTableStatement = `
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        date TEXT,
        time TEXT,
        location TEXT,
        type TEXT,
        description TEXT
      );
    `;

    database.transaction((tx) => {
      tx.executeSql(createTableStatement);
    });
  }, []);

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleDateConfirm = (selectedDate) => {
    hideDatePicker();
    setDate(selectedDate);
  };

  const showTimePicker = () => {
    setTimePickerVisible(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisible(false);
  };

  const handleTimeConfirm = (selectedTime) => {
    hideTimePicker();
    setTime(selectedTime);
  };

  const handleSubmit = () => {
    if (!db) {
      console.error('Database not initialized');
      return;
    }

    // Insert the new event into the database
    const insertEventStatement = `
      INSERT INTO events (title, date, time, location, type, description)
      VALUES (?, ?, ?, ?, ?, ?);
    `;

    const eventData = [
      title,
      date.toLocaleDateString(),
      time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location,
      type,
      description,
    ];

    db.transaction((tx) => {
      tx.executeSql(insertEventStatement, eventData, (tx, results) => {
        // Handle the result of the insert operation
        const { insertId } = results;
        console.log(`Event inserted with ID: ${insertId}`);
      });
    });

    // Navigate to the EventViewScreen
    console.log('Navigation object:', navigation);

    navigation.navigate('EventView');
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
      <TouchableOpacity onPress={showDatePicker}>
        <Text style={styles.pickerText}>{date ? date.toLocaleDateString() : 'Select Date'}</Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
      />

      <TouchableOpacity onPress={showTimePicker}>
        <Text style={styles.pickerText}>
          {time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Select Time'}
        </Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleTimeConfirm}
        onCancel={hideTimePicker}
      />

      <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
      <TextInput style={styles.input} placeholder="Type" value={type} onChangeText={setType} />
      <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
      <Button title="Create Event" onPress={handleSubmit} />
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
  pickerText: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 8,
    textAlignVertical: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
});

export default EventForm;
