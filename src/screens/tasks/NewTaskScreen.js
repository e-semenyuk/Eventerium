import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, TextInput, TouchableOpacity, Modal, Pressable, ScrollView, Alert,  KeyboardAvoidingView, Platform } from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import SQLite from 'react-native-sqlite-storage';
import { useNavigation } from '@react-navigation/native';
import ToggleSwitch from 'react-native-toggle-element';
import Icon from 'react-native-vector-icons/FontAwesome';

const NewTaskScreen = ({ route, onRequestClose, selectedTask }) => {
  const { event } = route.params;
  const item = selectedTask;
  const navigation = useNavigation();
  const isEditing = !!selectedTask; // Determine if it's an editing scenario
  const [isSectionToggleEnabled, setSectionToggleEnabled] = useState(isEditing ? item.type === 'section' : false);
  const [taskName, setTaskName] = useState(isEditing ? item.taskName : '');
  const [description, setDescription] = useState(isEditing ? item.description : '');
  const [dueDate, setDueDate] = useState(isEditing ? item.date === null ? null : new Date(parseFloat(item.date)) : null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState(isEditing ? item.priority : 'Priority');
  const [status, setStatus] = useState(isEditing ? item.status : 'New');
  const [assignee, setAssignee] = useState(isEditing ? item.assignee === null ? 'Unassigned' : item.assignee : 'Unassigned');
  const [teamMembers, setTeamMembers] = useState([]);
  const [orderId, setOrderId] = useState();
  const [priorityModalVisible, setPriorityModalVisible] = useState(false)
  const [assigneeModalVisible, setAssigneeModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const nameInputRef = useRef(null);


  useEffect(() => {
    if (!isEditing) {
      GetTheLatestOrderId();
    }
    loadTeamMembers();
    nameInputRef.current.focus();
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

  const handleTaskOperation = () => {
    if (isEditing) {
      handleEditTask();
    } else {
      handleAddTask();
    }
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
          priority === 'Priority' ? 'Medium' : priority,
          status,
          isSectionToggleEnabled ? 'section' : 'task',
          orderId + 1,
          event.id,
          teamMemberId,
        ],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            onRequestClose();
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

  const handleEditTask = () => {
    const db = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });
    const teamMemberId = assignee !== 'Unassigned'
      ? teamMembers.find((teamMember) => teamMember.name === assignee)?.id
      : null;

    const updateTaskStatement = `
      UPDATE tasks 
      SET taskName = ?, description = ?, date = ?, priority = ?, status = ?, type = ?, teamMemberId = ?
      WHERE id = ?
    `;

    db.transaction((tx) => {
      tx.executeSql(
        updateTaskStatement,
        [taskName, description, dueDate === null ? null : dueDate.getTime(), priority, status, isSectionToggleEnabled ? 'section' : 'task', teamMemberId, item.id],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            onRequestClose();
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

  const handleDateChange = (selectedDate) => {
    setShowDatePicker(false);
    setDueDate(selectedDate || dueDate);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleCancel = () => {
    onRequestClose();
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
        [item.id],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            onRequestClose();
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
              {isEditing ? 'Edit' : 'Add'} {isSectionToggleEnabled ? 'Section' : 'Task'}
            </Text>
            <Icon name="close" size={24} onPress={onRequestClose} style={{ marginLeft: 'auto' }} />
          </View>
          <TextInput
            ref={nameInputRef}
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
            leftTitle="Task"
            rightTitle="Section"
            trackBar={{
              activeBackgroundColor: "#3c4145",
              inActiveBackgroundColor: "#3c4145",
            }}
            thumbButton={{
              width: 60,
              height: 60,
              radius: 30,
              textAlign: 'center',
            }}
            thumbStyle={{
              backgroundColor: "#86c3d7", 
            }}
          />
          <Text style={{paddingBottom: 30}}></Text>
          <TouchableOpacity
              style={{ position: 'absolute', bottom: 16, right: 16 }}
              onPress={handleTaskOperation}
            >
            <Icon name="plus" size={40} color="#007BFF" />
          </TouchableOpacity>
          {isEditing && <TouchableOpacity
              style={{ position: 'absolute', bottom: 16, left: 16, }}
              onPress={handleDeleteTask}
            >
            <Icon name="trash" size={40} color="red" />
          </TouchableOpacity>}
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default NewTaskScreen;
