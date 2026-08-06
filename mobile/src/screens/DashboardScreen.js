import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/tasks/stats');
      setStats(res.data.data);
    } catch (e) {
      console.log('Failed to fetch dashboard stats', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAiAdd = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    try {
      const parseRes = await api.post('/ai/parse', { input: aiInput });
      const parsed = parseRes.data.data;

      await api.post('/tasks', {
        title: parsed.title,
        description: parsed.description || '',
        dueDate: parsed.dueDate || null,
        priority: parsed.priority || 'medium',
        category: parsed.category || 'General',
        reminder: parsed.reminder || null,
      });

      Alert.alert('Task Created!', `"${parsed.title}" added to your task list.`);
      setAiInput('');
      fetchStats();
    } catch (e) {
      Alert.alert('Error', 'Could not create task with AI');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} tintColor="#6366f1" />}
    >
      {/* Welcome Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back 👋</Text>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={22} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* AI Quick Add */}
      <View style={styles.aiBox}>
        <View style={styles.aiInputRow}>
          <Ionicons name="sparkles" size={20} color="#818cf8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.aiInput}
            placeholder="AI Quick Add (e.g. Call client tomorrow at 3pm)..."
            placeholderTextColor="#64748b"
            value={aiInput}
            onChangeText={setAiInput}
          />
          {aiLoading ? (
            <ActivityIndicator size="small" color="#6366f1" />
          ) : (
            <TouchableOpacity style={styles.aiBtn} onPress={handleAiAdd} disabled={!aiInput.trim()}>
              <Ionicons name="send" size={16} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Metric Cards Grid */}
      <View style={styles.grid}>
        <View style={[styles.card, { borderLeftColor: '#6366f1' }]}>
          <Ionicons name="list" size={24} color="#6366f1" />
          <Text style={styles.cardNum}>{stats?.totalTasks || 0}</Text>
          <Text style={styles.cardLabel}>Total Tasks</Text>
        </View>

        <View style={[styles.card, { borderLeftColor: '#f59e0b' }]}>
          <Ionicons name="time-outline" size={24} color="#f59e0b" />
          <Text style={styles.cardNum}>{stats?.pendingTasks || 0}</Text>
          <Text style={styles.cardLabel}>Pending</Text>
        </View>

        <View style={[styles.card, { borderLeftColor: '#10b981' }]}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#10b981" />
          <Text style={styles.cardNum}>{stats?.completedTasks || 0}</Text>
          <Text style={styles.cardLabel}>Completed</Text>
        </View>

        <View style={[styles.card, { borderLeftColor: '#ef4444' }]}>
          <Ionicons name="alert-circle-outline" size={24} color="#ef4444" />
          <Text style={styles.cardNum}>{stats?.overdueTasks || 0}</Text>
          <Text style={styles.cardLabel}>Overdue</Text>
        </View>
      </View>

      {/* Completion Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Completion Rate</Text>
          <Text style={styles.progressNum}>{stats?.completionRate || 0}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${stats?.completionRate || 0}%` }]} />
        </View>
      </View>

      {/* Upcoming Reminders */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="alarm-outline" size={20} color="#818cf8" style={{ marginRight: 6 }} />
          <Text style={styles.sectionTitle}>Upcoming Reminders</Text>
        </View>

        {stats?.upcomingReminders?.length > 0 ? (
          stats.upcomingReminders.map((task) => (
            <View key={task._id} style={styles.reminderCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.reminderTitle}>{task.title}</Text>
                <Text style={styles.reminderTime}>
                  ⏰ {new Date(task.reminder).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: getPriorityColor(task.priority) }]}>
                <Text style={styles.badgeText}>{task.priority}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No upcoming reminders</Text>
        )}
      </View>
    </ScrollView>
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
  },
  content: {
    padding: 16,
    paddingTop: 48,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  userName: {
    color: '#f1f5f9',
    fontSize: 22,
    fontWeight: 'bold',
  },
  logoutBtn: {
    padding: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 10,
  },
  aiBox: {
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    marginBottom: 20,
  },
  aiInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiInput: {
    flex: 1,
    color: '#f1f5f9',
    fontSize: 14,
  },
  aiBtn: {
    backgroundColor: '#6366f1',
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '48%',
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    marginBottom: 12,
  },
  cardNum: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginTop: 8,
  },
  cardLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  progressSection: {
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressTitle: {
    color: '#94a3b8',
    fontSize: 14,
  },
  progressNum: {
    color: '#818cf8',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#16213e',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  section: {
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  reminderTitle: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '600',
  },
  reminderTime: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#f1f5f9',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 12,
  },
});
