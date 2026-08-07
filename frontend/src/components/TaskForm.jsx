import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { HiOutlineX, HiOutlineSparkles, HiOutlineCalendar, HiOutlineBell, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const CATEGORIES = ['General', 'Work', 'Personal', 'Health', 'Finance', 'Education', 'Shopping', 'Travel'];

const formatToLocalDatetime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const TaskForm = ({ task, onClose, onSaved }) => {
  const isEdit = !!task;
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    dueDate: formatToLocalDatetime(task?.dueDate),
    priority: task?.priority || 'medium',
    category: task?.category || 'General',
    reminder: formatToLocalDatetime(task?.reminder),
    subtasks: task?.subtasks || [],
  });
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [aiAutocomplete, setAiAutocomplete] = useState('');

  useEffect(() => {
    const fetchAutocomplete = async () => {
      if (formData.title.trim().length < 5) {
        setAiAutocomplete('');
        return;
      }
      try {
        const res = await api.get(`/ai/autocomplete?q=${encodeURIComponent(formData.title)}`);
        if (res.data.success && res.data.data) {
          setAiAutocomplete(res.data.data);
        } else {
          setAiAutocomplete('');
        }
      } catch (e) {
        setAiAutocomplete('');
      }
    };

    const debounceTimer = setTimeout(fetchAutocomplete, 1500);
    return () => clearTimeout(debounceTimer);
  }, [formData.title]);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab' && aiAutocomplete) {
      e.preventDefault();
      handleChange('title', formData.title + aiAutocomplete);
      setAiAutocomplete('');
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        reminder: formData.reminder ? new Date(formData.reminder).toISOString() : null,
      };

      if (isEdit) {
        await api.put(`/tasks/${task._id}`, payload);
        toast.success('Task updated!');
      } else {
        await api.post('/tasks', payload);
        toast.success('Task created!');
      }
      onSaved();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleAiSuggest = async () => {
    if (!formData.title.trim()) {
      toast.error('Enter a title first to get AI suggestions');
      return;
    }

    setAiLoading(true);
    try {
      const res = await api.post('/ai/suggest', {
        title: formData.title,
        description: formData.description,
      });
      setAiSuggestions(res.data.data);
    } catch {
      toast.error('AI suggestions unavailable');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setFormData((prev) => ({
      ...prev,
      subtasks: [...prev.subtasks, { title: newSubtaskTitle.trim(), completed: false }],
    }));
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (index) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index),
    }));
  };

  const applySuggestion = (field, value) => {
    handleChange(field, value);
    toast.success(`Applied AI suggestion for ${field}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Task' : 'Create Task'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <HiOutlineX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Title *</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  id="task-title"
                  type="text"
                  className="form-input"
                  placeholder="What needs to be done?"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAiSuggest}
                  disabled={aiLoading}
                  title="Get AI suggestions"
                >
                  {aiLoading ? <span className="spinner spinner-sm" /> : <HiOutlineSparkles size={16} />}
                </button>
              </div>
              {aiAutocomplete && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Suggestion: <span style={{ color: 'var(--primary-400)', fontWeight: 500 }}>{formData.title}{aiAutocomplete}</span> 
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', opacity: 0.6, background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>Press Tab to accept</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                id="task-description"
                className="form-input"
                placeholder="Add more details..."
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Priority & Category Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  id="task-priority"
                  className="form-input"
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  id="task-category"
                  className="form-input"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Due Date & Reminder Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <div className="input-icon-wrapper">
                  <HiOutlineCalendar className="input-icon" size={18} />
                  <input
                    id="task-due-date"
                    type="datetime-local"
                    className="form-input input-with-icon"
                    value={formData.dueDate}
                    onChange={(e) => handleChange('dueDate', e.target.value)}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Reminder</label>
                <div className="input-icon-wrapper">
                  <HiOutlineBell className="input-icon" size={18} />
                  <input
                    id="task-reminder"
                    type="datetime-local"
                    className="form-input input-with-icon"
                    value={formData.reminder}
                    onChange={(e) => handleChange('reminder', e.target.value)}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  />
                </div>
              </div>
            </div>

            {/* Subtasks / Checklist Section */}
            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label className="form-label">Subtasks & Checklist</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Add a subtask item..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddSubtask}
                  style={{ minWidth: '40px' }}
                >
                  <HiOutlinePlus size={16} />
                </button>
              </div>

              {formData.subtasks.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginTop: '0.5rem' }}>
                  {formData.subtasks.map((st, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'var(--bg-tertiary)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                      }}
                    >
                      <span style={{ textDecoration: st.completed ? 'line-through' : 'none', opacity: st.completed ? 0.6 : 1 }}>
                        {st.title}
                      </span>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleRemoveSubtask(index)}
                        style={{ color: 'var(--danger)', padding: '2px' }}
                      >
                        <HiOutlineTrash size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Suggestions Panel */}
            {aiSuggestions && (
              <div className="ai-suggestions-panel animate-fade-in-down">
                <div className="ai-suggestions-header">
                  <HiOutlineSparkles size={16} />
                  <span>AI Suggestions</span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setAiSuggestions(null)}
                  >
                    <HiOutlineX size={14} />
                  </button>
                </div>

                {aiSuggestions.improvedTitle && aiSuggestions.improvedTitle !== formData.title && (
                  <div className="suggestion-item">
                    <span className="suggestion-label">Better title:</span>
                    <span className="suggestion-value">{aiSuggestions.improvedTitle}</span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => applySuggestion('title', aiSuggestions.improvedTitle)}
                    >
                      Apply
                    </button>
                  </div>
                )}

                {aiSuggestions.suggestedPriority && (
                  <div className="suggestion-item">
                    <span className="suggestion-label">Priority:</span>
                    <span className={`badge badge-${aiSuggestions.suggestedPriority}`}>
                      {aiSuggestions.suggestedPriority}
                    </span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => applySuggestion('priority', aiSuggestions.suggestedPriority)}
                    >
                      Apply
                    </button>
                  </div>
                )}

                {aiSuggestions.suggestedCategory && (
                  <div className="suggestion-item">
                    <span className="suggestion-label">Category:</span>
                    <span>{aiSuggestions.suggestedCategory}</span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => applySuggestion('category', aiSuggestions.suggestedCategory)}
                    >
                      Apply
                    </button>
                  </div>
                )}

                {aiSuggestions.tips?.length > 0 && (
                  <div className="suggestion-tips">
                    <span className="suggestion-label">Tips:</span>
                    <ul>
                      {aiSuggestions.tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              id="task-submit"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <span className="spinner spinner-sm" /> : isEdit ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
