import React, { useState } from 'react';

/**
 * TaskItem renders a single task row with:
 * - checkbox to toggle completion
 * - title text with strike-through when completed
 * - edit mode with input + save/cancel
 * - delete button
 */
// PUBLIC_INTERFACE
export default function TaskItem({ task, onToggle, onUpdate, onDelete }) {
  /** This is a public component rendering a task item with interactions. */
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleToggle = async () => {
    setError('');
    try {
      await onToggle(task.id);
    } catch (e) {
      setError(e.message || 'Failed to toggle');
    }
  };

  const handleSave = async () => {
    if (!draft.trim()) {
      setError('Title cannot be empty');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onUpdate(task.id, { title: draft.trim() });
      setIsEditing(false);
    } catch (e) {
      setError(e.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setError('');
    try {
      await onDelete(task.id);
    } catch (e) {
      setError(e.message || 'Failed to delete');
    }
  };

  return (
    <li className="task-item" data-completed={task.completed ? 'true' : 'false'}>
      <div className="task-main">
        <input
          type="checkbox"
          checked={!!task.completed}
          onChange={handleToggle}
          aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
        />
        {!isEditing ? (
          <span className={`task-title ${task.completed ? 'completed' : ''}`}>{task.title}</span>
        ) : (
          <input
            className="task-edit-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') {
                setIsEditing(false);
                setDraft(task.title);
              }
            }}
            aria-label="Edit task title"
            disabled={saving}
          />
        )}
      </div>

      <div className="task-actions">
        {!isEditing ? (
          <button className="btn btn-secondary" onClick={() => setIsEditing(true)} aria-label={`Edit "${task.title}"`}>
            Edit
          </button>
        ) : (
          <>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setIsEditing(false);
                setDraft(task.title);
                setError('');
              }}
              disabled={saving}
            >
              Cancel
            </button>
          </>
        )}
        <button className="btn btn-danger" onClick={handleDelete} aria-label={`Delete "${task.title}"`}>
          Delete
        </button>
      </div>

      {error ? <div className="task-error" role="alert">{error}</div> : null}
    </li>
  );
}
