import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, TouchableOpacity, Alert } from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import SQLite from 'react-native-sqlite-storage';
import { useNavigation } from '@react-navigation/native';

const EditTaskScreen = ({ route }) => {
  const task = route.params.item;
  const navigation = useNavigation();
  const [taskName, setTaskName] = useState(task.taskName);
  const [description, setDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState(task.date ? new Date(parseFloat(task.date)) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState(task.priority);
  const [status, setStatus] = useState(task.status);
  const [assignee, setAssignee] = useState(task.assignee); // Default value as "Unassigned"
  const [teamMembers, setTeamMembers] = useState([]);

  // Load team members when the component mounts
  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = () => {
    const db = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });

    const selectTeamMembersStatement = 'SELECT * FROM team_members WHERE eventId = ?';

    db.transaction((tx) => {
      tx.executeSql(
        selectTeamMembersStatement,
        [task.eventId],
        (tx, results) => {
          const len = results.rows.length;
          const teamMembersArray = [];
          for (let i = 0; i < len; i++) {
            teamMembersArray.push(results.rows.item(i));
          }
          setTeamMembers(teamMembersArray);
          console.log(teammembers);
        },
        (error) => {
          console.error('Error executing SQL statement:', error);
        }
      );
    });
  };

  const handleEditTask = () => {
    const db = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });
    // Get the team member ID if an assignee is selected
    const teamMemberId = assignee !== 'Unassigned'
      ? teamMembers.find((teamMember) => teamMember.name === assignee)?.id
      : null;

    const UpdateTaskStatement = `
      UPDATE tasks 
      SET taskName = ?, description = ?, date = ?, priority = ?, status = ?, teamMemberId = ?
      WHERE id = ?
    `;

    db.transaction((tx) => {
      tx.executeSql(
        UpdateTaskStatement,
        [taskName, description, dueDate.getTime(), priority, status, teamMemberId, task.id],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            navigation.goBack(); // Navigate back to ActionsScreen
          } else {
            console.error('Failed to update task. Please try again.');
          }
        },
        (error) => {
          console.error('Error executing SQL statement:', error);
        }
      );
    });
  };

  const handleDeleteTask = () => {
    // Display a confirmation dialog before deleting the task
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            deleteTask();
          },
        },
      ],
      { cancelable: false }
    );
  };

  const deleteTask = () => {
    const db = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });

    const deleteTaskStatement = 'DELETE FROM tasks WHERE id = ?';

    db.transaction((tx) => {
      tx.executeSql(
        deleteTaskStatement,
        [task.id],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            navigation.goBack(); // Navigate back to the previous screen
          } else {
            console.error('Failed to delete task. Please try again.');
          }
        },
        (error) => {
          console.error('Error executing SQL statement:', error);
        }
      );
    });
  };

  const handleDateChange = (selectedDate) => {
    setShowDatePicker(false);
    setDueDate(selectedDate || dueDate);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
        Edit Task
      </Text>

      {/* Task Name Input */}
      <TextInput
        placeholder="Task Name"
        value={taskName}
        onChangeText={setTaskName}
        style={{ marginBottom: 8, borderColor: 'gray', borderWidth: 1, padding: 8, width: '80%' }}
      />

      {/* Description Input */}
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={{ marginBottom: 8, borderColor: 'gray', borderWidth: 1, padding: 8, width: '80%' }}
      />

      {/* Due Date Picker */}
      <TouchableOpacity onPress={showDatepicker} style={{ marginBottom: 8 }}>
        <Text>Due Date: {dueDate.toLocaleDateString()}</Text>
      </TouchableOpacity>
      <DateTimePicker
        isVisible={showDatePicker}
        mode="date"
        onConfirm={handleDateChange}
        onCancel={() => setShowDatePicker(false)}
      />

      <Text>Priority:</Text>
      {/* Priority Picker */}
      <Picker
        selectedValue={priority}
        onValueChange={(itemValue) => setPriority(itemValue)}
        mode="dropdown"
        style={{ width: '80%', height: 40, marginBottom: 8, borderColor: 'gray', padding: 0 }}
        itemStyle={{ height: 50, padding: 0, margin: 0 }}
      >
        <Picker.Item label="Critical" value="Critical" />
        <Picker.Item label="High" value="High" />
        <Picker.Item label="Medium" value="Medium" />
        <Picker.Item label="Low" value="Low" />
      </Picker>

      <Text>Assignee:</Text>
      {/* Assignee Picker */}
      <Picker
        selectedValue={assignee}
        onValueChange={(itemValue) => setAssignee(itemValue)}
        mode="dialog"
        style={{ width: '80%', height: 40, marginBottom: 16, borderColor: 'gray', padding: 0 }}
        itemStyle={{ height: 50, padding: 0, margin: 0 }}
      >
        <Picker.Item label="Unassigned" value="Unassigned" />
        {teamMembers.map((teamMember) => (
          <Picker.Item key={teamMember.id} label={teamMember.name} value={teamMember.name} />
        ))}
      </Picker>

      <Text>Status:</Text>
      {/* Status Picker */}
      <Picker
        selectedValue={status}
        onValueChange={(itemValue) => setStatus(itemValue)}
        mode="dropdown"
        style={{ width: '80%', height: 40, marginBottom: 8, borderColor: 'gray', padding: 0 }}
        itemStyle={{ height: 50, padding: 0, margin: 0 }}
      >
        <Picker.Item label="New" value="New" />
        <Picker.Item label="In Progress" value="In Progress" />
        <Picker.Item label="Done" value="Done" />
      </Picker>

      {/* Edit and Cancel Buttons */}
      <Button title="Update" onPress={handleEditTask} />
      <Button title="Delete" onPress={handleDeleteTask} color="red" />
      <Button title="Cancel" onPress={handleCancel} color="gray" />
    </View>
  );
};

export default EditTaskScreen;
