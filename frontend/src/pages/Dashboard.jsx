import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineCalendar,
  HiOutlineSparkles,
  HiOutlineLightningBolt,
} from 'react-icons/hi';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip,
  AreaChart, Area, CartesianGrid,
} from 'recharts';
import { format, formatDistanceToNow } from 'date-fns';
import './Dashboard.css';

const PRIORITY_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  urgent: '#ef4444',
};

const CATEGORY_COLORS = {
  General: '#6366f1',
  Work: '#3b82f6',
  Personal: '#8b5cf6',
  Health: '#10b981',
  Finance: '#f59e0b',
  Education: '#06b6d4',
  Shopping: '#ec4899',
  Travel: '#f97316',
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/tasks/stats');
      setStats(res.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAiQuickAdd = async (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    setAiLoading(true);
    try {
      const parseRes = await api.post('/ai/parse', { input: aiInput });
      const parsed = parseRes.data.data;

      // Create the task
      const taskData = {
        title: parsed.title,
        description: parsed.description || '',
        dueDate: parsed.dueDate || null,
        priority: parsed.priority || 'medium',
        category: parsed.category || 'General',
        reminder: parsed.reminder || null,
      };

      await api.post('/tasks', taskData);
      toast.success(`Task "${parsed.title}" created!`);
      setAiInput('');
      fetchStats();
    } catch {
      toast.error('Failed to create task');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const priorityData = stats?.priorityStats
    ? Object.entries(stats.priorityStats).map(([name, value]) => ({ name, value }))
    : [];

  const categoryData = stats?.categoryStats
    ? Object.entries(stats.categoryStats).map(([name, value]) => ({ name, value }))
    : [];

  const trendData = stats?.completionTrend?.map((item) => ({
    date: format(new Date(item._id), 'MMM dd'),
    completed: item.count,
  })) || [];

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <div className="dashboard-welcome animate-fade-in-up">
        <div>
          <h1>Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || 'User'}</span></h1>
          <p>Here's your task overview for today</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/tasks', { state: { openCreateModal: true } })}>
          <HiOutlineLightningBolt size={18} />
          Quick Add
        </button>
      </div>

      {/* AI Quick Add */}
      <form className="ai-quick-add glass animate-fade-in-up delay-1" onSubmit={handleAiQuickAdd}>
        <div className="ai-input-wrapper">
          <HiOutlineSparkles className="ai-icon" size={20} />
          <input
            id="ai-quick-input"
            type="text"
            className="ai-input"
            placeholder='Try: "Submit report by Friday 5pm" or "Buy groceries tomorrow"'
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm ai-submit"
            disabled={aiLoading || !aiInput.trim()}
          >
            {aiLoading ? <span className="spinner spinner-sm" /> : <><HiOutlineSparkles size={14} /> AI Add</>}
          </button>
        </div>
      </form>

      {/* Stats Cards */}
      <div className="stats-grid animate-fade-in-up delay-2">
        <div className="stat-card clickable" style={{ '--accent': 'var(--primary-500)', cursor: 'pointer' }} onClick={() => navigate('/tasks')}>
          <div className="stat-icon">
            <HiOutlineClipboardList size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.totalTasks || 0}</span>
            <span className="stat-label">Total Tasks</span>
          </div>
        </div>

        <div className="stat-card clickable" style={{ '--accent': 'var(--warning)', cursor: 'pointer' }} onClick={() => navigate('/tasks', { state: { status: 'pending' } })}>
          <div className="stat-icon">
            <HiOutlineClock size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.pendingTasks || 0}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>

        <div className="stat-card clickable" style={{ '--accent': 'var(--success)', cursor: 'pointer' }} onClick={() => navigate('/tasks', { state: { status: 'completed' } })}>
          <div className="stat-icon">
            <HiOutlineCheckCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.completedTasks || 0}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>

        <div className="stat-card clickable" style={{ '--accent': 'var(--danger)', cursor: 'pointer' }} onClick={() => navigate('/tasks', { state: { overdue: true } })}>
          <div className="stat-icon">
            <HiOutlineExclamationCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.overdueTasks || 0}</span>
            <span className="stat-label">Overdue</span>
          </div>
        </div>

        <div className="stat-card" style={{ '--accent': '#f59e0b' }}>
          <div className="stat-icon" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)' }}>
            🔥
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.streakDays || 0}d</span>
            <span className="stat-label">Productivity Streak</span>
          </div>
        </div>

        <div className="stat-card" style={{ '--accent': '#10b981' }}>
          <div className="stat-icon" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.15)' }}>
            ⚡
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.productivityScore || 0}%</span>
            <span className="stat-label">Productivity Score</span>
          </div>
        </div>
      </div>

      {/* Completion Rate */}
      {stats?.totalTasks > 0 && (
        <div className="completion-bar-section animate-fade-in-up delay-3">
          <div className="completion-header">
            <span>Completion Rate</span>
            <span className="completion-percent">{stats?.completionRate || 0}%</span>
          </div>
          <div className="completion-bar-track">
            <div
              className="completion-bar-fill"
              style={{ width: `${stats?.completionRate || 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="charts-grid animate-fade-in-up delay-3">
        {/* Priority Distribution */}
        {priorityData.length > 0 && (
          <div className="chart-card glass">
            <h3>Priority Distribution</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {priorityData.map((entry) => (
                      <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] || '#6366f1'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#1a1a2e',
                      border: '1px solid rgba(99,102,241,0.3)',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                      fontSize: '13px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-legend">
                {priorityData.map((item) => (
                  <div key={item.name} className="legend-item">
                    <span className="legend-dot" style={{ background: PRIORITY_COLORS[item.name] }} />
                    <span className="legend-label">{item.name}</span>
                    <span className="legend-value">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Category Distribution */}
        {categoryData.length > 0 && (
          <div className="chart-card glass">
            <h3>Categories</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryData} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={75}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#1a1a2e',
                      border: '1px solid rgba(99,102,241,0.3)',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                      fontSize: '13px',
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={24}>
                    {categoryData.map((entry) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Completion Trend */}
        {trendData.length > 0 && (
          <div className="chart-card glass chart-wide">
            <h3>Completion Trend (7 days)</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="completionGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#1a1a2e',
                      border: '1px solid rgba(99,102,241,0.3)',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                      fontSize: '13px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#completionGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Upcoming Reminders & Recent Tasks */}
      <div className="bottom-grid animate-fade-in-up delay-4">
        {/* Upcoming Reminders */}
        <div className="list-card glass">
          <div className="list-card-header">
            <h3><HiOutlineCalendar size={18} /> Upcoming Reminders</h3>
          </div>
          <div className="list-card-body">
            {stats?.upcomingReminders?.length > 0 ? (
              stats.upcomingReminders.map((task) => (
                <div key={task._id} className="reminder-item" onClick={() => navigate(`/tasks`)}>
                  <div className="reminder-info">
                    <span className="reminder-title">{task.title}</span>
                    <span className="reminder-time">
                      {formatDistanceToNow(new Date(task.reminder), { addSuffix: true })}
                    </span>
                  </div>
                  <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                </div>
              ))
            ) : (
              <div className="empty-state-mini">
                <p>No upcoming reminders</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Completed */}
        <div className="list-card glass">
          <div className="list-card-header">
            <h3><HiOutlineCheckCircle size={18} /> Recently Completed</h3>
          </div>
          <div className="list-card-body">
            {stats?.recentCompleted?.length > 0 ? (
              stats.recentCompleted.map((task) => (
                <div key={task._id} className="reminder-item completed-item">
                  <div className="reminder-info">
                    <span className="reminder-title">{task.title}</span>
                    <span className="reminder-time">
                      {task.completedAt ? formatDistanceToNow(new Date(task.completedAt), { addSuffix: true }) : ''}
                    </span>
                  </div>
                  <HiOutlineCheckCircle size={18} className="completed-icon" />
                </div>
              ))
            ) : (
              <div className="empty-state-mini">
                <p>No completed tasks yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
