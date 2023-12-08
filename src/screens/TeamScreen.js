import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, Alert } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import AddTeamMemberScreen from './AddTeamMemberScreen';

const TeamScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    checkAndCreateTable();
    const unsubscribe = navigation.addListener('focus', () => {
        loadTeamMembers();
      });

    return () => {
        unsubscribe;
        const db = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });
        db.close();
    };
  }, []);

  const checkAndCreateTable = () => {
    const db = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });

    const createTableStatement = `
      CREATE TABLE IF NOT EXISTS team_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        role TEXT,
        eventId INTEGER,
        FOREIGN KEY (eventId) REFERENCES events (id)
      )
    `;

    db.transaction((tx) => {
      tx.executeSql(createTableStatement, [], () => {}, onError);
    });
  };

  const loadTeamMembers = () => {
    const db = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });

    const selectTeamMembersStatement = 'SELECT * FROM team_members WHERE eventId = ?';
    console.log(event.id);

    db.transaction((tx) => {
      tx.executeSql(
        selectTeamMembersStatement,
        [event.id],
        (tx, results) => {
          const len = results.rows.length;
          const teamMembersArray = [];
          for (let i = 0; i < len; i++) {
            teamMembersArray.push(results.rows.item(i));
          }
          setTeamMembers(teamMembersArray);
        },
        onError
      );
    });
  };

  const handleEditTeamMember = (id) => {
    // Implement navigation logic for editing team members
  };

  const handleDeleteTeamMember = (id) => {
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
            loadTeamMembers(); // Refresh the team members after deletion
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

  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
        Team Members
      </Text>
      <Button
        title="Add a New Team Member"
        onPress={() => navigation.navigate('AddTeamMember', { event })}
      />

{teamMembers.length === 0 ? (
  <Text>No team members available.</Text>
) : (
  <FlatList
    data={teamMembers}
    keyExtractor={(item) => item.id.toString()}
    ListHeaderComponent={() => (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, borderBottomWidth: 1, paddingBottom: 8 }}>
        <Text style={{ flex: 1, fontWeight: 'bold' }}>Name</Text>
        <Text style={{ flex: 1, fontWeight: 'bold' }}>Role</Text>
        <Text style={{ flex: 1, fontWeight: 'bold' }}>Actions</Text>
      </View>
    )}
    renderItem={({ item }) => (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 }}>
        <Text style={{ flex: 1 }}>{item.name}</Text>
        <Text style={{ flex: 1 }}>{item.role}</Text>
        <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-between' }}>
          <Button title="Delete" onPress={() => handleDeleteTeamMember(item.id)} color="red" />
        </View>
      </View>
    )}
  />
)}
    </View>
  );
};

export default TeamScreen;
