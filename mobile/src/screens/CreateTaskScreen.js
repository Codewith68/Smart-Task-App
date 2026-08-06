import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import api from '../api/client';
import { Ionicons } from '@expo/vector-icons';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const CATEGORIES = ['General', 'Work', 'Personal', 'Health', 'Finance', 'Education', 'Shopping', 'Travel'];

export default function CreateTaskScreen({ navigation, route }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Task title is required');
      return;
    }

    setLoading(true);
    try {
      await api.post('/tasks', {
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
      });

      Alert.alert('Success', 'Task created successfully');
      if (route.params?.onSaved) route.params.onSaved();
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const getAiSuggest = async () => {
    if (!title.trim()) {
      Alert.alert('AI Assist', 'Enter a title first');
      return;
    }
    setAiLoading(true);
    try {
      const res = await api.post('/ai/suggest', { title, description });
      const data = res.data.data;
      if (data.improvedTitle) setTitle(data.improvedTitle);
      if (data.suggestedPriority) setPriority(data.suggestedPriority);
      if (data.suggestedCategory) setCategory(data.suggestedCategory);
      Alert.alert('AI Applied!', 'Updated title, priority, and category based on AI suggestions.');
    } catch (e) {
      Alert.alert('Error', 'AI suggestions unavailable');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#f1f5f9" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Task</Text>
        <TouchableOpacity style={styles.aiBtn} onPress={getAiSuggest} disabled={aiLoading}>
          {aiLoading ? (
            <ActivityIndicator size="small" color="#818cf8" />
          ) : (
            <Ionicons name="sparkles" size={20} color="#818cf8" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="Task title..."
          placeholderTextColor="#64748b"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
          placeholder="Details..."
          placeholderTextColor="#64748b"
          value={description}
          onChangeText={setDescription}
          multiline
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Priority</Text>
        <View style={styles.chipRow}>
          {PRIORITIES.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.chip, priority === p && styles.chipActive]}
              onPress={() => setPriority(p)}
            >
              <Text style={[styles.chipText, priority === p && styles.chipTextActive]}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, category === c && styles.chipActive]}
              onPress={() => setCategory(c)}
            >
              <Text style={[styles.chipText, category === c && styles.chipTextActive]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleCreate} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitText}>Save Task</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  content: {
    padding: 16,
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerTitle: {
    color: '#f1f5f9',
    fontSize: 20,
    fontWeight: 'bold',
  },
  aiBtn: {
    padding: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: 10,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 14,
    height: 48,
    color: '#f1f5f9',
    fontSize: 15,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#16213e',
    marginRight: 6,
    marginBottom: 6,
  },
  chipActive: {
    backgroundColor: '#6366f1',
  },
  chipText: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  submitBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
