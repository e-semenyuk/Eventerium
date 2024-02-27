import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';

const TeamMemberFormScreen = ({ route, navigation }) => {
  const { event, item } = route.params;
  const [name, setName] = useState(item ? item.name : '');
  const [role, setRole] = useState(item ? item.role : '');
  const [username, setUsername] = useState(item ? item.username : ''); // State for username
  const [canManageEvent, setCanManageEvent] = useState(item ? item.canManageEvent : false); // State for managing event
  const [canManageTasks, setCanManageTasks] = useState(item ? item.canManageTasks : false); // State for managing tasks
  const [canManageParticipants, setCanManageParticipants] = useState(item ? item.canManageParticipants : false); // State for managing participants
  const [canManageTeam, setCanManageTeam] = useState(item ? item.canManageTeam : false); // State for managing team
  const { t } = useTranslation();

  const handleSubmit = async () => {
    if (!name || !role ) { // Check for username as well
      Alert.alert('Error', t('Please fill in all fields.'));
      return;
    }

    const endpoint = item ? `https://crashtest.by/app/team.php?id=${item.id}` : 'https://crashtest.by/app/team.php';
    try {
        const method = item ? 'PUT' : 'POST';
        const bodyData = {
          name,
          role,
          username,
          canManageEvent: canManageEvent ? 1 : 0,
          canManageTasks: canManageTasks ? 1 : 0,
          canManageParticipants: canManageParticipants ? 1 : 0,
          canManageTeam: canManageTeam ? 1 : 0,
          eventId: item ? item.eventId : route.params.event.id,
        };
        
        const response = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bodyData),
        });
      const data = await response.json();

      if (response.ok) {
        const message = item ? t('Team member updated successfully.') : t('Team member added successfully.');
        Alert.alert('Success', message, [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        const errorMessage = item ? t('Failed to update team member.') : t('Failed to add team member.');
        Alert.alert('Error', `${errorMessage} ${data.error || t('Please try again.')}`);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = item ? t('Failed to update team member.') : t('Failed to add team member.');
      Alert.alert('Error', `${errorMessage} ${t('Please try again.')}`);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      t('Confirm Deletion'),
      t('Are you sure you want to delete this team member?'),
      [
        {
          text: t('Cancel'),
          style: 'cancel',
        },
        {
          text: t('Delete'),
          onPress: performDelete,
          style: 'destructive',
        },
      ]
    );
  };

  const performDelete = async () => {
    if (!item) return;

    const endpoint = `https://crashtest.by/app/team.php?id=${item.id}`;

    try {
      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (response.ok) {
        navigation.goBack();
      } else {
        Alert.alert('Error', t('Failed to delete team member. Please try again.'));
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', t('Failed to delete team member. Please try again.'));
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {item ? t('Edit Team Member') : t('Add a New Team Member')}
      </Text>
      <TextInput
        placeholder={t('Name')}
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder={t('Role')}
        value={role}
        onChangeText={setRole}
        style={styles.input}
      />
      <TextInput // Add TextInput for Username
        placeholder={t('Username')}
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <View style={styles.checkboxContainer}>
        <CheckBox // Add CheckBox for managing event
          value={canManageEvent}
          onValueChange={setCanManageEvent}
        />
        <Text style={styles.checkboxLabel}>{t('Can Manage Event')}</Text>
      </View>
      <View style={styles.checkboxContainer}>
        <CheckBox // Add CheckBox for managing tasks
          value={canManageTasks}
          onValueChange={setCanManageTasks}
        />
        <Text style={styles.checkboxLabel}>{t('Can Manage Tasks')}</Text>
      </View>
      <View style={styles.checkboxContainer}>
        <CheckBox // Add CheckBox for managing participants
          value={canManageParticipants}
          onValueChange={setCanManageParticipants}
        />
        <Text style={styles.checkboxLabel}>{t('Can Manage Participants')}</Text>
      </View>
      <View style={styles.checkboxContainer}>
        <CheckBox // Add CheckBox for managing team
          value={canManageTeam}
          onValueChange={setCanManageTeam}
        />
        <Text style={styles.checkboxLabel}>{t('Can Manage Team')}</Text>
      </View>
      <Button title={item ? t('Update') : t('Add')} onPress={handleSubmit} />
      {item && <Button title={t('Delete')} onPress={handleDelete} color="red" />}
      <Button title={t('Cancel')} onPress={handleCancel} color="gray" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  input: {
    marginBottom: 8,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 8,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: 10,
    marginRight: 10,
  },
  checkboxLabel: {
    marginLeft: 8,
  },
});

export default TeamMemberFormScreen;
