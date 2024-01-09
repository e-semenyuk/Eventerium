import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, Alert, Switch, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { showMessage } from 'react-native-flash-message';
import { useTranslation } from 'react-i18next';

const NewTemplateScreen = ({ route, onRequestClose, selectedTasks }) => {
  const tasks = selectedTasks;
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const nameInputRef = useRef(null);
  const { t } = useTranslation();
  const [isPublic, setIsPublic] = useState(false); // New state for the toggle switch

  useEffect(() => {
    // Set focus to the TextInput when the component mounts
    nameInputRef.current.focus();
  }, []);

  const handleAddTemplate = async () => {
    if (!name || !type) {
      Alert.alert('Error', t('Please fill in all fields.'));
      return;
    }

    try {
      // Make a POST request to create a new template
      const templateResponse = await fetch('https://crashtest.by/app/templates.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          type,
          description,
          isPublic: isPublic,
        }),
      });

      if (templateResponse.ok) {
        const templateData = await templateResponse.json();
        const templateId = templateData.id;

        // Make a batch of POST requests to create tasks associated with the template
        await Promise.all(
          tasks.map(async (task, index) => {
            const taskResponse = await fetch('https://crashtest.by/app/templateDetails.php', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                taskName: task.taskName,
                description: task.description,
                priority: task.priority,
                type: task.type,
                orderId: task.orderId,
                templateId: templateId,
                color: task.color,
              }),
            });

            if (taskResponse.ok) {
              console.log(`Task ${index + 1} added successfully.`);
            } else {
              console.error(`Failed to add task ${index + 1}. Please try again.`);
            }
          })
        );

        showMessage({
          message: t('New template created successfully.'),
          type: 'success',
          titleStyle: { textAlign: 'center' },
        });

        onRequestClose();
      } else {
        console.error('Failed to create template. Please try again.');
        Alert.alert('Error', 'Failed to create template. Please try again.');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      Alert.alert('Error', 'Failed to create template. Please try again.');
    }
  };

  const handleCancel = () => {
    onRequestClose();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        keyboardShouldPersistTaps="always"
        contentContainerStyle={{ flex: 1, justifyContent: 'flex-end', padding: 16, paddingBottom: 0 }}
      >
        <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', flex: 1, textAlign: 'center' }}>
              {t('Create a New Template')}
            </Text>
            <Icon name="close" size={24} onPress={onRequestClose} style={{ marginLeft: 'auto' }} />
          </View>
          <TextInput
            ref={nameInputRef}
            placeholder={t('Template Name')}
            value={name}
            onChangeText={setName}
            style={{ paddingTop: 16, padding: 8, fontWeight: 'bold', fontSize: 20 }}
          />
          <TextInput
            placeholder={t('Template Type')}
            value={type}
            onChangeText={setType}
            style={{ paddingTop: 16, padding: 8 }}
          />
          <TextInput
            placeholder={t('Template Description')}
            value={description}
            onChangeText={setDescription}
            style={{ paddingTop: 16, padding: 8 }}
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 16 }}>
            <Text style={{ marginRight: 8 }}>{t('Public')}</Text>
            <Switch value={isPublic} onValueChange={(value) => setIsPublic(value)} />
          </View>

          <Button title={t('Add')} onPress={handleAddTemplate} />
          <Button title={t('Cancel')} onPress={handleCancel} color="gray" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default NewTemplateScreen;