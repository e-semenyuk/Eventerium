import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert, FlatList, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import SQLite from 'react-native-sqlite-storage';
import DraggableFlatList from 'react-native-draggable-flatlist';

const TasksScreen = ({ navigation, route }) => {
  const { event } = route.params;
  const [tasks, setTasks] = useState([]);
  const [expandedTasks, setExpandedTasks] = useState([]);

  useEffect(() => {
    checkAndCreateTable();
    const unsubscribe = navigation.addListener('focus', () => {
      loadTasks();
    });

    return () => {
      unsubscribe;
      const db = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });
      db.close();
    };
  }, []);

  const checkAndCreateTable = () => {
    const db = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });

    const createTableStatement = `
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          taskName TEXT,
          description TEXT,
          date TEXT,
          priority TEXT,
          status TEXT,
          orderId INTEGER,
          eventId INTEGER,
          teamMemberId INTEGER,
          FOREIGN KEY (eventId) REFERENCES events (id),
          FOREIGN KEY (teamMemberId) REFERENCES team_members (id)
        );
      `;

    db.transaction((tx) => {
      tx.executeSql(createTableStatement, []);
    });
  };

  const loadTasks = () => {
    const db = SQLite.openDatabase({ name: 'events.db', createFromLocation: 1 });

    const fetchTasksStatement = `
      SELECT tasks.id, taskName, description, status, priority, date, orderId, teamMemberId, tasks.eventId, name as assignee
      FROM tasks
      LEFT JOIN team_members ON tasks.teamMemberId = team_members.id
      WHERE tasks.eventId = ? ORDER BY orderId
    `;

    db.transaction((tx) => {
      tx.executeSql(
        fetchTasksStatement,
        [event.id],
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

  const handleAddAction = () => {
    navigation.navigate('New Task', { event });
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
    console.log(newOrder);
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
  };

  // Priority style
  const priorityStyle = {
    color: getPriorityColor(item.priority),
  };

  const renderStatusIcon = () => {
    const icon = item.status === 'Done' ? 'check-circle-o' : 'circle-o';
    return (
      <Icon
        color="#007BFF"
        size={20}
        name={icon}
        onPress={() => handleTaskStatusChange(item.id, item.status)}
      />
    );
  };

  return (
    <View style={{ marginBottom: 16, backgroundColor: isActive ? '#d3d3d3' : 'transparent' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {renderStatusIcon()}
        <TouchableOpacity onPress={() => toggleTaskDetails(item.id)} onLongPress={drag}>
          <View>
            <Text style={taskNameStyle}> {item.taskName} </Text>
          </View>
        </TouchableOpacity>
        <Icon
          color="#007BFF"
          size={20}
          name="edit"
          onPress={() => navigation.navigate('Edit Task', { item })}
        ></Icon>
      </View>
      {expandedTasks[item.id] && (
        <View>
          <TouchableOpacity onPress={() => toggleTaskDetails(item.id)} onLongPress={drag}>
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
          <Text>
            <Text style={{ fontWeight: 'bold' }}>Due Date: </Text>
            <Text>{dueDate.toLocaleDateString()}</Text>
          </Text>
          <Text>
            <Text style={{ fontWeight: 'bold' }}>Assignee: </Text>
            <Text>{item.teamMemberId ? item.assignee : 'Unassigned'}</Text>
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
    <TouchableOpacity
        style={{ position: 'absolute', top: 16, right: 16 }}
        onPress={handleAddAction}
      >
        <Icon name="plus-circle" size={30} color="#007BFF" />
      </TouchableOpacity>

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
        style={{ position: 'absolute', bottom: 16, right: 16 }}
        onPress={handleSaveTemplate}
      >
        <Icon name="bookmark-o" size={30} color="#007BFF" />
      </TouchableOpacity>
    </View>
  );
};

export default TasksScreen;
