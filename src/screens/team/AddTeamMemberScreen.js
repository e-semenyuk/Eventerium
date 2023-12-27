import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import { useTranslation } from 'react-i18next';

const AddTeamMemberScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const { t } = useTranslation();

  const handleAddTeamMember = async () => {
    if (!name || !role) {
      Alert.alert('Error', t('Please fill in all fields.'));
      return;
    }

    const endpoint = 'https://crashtest.by/app/team.php';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          role,
          eventId: event.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Team member added successfully.', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Error', `Failed to add team member. ${data.error || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Error adding team member:', error);
      Alert.alert('Error', 'Failed to add team member. Please try again.');
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', marginTop: 16 }}>
        {t("Add a New Team Member")}
      </Text>
      <TextInput
        placeholder={t("Name")}
        value={name}
        onChangeText={setName}
        style={{ marginBottom: 8, borderColor: 'gray', borderWidth: 1, padding: 8 }}
      />
      <TextInput
        placeholder={t("Role")}
        value={role}
        onChangeText={setRole}
        style={{ marginBottom: 16, borderColor: 'gray', borderWidth: 1, padding: 8 }}
      />

      <Button title={t("Add")} onPress={handleAddTeamMember} />
      <Button title={t("Cancel")} onPress={handleCancel} color="gray" />
    </View>
  );
};

export default AddTeamMemberScreen;
