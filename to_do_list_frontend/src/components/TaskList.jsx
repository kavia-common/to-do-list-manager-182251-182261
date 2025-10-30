import React from 'react';
import TaskItem from './TaskItem';

/**
 * TaskList renders a vertical list of TaskItem components
 */
// PUBLIC_INTERFACE
export default function TaskList({ tasks, onToggle, onUpdate, onDelete }) {
  /** Public component to render a list of tasks. */
  if (!tasks || tasks.length === 0) {
    return <div className="empty-state">No tasks yet. Add your first task above!</div>;
  }

  return (
    <ul className="task-list">
      {tasks.map((t) => (
        <TaskItem
          key={t.id}
          task={t}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
