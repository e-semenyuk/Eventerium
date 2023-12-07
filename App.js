// In your navigation file (e.g., App.js)
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import EventViewScreen from './src/screens/EventViewScreen';
import EventForm from './src/components/EventForm';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="EventView">
        <Stack.Screen name="EventView" component={EventViewScreen} />
        <Stack.Screen name="EventForm" component={EventForm} />
        {/* Add other screens if needed */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
