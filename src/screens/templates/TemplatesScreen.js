import React, { useState, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, Button, FlatList, Alert, TextInput, TouchableOpacity, ActivityIndicator, Switch, ScrollView, Modal, Keyboard } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/FontAwesome';
import { TEMPLATES_URL, TEMPLATE_LIKES_URL } from '../../constants/Urls';

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
  const [isFavouritesSwitchValue, setIsFavouritesSwitchValue] = useState(false);
  const [totalPages, setTotalPages] = useState(2);
  const [totalRecords, setTotalRecords] = useState(0); 
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagFilterInput, setTagFilterInput] = useState('');
  const [lastIsPublicSwitchValue, setLastIsPublicSwitchValue] = useState(false);
  const [lastIsFavouritesSwitchValue, setLastIsFavouritesSwitchValue] = useState(false);
  const [lastSelectedTags, setLastSelectedTags] = useState([]);
  const [lastTagFilterInput, setLastTagFilterInput] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      // Update isPublicRef based on the switch value in the modal
      isPublicRef.current = isPublicSwitchValue;
      currentPageRef.current = 1;
      setTemplates([]);
      hasMorePagesRef.current = true;
      loadTemplates();

      // Return a cleanup function to reset filters when the component is unmounted or when the focus is lost
      return () => {
        //resetFilters();
      };
    }, [isPublicSwitchValue, isFavouritesSwitchValue, selectedTags, searchQuery]) // Add the dependencies you want to track
  );

  const loadTemplates = async () => {
    try {
      setLoading(true);
  
      const tagsQueryParam = selectedTags.length > 0 ? `&tags=${selectedTags.join(',')}` : '';
      const response = await fetch(
        `${TEMPLATES_URL}?page=${currentPageRef.current}&pageSize=${pageSize}&search=${searchQuery}&templates=${!isPublicRef.current ? "all" : "my"}${tagsQueryParam}&favourites=${isFavouritesSwitchValue}`
      );

      const data = await response.json();  
      const hasMorePages = data.records.length === pageSize;
      const totalPages = Math.ceil(data.totalRecords / pageSize);
      
      setTotalRecords(data.totalRecords);
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
  
  const handleLike = async (templateId, isUserLiked, likesNumber) => {
    try {
      // Send a POST request to the templateLikes endpoint
      const response = await fetch(TEMPLATE_LIKES_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_id: templateId,
        }),
      });
  
      if (response.ok) {
        // If the request is successful, update the specific template in the state
        setTemplates((prevTemplates) => {
          return prevTemplates.map((template) => {
            if (template.id === templateId) {
              return {
                ...template,
                isUserLiked: !isUserLiked, // Toggle like status
                like_count: isUserLiked ? template.like_count - 1 : template.like_count + 1, // Update likes count
              };
            }
            return template;
          });
        });
      } else {
        console.error('Failed to like template');
        Alert.alert('Error', 'Failed to like template. Please try again.');
      }
    } catch (error) {
      console.error('Error liking template:', error);
      Alert.alert('Error', 'Failed to like template. Please try again.');
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

    setLastIsPublicSwitchValue(isPublicSwitchValue);
    setLastIsFavouritesSwitchValue(isFavouritesSwitchValue);
    setLastSelectedTags([...selectedTags]);
    setLastTagFilterInput(tagFilterInput);
  };

  const resetFilters = () => {
    // Reset filters to the last applied values
    setIsPublicSwitchValue(lastIsPublicSwitchValue);
    setIsFavouritesSwitchValue(lastIsFavouritesSwitchValue);
    setSelectedTags(lastSelectedTags);
    setTagFilterInput(lastTagFilterInput);
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
          style={{ flex: 1, padding: 8, borderWidth: 1, borderColor: 'gray', borderRadius: 5 }}
        />
        <TouchableOpacity onPress={() => setShowFiltersModal(true)} style={{ justifyContent: 'center', padding: 8, backgroundColor: '#007BFF', marginLeft: 8, borderRadius: 5 }}>
          <Text style={{ color: 'white' }}>{t("Filters")}</Text>
        </TouchableOpacity>
      </View>
      {/* Display filter values as tags */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap'}}>
        {isPublicSwitchValue && (
          <TouchableOpacity
            style={{ borderRadius: 15, backgroundColor: 'lightgray', padding: 8, marginRight: 8, marginBottom: 8 }}
            onPress={() => setIsPublicSwitchValue(false)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text>{t('Show My Templates')}</Text>
              <Icon name="times" size={12} color="red" />
            </View>
          </TouchableOpacity>
        )}

        {isFavouritesSwitchValue && (
          <TouchableOpacity
            style={{ borderRadius: 15, backgroundColor: 'lightgray', padding: 8, marginRight: 8, marginBottom: 8 }}
            onPress={() => setIsFavouritesSwitchValue(false)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text>{t('Show Favourites')}</Text>
              <Icon name="times" size={12} color="red" />
            </View>
          </TouchableOpacity>
        )}

        {selectedTags.map((tag, index) => (
          <TouchableOpacity
            key={index}
            style={{ borderRadius: 15, backgroundColor: 'lightgray', padding: 8, marginRight: 8, marginBottom: 8 }}
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
              <Icon name="close" size={24} onPress={() => {
                setShowFiltersModal(false);
                resetFilters();
              }} style={{ marginLeft: 'auto' }} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ marginRight: 8 }}>{t('Show My Templates')}</Text>
              <Switch value={isPublicSwitchValue} onValueChange={(value) => handleSwitchChange(value)} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ marginRight: 8 }}>{t('Show Favourites')}</Text>
              <Switch value={isFavouritesSwitchValue} onValueChange={(value) => setIsFavouritesSwitchValue(value)} />
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
              <Text style={{ color: 'white', textAlign: 'center' }}>{t("Search")} ({totalRecords})</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* FlatList and Footer */}
      <FlatList
        data={templates}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, paddingVertical: 8 }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>{item.name}</Text>
          </View>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => handleLike(item.id, item.isUserLiked, item.likesNumber)} style={{ marginTop: 8 }}>
              <Icon name={item.isUserLiked ? 'heart' : 'heart-o'} size={24} color="red" />
              <Text style={{textAlign: 'center'}}>{item.like_count}</Text>
            </TouchableOpacity>          
            </View>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
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
                style={{ padding: 8, borderRadius: 5, backgroundColor: currentPageRef.current === 1 ? 'gray' : '#007BFF' }}
              >
                <Text style={{ color: 'white', alignItems: 'center' }}>{t("Previous")}</Text>
              </TouchableOpacity>
              <Text>{`${currentPageRef.current} / ${totalPages}`}</Text>
              <TouchableOpacity
                onPress={() => handlePageChange(currentPageRef.current + 1)}
                disabled={currentPageRef.current === totalPages}
                style={{ padding: 8, borderRadius: 5, backgroundColor: currentPageRef.current === totalPages ? 'gray' : '#007BFF' }}
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