import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import SQLite from 'react-native-sqlite-storage';

const NewTemplateScreen = ({ route, navigation }) => {
  const  tasks  = route.params;
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');

  console.log(tasks);

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
            const insertTaskStatement = `INSERT INTO template_details (taskName, description, priority, status, orderId, templateId)
                VALUES (?, ?, ?, ?, ?, ?)`;

            db.transaction((tx) => {
                tasks.forEach((task, index) => {
                tx.executeSql(
                    insertTaskStatement,
                    [task.taskName, task.description, task.priority, "New", task.orderId, results.insertId],
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
                onPress: () => navigation.goBack(),
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
    navigation.goBack();
  };

  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
        Create a New Template
      </Text>
      <TextInput
        placeholder="Template Name"
        value={name}
        onChangeText={setName}
        style={{ marginBottom: 8, borderColor: 'gray', borderWidth: 1, padding: 8 }}
      />
      <TextInput
        placeholder="Template Type"
        value={type}
        onChangeText={setType}
        style={{ marginBottom: 16, borderColor: 'gray', borderWidth: 1, padding: 8 }}
      />
      <TextInput
        placeholder="Template Description"
        value={description}
        onChangeText={setDescription}
        style={{ marginBottom: 16, borderColor: 'gray', borderWidth: 1, padding: 8 }}
      />

      <Button title="Add" onPress={handleAddTeamMember} />
      <Button title="Cancel" onPress={handleCancel} color="gray" />
    </View>
  );
};

export default NewTemplateScreen;
