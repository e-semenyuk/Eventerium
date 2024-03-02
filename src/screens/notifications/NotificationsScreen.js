import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Button, Dimensions } from 'react-native'; // Import Dimensions from react-native
import { useFocusEffect } from '@react-navigation/native'; 
import Icon from 'react-native-vector-icons/FontAwesome';

const NotificationsScreen = ({ setNotificationsCount }) => {
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('https://crashtest.by/app/notifications.php');
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchNotificationCount = async () => {
    try {
      const response = await fetch('https://crashtest.by/app/notificationsCount.php');
      const data = await response.json();
      setNotificationCount(data);
      setNotificationsCount(data);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchNotifications();
      fetchNotificationCount();
      const intervalId = setInterval(() => {
        fetchNotifications();
        fetchNotificationCount();
      }, 30000);
      return () => clearInterval(intervalId);
    }, [])
  );

  const markNotificationAsSeen = async (notificationId) => {
    try {
      const response = await fetch('https://crashtest.by/app/notificationsCount.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: notificationId }),
      });
      if (response.ok) {
        fetchNotifications();
        fetchNotificationCount();
      } else {
        console.error('Failed to mark notification as seen:', response.status);
      }
    } catch (error) {
      console.error('Error marking notification as seen:', error);
    }
  };

  const markAllNotificationsAsSeen = async () => {
    try {
      const response = await fetch('https://crashtest.by/app/notificationsCount.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markAll: true }),
      });
      if (response.ok) {
        fetchNotifications();
        fetchNotificationCount();
      } else {
        console.error('Failed to mark all notifications as seen:', response.status);
      }
    } catch (error) {
      console.error('Error marking all notifications as seen:', error);
    }
  };

  const handleStatusChange = async (id, statusText) => {
    try {
      const response = await fetch(`https://crashtest.by/app/notifications.php?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: statusText, seen: 1 }),
      });
      if (response.ok) {
        fetchNotifications();
        fetchNotificationCount();
      } else {
        console.error('Failed to update status of notification:', response.status);
      }
    } catch (error) {
      console.error('Error changing status for notification:', error);
    }
  };

  const handleNotificationPress = (notificationId) => {
    markNotificationAsSeen(notificationId);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleNotificationPress(item.id)}>
      <View style={styles.notificationContainer}>
        <Text style={[styles.notificationText, item.seen == 1 ? {} : styles.bold]}>
          {item.message}
        </Text>
        <View style={styles.statusContainer}>
          {item.request_id && item.status === 'Pending' ? (
            <View style={styles.iconContainer}>
              <TouchableOpacity onPress={() => handleStatusChange(item.id, "Accepted")}>
                <Icon name="check" size={20} color="green" style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleStatusChange(item.id, "Denied")}>
                <Icon name="times" size={20} color="red" style={styles.icon} />
              </TouchableOpacity>
            </View>
          ) : (
            item.request_id && (
              <Text style={styles.status}>{item.status}</Text>
            )
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button title="Mark All as Read" onPress={markAllNotificationsAsSeen} />
      </View>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No notifications to display</Text>
        )}
        horizontal={false} // Disable horizontal scroll
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: Dimensions.get('window').width * 0.9, // Adjusted to 70% of screen width
  },
  notificationText: {
    fontSize: 16,
    flex: 1,
  },
  bold: {
    fontWeight: 'bold',
  },
  iconContainer: {
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 10,
  },
  status: {
    marginLeft: 1,
    color: 'blue',
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
  buttonContainer: {
    marginBottom: 10,
  },
});

export default NotificationsScreen;
