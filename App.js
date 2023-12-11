// In your navigation file (e.g., App.js)
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import EventViewScreen from './src/screens/EventViewScreen';
import EventForm from './src/components/EventForm';
import EventDetailsScreen from './src/screens/EventDetailsScreen';
import AddTeamMemberScreen from './src/screens/team/AddTeamMemberScreen';
import EditTeamMemberScreen from './src/screens/team/EditTeamMemberScreen';
import TeamScreen from './src/screens/team/TeamScreen';
import TasksScreen from './src/screens/tasks/TasksScreen';
import NewTaskScreen from './src/screens/tasks/NewTaskScreen';
import EditTaskScreen from './src/screens/tasks/EditTaskScreen';
import NewTemplateScreen from './src/screens/templates/NewTemplateScreen';
import ViewTemplateScreen from './src/screens/templates/ViewTemplateScreen';
import TemplatesScreen from './src/screens/templates/TemplatesScreen';
import FlashMessage from "react-native-flash-message";


const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Upcoming Events">
        <Stack.Screen name="Upcoming Events" component={EventViewScreen} />
        <Stack.Screen name="Create New Event" component={EventForm} />
        <Stack.Screen name="Event Details" component={EventDetailsScreen} />
        <Stack.Screen name="Add a New Team Member" component={AddTeamMemberScreen} />
        <Stack.Screen name="Event Team" component={TeamScreen} />
        <Stack.Screen name="Tasks" component={TasksScreen} />
        <Stack.Screen name="Edit Team Member" component={EditTeamMemberScreen} />
        <Stack.Screen name="New Task" component={NewTaskScreen} />
        <Stack.Screen name="Edit Task" component={EditTaskScreen} />
        <Stack.Screen name="Create Template" component={NewTemplateScreen} />
        <Stack.Screen name="View Template" component={ViewTemplateScreen} />
        <Stack.Screen name="Templates" component={TemplatesScreen} />

        {/* Add other screens if needed */}
      </Stack.Navigator>
      <FlashMessage position="top" />
    </NavigationContainer>
  );
};

export default App;
