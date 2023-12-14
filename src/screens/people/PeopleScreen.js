import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, Alert } from 'react-native';
import Clipboard from "@react-native-community/clipboard";

const PeopleScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const [people, setPeople] = useState([]);
  const dataUrl = 'https://crashtest.by/data.php';
  const formUrl = 'https://crashtest.by/form.php';

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadPeople();
    });

    return () => {
      unsubscribe;
    };
  }, []);

  const loadPeople = async () => {
    try {
      const response = await fetch(getDataUrl());
      const data = await response.json();
      setPeople(data);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getRegistrationUrl = () => {
    return formUrl + "?eventId=" + event.id;
  }

  const getDataUrl = () => {
    return dataUrl + "?eventId=" + event.id;
  }

  const copyUrlToClipboard = (url) => {
    Clipboard.setString(url);
    Alert.alert('URL Copied', 'Registration URL has been copied to the clipboard.');
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>Total Registrations: {people.length === undefined ? '0' : people.length}
</Text>
      <FlatList
        data={people}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={() => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, borderBottomWidth: 1, paddingBottom: 8 }}>
            <Text style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>First Name</Text>
            <Text style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>Last Name</Text>
            <Text style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>Actions</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, paddingVertical: 8 }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text>{item.firstname}</Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text>{item.lastname}</Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Button title="View" onPress={() => navigation.navigate('View Person', { item, event })} />
            </View>
          </View>
        )}
        ListEmptyComponent={() => <Text>No people invited.</Text>}
      />
      <TouchableOpacity
        style={{ position: 'absolute', bottom: 16, right: 16 }}>
        <Button title="Get URL" onPress={() => copyUrlToClipboard(getRegistrationUrl())}/>
      </TouchableOpacity>
    </View>
  );
};

export default PeopleScreen;
