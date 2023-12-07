// src/components/TemplatesList.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const TemplatesList = () => {
  const [templateName, setTemplateName] = useState('');

  const handleAddTemplate = () => {
    const templateData = { templateName };
    console.log('Template Added:', templateData);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Templates List</Text>
      <TextInput
        style={styles.input}
        placeholder="Template Name"
        value={templateName}
        onChangeText={setTemplateName}
      />
      <Button title="Add Template" onPress={handleAddTemplate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
});

export default TemplatesList;
