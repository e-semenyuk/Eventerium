import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, Alert, Switch, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { showMessage } from 'react-native-flash-message';
import { useTranslation } from 'react-i18next';
import { TEMPLATES_URL, TEMPLATE_DETAILS_URL } from '../../constants/Urls';

const NewTemplateScreen = ({ onRequestClose, selectedTasks }) => {
  const tasks = selectedTasks;
  const [name, setName] = useState('');
  const [type, setType] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [description, setDescription] = useState('');
  const nameInputRef = useRef(null);
  const { t } = useTranslation();
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    nameInputRef.current.focus();
  }, []);

  const handleAddTemplate = async () => {
    if (!name || !type.length) {
      Alert.alert('Error', t('Please fill in all fields.'));
      return;
    }

    try {
      const templateResponse = await fetch(TEMPLATES_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          type: type.join(' '), // Join the array into a string
          description,
          isPublic,
          tags: type
        }),
      });

      if (templateResponse.ok) {
        const templateData = await templateResponse.json();
        const templateId = templateData.id;

        await Promise.all(
          tasks.map(async (task, index) => {
            const taskResponse = await fetch(TEMPLATE_DETAILS_URL, {
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
                templateId,
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

  const handleTagInputChange = (text) => {
    setTagInput(text);
  };

  const handleAddTag = () => {
    if (tagInput.trim() !== '') {
      setType([...type, tagInput.trim()]);
      setTagInput('');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView keyboardShouldPersistTaps="always" contentContainerStyle={{ flex: 1, justifyContent: 'flex-end', padding: 16, paddingBottom: 0 }}>
        <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', flex: 1, textAlign: 'center' }}>
              {t('Create a New Template')}
            </Text>
            <Icon name="close" size={24} onPress={onRequestClose} style={{ marginLeft: 'auto' }} />
          </View>
          <TextInput ref={nameInputRef} placeholder={t('Template Name')} value={name} onChangeText={setName} style={{ paddingTop: 16, padding: 8, fontWeight: 'bold', fontSize: 20 }} />
          <TextInput placeholder={t('Template Description')} value={description} onChangeText={setDescription} style={{ paddingTop: 16, padding: 8 }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 16 }}>
            <Text style={{ marginRight: 8 }}>{t('Public')}</Text>
            <Switch value={isPublic} onValueChange={(value) => setIsPublic(value)} />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 16 }}>
            <TextInput
              placeholder={t('Add Tag')}
              value={tagInput}
              onChangeText={handleTagInputChange}
              style={{ flex: 1, padding: 8, marginRight: 8, borderWidth: 1, borderColor: 'gray', borderRadius: 5 }}
            />
            <TouchableOpacity onPress={handleAddTag} style={{ padding: 8, backgroundColor: '#007BFF', borderRadius: 5 }}>
              <Text style={{ color: 'white' }}>{t('Add')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal style={{ flexDirection: 'row', paddingTop: 16 }}>
            {type.map((tag, index) => (
              <TouchableOpacity
                key={index}
                style={{ borderRadius: 15, backgroundColor: 'lightgray', padding: 8, marginRight: 8 }}
                onPress={() => {
                  const updatedTags = [...type];
                  updatedTags.splice(index, 1);
                  setType(updatedTags);
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text>{tag}</Text>
                <Icon name="times" size={12} color="red" />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Button title={t('Add')} onPress={handleAddTemplate} />
          <Button title={t('Cancel')} onPress={handleCancel} color="gray" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default NewTemplateScreen;
