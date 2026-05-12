import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../api';

const STATUSES = ['todo', 'in-progress', 'done'];
const STATUS_LABELS = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };
const PRIORITY_COLORS = { low: '#3b82f6', medium: '#f59e0b', high: '#ef4444' };

const TaskCard = ({ task, onStatusChange, onDelete }) => (
  <div className="task-card">
    <div className="task-card-header">
      <span
        className="priority-badge"
        style={{ background: PRIORITY_COLORS[task.priority] + '20', color: PRIORITY_COLORS[task.priority] }}
      >
        {task.priority}
      </span>
      <button
        className="btn-icon"
        onClick={() => onDelete(task._id)}
        aria-label="Delete task"
        title="Delete"
      >
        ×
      </button>
    </div>
    <h3 className="task-title">{task.title}</h3>
    {task.description && <p className="task-desc">{task.description}</p>}
    {task.dueDate && (
      <p className="task-due">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
    )}
    <div className="task-actions">
      {STATUSES.filter((s) => s !== task.status).map((s) => (
        <button
          key={s}
          className="btn-status"
          onClick={() => onStatusChange(task._id, s)}
        >
          → {STATUS_LABELS[s]}
        </button>
      ))}
    </div>
  </div>
);

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterPriority, setFilterPriority] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterPriority) params.priority = filterPriority;
      const res = await tasksAPI.getAll(params);
      setTasks(res.data.tasks);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [filterPriority]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.title.trim()) {
      setFormError('Title is required');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.dueDate) delete payload.dueDate;
      const res = await tasksAPI.create(payload);
      setTasks((prev) => [res.data.task, ...prev]);
      setForm({ title: '', description: '', priority: 'medium', status: 'todo', dueDate: '' });
      setShowForm(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await tasksAPI.update(id, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t._id === id ? res.data.task : t)));
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await tasksAPI.delete(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const tasksByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter((t) => t.status === s);
    return acc;
  }, {});

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dash-header">
        <div className="dash-header-left">
          <h1 className="dash-logo">TaskFlow</h1>
          <span className="dash-greeting">Hi, {user?.name?.split(' ')[0]} 👋</span>
        </div>
        <div className="dash-header-right">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="filter-select"
            aria-label="Filter by priority"
          >
            <option value="">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button className="btn-primary small" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancel' : '+ New Task'}
          </button>
          <button className="btn-ghost" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      {/* Create Task Form */}
      {showForm && (
        <div className="form-panel">
          <h2>New Task</h2>
          <form onSubmit={handleCreate} className="task-form">
            {formError && <div className="error-banner">{formError}</div>}
            <div className="form-row">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="What needs to be done?"
                  required
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select name="priority" value={form.priority} onChange={handleChange}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={2}
                placeholder="Optional details..."
              />
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create task'}
            </button>
          </form>
        </div>
      )}

      {/* Stats Bar */}
      <div className="stats-bar">
        {STATUSES.map((s) => (
          <div key={s} className="stat-item">
            <span className="stat-count">{tasksByStatus[s].length}</span>
            <span className="stat-label">{STATUS_LABELS[s]}</span>
          </div>
        ))}
        <div className="stat-item">
          <span className="stat-count">{tasks.length}</span>
          <span className="stat-label">Total</span>
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <p className="loading-msg">Loading tasks...</p>
      ) : (
        <div className="kanban-board">
          {STATUSES.map((status) => (
            <div key={status} className="kanban-column">
              <div className="column-header">
                <h2 className="column-title">{STATUS_LABELS[status]}</h2>
                <span className="column-count">{tasksByStatus[status].length}</span>
              </div>
              <div className="column-tasks">
                {tasksByStatus[status].length === 0 ? (
                  <p className="empty-col">No tasks here yet</p>
                ) : (
                  tasksByStatus[status].map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
