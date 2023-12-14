import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Button, ScrollView } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import { useFocusEffect } from '@react-navigation/native';

const EventViewScreen = ({ route, navigation }) => {
  const { params } = route;
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [db, setDb] = useState(null);

  useEffect(() => {
    // Check if the SQLite database exists or create it
    const checkAndCreateDatabase = () => {
      const database = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });

      // Create the events table if it doesn't exist
      const createEventsTableStatement = `
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

      const createTemplatesTableStatement = `
        CREATE TABLE IF NOT EXISTS templates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          type TEXT,
          description TEXT
        );
      `;

      const createTemplateDetailsTableStatement = `
        CREATE TABLE IF NOT EXISTS template_details (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            taskName TEXT,
            description TEXT,
            date TEXT,
            priority TEXT,
            status TEXT,
            type TEST,
            orderId INTEGER,
            eventId INTEGER,
            templateId INTEGER,
            FOREIGN KEY (templateId) REFERENCES templates (id)
        );
      `;

      const createTeamTableStatement = `
      CREATE TABLE IF NOT EXISTS team_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        role TEXT,
        eventId INTEGER,
        FOREIGN KEY (eventId) REFERENCES events (id)
      )
    `;

    database.transaction((tx) => {
        tx.executeSql(createEventsTableStatement);
        tx.executeSql(createTeamTableStatement);
        tx.executeSql(createTemplatesTableStatement);
        tx.executeSql(createTemplateDetailsTableStatement);

    });

      setDb(database);
    };

    checkAndCreateDatabase();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // Load events from the database when the screen comes into focus
      const loadEvents = () => {
        if (!db) {
          console.log('Database not initialized');
          return;
        }

        const selectEventsStatement = `
          SELECT * FROM events
          ORDER BY date, time;
        `;

        db.transaction((tx) => {
          tx.executeSql(selectEventsStatement, [], (tx, results) => {
            const events = [];
            for (let i = 0; i < results.rows.length; i++) {
              const event = results.rows.item(i);
              events.push(event);
            }
            setUpcomingEvents(events);
          });
        });
      };

      // Load events from the database when the screen comes into focus
      if (db) {
        loadEvents();
      }
    }, [db])
  );

  const handleEventClick = (event) => {
    // Navigate to the EventDetailsScreen with the selected event
    navigation.navigate('Event Details', { event });
  };

  const handleCreateEvent = () => {
    // Navigate to the EventForm screen for creating a new event
    navigation.navigate('Create New Event');
  };

  return (
    <ScrollView>
      <View>
        <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>
        </Text>
        {/* Use Button component for "Create New Event" */}
        <Button
          title="Create New Event"
          onPress={handleCreateEvent}
          color="blue"
          style={{ marginTop: 16 }}
        />
        {upcomingEvents.length === 0 ? (
          <Text>No upcoming events</Text>
        ) : (
          upcomingEvents.map((event, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleEventClick(event)}
            >
              <View style={{ marginBottom: 8, padding: 8, backgroundColor: '#f0f0f0' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{event.title}</Text>
                <Text>{`Date: ${event.date}`}</Text>
                <Text>{`Time: ${event.time}`}</Text>
                <Text>{`Type: ${event.type}`}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

      </View>
    </ScrollView>
  );
};

export default EventViewScreen;
