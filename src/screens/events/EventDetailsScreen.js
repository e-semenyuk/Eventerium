import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Button, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Use any icon library you prefer
import SQLite from 'react-native-sqlite-storage';
import TeamScreen from '../team/TeamScreen';
import TasksScreen from '../tasks/TasksScreen';
import TemplatesScreen from '../templates/TemplatesScreen';
import PeopleScreen from '../people/PeopleScreen';
import { useTranslation } from 'react-i18next'; 

const Tab = createBottomTabNavigator();

const DetailsScreen = ({ navigation, route }) => {
  const { event } = route.params === undefined ? route : route.params;
  const { t } = useTranslation(); // Use useTranslation hook
  
  const performDeleteEvent = () => {
    const db = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });
  
    const deleteEventStatement = 'DELETE FROM events WHERE id = ?';
  
    db.transaction((tx) => {
      tx.executeSql(
        deleteEventStatement,
        [event.id],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            Alert.alert('Event Deleted', 'The event has been successfully deleted.', [
              {
                text: 'OK',
                onPress: () => navigation.navigate('Event Maker'),
              },
            ]);
          } else {
            Alert.alert('Error', 'Failed to delete the event. Please try again.');
          }
        },
        (error) => {
          console.log('Error executing SQL statement:', error);
        }
      );
    });
  };

  const handleDeleteEvent = () => {
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete the event "${event.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => performDeleteEvent(),
          style: 'destructive',
        },
      ]
    );
  };
  
  const handleEditEvent = () => {
    const eventWithEditMode = {
      ...event,
      editMode: true,
    };
    console.log(eventWithEditMode);
    navigation.navigate(t('Create New Event'), eventWithEditMode);
  }

  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center'}}>
      </Text>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{`Title: ${event.title}`}</Text>
      <Text>{`${t("date")}: ${event.date}`}</Text>
      <Text>{`${t("time")}: ${event.time}`}</Text>
      <Text>{`${t("type")}: ${event.type}`}</Text>
      <Text>{`${t("location")}: ${event.location}`}</Text>
      <Text>{`${t("description")}: ${event.description}`}</Text>

      <Button
        title={t("Delete Event")}
        onPress={handleDeleteEvent}
        color="red"
      />
      <Button
        title={t("Edit Event")}
        onPress={handleEditEvent}
      />
    </View>
  );
};

const EventDetailsScreen = ({ route }) => {
  const { event } = route.params;
  const { t } = useTranslation(); // Use useTranslation hook

  return (
    <Tab.Navigator initialRouteName={t("Tasks")}>
      <Tab.Screen
        name={t("Details")}
        component={DetailsScreen}
        initialParams={route.params}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="info" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name={t("Tasks")}
        component={TasksScreen}
        initialParams={{ event }}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="th-list" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name={t("Team")}
        component={TeamScreen}
        initialParams={{ event }}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="users" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name={t("Templates")}
        component={TemplatesScreen}
        initialParams={{ event }}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="clone" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name={t("Invitations")}
        component={PeopleScreen}
        initialParams={{ event }}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="envelope" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default EventDetailsScreen;
