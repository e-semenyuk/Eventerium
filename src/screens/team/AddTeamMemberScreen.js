import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import SQLite from 'react-native-sqlite-storage';

const AddTeamMemberScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  const handleAddTeamMember = () => {
    if (!name|| !role) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const db = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });

    const insertTeamMemberStatement = `
      INSERT INTO team_members (name, role, eventId)
      VALUES (?, ?, ?)
    `;
    db.transaction((tx) => {
      tx.executeSql(
        insertTeamMemberStatement,
        [name, role, event.id],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            Alert.alert('Success', 'Team member added successfully.', [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]);
          } else {
            Alert.alert('Error', 'Failed to add team member. Please try again.');
          }
        },
        (error) => {
          console.error('Error executing SQL statement:', error);
        }
      );
    });
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
        Add a New Team Member
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

      <Button title="Add" onPress={handleAddTeamMember} />
      <Button title="Cancel" onPress={handleCancel} color="gray" />
    </View>
  );
};

export default AddTeamMemberScreen;
