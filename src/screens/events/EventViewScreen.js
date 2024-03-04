import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Button, ScrollView, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import CreateEventScreen from './CreateEventScreen';
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
    fetch(EVENTS_URL)
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
    <ScrollView>
      <View>
        <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>
        </Text>
        {/* Use Button component for "Create New Event" */}
        <Button
          title={t('Create New Event')}
          onPress={handleCreateEvent}
          color="blue"
          style={{ marginTop: 16 }}
        />
        {upcomingEvents.length === 0 ? (
          <Text>{t("No upcoming events")}</Text>
        ) : (
          upcomingEvents.map((event, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleEventClick(event)}
            >
              <View style={{ marginBottom: 8, padding: 8, backgroundColor: '#f0f0f0' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{event.title}</Text>
                <Text>{`${t('date')}: ${event.date}`}</Text>
                <Text>{`${t('time')}: ${event.time}`}</Text>
                <Text>{`${t('type')}: ${event.type}`}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
        <Button title={t('Change Language')} onPress={changeLanguage}/>
        <Button title={t('Logout')} onPress={logOut}/>              
        <Modal
          transparent={true}
          visible={isCreateEventModalVisible}
          onRequestClose={closeCreateEventModal}
        >
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
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

export default EventViewScreen;
