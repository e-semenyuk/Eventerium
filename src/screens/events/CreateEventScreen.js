import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/FontAwesome';
import { EVENTS_URL } from '../../constants/Urls';

const CreateEventScreen = ({ route, onRequestClose }) => {
  const params = route.params.event === undefined ? route : route.params.event;
  const navigation = useNavigation();
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    // Call parseEventData when the component is mounted
    parseEventData();
  }, []); 

  const parseEventData = () => {
    if (params && params.editMode) {
      const event = params;
      setTitle(event.title);
      setDate(event.date);
      setTime(new Date(`2000-01-01T${event.time}`)); // Combine with a fixed date for proper formatting
      setLocation(event.location);
      setType(event.type);
      setDescription(event.description);
    }
  }

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleDateConfirm = (selectedDate) => {
    hideDatePicker();
    setDate(selectedDate.toLocaleDateString());
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

  const handleSubmit = async () => {
    if (!title || !date) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const endpoint = EVENTS_URL;
    const method = params && params.editMode ? 'PUT' : 'POST';
    const eventId = params && params.editMode ? params.id : '';

    try {
      const response = await fetch(`${endpoint}${eventId ? `?id=${eventId}` : ''}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          date: date,
          time: time === null ? null : time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          location,
          type,
          description,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(data.success ? 'Event updated/inserted successfully' : 'Event update/insert failed');
      } else {
        console.error('Failed to communicate with the API');
      }
    } catch (error) {
      console.error('Error during API request:', error);
    }

    onRequestClose();
  };

 const formatTime = (date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  console.log(date, time);
  return `${hours}:${minutes}`;};

  return (

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="always" 
          contentContainerStyle={{ flex: 1, justifyContent: 'flex-end', padding: 16, paddingBottom: 0 }}>
          <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 }}>
            <Icon name="close" size={24} onPress={onRequestClose} style={{ marginLeft: 'auto' }} />
            <TextInput style={styles.input} placeholder={t("Event Name")} value={title} onChangeText={setTitle} />
            <TouchableOpacity onPress={showDatePicker}>
              <Text style={styles.pickerText}>{date ? date : t("Select the Date")}</Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleDateConfirm}
              onCancel={hideDatePicker}
            />

            <TouchableOpacity onPress={showTimePicker}>
              <Text style={styles.pickerText}>
                {time ? formatTime(time) : t('Select the Time')}
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
        </ScrollView>
      </KeyboardAvoidingView>
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
    marginBottom: 8,
    paddingHorizontal: 8,
    textAlignVertical: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
});

export default CreateEventScreen;
