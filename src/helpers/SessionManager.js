// SessionManager.js
import CookieManager from '@react-native-cookies/cookies';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SessionManager {
  static async getSessionId() {
    try {
      const sessionId = await AsyncStorage.getItem('sessionId');
      return sessionId;
    } catch (error) {
      console.error('Error getting session ID:', error);
      return null;
    }
  }

  static async clearCookies() {
    try {
      await CookieManager.clearAll();
    } catch (error) {
      console.error('Error clearing cookies:', error);
    }
  }

  static async checkSession() {
    const sessionId = await SessionManager.getSessionId();

    if (!sessionId) {
      // No session ID, return false
      return false;
    }

    try {
      // Make a GET request to check the session
      const response = await fetch('https://crashtest.by/app/login.php', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`,
        },
      });

      // Check the HTTP status code
      if (response.ok) {
        // Session is alive (status code 200), return true
        return true;
      } else if (response.status === 401) {
        // Unauthorized (status code 401), session is not alive, return false
        return false;
      } else {
        // Handle other status codes if needed
        console.error('Unexpected status code:', response.status);
        return false;
      }
    } catch (error) {
      // Handle network or other errors
      console.error('Error checking session:', error);
      return false;
    }
  }

  static async killSession() {
    const sessionId = await SessionManager.getSessionId();

    if (sessionId) {
      // Make a POST request to log out on the server
      try {
        const logoutResponse = await fetch('https://crashtest.by/app/logout.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionId}`,
          },
        });

        // Check if the logout request was successful (status code 200)
        if (logoutResponse.ok) {
          console.log('Logout successful on the server');
        } else {
          console.error('Failed to log out on the server:', logoutResponse.status);
        }
      } catch (error) {
        console.error('Error during logout request:', error);
      }
    }

    // Clear cookies and remove session ID locally
    await SessionManager.clearCookies();
    await AsyncStorage.removeItem('sessionId');
  }
}

export default SessionManager;
