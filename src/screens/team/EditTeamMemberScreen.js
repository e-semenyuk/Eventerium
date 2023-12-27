import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import SQLite from 'react-native-sqlite-storage';

const EditTeamMemberScreen = ({ route, navigation }) => {
  const teamMember = route.params.item;
  const [name, setName] = useState(teamMember.name);
  const [role, setRole] = useState(teamMember.role);

  const handleUpdateTeamMember = async () => {
    if (!name || !role) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const endpoint = `https://crashtest.by/app/team.php?id=${teamMember.id}`;

    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          role,
          eventId: teamMember.eventId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Team member updated successfully.', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Error', `Failed to update team member. ${data.error || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Error updating team member:', error);
      Alert.alert('Error', 'Failed to update team member. Please try again.');
    }
  };

  const handleDeleteTeamMember = () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this team member?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: performDeleteTeamMember,
          style: 'destructive',
        },
      ]
    );
  };

  const performDeleteTeamMember = async () => {
    const endpoint = `https://crashtest.by/app/team.php?id=${teamMember.id}`;

    try {
      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (response.ok) {
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to delete team member. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting team member:', error);
      Alert.alert('Error', 'Failed to delete team member. Please try again.');
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };


  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', marginTop: 16 }}>
        Edit Team Member
      </Text>
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={{ marginBottom: 8, borderColor: 'gray', borderWidth: 1, padding: 8 }}
      />
      <TextInput
        placeholder="Role"
        value={role}
        onChangeText={setRole}
        style={{ marginBottom: 16, borderColor: 'gray', borderWidth: 1, padding: 8 }}
      />

      <Button title="Update" onPress={handleUpdateTeamMember} />
      <Button title="Delete" onPress={() => handleDeleteTeamMember(teamMember.id)} color="red" />
      <Button title="Cancel" onPress={handleCancel} color="gray" />
    </View>
  );
};

export default EditTeamMemberScreen;
