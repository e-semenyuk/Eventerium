import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, Alert, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

const NewTemplateScreen = ({ route, onRequestClose, selectedTasks }) => {
  const  tasks  = selectedTasks;
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const nameInputRef = useRef(null);

  useEffect(() => {
    // Set focus to the TextInput when the component mounts
    nameInputRef.current.focus();
  }, []);

  const handleAddTeamMember = () => {
    if (!name|| !type) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const db = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });

    const insertTemplateStatement = `
      INSERT INTO templates (name, type, description)
      VALUES (?, ?, ?)
    `;
    db.transaction((tx) => {
      tx.executeSql(
        insertTemplateStatement,
        [name, type, description],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            const insertTaskStatement = `INSERT INTO template_details (taskName, description, priority, status, type, orderId, templateId)
                VALUES (?, ?, ?, ?, ?, ?, ?)`;

            db.transaction((tx) => {
                tasks.forEach((task, index) => {
                tx.executeSql(
                    insertTaskStatement,
                    [task.taskName, task.description, task.priority, "New", task.type, task.orderId, results.insertId],
                    (tx, results) => {
                    if (results.rowsAffected > 0) {
                        console.log(`Task ${index + 1} added successfully.`);
                    } else {
                        console.error(`Failed to add task ${index + 1}. Please try again.`);
                    }
                    },
                    (error) => {
                    console.error('Error executing SQL statement:', error);
                    }
                );
                });
            });

            Alert.alert('Success', 'New template created successfully.', [
              {
                text: 'OK',
                onPress: () => onRequestClose(),
              },
            ]);
          } else {
            Alert.alert('Error', 'Failed to create template. Please try again.');
          }
        },
        (error) => {
          console.error('Error executing SQL statement:', error);
        }
      );
    });
  };

  const handleCancel = () => {
    onRequestClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true} // Make sure it's always visible
      onRequestClose={onRequestClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
      <ScrollView keyboardShouldPersistTaps="always" contentContainerStyle={{ flex: 1, justifyContent: 'flex-end', padding: 16, paddingBottom: 0 }}>
      <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', flex: 1, textAlign: 'center' }}>
              Create a New Template
            </Text>
            <Icon name="close" size={24} onPress={onRequestClose} style={{ marginLeft: 'auto' }} />
          </View>
      <TextInput
        ref={nameInputRef}
        placeholder="Template Name"
        value={name}
        onChangeText={setName}
        style={{ paddingTop: 16, padding: 8, fontWeight: 'bold', fontSize: 20 }}
      />
      <TextInput
        placeholder="Template Type"
        value={type}
        onChangeText={setType}
        style={{ paddingTop: 16, padding: 8 }}
      />
      <TextInput
        placeholder="Template Description"
        value={description}
        onChangeText={setDescription}
        style={{ paddingTop: 16, padding: 8 }}
      />

      <Button title="Add" onPress={handleAddTeamMember} />
      <Button title="Cancel" onPress={handleCancel} color="gray" />
    </View>
    </ScrollView>
    </KeyboardAvoidingView>
    </Modal>
  );
};

export default NewTemplateScreen;
