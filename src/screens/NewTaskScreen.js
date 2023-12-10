import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, TouchableOpacity } from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import SQLite from 'react-native-sqlite-storage';
import { useNavigation } from '@react-navigation/native';

const NewTaskScreen = ({ route }) => {
  const { event } = route.params;
  const navigation = useNavigation();
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('New');
  const [assignee, setAssignee] = useState('Unassigned'); // Default value as "Unassigned"
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
        [event.id],
        (tx, results) => {
          const len = results.rows.length;
          const teamMembersArray = [];
          for (let i = 0; i < len; i++) {
            teamMembersArray.push(results.rows.item(i));
          }
          setTeamMembers(teamMembersArray);
          console.log(teamMembers);

        },
        (error) => {
          console.error('Error executing SQL statement:', error);
        }
      );
    });
  };

  const handleAddTask = () => {
    const db = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });

    // Get the team member ID if an assignee is selected
    const teamMemberId = assignee !== 'Unassigned'
      ? teamMembers.find((teamMember) => teamMember.name === assignee)?.id
      : null;

    const insertTaskStatement = `
      INSERT INTO tasks (taskName, description, date, priority, status, eventId, teamMemberId)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.transaction((tx) => {
      tx.executeSql(
        insertTaskStatement,
        [taskName, description, dueDate.getTime(), priority, status, event.id, teamMemberId],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            navigation.goBack(); // Navigate back to ActionsScreen
          } else {
            console.error('Failed to add task. Please try again.');
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
        Add a New Task
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

      {/* Add and Cancel Buttons */}
      <Button title="Add" onPress={handleAddTask} />
      <Button title="Cancel" onPress={handleCancel} color="gray" />
    </View>
  );
};

export default NewTaskScreen;
