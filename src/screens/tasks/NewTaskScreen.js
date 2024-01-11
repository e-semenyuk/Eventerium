import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, TextInput, TouchableOpacity, Modal, Pressable, ScrollView, Alert,  KeyboardAvoidingView, Platform } from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import SQLite from 'react-native-sqlite-storage';
import { useNavigation } from '@react-navigation/native';
import ToggleSwitch from 'react-native-toggle-element';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';

const NewTaskScreen = ({ route, onRequestClose, selectedTask }) => {
  const { event } = route.params;
  const item = selectedTask;
  const { t } = useTranslation();
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
  const [selectedColor, setSelectedColor] = useState(isEditing&&item.color ? item.color : isSectionToggleEnabled ? "grey" : "black");
  const [colorModalVisible, setColorModalVisible] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      getLatestOrderId();
    }
    loadTeamMembers();
    nameInputRef.current.focus();
  }, []);

  const loadTeamMembers = async () => {
    try {
      // Replace the following API call with your actual endpoint to fetch team members
      const response = await fetch(`https://crashtest.by/app/team.php?id=${event.id}`);
      const data = await response.json();
      setTeamMembers(data);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const getLatestOrderId = async () => {
    try {
      // Replace the following API call with your actual endpoint to get the latest order ID
      const response = await fetch(`https://crashtest.by/app/taskOrder.php?id=${event.id}`);
      const data = await response.json();
      setOrderId(data[0].latestOrderId);
    } catch (error) {
      console.error('Error fetching latest order ID:', error);
    }
  };

  const handleToggleChange = () => {
    setSectionToggleEnabled(!isSectionToggleEnabled);
    !isEditing && isSectionToggleEnabled ? setSelectedColor("black") : setSelectedColor("grey") 
  };

  const handleTaskOperation = async () => {
    if (isEditing) {
      await handleEditTask();
    } else {
      await handleAddTask();
    }
  };

  const handleAddTask = async () => {
    try {
      // Replace the following API call with your actual endpoint to add a new task
      const response = await fetch('https://crashtest.by/app/tasks.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskName,
          description,
          date: dueDate ? dueDate.getTime() : null,
          priority: priority === 'Priority' ? 'Medium' : priority,
          status,
          type: isSectionToggleEnabled ? 'section' : 'task',
          orderId: orderId + 1,
          teamMemberId: assignee !== 'Unassigned' ? teamMembers.find((teamMember) => teamMember.name === assignee)?.id : null,
          eventId: event.id,
          color: selectedColor,
        }),
      });

      if (response.ok) {
        onRequestClose();
      } else {
        console.error('Failed to add task. Please try again.');
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleEditTask = async () => {
    try {
      // Replace the following API call with your actual endpoint to edit an existing task
      const response = await fetch(`https://crashtest.by/app/tasks.php?id=${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskName,
          description,
          date: dueDate === null ? null : dueDate.getTime(),
          priority,
          status,
          type: isSectionToggleEnabled ? 'section' : 'task',
          teamMemberId: assignee !== 'Unassigned' ? teamMembers.find((teamMember) => teamMember.name === assignee)?.id : null,
          eventId: event.id,
          color: selectedColor,
        }),
      });

      if (response.ok) {
        onRequestClose();
      } else {
        console.error('Failed to update task. Please try again.');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
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

  const handleColorModal = () => {
    setColorModalVisible(!colorModalVisible);
  };
  
  const selectColor = (color) => {
    setSelectedColor(color);
    setColorModalVisible(false);
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

  const handleDeleteTask = async () => {
    // Display a confirmation dialog before deleting the task
    Alert.alert(
      t('Confirm Deletion'),
      t('Are you sure you want to delete this task?'),
      [
        {
          text: t('Cancel'),
          style: 'cancel',
        },
        {
          text: t('Delete'),
          onPress: async () => {
            await deleteTask();
          },
        },
      ],
      { cancelable: false }
    );
  };

  const deleteTask = async () => {
    try {
      // Replace the following API call with your actual endpoint to delete a task
      const response = await fetch(`https://crashtest.by/app/tasks.php?id=${item.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onRequestClose();
      } else {
        console.error('Failed to delete task. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const colors = ['black', 'maroon','red', 'pink', 'purple', 'blue', 'lightblue', 'grey', 'silver', 'orange', 'gold', 'green', 'brown', 'tan'];

  return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
      <ScrollView keyboardShouldPersistTaps="always" contentContainerStyle={{ flex: 1, justifyContent: 'flex-end', padding: 16, paddingBottom: 0 }}>
        <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', flex: 1, textAlign: 'center' }}>
              {isEditing ? t('Edit') : t('Add')} {isSectionToggleEnabled ? t('Section') : t('Task')}
            </Text>
            <Icon name="close" size={24} onPress={onRequestClose} style={{ marginLeft: 'auto' }} />
          </View>
          <TextInput
            ref={nameInputRef}
            placeholder={isSectionToggleEnabled ? t('Section Name') : t('Task Name')}
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
                placeholder={t("description")}
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
                    {dueDate === null ? t('Select the Date') : dueDate.toLocaleDateString()}
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
                  >{t(priority)}</Text>
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
                    {t(assignee)}</Text>
                </Pressable>
                <Pressable onPress={handleStatusModal}>
                  <Text style={{
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: 'grey',
                    padding: 8,
                    alignItems: 'center',
                  }}>
                    {t(status)}</Text>
                </Pressable>
              </View>
            </>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '80%' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8, borderColor: 'grey', borderWidth: 0, padding: 8 }}>
          {t("Color")}</Text>
          <TouchableOpacity onPress={handleColorModal}>
            <Text>
                <View style={{ width: 30, height: 30, backgroundColor: selectedColor, borderRadius: 20 }} />
            </Text>
          </TouchableOpacity>
          </View>

          <Modal
  animationType="slide"
  transparent={true}
  visible={colorModalVisible}
  onRequestClose={() => setColorModalVisible(false)}
>
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, elevation: 5, width: '90%' }}>
      <Text style={{ marginBottom: 16, fontSize: 18, fontWeight: 'bold' }}>{t("Select Color")}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {colors.map((color) => (
          <TouchableOpacity
            key={color}
            onPress={() => selectColor(color)}
            style={{
                      width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: color,
              margin: 5,
            }}
          />
        ))}
      </View>
      <Button title={t("Cancel")} onPress={() => setColorModalVisible(false)} />
    </View>
  </View>
</Modal>

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
                    <Text style={{ marginBottom: 16, fontSize: 18, fontWeight: 'bold' }}>{t("Select Assignee")}</Text>
                    {teamMembers.map((teamMember) => (
                      <Pressable key={teamMember.id} onPress={() => selectAssignee(teamMember.name)}>
                        <Text style={{ marginBottom: 8 }}>{teamMember.name}</Text>
                      </Pressable>
                    ))}
                  </>
                )}
                {statusModalVisible && (
                  <>
                    <Text style={{ marginBottom: 16, fontSize: 18, fontWeight: 'bold' }}>{t("Select Status")}</Text>
                    <Pressable onPress={() => selectStatus('New')}>
                      <Text style={{ marginBottom: 8 }}>{t('New')}</Text>
                    </Pressable>
                    <Pressable onPress={() => selectStatus('In Progress')}>
                      <Text style={{ marginBottom: 8 }}>{t("In Progress")}</Text>
                    </Pressable>
                    <Pressable onPress={() => selectStatus('Done')}>
                      <Text style={{ marginBottom: 8 }}>{t("Done")}</Text>
                    </Pressable>
                  </>
                )}
                {priorityModalVisible && (
                  <>
                    <Text style={{ marginBottom: 16, fontSize: 18, fontWeight: 'bold' }}>{t("Select Priority")}</Text>
                    <Pressable onPress={() => selectPriority('Critical')}>
                      <Text style={{ marginBottom: 8 }}>{t('Critical')}</Text>
                    </Pressable>
                    <Pressable onPress={() => selectPriority('High')}>
                      <Text style={{ marginBottom: 8 }}>{(t('High'))}</Text>
                    </Pressable>
                    <Pressable onPress={() => selectPriority('Medium')}>
                      <Text style={{ marginBottom: 8 }}>{(t('Medium'))}</Text>
                    </Pressable>
                    <Pressable onPress={() => selectPriority('Low')}>
                      <Text style={{ marginBottom: 8 }}>{(t('Low'))}</Text>
                    </Pressable>
                  </>
                )}
                <Button title={t("Cancel")} onPress={() => setAssigneeModalVisible(false) || setStatusModalVisible(false) || setPriorityModalVisible(false)} />
              </View>
            </View>
          </Modal>
          <ToggleSwitch
            isOn={isSectionToggleEnabled}
            onPress={handleToggleChange}
            leftTitle={t("task")}
            rightTitle={t("section")}
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
  );
};

export default NewTaskScreen;
