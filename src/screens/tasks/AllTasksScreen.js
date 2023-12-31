import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert, Text, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import SQLite from 'react-native-sqlite-storage';
import DraggableFlatList from 'react-native-draggable-flatlist';
import NewTaskScreen from './NewTaskScreen'; // Update the path to the correct location
import NewTemplateScreen from '../templates/NewTemplateScreen';
import { useTranslation } from 'react-i18next'; 

const AllTasksScreen = ({ navigation, route }) => {
  const [tasks, setTasks] = useState([]);
  const [expandedTasks, setExpandedTasks] = useState([]);
  const [isAddTaskModalVisible, setAddTaskModalVisible] = useState(false);
  const [isCreateTemplateModalVisible, setCreateTemplateModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTasks();
    });

    return () => {
      unsubscribe;
      const db = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });
      db.close();
    };
  }, []);

  const loadTasks = () => {
    const db = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });

    const fetchTasksStatement = `
    SELECT tasks.id, taskName, tasks.description, status, priority, tasks.date, orderId, tasks.type, teamMemberId, tasks.eventId, name as assignee, events.title, events.date as eventDate
    FROM tasks
    LEFT JOIN team_members ON tasks.teamMemberId = team_members.id
    LEFT JOIN events ON tasks.eventId = events.id WHERE tasks.type = 'task' AND tasks.status != 'Done' ORDER BY events.id, tasks.orderId
    `;

    db.transaction((tx) => {
      tx.executeSql(
        fetchTasksStatement,
        [],
        (tx, results) => {
          const len = results.rows.length;
          const tasksArray = [];
          const expandedArray = expandedTasks.length === len ? expandedTasks : new Array(len).fill(false);

          for (let i = 0; i < len; i++) {
            tasksArray.push(results.rows.item(i));
          }
          setTasks(tasksArray);
          setExpandedTasks(expandedArray);
        },
        (error) => {
          console.error('Error executing SQL statement:', error);
          Alert.alert('Error', 'Failed to fetch tasks. Please try again.');
        }
      );
    });
  };

  const handleTaskStatusChange = (taskId, currentStatus) => {
    const db = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });
  
    let newStatus = 'New';
    if (currentStatus === 'New') {
      // If the current status is already 'New', toggle it back to 'Done'
      newStatus = 'Done';
    }
  
    const updateStatusStatement = `
      UPDATE tasks
      SET status = ?
      WHERE id = ?
    `;
  
    db.transaction((tx) => {
      tx.executeSql(
        updateStatusStatement,
        [newStatus, taskId],
        () => {
          // Reload tasks after updating status
          loadTasks();
        },
        (error) => {
          console.error('Error executing SQL statement:', error);
          Alert.alert('Error', 'Failed to update task status. Please try again.');
        }
      );
    });
  };  

  const handleSaveTemplate = () => {
    navigation.navigate('Create Template',  tasks );
  };

  const toggleTaskDetails = (taskId) => {
    // Toggle the expanded state for the clicked task
    setExpandedTasks((prevExpandedTasks) => ({
      ...prevExpandedTasks,
      [taskId]: !prevExpandedTasks[taskId],
    }));
  };

  const saveTaskOrderToDatabase = (newOrder) => {
    const db = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });
 
    newOrder.forEach((item, index) => {
      const updateOrderStatement = `
        UPDATE tasks
        SET orderId = ?
        WHERE id = ?
      `;
 
      db.transaction((tx) => {
        tx.executeSql(
          updateOrderStatement,
          [index, item.id],
          () => {},
          (error) => {
            console.error('Error executing SQL statement:', error);
            Alert.alert('Error', 'Failed to update task order. Please try again.');
          }
        );
      });
    });
 };
 

 const renderTaskItem = ({ item, index, drag, isActive }) => {
  const dueDate = new Date(Number(item.date));

  // Style for the task name based on status
  const taskNameStyle = {
    fontWeight: 'bold',
    fontSize: 18,
    textDecorationLine: item.status === 'Done' ? 'line-through' : 'none',
    color: item.type === 'section' ? 'gray' : 'black', // Apply underline for section tasks
    textAlign: item.type === 'section' ? 'center' : 'left', // Center text for section tasks
  };

  // Priority style
  const priorityStyle = {
    color: getPriorityColor(item.priority),
  };

  // Determine the icon based on task type
  const icon = item.type === 'section' ? null : item.status === 'Done' ? 'check-circle-o' : 'circle-o';

  const limitedTaskName = item.taskName.length > 25 ? item.taskName.substring(0, 30) + '...' : item.taskName;

  // Check if the current event is different from the last displayed event
  const showEventName = index === 0 || item.eventId !== lastDisplayedEvent;

  // Update the last displayed event for the next iteration
  lastDisplayedEvent = item.eventId;

  return (
    <View style={{ marginBottom: 16, backgroundColor: isActive ? '#d3d3d3' : 'transparent' }}>
      {showEventName && (
        <View style={{ backgroundColor: '#efefef', padding: 8 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 20, color: 'grey' }}>{t("Event")}: {item.title}, {t("date")}: {item.eventDate}</Text>
        </View>
      )}
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
        <Icon
          color="#007BFF"
          size={30}
          name="edit"
          onPress={() => handleTaskEdit(item)}
        ></Icon>
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
            {item.teamMemberId && (<Text>
              <Text style={{ fontWeight: 'bold' }}>{t("Assignee")}: </Text>
              <Text>{item.teamMemberId ? item.assignee : t('Unassigned')}</Text>
            </Text>)}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// ...

// Define a variable to keep track of the last displayed event
let lastDisplayedEvent;

  // Helper function to get status color
  const getStatusColor = (status) => {
    return status === 'Done' ? 'red' : 'black';
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
      <Text style={{ fontSize: 20, textAlign: 'center', paddingTop: 10}}>{t("All tasks to do from all events")}</Text>
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
      <TouchableOpacity
        style={{ position: 'absolute', bottom: 10, right: 16 }}
        onPress={openAddTaskModal}
      >
        <Icon name="plus" size={40} color="#007BFF" />
      </TouchableOpacity>      
    </View>
  );
};

export default AllTasksScreen;