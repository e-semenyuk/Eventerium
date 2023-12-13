import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, TouchableOpacity, Modal, Pressable, ScrollView } from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import ToggleSwitch from 'react-native-toggle-element';
import SQLite from 'react-native-sqlite-storage';
import { useNavigation } from '@react-navigation/native';

const NewTaskScreen = ({ route }) => {
  const { event } = route.params;
  const navigation = useNavigation();
  const [isSectionToggleEnabled, setSectionToggleEnabled] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState('Priority');
  const [status, setStatus] = useState('New');
  const [assignee, setAssignee] = useState('Unassigned');
  const [teamMembers, setTeamMembers] = useState([]);
  const [orderId, setOrderId] = useState();
  const [priorityModalVisible, setPriorityModalVisible] = useState(false)
  const [assigneeModalVisible, setAssigneeModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  // Load team members when the component mounts
  useEffect(() => {
    GetTheLatestOrderId();
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
        },
        (error) => {
          console.error('Error executing SQL statement:', error);
        }
      );
    });
  };

  const GetTheLatestOrderId = () => {
    const db = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });

    const selectOrderIdStatement = 'SELECT MAX(orderId) as latestOrderId FROM tasks WHERE eventId = ?';

    db.transaction((tx) => {
      tx.executeSql(
        selectOrderIdStatement,
        [event.id],
        (tx, results) => {
          const len = results.rows.length;
          setOrderId(results.rows.item(0).latestOrderId);
        },
        (error) => {
          console.error('Error executing SQL statement:', error);
        }
      );
    });
  };

  const handleToggleChange = () => {
    setSectionToggleEnabled(!isSectionToggleEnabled);
  };

  const handleAddTask = () => {
    const db = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });

    const teamMemberId =
      assignee !== 'Unassigned'
        ? teamMembers.find((teamMember) => teamMember.name === assignee)?.id
        : null;

    const insertTaskStatement = `
      INSERT INTO tasks (taskName, description, date, priority, status, type, orderId, eventId, teamMemberId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.transaction((tx) => {
      tx.executeSql(
        insertTaskStatement,
        [
          taskName,
          description,
          dueDate ? dueDate.getTime() : null,
          priority,
          status,
          isSectionToggleEnabled ? 'section' : 'task',
          orderId + 1,
          event.id,
          teamMemberId,
        ],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            navigation.goBack();
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

  const handleAssigneeModal = () => {
    setAssigneeModalVisible(!assigneeModalVisible);
  };

  const handleStatusModal = () => {
    setStatusModalVisible(!statusModalVisible);
  };

  const selectAssignee = (value) => {
    setAssignee(value);
    setAssigneeModalVisible(false);
  };

  const selectStatus = (value) => {
    setStatus(value);
    setStatusModalVisible(false);
  };

  const handlePriorityModal = () => {
    setPriorityModalVisible(!priorityModalVisible);
  };

  const selectPriority = (value) => {
    setPriority(value);
    setPriorityModalVisible(false);
  };

  return (
    <ScrollView contentContainerStyle={{ flex: 1, justifyContent: 'flex-end', padding: 16 }}>
    <View style={{ justifyContent: 'center', alignItems: 'center', paddingTop: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
        Add a New {isSectionToggleEnabled ? 'Section' : 'Task'}
      </Text>

      <TextInput
        placeholder={isSectionToggleEnabled ? 'Section Name' : 'Task Name'}
        value={taskName}
        onChangeText={setTaskName}
        style={{
          marginBottom: 8,
          marginTop: 8,
          borderColor: 'gray',
          borderWidth: 0,
          fontSize: 20,
          fontWeight: 'bold',
          padding: 8,
          width: '80%',
        }}
      />

      {!isSectionToggleEnabled && (
        <>
          <TextInput
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            style={{ marginBottom: 8, borderColor: 'grey', borderWidth: 0, padding: 8, width: '80%' }}
          />

          <View style={{ flexDirection: 'row', width: '80%' }}>
            <TouchableOpacity onPress={showDatepicker} style={{ flex: 1, marginRight: 8 }}>
              <Text
                style={{
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: 'grey',
                  padding: 8,
                  textAlign: 'center',
                  marginLeft: 45,
                  marginRight: 45,
                }}
              >
                {dueDate === null ? 'Select the Date' : dueDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            <DateTimePicker
              isVisible={showDatePicker}
              mode="date"
              onConfirm={handleDateChange}
              onCancel={() => setShowDatePicker(false)}
            />
                    
            </View>

          <View style={{ flexDirection: 'row',  width: '80%', justifyContent: 'center', marginBottom: 16, marginTop: 8}}>
          <Pressable onPress={handlePriorityModal}>
              <Text style={{
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: 'grey',
                  padding: 8,
                  alignItems: 'center',
                  marginRight: 8,
                }}
                >{priority}</Text>
            </Pressable>  
            <Pressable onPress={handleAssigneeModal}>
              <Text style={{
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: 'grey',
                  padding: 8,
                  alignItems: 'center',
                  marginRight: 8,
                }}>
                  {assignee}</Text>
            </Pressable>
            <Pressable onPress={handleStatusModal}>
              <Text style={{
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: 'grey',
                  padding: 8,
                  alignItems: 'center',
                }}>
                  {status}</Text>
            </Pressable>
          </View>
        </>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={assigneeModalVisible || statusModalVisible || priorityModalVisible}
        onRequestClose={() => {
          setAssigneeModalVisible(false);
          setStatusModalVisible(false);
          setPriorityModalVisible(false);
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, elevation: 5 }}>
            {assigneeModalVisible && (
              <>
                <Text style={{ marginBottom: 16, fontSize: 18, fontWeight: 'bold' }}>Select Assignee</Text>
                {teamMembers.map((teamMember) => (
                  <Pressable key={teamMember.id} onPress={() => selectAssignee(teamMember.name)}>
                    <Text style={{ marginBottom: 8 }}>{teamMember.name}</Text>
                  </Pressable>
                ))}
              </>
            )}
            {statusModalVisible && (
              <>
                <Text style={{ marginBottom: 16, fontSize: 18, fontWeight: 'bold' }}>Select Status</Text>
                <Pressable onPress={() => selectStatus('New')}>
                  <Text style={{ marginBottom: 8 }}>New</Text>
                </Pressable>
                <Pressable onPress={() => selectStatus('In Progress')}>
                  <Text style={{ marginBottom: 8 }}>In Progress</Text>
                </Pressable>
                <Pressable onPress={() => selectStatus('Done')}>
                  <Text style={{ marginBottom: 8 }}>Done</Text>
                </Pressable>
              </>
            )}
            {priorityModalVisible && (
              <>
                <Text style={{ marginBottom: 16, fontSize: 18, fontWeight: 'bold' }}>Select Priority</Text>
                <Pressable onPress={() => selectPriority('Critical')}>
                  <Text style={{ marginBottom: 8 }}>Critical</Text>
                </Pressable>
                <Pressable onPress={() => selectPriority('High')}>
                  <Text style={{ marginBottom: 8 }}>High</Text>
                </Pressable>
                <Pressable onPress={() => selectPriority('Medium')}>
                  <Text style={{ marginBottom: 8 }}>Medium</Text>
                </Pressable>
                <Pressable onPress={() => selectPriority('Low')}>
                  <Text style={{ marginBottom: 8 }}>Low</Text>
                </Pressable>
              </>
            )}
            <Button title="Cancel" onPress={() => setAssigneeModalVisible(false) || setStatusModalVisible(false) || setPriorityModalVisible(false)} />
          </View>
        </View>
      </Modal>
      <ToggleSwitch
        isOn={isSectionToggleEnabled}
        onPress={handleToggleChange}
        leftLabel="Task"
        rightLabel="Section"
        disabledTitleStyle={{ color: 'red' }}
      />
      <Button title="Add" onPress={handleAddTask} />
      <Button title="Cancel" onPress={handleCancel} color="gray" />
    </View>
    </ScrollView>
  );
};

export default NewTaskScreen;
