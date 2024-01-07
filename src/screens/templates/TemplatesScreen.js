import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, FlatList, Alert, TextInput, TouchableOpacity, ActivityIndicator, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';

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

  const [totalPages, setTotalPages] = useState(2);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      isPublicRef.current = false;
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

      const response = await fetch(
        `https://crashtest.by/app/templates.php?page=${currentPageRef.current}&pageSize=${pageSize}&search=${searchQuery}&templates=${!isPublicRef.current ? "all" : "my"}`
      );
      const data = await response.json();
      console.log(data.records);

      const hasMorePages = data.records.length === pageSize;
      const totalPages = Math.ceil(data.totalRecords / pageSize);

      setTemplates(data.records)

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
    currentPageRef.current = 1;
    setTemplates([]);
    hasMorePagesRef.current = true;
    loadTemplates();
  };

  const handleLoadMore = () => {
    if (hasMorePagesRef.current) {
      console.log("cur page is", currentPageRef.current);
      currentPageRef.current += 1;
      console.log("cur page sh b", currentPageRef.current);
      loadTemplates();
    }
  };

  const handleSwitch = (value) => {
    isPublicRef.current = value;
    currentPageRef.current = 1;
    setTemplates([]);
    hasMorePagesRef.current = true;
    loadTemplates();
  };

  const handlePageChange = (page) => {
    if (page !== currentPageRef.current) {
      currentPageRef.current = page;
      setTemplates([]);
      hasMorePagesRef.current = true;
      loadTemplates();
    }
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: 16 }}>
        <Text style={{ marginRight: 8 }}>{t('Show My Templates')}</Text>
        <Switch value={isPublicRef.current} onValueChange={(value) => handleSwitch(value)} />
      </View>
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
          ) : (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => handlePageChange(currentPageRef.current - 1)}
                disabled={currentPageRef.current === 1}
                style={{ padding: 8, backgroundColor: currentPageRef.current === 1 ? 'gray' : 'blue' }}
              >
                <Text style={{ color: 'white' }}>{t("Previous")}</Text>
              </TouchableOpacity>
              <Text>{`${currentPageRef.current} / ${totalPages}`}</Text>
              <TouchableOpacity
                onPress={() => handlePageChange(currentPageRef.current + 1)}
                disabled={currentPageRef.current === totalPages}
                style={{ padding: 8, backgroundColor: currentPageRef.current === totalPages ? 'gray' : 'blue' }}
              >
                <Text style={{ color: 'white' }}>{t("Next")}</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </View>
  );
};

export default TemplatesScreen;
