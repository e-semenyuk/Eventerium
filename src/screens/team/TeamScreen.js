import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import SQLite from 'react-native-sqlite-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';

const TeamScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const [teamMembers, setTeamMembers] = useState([]);
  const { t } = useTranslation();

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
    const serverEndpoint = `https://crashtest.by/app/team.php?id=${event.id}`;

    fetch(serverEndpoint)
      .then(response => response.json())
      .then(data => {
        setTeamMembers(data);
      })
      .catch(error => {
        console.error('Error fetching team from server:', error);
      });
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', marginTop: 16 }}>
      </Text>
      <Icon
        name="user-plus"
        size={30}
        color="#007BFF"
        style={{ position: 'absolute', top: 16, right: 16 }}
        onPress={() => navigation.navigate(t('Add a New Team Member'), { event })}
      />
      <FlatList
        data={teamMembers}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={() => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, borderBottomWidth: 1, paddingBottom: 8 }}>
            <Text style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>{t('Name')}</Text>
            <Text style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>{t('Role')}</Text>
            <Text style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>{t('Actions')}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, paddingVertical: 8 }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text>{item.name}</Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text>{item.role}</Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Button title={t('Edit')} onPress={() => navigation.navigate(t('Add a New Team Member'), { item })} />
            </View>
          </View>
        )}
        ListEmptyComponent={() => <Text>{t('No team members available.')}</Text>}
      />
    </View>
  );
};

export default TeamScreen;
