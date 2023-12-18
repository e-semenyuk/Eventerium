import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import SQLite from 'react-native-sqlite-storage';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const CreateEventScreen = ({ route }) => {
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
  const { t } = useTranslation();     

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

    // If editing an existing event, initialize the state with event details
    if (params && params.editMode) {
      const event = params;
      setTitle(event.title);
      setDate(parseDateString(event.date));
      setTime(new Date(`2000-01-01T${event.time}`)); // Combine with a fixed date for proper formatting
      setLocation(event.location);
      setType(event.type);
      setDescription(event.description);
    }
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

  const parseDateString = (dateString) => {
    const parts = dateString.split('.');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Months are 0-based in JavaScript Dates
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return null; // Invalid date string
  };

  const handleSubmit = () => {
    if (!db) {
      console.error('Database not initialized');
      return;
    }

    if (!title || !date) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    // Insert or update the event in the database
    const statement = params && params.editMode ? updateEventStatement : insertEventStatement;

    const eventData = [
      title,
      date.toLocaleDateString(),
      time === null ? null : time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location,
      type,
      description,
      params && params.editMode ? params.id : undefined,
    ];
    if (params && params.editMode){
      params.title = eventData[0];
      params.date = eventData[1];
      params.time = eventData[2];
      params.location = eventData[3];
      params.type = eventData[4];
      params.description = eventData[5];
    }

    db.transaction((tx) => {
      tx.executeSql(statement, eventData, (tx, results) => {
        // Handle the result of the operation
        const { rowsAffected, insertId } = results;
        console.log(rowsAffected > 0 ? 'Event updated' : `Event inserted with ID: ${insertId}`);
      });
    });

    // Navigate to the EventViewScreen or Upcoming Events
    //navigation.navigate(params && params.editMode ? 'Event Details' : 'Upcoming Events', { params });
    params && params.editMode ? navigation.goBack() : navigation.navigate('Event Maker');

  };

  // SQL statement to insert a new event
  const insertEventStatement = `
    INSERT INTO events (title, date, time, location, type, description)
    VALUES (?, ?, ?, ?, ?, ?);
  `;

  // SQL statement to update an existing event
  const updateEventStatement = `
    UPDATE events
    SET title = ?, date = ?, time = ?, location = ?, type = ?, description = ?
    WHERE id = ?;
  `;

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder={t("Event Name")} value={title} onChangeText={setTitle} />
      <TouchableOpacity onPress={showDatePicker}>
        <Text style={styles.pickerText}>{date ? date.toLocaleDateString() : t("Select the Date")}</Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
      />

      <TouchableOpacity onPress={showTimePicker}>
        <Text style={styles.pickerText}>
          {time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : t('Select the Time')}
        </Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleTimeConfirm}
        onCancel={hideTimePicker}
      />

      <TextInput style={styles.input} placeholder={t("location")} value={location} onChangeText={setLocation} />
      <TextInput style={styles.input} placeholder={t("type")} value={type} onChangeText={setType} />
      <TextInput style={styles.input} placeholder={t("description")} value={description} onChangeText={setDescription} />
      <Button title={params && params.editMode ? t('Update Event') : t('Create Event')} onPress={handleSubmit} />
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

export default CreateEventScreen;
