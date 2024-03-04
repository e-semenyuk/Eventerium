import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, Alert } from 'react-native';
import Clipboard from "@react-native-community/clipboard";
import RegistrationsHelper from '../../helpers/RegistrationsHelper';
import { useTranslation } from 'react-i18next';
import { FORM_URL } from '../../constants/Urls';

const PeopleScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const [people, setPeople] = useState([]);
  const { t } = useTranslation();

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
      const data = await getRegistrations(event.id)
      setPeople(data);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  async function getRegistrations(id) {
    const registrations = await RegistrationsHelper.getRegistrations(id);
    return registrations;
  }

  const getRegistrationUrl = () => {
    return FORM_URL + "?eventId=" + event.id;
  }

  const copyUrlToClipboard = (url) => {
    Clipboard.setString(url);
    Alert.alert(t('urlCopied'), t('copiedUrlMessage'));
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>{t('totalRegistrations', { count: people.length === undefined ? 0 : people.length })}
</Text>
      <FlatList
        data={people}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={() => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, borderBottomWidth: 1, paddingBottom: 8 }}>
            <Text style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>{t('firstname')}</Text>
            <Text style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>{t('lastname')}</Text>
            <Text style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>{t('action')}</Text>
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
              <Button title={t('view')} onPress={() => navigation.navigate(t('View Person'), { item, event })} />
            </View>
          </View>
        )}
        ListEmptyComponent={() => <Text>{t("No people invited.")}</Text>}
      />
      <TouchableOpacity
        style={{ position: 'absolute', bottom: 16, right: 16 }}>
        <Button title={t('getUrl')} onPress={() => copyUrlToClipboard(getRegistrationUrl())}/>
      </TouchableOpacity>
    </View>
  );
};

export default PeopleScreen;
