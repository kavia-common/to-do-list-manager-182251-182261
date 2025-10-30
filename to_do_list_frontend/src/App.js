import React, { useState, useEffect } from 'react';
import './App.css';
import { getTasks, addTask, updateTask, toggleTask, deleteTask } from './api';
import TaskList from './components/TaskList';

// PUBLIC_INTERFACE
function App() {
  /**
   * Main To-Do App:
   * - Loads tasks from backend
   * - Allows adding, editing, deleting, and toggling tasks
   * - Provides light/dark theme toggle
   */
  const [theme, setTheme] = useState('light');
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Initial load
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getTasks();
        if (!ignore) setTasks(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!ignore) setError(e.message || 'Failed to load tasks');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    /** Toggle between light and dark themes */
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setError('Please enter a task title.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const created = await addTask(newTitle.trim());
      setTasks((prev) => [created, ...prev]);
      setNewTitle('');
    } catch (e) {
      setError(e.message || 'Failed to add task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    const prev = tasks;
    // Optimistic update
    setTasks((list) =>
      list.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    try {
      const updated = await toggleTask(id);
      // Reconcile in case backend returns canonical state
      setTasks((list) => list.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    } catch (e) {
      // Rollback
      setTasks(prev);
      setError(e.message || 'Failed to toggle task');
      throw e;
    }
  };

  const handleUpdate = async (id, updates) => {
    const prev = tasks;
    setTasks((list) => list.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    try {
      const saved = await updateTask(id, updates);
      setTasks((list) => list.map((t) => (t.id === id ? { ...t, ...saved } : t)));
    } catch (e) {
      setTasks(prev);
      setError(e.message || 'Failed to update task');
      throw e;
    }
  };

  const handleDelete = async (id) => {
    const prev = tasks;
    setTasks((list) => list.filter((t) => t.id !== id));
    try {
      await deleteTask(id);
    } catch (e) {
      setTasks(prev);
      setError(e.message || 'Failed to delete task');
      throw e;
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="navbar">
          <h1 className="title">To-Do List</h1>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </header>

      <main className="container">
        <section className="add-form-section">
          <form className="add-form" onSubmit={handleAdd}>
            <input
              className="task-input"
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add a new task..."
              aria-label="Task title"
              disabled={submitting}
            />
            <button className="btn btn-primary btn-large" type="submit" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Task'}
            </button>
          </form>
          {error ? <div className="global-error" role="alert">{error}</div> : null}
        </section>

        <section className="list-section">
          {loading ? (
            <div className="loading">Loading tasks...</div>
          ) : (
            <TaskList
              tasks={tasks}
              onToggle={handleToggle}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
