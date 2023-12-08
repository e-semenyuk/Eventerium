import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import SQLite from 'react-native-sqlite-storage';

const EditTeamMemberScreen = ({ route, navigation }) => {
  const teamMember = route.params.item;
  const [name, setName] = useState(teamMember.name);
  const [role, setRole] = useState(teamMember.role);

  const handleUpdateTeamMember = () => {
    if (!name || !role) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const db = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });

    const updateTeamMemberStatement = `
      UPDATE team_members
      SET name = ?, role = ?
      WHERE id = ?
    `;

    db.transaction((tx) => {
      tx.executeSql(
        updateTeamMemberStatement,
        [name, role, teamMember.id],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            Alert.alert('Success', 'Team member updated successfully.', [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]);
          } else {
            Alert.alert('Error', 'Failed to update team member. Please try again.');
          }
        },
        (error) => {
          console.error('Error executing SQL statement:', error);
        }
      );
    });
  };

  const handleDeleteTeamMember = (id) => {
    // Implement logic to delete the team member (similar to TeamScreen)
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
            onPress: () => performDeleteTeamMember(id),
            style: 'destructive',
          },
        ]
      );
  };

  const performDeleteTeamMember = (id) => {
    const db = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });

    const deleteTeamMemberStatement = 'DELETE FROM team_members WHERE id = ?';

    db.transaction((tx) => {
      tx.executeSql(
        deleteTeamMemberStatement,
        [id],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            navigation.goBack();
          } else {
            onError();
          }
        },
        onError
      );
    });
  };

  const onError = (error) => {
    console.error('Error executing SQL statement:', error);
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
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
