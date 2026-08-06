import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format, isPast, formatDistanceToNow } from 'date-fns';
import { useLocation } from 'react-router-dom';
import {
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlinePlus,
  HiOutlineDotsVertical,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineCalendar,
  HiOutlineBell,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineSortDescending,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineX,
  HiOutlineClipboardList,
} from 'react-icons/hi';
import TaskForm from '../components/TaskForm';
import './Tasks.css';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const CATEGORIES = ['General', 'Work', 'Personal', 'Health', 'Finance', 'Education', 'Shopping', 'Travel'];
const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date Created' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title' },
];

const Tasks = () => {
  const location = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 12 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [completed, setCompleted] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  const fetchTasks = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.limit,
        sort,
        order,
      };
      if (search) params.search = search;
      if (priority) params.priority = priority;
      if (category) params.category = category;
      if (completed) params.completed = completed;

      const res = await api.get('/tasks', { params });
      setTasks(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [search, priority, category, completed, sort, order, pagination.limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  useEffect(() => {
    if (location.state) {
      if (location.state.openCreateModal) {
        setShowCreateModal(true);
      }
      if (location.state.status) {
        setCompleted(location.state.status === 'completed' ? 'true' : 'false');
        setShowFilters(true);
      }
      if (location.state.overdue) {
        setSort('dueDate');
        setOrder('asc');
        setCompleted('false');
        setShowFilters(true);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleToggleComplete = async (taskId) => {
    try {
      const res = await api.patch(`/tasks/${taskId}/complete`);
      setTasks(tasks.map((t) => (t._id === taskId ? res.data.data : t)));
      toast.success(res.data.message);
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t._id !== taskId));
      setDeleteConfirm(null);
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleTaskSaved = () => {
    setShowCreateModal(false);
    setEditTask(null);
    fetchTasks(pagination.page);
  };

  const clearFilters = () => {
    setSearch('');
    setPriority('');
    setCategory('');
    setCompleted('');
    setSort('createdAt');
    setOrder('desc');
  };

  const hasFilters = search || priority || category || completed;

  return (
    <div className="tasks-page">
      {/* Header */}
      <div className="tasks-header">
        <div>
          <h1>Tasks</h1>
          <p>{pagination.total} task{pagination.total !== 1 ? 's' : ''} total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <HiOutlinePlus size={18} />
          New Task
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="tasks-controls">
        <div className="search-bar">
          <HiOutlineSearch size={18} className="search-icon" />
          <input
            id="tasks-search"
            type="text"
            className="search-input"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>
              <HiOutlineX size={16} />
            </button>
          )}
        </div>

        <div className="controls-right">
          <button
            className={`btn btn-ghost btn-sm ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <HiOutlineFilter size={16} />
            Filters
            {hasFilters && <span className="filter-badge">!</span>}
          </button>

          <div className="sort-dropdown">
            <select
              id="tasks-sort"
              className="sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
              title={order === 'asc' ? 'Ascending' : 'Descending'}
            >
              <HiOutlineSortDescending size={16} style={{ transform: order === 'asc' ? 'scaleY(-1)' : 'none' }} />
            </button>
          </div>

          <div className="layout-toggle">
            <button
              className={`layout-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <HiOutlineViewGrid size={16} />
            </button>
            <button
              className={`layout-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <HiOutlineViewList size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="filters-section animate-fade-in-down">
          <div className="filter-group">
            <label>Priority</label>
            <div className="filter-options">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  className={`filter-pill ${priority === p ? 'active' : ''}`}
                  onClick={() => setPriority(priority === p ? '' : p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Category</label>
            <div className="filter-options">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  className={`filter-pill ${category === c ? 'active' : ''}`}
                  onClick={() => setCategory(category === c ? '' : c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <div className="filter-options">
              <button
                className={`filter-pill ${completed === 'false' ? 'active' : ''}`}
                onClick={() => setCompleted(completed === 'false' ? '' : 'false')}
              >
                Pending
              </button>
              <button
                className={`filter-pill ${completed === 'true' ? 'active' : ''}`}
                onClick={() => setCompleted(completed === 'true' ? '' : 'true')}
              >
                Completed
              </button>
            </div>
          </div>

          {hasFilters && (
            <button className="btn btn-ghost btn-sm clear-filters" onClick={clearFilters}>
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Task List */}
      {loading ? (
        <div className="loading-screen">
          <div className="spinner" />
          <p>Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state animate-fade-in-up">
          <div className="empty-icon"><HiOutlineClipboardList size={48} /></div>
          <h3>{hasFilters ? 'No tasks match your filters' : 'No tasks yet'}</h3>
          <p>{hasFilters ? 'Try adjusting your filters' : 'Create your first task to get started!'}</p>
          {!hasFilters && (
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <HiOutlinePlus size={18} />
              Create Task
            </button>
          )}
        </div>
      ) : (
        <div className={`tasks-grid ${viewMode}`}>
          {tasks.map((task, index) => (
            <div
              key={task._id}
              className={`task-card priority-${task.priority} ${task.completed ? 'completed' : ''} animate-fade-in-up`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="task-header">
                <h3 className="task-title">{task.title}</h3>
                <div className="task-actions">
                  <button
                    className={`task-action-btn complete-toggle ${task.completed ? 'checked' : ''}`}
                    onClick={() => handleToggleComplete(task._id)}
                    title={task.completed ? "Mark pending" : "Mark complete"}
                  >
                    <HiOutlineCheckCircle size={20} />
                  </button>
                  <button
                    className="task-action-btn"
                    onClick={() => setEditTask(task)}
                    title="Edit task"
                  >
                    <HiOutlinePencil size={18} />
                  </button>
                  <button
                    className="task-action-btn delete"
                    onClick={() => setDeleteConfirm(task._id)}
                    title="Delete task"
                  >
                    <HiOutlineTrash size={18} />
                  </button>
                </div>
              </div>

              {task.description && (
                <p className="task-desc">{task.description}</p>
              )}

              <div className="task-footer">
                <div className="task-badges">
                  <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                  <span className="badge-category">{task.category}</span>
                </div>
                <div className="task-meta">
                  {task.dueDate && (
                    <div className={`meta-item ${!task.completed && isPast(new Date(task.dueDate)) ? 'overdue' : ''}`}>
                      <HiOutlineCalendar size={14} />
                      {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                    </div>
                  )}
                  {task.reminder && !task.reminderSent && (
                    <div className="meta-item">
                      <HiOutlineBell size={14} />
                      {formatDistanceToNow(new Date(task.reminder), { addSuffix: true })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-ghost btn-sm"
            disabled={pagination.page <= 1}
            onClick={() => fetchTasks(pagination.page - 1)}
          >
            <HiOutlineChevronLeft size={16} /> Prev
          </button>
          <span className="page-info">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            disabled={pagination.page >= pagination.pages}
            onClick={() => fetchTasks(pagination.page + 1)}
          >
            Next <HiOutlineChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Create/Edit Task Modal */}
      {(showCreateModal || editTask) && (
        <TaskForm
          task={editTask}
          onClose={() => { setShowCreateModal(false); setEditTask(null); }}
          onSaved={handleTaskSaved}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-body" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ marginBottom: '1rem', color: 'var(--danger)' }}><HiOutlineTrash size={48} /></div>
              <h2 style={{ marginBottom: '0.5rem' }}>Delete Task?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
