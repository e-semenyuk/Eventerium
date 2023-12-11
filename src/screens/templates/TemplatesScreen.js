import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, Alert } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

const TemplatesScreen = ({ route, navigation }) => {
  const {event} = route.params;
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
        loadTemplates();
      });

    return () => {
        unsubscribe;
        const db = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });
        db.close();
    };
  }, []);

  const loadTemplates = () => {
    const db = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });

    const selectTeamMembersStatement = 'SELECT * FROM templates';

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
          setTemplates(teamMembersArray);
        },
      );
    });
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
      Templates
    </Text>
      <FlatList
        data={templates}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={() => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, borderBottomWidth: 1, paddingBottom: 8}}>
            <Text style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>Template</Text>
            <Text style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>Type</Text>
            <Text style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>Actions</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, paddingVertical: 8 }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
              <Text>{item.name}</Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text>{item.type}</Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Button title="View" onPress={() => navigation.navigate('View Template', { item, event })}/>
            </View>
          </View>
        )}
        ListEmptyComponent={() => <Text>No templates available.</Text>}
      />
    </View>
  );
};

export default TemplatesScreen;
