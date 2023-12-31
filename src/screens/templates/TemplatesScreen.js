import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, Alert, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';

const TemplatesScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const [templates, setTemplates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(3);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const [hasMorePages, setHasMorePages] = useState(true);


  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setCurrentPage(1); // Reset current page when the screen is focused
      setTemplates([]); // Clear existing templates when the screen is focused
      setHasMorePages(true); // Reset hasMorePages state to true
      loadTemplates();
    });

    return () => {
      unsubscribe();
    };
  }, [navigation]);

  const loadTemplates = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `https://crashtest.by/app/templates.php?page=${currentPage}&pageSize=${pageSize}&search=${searchQuery}`
      );
      const data = await response.json();

      // Check if there are more pages
      const hasMorePages = data.length === pageSize;

      setTemplates((prevTemplates) => [
        ...prevTemplates,
        ...data.map((item, index) => ({ ...item, id: prevTemplates.length + index })),
      ]);

      // If there are no more pages, hide the "Load More" button
      if (!hasMorePages) {
        setHasMorePages(false);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      Alert.alert('Error', 'Failed to load templates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setTemplates([]); // Clear existing templates when performing a new search
    setHasMorePages(true); // Reset hasMorePages state to true
    loadTemplates();
  };

  const handleLoadMore = () => {
    if (hasMorePages) {
      setCurrentPage(currentPage + 1);
      loadTemplates();
    }
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <TextInput
          placeholder={t("Enter Event Type or Name")}
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          style={{ flex: 1, padding: 8, borderWidth: 1, marginRight: 8 }}
        />
        <TouchableOpacity onPress={handleSearch} style={{ justifyContent: 'center', padding: 8, backgroundColor: 'blue' }}>
          <Text style={{ color: 'white' }}>{t("Search")}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={templates}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={() => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, borderBottomWidth: 1, paddingBottom: 8 }}>
            <Text style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>{t("Template")}</Text>
            <Text style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>{t("type")}</Text>
            <Text style={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>{t("action")}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, paddingVertical: 8 }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text>{item.name}</Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text>{item.type}</Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Button title={t("view")} onPress={() => navigation.navigate(t('View Template'), { item, event })} />
            </View>
          </View>
        )}
        ListFooterComponent={() =>
          loading ? (
            <ActivityIndicator size="large" color="blue" />
          ) : hasMorePages ? (
            <Button title={t("Load More")} onPress={handleLoadMore} />
          ) : null
        }
        ListEmptyComponent={() => <Text>{t("No templates available.")}</Text>}
      />
    </View>
  );
};

export default TemplatesScreen;
