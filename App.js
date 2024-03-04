// In your navigation file (e.g., App.js)
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import EventViewScreen from './src/screens/events/EventViewScreen';
import MainScreen from './src/screens/MainScreen';
import CreateEventScreen from './src/screens/events/CreateEventScreen';
import EventDetailsScreen from './src/screens/events/EventDetailsScreen';
import TeamScreen from './src/screens/team/TeamScreen';
import TasksScreen from './src/screens/tasks/TasksScreen';
import AllTasksScreen from './src/screens/tasks/AllTasksScreen';
import NewTaskScreen from './src/screens/tasks/NewTaskScreen';
import NewTemplateScreen from './src/screens/templates/NewTemplateScreen';
import ViewTemplateScreen from './src/screens/templates/ViewTemplateScreen';
import TemplatesScreen from './src/screens/templates/TemplatesScreen';
import PeopleScreen from './src/screens/people/PeopleScreen';
import ViewPersonScreen from './src/screens/people/ViewPersonScreen';
import FlashMessage from "react-native-flash-message";
import { useTranslation } from 'react-i18next'; 
import RegistrationForm from './src/components/RegistrationForm';
import LoginForm from './src/components/LoginForm'; 
import Login from './src/screens/Login';
import SettingsScreen from './src/screens/settings/SettingsScreen';
import LanguageScreen from './src/screens/settings/LanguageScreen';
import TeamMemberFormScreen from './src/screens/team/TeamMemberFormScreen';
import NotificationsScreen from './src/screens/notifications/NotificationsScreen';

const Stack = createStackNavigator();

const App = () => {
  const { t } = useTranslation();

const globalScreenOptions = {
  headerBackTitle: t('Back'),
};

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={globalScreenOptions} initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name={t("Login Form")} component={LoginForm} />
        <Stack.Screen name={t("Registration Form")} component={RegistrationForm} />
        <Stack.Screen name="Eventerium" component={MainScreen} />
        <Stack.Screen name="Upcoming Events" component={EventViewScreen} />
        <Stack.Screen name={t("Settings")} component={SettingsScreen} />
        <Stack.Screen name={t("Language")} component={LanguageScreen} />
        <Stack.Screen name={t("Create New Event")}component={CreateEventScreen} />
        <Stack.Screen name={t("Event Details")} component={EventDetailsScreen} />
        <Stack.Screen name={t("Add a New Team Member")}component={TeamMemberFormScreen} />
        <Stack.Screen name={t("Event Team")}component={TeamScreen} />
        <Stack.Screen name={t("Tasks")}component={TasksScreen} />
        <Stack.Screen name={t("All Tasks")}component={AllTasksScreen} />
        <Stack.Screen name={t("New Task")}component={NewTaskScreen} />
        <Stack.Screen name={t("Create Template")}component={NewTemplateScreen} />
        <Stack.Screen name={t("View Template")}component={ViewTemplateScreen} />
        <Stack.Screen name={t("Templates")}component={TemplatesScreen} />
        <Stack.Screen name={t("Invited People")}component={PeopleScreen} />
        <Stack.Screen name={t("View Person")}component={ViewPersonScreen} />
        <Stack.Screen name={t("Notifications")}component={NotificationsScreen} />

        {/* Add other screens if needed */}
      </Stack.Navigator>
      <FlashMessage position="bottom" />
    </NavigationContainer>
  );
};

export default App;
