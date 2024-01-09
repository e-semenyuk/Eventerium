import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert, FlatList, Text, Button } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { showMessage } from 'react-native-flash-message';
import { useTranslation } from 'react-i18next';

const ViewTemplateScreen = ({ navigation, route }) => {
  const event = route.params.event;
  const templateId = route.params.item.id;
  const [tasks, setTasks] = useState([]);
  const [expandedTasks, setExpandedTasks] = useState({});
  const { t } = useTranslation();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await fetch(`https://crashtest.by/app/templateDetails.php?id=${templateId}`);
      const data = await response.json();
      setTasks(data);

      // Initialize the expandedTasks state with default values based on the data
      const initialExpandedState = {};
      data.forEach((task) => {
        initialExpandedState[task.id] = false;
      });
      setExpandedTasks(initialExpandedState);
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'Failed to fetch tasks. Please try again.');
    }
  };

  const getLatestOrderId = async () => {
    try {
      const response = await fetch(`https://crashtest.by/app/taskOrder.php?id=${event.id}`);
      const data = await response.json();
      return data[0].latestOrderId;
    } catch (error) {
      console.error('Error getting latest order ID:', error);
      throw new Error('Failed to get the latest order ID. Please try again.');
    }
  };

  const handleAddAction = async (id) => {
    const task = tasks.find((task) => task.id === id);

    try {
      const latestOrderId = await getLatestOrderId();

      const response = await fetch('https://crashtest.by/app/tasks.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskName: task.taskName,
          description: task.description,
          priority: task.priority,
          status: "New",
          type: task.type,
          color: task.color,
          orderId: latestOrderId + 1,
          templateId: templateId,
          eventId: event.id
        }),
      });

      if (response.ok) {
        showMessage({
          message: t('Task added successfully!'),
          type: 'success',
          titleStyle: { textAlign: 'center' },
        });
      } else {
        console.error('Failed to add task. Please try again.');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Error', 'Failed to add task. Please try again.');
    }
  };

  const handleAddAll = () => {
    tasks.forEach((item) => {
      handleAddAction(item.id);
    });
  };

  const toggleTaskDetails = (taskId) => {
    setExpandedTasks((prevExpandedTasks) => ({
      ...prevExpandedTasks,
      [taskId]: !prevExpandedTasks[taskId],
    }));
  };

  const renderTaskItem = ({ item, index, drag, isActive }) => {
    const dueDate = new Date(Number(item.date));

    const taskNameStyle = {
      fontWeight: 'bold',
      fontSize: 18,
      textDecorationLine: item.status === 'Done' ? 'line-through' : 'none',
      color: item.type === 'section' ? 'gray' : 'black',
      textAlign: item.type === 'section' ? 'center' : 'left',
    };

    const priorityStyle = {
      color: getPriorityColor(item.priority),
    };

    const renderStatusIcon = () => {
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

  const getStatusColor = (status) => {
    return status === 'Done' ? 'red' : 'black';
  };

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
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'left' }}>
      <DraggableFlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index, drag, isActive }) =>
          renderTaskItem({ item, index, drag, isActive })
        }
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text>No tasks available</Text>}
        onDragEnd={({ data }) => {
          setTasks(data);
        }}
      />
      <TouchableOpacity
        style={{ position: 'absolute', bottom: 16, right: 16 }}>
        <Button title={t("Add All")} onPress={handleAddAll} />
      </TouchableOpacity>
    </View>
  );
};

export default ViewTemplateScreen;
