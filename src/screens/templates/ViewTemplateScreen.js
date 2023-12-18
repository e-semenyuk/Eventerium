import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert, FlatList, Text, Button } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import SQLite from 'react-native-sqlite-storage';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { showMessage, hideMessage, FlashMessage } from "react-native-flash-message";
import NewTaskScreen from '../tasks/NewTaskScreen';
import { useTranslation } from 'react-i18next';

const ViewTemplateScreen = ({ navigation, route  }) => {
  const event = route.params.event;
  const templateId = route.params.item.id;
  const [tasks, setTasks] = useState([]);
  const [expandedTasks, setExpandedTasks] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
      loadTasks();
  }, []);

  const loadTasks = () => {
    const db = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });
  
    const fetchTasksStatement = `
      SELECT * FROM template_details WHERE templateId = ?
    `;
  
    db.transaction((tx) => {
      tx.executeSql(
        fetchTasksStatement,
        [templateId],
        (tx, results) => {
          const len = results.rows.length;
          const tasksArray = [];
          const expandedArray = expandedTasks.length === len ? expandedTasks : new Array(len).fill(false);
          for (let i = 0; i < len; i++) {
            tasksArray.push(results.rows.item(i));
            console.log(tasksArray);
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

  const GetTheLatestOrderId = () => {
    const db = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });

    const selectOrderIdStatement = 'SELECT MAX(orderId) as latestOrderId FROM tasks WHERE eventId = ?';

    db.transaction((tx) => {
      tx.executeSql(
        selectOrderIdStatement,
        [event.id],
        (tx, results) => {
          const len = results.rows.length;
          return (results.rows.item(0).latestOrderId);
        },
        (error) => {
          console.error('Error executing SQL statement:', error);
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

  const handleAddAction = (id) => {
    const task = tasks.find(task => task.id === id)
    const db = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });

    const insertTaskStatement = `
      INSERT INTO tasks (taskName, description, priority, status, type, orderId, eventId)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.transaction((tx) => {
      tx.executeSql(
        insertTaskStatement,
        [task.taskName, task.description, task.priority, "New", task.type, GetTheLatestOrderId+1, event.id],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            showMessage({
                message: t('Task added successfully!'),
                type: 'success',
                titleStyle: { textAlign: 'center' },
              });
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

  const hadleAddAll = () => {
    tasks.forEach((item) => {
        handleAddAction(item.id)
    })
  }

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

  const renderStatusIcon = () => {
    //const icon = item.status === 'Done' ? 'check-circle-o' : 'circle-o';
    return (
      <Icon
        color="#007BFF"
        size={30}
        name="plus"
        onPress={() => handleAddAction(item.id)}
      />
    );
  };

  return (
    <View style={{ marginBottom: 16, textAlign: 'center', marginTop: 16, backgroundColor: isActive ? '#d3d3d3' : 'transparent' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {renderStatusIcon()}
        <TouchableOpacity onPress={() => (item.type === 'section' ? null : toggleTaskDetails(item.id))} onLongPress={drag}>
          <View>
            <Text style={taskNameStyle}> {item.taskName} </Text>
          </View>
        </TouchableOpacity>
        <Icon
          color="#007BFF"
          size={30}
          name="edit"
          onPress={() => navigation.navigate('Edit Task', { item })}
        ></Icon>
      </View>
      {expandedTasks[item.id] && (
        <View>
        <TouchableOpacity onPress={() => (item.type === 'section' ? null : toggleTaskDetails(item.id))} onLongPress={drag}>
          <Text>
            <Text style={{ fontWeight: 'bold' }}>Description: </Text>
            <Text>{item.description}</Text>
          </Text>
          <Text>
            <Text style={{ fontWeight: 'bold' }}>Status: </Text>
            <Text>{item.status}</Text>
          </Text>
          <Text>
            <Text style={{ fontWeight: 'bold' }}>Priority: </Text>
            <Text style={priorityStyle}>{item.priority}</Text>
          </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};


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
        return 'burgundy';
      default:
        return 'black';
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'left'}}>      
      <DraggableFlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index, drag, isActive }) =>
          renderTaskItem({ item, index, drag, isActive })
        }
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text>No tasks available</Text>}
        onDragEnd={({ data }) => {
          // Update the order of tasks in the component state after drag-and-drop
          setTasks(data);

          // Save the new order to the database
          saveTaskOrderToDatabase(data);
        }}
      />
      <TouchableOpacity
        style={{ position: 'absolute', bottom: 16, right: 16 }}>
        <Button title={t("Add All")} onPress={hadleAddAll}/>
      </TouchableOpacity>
    </View>
  );
};

export default ViewTemplateScreen;
