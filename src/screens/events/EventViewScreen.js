import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Button, ScrollView, Modal, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import CreateEventScreen from './CreateEventScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SessionManager from '../../helpers/SessionManager';
import { EVENTS_URL } from '../../constants/Urls';

const EventViewScreen = ({ route, navigation }) => {
  const { params } = route;
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const { t, i18n } = useTranslation();
  const [isCreateEventModalVisible, setCreateEventModalVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      // Load events from the remote server when the screen comes into focus
      loadEventsFromServer();
    }, [])
  );

  const logOut = () => {
    console.log(2);
    SessionManager.killSession();
    navigation.navigate("Login Form");
  }

  const loadEventsFromServer = () => {
    // Replace the following URL with your actual endpoint
    const serverEndpoint = 'https://crashtest.by/app/events.php';

    fetch(serverEndpoint)
      .then(response => response.json())
      .then(data => {
        // Assuming the server response is an array of events
        console.log(data);
        setUpcomingEvents(data);
      })
      .catch(error => {
        console.error('Error fetching events from server:', error);
      });
  };

  const handleEventClick = (event) => {
    // Navigate to the EventDetailsScreen with the selected event
    navigation.navigate(t('Event Details'), { event });
  };

  const handleCreateEvent = () => {
    setCreateEventModalVisible(true);
  };

  const closeCreateEventModal = () => {
    // After creating an event, reload events from the server
    loadEventsFromServer();
    setCreateEventModalVisible(false);
  };

  const changeLanguage = () => {
    const newLanguage = i18n.language === 'en' ? 'ru' : 'en';
    i18n.changeLanguage(newLanguage);
  };

  return (
    <ScrollView style={styles.container}>
      <View>
        {/* Use TouchableOpacity for "Create New Event" */}
        <TouchableOpacity
          style={styles.createEventButton}
          onPress={handleCreateEvent}
        >
          <Text style={styles.createEventButtonText}>{t('Create New Event')}</Text>
        </TouchableOpacity>
        {upcomingEvents.length === 0 ? (
          <Text style={styles.noEventsText}>{t("No upcoming events")}</Text>
        ) : (
          upcomingEvents.map((event, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleEventClick(event)}
              style={styles.eventContainer}
            >
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDetails}>{`${t('date')}: ${event.date}`}</Text>
              <Text style={styles.eventDetails}>{`${t('time')}: ${event.time}`}</Text>
              <Text style={styles.eventDetails}>{`${t('type')}: ${event.type}`}</Text>
            </TouchableOpacity>
          ))
        )}
        <Button title={t('Change Language')} onPress={changeLanguage} color="#333" />
        <Button title={t('Logout')} onPress={logOut} color="#333" />              
        <Modal
          transparent={true}
          visible={isCreateEventModalVisible}
          onRequestClose={closeCreateEventModal}
        >
          <View style={styles.modalContainer}>
            <CreateEventScreen
              route={{ params: { params } }}
              onRequestClose={closeCreateEventModal}
            />        
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  createEventButton: {
    marginTop: 16,
    backgroundColor: 'blue',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: 'center',
  },
  createEventButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noEventsText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  eventContainer: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventDetails: {
    fontSize: 14,
    marginBottom: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default EventViewScreen;
