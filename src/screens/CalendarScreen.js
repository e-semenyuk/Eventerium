// src/screens/CalendarScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

LocaleConfig.locales['en'] = {
  monthNames: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  monthNamesShort: ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

LocaleConfig.defaultLocale = 'en';

const CalendarScreen = ({ events }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendar</Text>
      <Calendar onDayPress={handleDayPress} />
      {selectedDate && (
        <View style={styles.eventsContainer}>
          <Text style={styles.eventsTitle}>Events for {selectedDate}</Text>
          {events[selectedDate] ? (
            events[selectedDate].map((event, index) => (
              <View key={index} style={styles.eventItem}>
                <Text>{event.time}</Text>
                <Text>{event.location}</Text>
                <Text>{event.type}</Text>
                <Text>{event.description}</Text>
              </View>
            ))
          ) : (
            <Text>No events for this date</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  eventsContainer: {
    marginTop: 16,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventItem: {
    marginBottom: 8,
  },
});

export default CalendarScreen;
