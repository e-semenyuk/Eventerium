import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert, Text, Modal, Button } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import SQLite from 'react-native-sqlite-storage';
import DraggableFlatList from 'react-native-draggable-flatlist';
import NewTaskScreen from './NewTaskScreen';
import NewTemplateScreen from '../templates/NewTemplateScreen';
import { useTranslation } from 'react-i18next';
import { TASKS_URL } from '../../constants/Urls';

const TasksScreen = ({ navigation, route }) => {
  const { event } = route.params;
  const [tasks, setTasks] = useState([]);
  const [expandedTasks, setExpandedTasks] = useState([]);
  const [isAddTaskModalVisible, setAddTaskModalVisible] = useState(false);
  const [isCreateTemplateModalVisible, setCreateTemplateModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null); // New state to track the selected task for editing
  const { t } = useTranslation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
    loadTasks();
    });
    return () => {
      unsubscribe;
    };
  }, []);

  const loadTasks = async () => {
    const endpoint = `${TASKS_URL}?id=${event.id}`;

    try {
      const response = await fetch(endpoint);
      const data = await response.json();

      if (response.ok) {
        setTasks(data);
        const expandedArray = new Array(data.length).fill(false);
        setExpandedTasks(expandedArray);
      } else {
        Alert.alert('Error', `Failed to fetch tasks. ${data.error || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'Failed to fetch tasks. Please try again.');
    }
  };

  const handleTaskStatusChange = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'New' ? 'Done' : 'New';
    const endpoint = `${TASKS_URL}?id=${taskId}`;

    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        loadTasks(); // Reload tasks after updating status
      } else {
        Alert.alert('Error', `Failed to update task status. ${data.error || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      Alert.alert('Error', 'Failed to update task status. Please try again.');
    }
  };

  const saveTaskOrderToDatabase = async (newOrder) => {
    const promises = newOrder.map(async (item, index) => {
      const endpoint = `${TASKS_URL}?id=${item.id}`;

      try {
        await fetch(endpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: index,
          }),
        });
      } catch (error) {
        console.error('Error updating task order:', error);
        Alert.alert('Error', 'Failed to update task order. Please try again.');
      }
    });

    await Promise.all(promises);
  };

  const toggleTaskDetails = (taskId) => {
    // Toggle the expanded state for the clicked task
    setExpandedTasks((prevExpandedTasks) => ({
      ...prevExpandedTasks,
      [taskId]: !prevExpandedTasks[taskId],
    }));
  };

  const renderTaskItem = ({ item, index, drag, isActive }) => {
    const dueDate = new Date(Number(item.date));
  
    // Style for the task name based on status
    const taskNameStyle = {
      fontWeight: 'bold',
      fontSize: item.type === 'section' ? 25 : 18,
      textDecorationLine: item.status === 'Done' ? 'line-through' : 'none',
      color: item.color,
      textAlign: item.type === 'section' ? 'center' : 'left', // Center text for section tasks
    };
  
    // Priority style
    const priorityStyle = {
      color: getPriorityColor(item.priority),
    };
  
    // Determine the icon based on task type
    const icon = item.type === 'section' ? null : item.status === 'Done' ? 'check-circle-o' : 'circle-o';
  
    const limitedTaskName = item.taskName.length > 25 ? item.taskName.substring(0, 30) + '...' : item.taskName;
  
    return (
      <TouchableOpacity onLongPress={drag}>
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon
            color="#007BFF"
            size={30}
            name={icon}
            onPress={() => (item.type === 'section' ? null : handleTaskStatusChange(item.id, item.status))}
          />
          <TouchableOpacity onPress={() => (item.type === 'section' ? null : toggleTaskDetails(item.id))} onLongPress={drag}>
            <View>
              <Text style={taskNameStyle}> {limitedTaskName} </Text>
            </View>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', position: 'absolute', right: 16 }}>
        <Icon
          color="#007BFF"
          size={30}
          name="edit"
          onPress={() => handleTaskEdit(item)}
        ></Icon>
      </View>
        </View>
        {expandedTasks[item.id] && (
          <View>
            <TouchableOpacity onPress={() => toggleTaskDetails(item.id)} onLongPress={drag}>
              <Text>
                <Text style={{ fontWeight: 'bold' }}>{t("description")}: </Text>
                <Text>{item.description}</Text>
              </Text>
              <Text>
                <Text style={{ fontWeight: 'bold' }}>{t("Status")}: </Text>
                <Text>{t(item.status)}</Text>
              </Text>
              <Text>
                <Text style={{ fontWeight: 'bold' }}>{t("Priority")}: </Text>
                <Text style={priorityStyle}>{t(item.priority)}</Text>
              </Text>
              <Text>
                <Text style={{ fontWeight: 'bold' }}>{t("Due Date")}: </Text>
                <Text>{item.date === null ? t('None') : dueDate.toLocaleDateString()}</Text>
              </Text>
              {item.teamMemberId && (
                <Text>
                  <Text style={{ fontWeight: 'bold' }}>{t("Assignee")}: </Text>
                  <Text>{item.teamMemberId ? item.assignee : t('Unassigned')}</Text>
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
          <View style={{ height: item.type === 'section' ? 3 : 1, backgroundColor: 'grey', marginVertical: 15 }} />
      </View>
      </TouchableOpacity>
    );
  };  

  // Helper function to get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low':
        return 'green';
      case 'Medium':
        return 'orange';
      case 'High':
        return 'red';
      case 'Critical':
        return 'red';
      default:
        return 'black';
    }
  };

  const handleTaskEdit = (task) => {
    setSelectedTask(task);
    setAddTaskModalVisible(true);
  };

  const openAddTaskModal = () => {
    setAddTaskModalVisible(true);
    setSelectedTask(null); // Clear the selected task when opening the modal for a new task
  };

  const closeAddTaskModal = () => {
    loadTasks();
    setAddTaskModalVisible(false);
    setSelectedTask(null); // Clear the selected task when closing the modal
  };

  const openCreateTemplateModal = () => {
    setCreateTemplateModalVisible(true);
  };

  const closeCreateTemplateModal = () => {
    loadTasks();
    setCreateTemplateModalVisible(false);
  };

  return (
    <View style={{ flex: 1 }}>

      {/* DraggableFlatList */}
      <View style={{ flex: 1, paddingBottom: 60 }}>
        <DraggableFlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index, drag, isActive }) => renderTaskItem({ item, index, drag, isActive })}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text>{t("No tasks available")}</Text>}
          onDragEnd={({ data }) => {
            setTasks(data);
            saveTaskOrderToDatabase(data);
          }}
        />
      </View>

      {/* Plus icon */}
      <TouchableOpacity
        style={{ position: 'absolute', bottom: 10, right: 16, zIndex: 1 }}
        onPress={openAddTaskModal}
      >
        <Icon name="plus" size={40} color="#007BFF" />
      </TouchableOpacity>

      {/* Create template button */}
      <TouchableOpacity
        style={{ position: 'absolute', bottom: 10, left: 16, zIndex: 1 }}
        onPress={openCreateTemplateModal}
      >
        <Button title={t("Create Template")} onPress={openCreateTemplateModal} />
      </TouchableOpacity>

      {/* Add Task Bottom Sheet */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddTaskModalVisible}
        onRequestClose={closeAddTaskModal}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <NewTaskScreen
            route={{ params: { event } }}
            onRequestClose={closeAddTaskModal}
            selectedTask={selectedTask}
          />
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCreateTemplateModalVisible}
        onRequestClose={closeCreateTemplateModal}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <NewTemplateScreen
            route={{ params: { event } }}
            onRequestClose={closeCreateTemplateModal}
            selectedTasks={tasks}
          />
        </View>
      </Modal>
    </View>
  );
};

export default TasksScreen;