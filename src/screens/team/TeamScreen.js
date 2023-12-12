import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, Alert } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import Icon from 'react-native-vector-icons/FontAwesome';


import AddTeamMemberScreen from './AddTeamMemberScreen';

const TeamScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
        loadTeamMembers();
      });

    return () => {
        unsubscribe;
        const db = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });
        db.close();
    };
  }, []);

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
    <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', marginTop: 16}}>
    </Text>
    <Icon
      name="user-plus"
      size={30}
      color="#007BFF"
      style={{ position: 'absolute', top: 16, right: 16 }}
      onPress={() => navigation.navigate('Add a New Team Member', { event })}
    />

      <FlatList
        data={teamMembers}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={() => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, borderBottomWidth: 1, paddingBottom: 8}}>
            <Text style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>Name</Text>
            <Text style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>Role</Text>
            <Text style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>Actions</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, paddingVertical: 8 }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
              <Text>{item.name}</Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text>{item.role}</Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Button title="Edit" onPress={() => navigation.navigate('Edit Team Member', { item })}/>
            </View>
          </View>
        )}
        ListEmptyComponent={() => <Text>No team members available.</Text>}
      />
    </View>
  );
};

export default TeamScreen;
