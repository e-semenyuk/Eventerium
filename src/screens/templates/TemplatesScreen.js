import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, FlatList, Alert, TextInput, TouchableOpacity, ActivityIndicator, Switch, ScrollView, Modal, Keyboard } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/FontAwesome';

const TemplatesScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const [templates, setTemplates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const currentPageRef = useRef(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const hasMorePagesRef = useRef(true);
  const { t } = useTranslation();
  const isPublicRef = useRef(false);
  const [isPublicSwitchValue, setIsPublicSwitchValue] = useState(false);
  const [totalPages, setTotalPages] = useState(2);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagFilterInput, setTagFilterInput] = useState('');

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Update isPublicRef based on the switch value in the modal
      isPublicRef.current = isPublicSwitchValue;
      currentPageRef.current = 1;
      setTemplates([]);
      hasMorePagesRef.current = true;
      loadTemplates();
    });

    return () => {
      unsubscribe();
    };
  }, [navigation]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
  
      const tagsQueryParam = selectedTags.length > 0 ? `&tags=${selectedTags.join(',')}` : '';
      const response = await fetch(
        `https://crashtest.by/app/templates.php?page=${currentPageRef.current}&pageSize=${pageSize}&search=${searchQuery}&templates=${!isPublicRef.current ? "all" : "my"}${tagsQueryParam}`
      );

      const data = await response.json();  
      const hasMorePages = data.records.length === pageSize;
      const totalPages = Math.ceil(data.totalRecords / pageSize);
  
      setTemplates(data.records);
  
      if (!hasMorePages) {
        hasMorePagesRef.current = false;
      }
  
      setTotalPages(totalPages);
    } catch (error) {
      console.error('Error loading templates:', error);
      Alert.alert('Error', 'Failed to load templates. Please try again.');
    } finally {
      setLoading(false);
    }
  };  

  const handleSearch = () => {
    // Update isPublicRef based on the switch value in the modal
    isPublicRef.current = isPublicSwitchValue;
    currentPageRef.current = 1;
    setTemplates([]);
    hasMorePagesRef.current = true;
    loadTemplates();
    setShowFiltersModal(false); // Close the filters modal after searching
  };

  const handleLoadMore = () => {
    if (hasMorePagesRef.current) {
      currentPageRef.current += 1;
      loadTemplates();
    }
  };

  const handleSwitchChange = (value) => {
    // Update the state but do not immediately change isPublicRef
    setIsPublicSwitchValue(value);
  };

  const handlePageChange = (page) => {
    if (page !== currentPageRef.current) {
      currentPageRef.current = page;
      setTemplates([]);
      hasMorePagesRef.current = true;
      loadTemplates();
    }
  };

  const handleSearchOnSubmit = () => {
    // Handle search when the return key is pressed
    handleSearch();
  };

  const handleKeyboardClose = () => {
    // Handle search when the keyboard is closed
    handleSearch();
  };

  const handleTagFilterInputChange = (text) => {
    setTagFilterInput(text);
  };
  
  const handleAddTagFilter = () => {
    if (tagFilterInput.trim() !== '') {
      setSelectedTags([...selectedTags, tagFilterInput.trim()]);
      setTagFilterInput('');
    }
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <TextInput
          placeholder={t("Enter Event Type or Name")}
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          onSubmitEditing={handleSearchOnSubmit}
          style={{ flex: 1, padding: 8, borderWidth: 1 }}
        />
        <TouchableOpacity onPress={() => setShowFiltersModal(true)} style={{ justifyContent: 'center', padding: 8, backgroundColor: '#007BFF', marginLeft: 8 }}>
          <Text style={{ color: 'white' }}>{t("Filters")}</Text>
        </TouchableOpacity>
      </View>

      {/* Filters Modal */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={showFiltersModal}
        onRequestClose={() => setShowFiltersModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{t('Filters')}</Text>
                  <Icon name="close" size={24} onPress={() => setShowFiltersModal(false)} style={{ marginLeft: 'auto' }} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ marginRight: 8 }}>{t('Show My Templates')}</Text>
              <Switch value={isPublicSwitchValue} onValueChange={(value) => handleSwitchChange(value)} />
            </View>

            {/* Add tag filter input and display selected tags */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                placeholder={t('Add Tag Filter')}
                value={tagFilterInput}
                onChangeText={handleTagFilterInputChange}
                style={{ flex: 1, padding: 8, marginRight: 8, borderWidth: 1, borderColor: 'gray', borderRadius: 5 }}
              />
              <TouchableOpacity onPress={handleAddTagFilter} style={{ padding: 8, backgroundColor: '#007BFF', borderRadius: 5 }}>
                <Text style={{ color: 'white' }}>{t('Add')}</Text>
              </TouchableOpacity>
            </View>

            {/* Display selected tags */}
            <ScrollView horizontal style={{ flexDirection: 'row', paddingTop: 16, maxHeight: 50, marginBottom: 8 }}>
              {selectedTags.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={{ borderRadius: 15, backgroundColor: 'lightgray', padding: 8, marginRight: 8 }}
                  onPress={() => {
                    const updatedTags = [...selectedTags];
                    updatedTags.splice(index, 1);
                    setSelectedTags(updatedTags);
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text>{tag}</Text>
                    <Icon name="times" size={12} color="red" />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity onPress={handleSearch} style={{ backgroundColor: '#007BFF', padding: 8, borderRadius: 5 }}>
              <Text style={{ color: 'white', textAlign: 'center' }}>{t("Search")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* FlatList and Footer */}
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
          ) : (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, marginBottom: 16 }}>
              <TouchableOpacity
                onPress={() => handlePageChange(currentPageRef.current - 1)}
                disabled={currentPageRef.current === 1}
                style={{ padding: 8, backgroundColor: currentPageRef.current === 1 ? 'gray' : '#007BFF' }}
              >
                <Text style={{ color: 'white', alignItems: 'center' }}>{t("Previous")}</Text>
              </TouchableOpacity>
              <Text>{`${currentPageRef.current} / ${totalPages}`}</Text>
              <TouchableOpacity
                onPress={() => handlePageChange(currentPageRef.current + 1)}
                disabled={currentPageRef.current === totalPages}
                style={{ padding: 8, backgroundColor: currentPageRef.current === totalPages ? 'gray' : '#007BFF' }}
              >
                <Text style={{ color: 'white' }}>{t("Next")}</Text>
              </TouchableOpacity>
            </View>
          )
        }
        ListEmptyComponent={<Text>{t("No templates available.")}</Text>}
      />
    </View>
  );
};

export default TemplatesScreen;
