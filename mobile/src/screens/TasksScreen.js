import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import api from '../api/client';
import { Ionicons } from '@expo/vector-icons';

export default function TasksScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (filterPriority) params.priority = filterPriority;

      const res = await api.get('/tasks', { params });
      setTasks(res.data.data);
    } catch (e) {
      console.log('Error fetching tasks', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, filterPriority]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const toggleComplete = async (id) => {
    try {
      const res = await api.patch(`/tasks/${id}/complete`);
      setTasks(tasks.map((t) => (t._id === id ? res.data.data : t)));
    } catch (e) {
      Alert.alert('Error', 'Could not update task');
    }
  };

  const deleteTask = async (id) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/tasks/${id}`);
            setTasks(tasks.filter((t) => t._id !== id));
          } catch (e) {
            Alert.alert('Error', 'Could not delete task');
          }
        },
      },
    ]);
  };

  const renderTask = ({ item }) => (
    <View style={[styles.taskCard, item.completed && styles.taskCardCompleted]}>
      <TouchableOpacity onPress={() => toggleComplete(item._id)} style={styles.checkBtn}>
        <Ionicons
          name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={item.completed ? '#10b981' : '#64748b'}
        />
      </TouchableOpacity>

      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text style={[styles.taskTitle, item.completed && styles.taskTitleCompleted]}>
          {item.title}
        </Text>
        {item.description ? (
          <Text style={styles.taskDesc} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        <View style={styles.tagRow}>
          <View style={[styles.tag, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.tagText}>{item.priority}</Text>
          </View>
          <View style={[styles.tag, { backgroundColor: 'rgba(99, 102, 241, 0.2)' }]}>
            <Text style={[styles.tagText, { color: '#818cf8' }]}>{item.category}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity onPress={() => deleteTask(item._id)} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={18} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#64748b" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            placeholderTextColor="#64748b"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color="#64748b" />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('CreateTask', { onSaved: fetchTasks })}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Priority Filter Bar */}
      <View style={styles.filterRow}>
        {['', 'low', 'medium', 'high', 'urgent'].map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.filterChip, filterPriority === p && styles.filterChipActive]}
            onPress={() => setFilterPriority(p)}
          >
            <Text style={[styles.filterText, filterPriority === p && styles.filterTextActive]}>
              {p === '' ? 'All' : p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Task List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item._id}
          renderItem={renderTask}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTasks(); }} tintColor="#6366f1" />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="clipboard-outline" size={48} color="#64748b" />
              <Text style={styles.emptyText}>No tasks found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function getPriorityColor(priority) {
  switch (priority) {
    case 'urgent': return 'rgba(239, 68, 68, 0.2)';
    case 'high': return 'rgba(249, 115, 22, 0.2)';
    case 'medium': return 'rgba(245, 158, 11, 0.2)';
    default: return 'rgba(16, 185, 129, 0.2)';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  searchInput: {
    flex: 1,
    color: '#f1f5f9',
    fontSize: 14,
  },
  addBtn: {
    backgroundColor: '#6366f1',
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#16213e',
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: '#6366f1',
  },
  filterText: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  filterTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.15)',
  },
  taskCardCompleted: {
    opacity: 0.6,
  },
  checkBtn: {
    marginRight: 12,
  },
  taskTitle: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '600',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  taskDesc: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 2,
  },
  tagRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  tagText: {
    color: '#f1f5f9',
    fontSize: 11,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 6,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 15,
    marginTop: 10,
  },
});
