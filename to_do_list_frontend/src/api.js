const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Helper to handle JSON responses and errors
async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const resp = await fetch(url, { ...options, headers });
  const text = await resp.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    // Non-JSON response
    data = text;
  }
  if (!resp.ok) {
    const message = (data && (data.message || data.error)) || `Request failed with status ${resp.status}`;
    const err = new Error(message);
    err.status = resp.status;
    err.data = data;
    throw err;
  }
  return data;
}

// PUBLIC_INTERFACE
export async function getTasks() {
  /** Fetch all tasks */
  return request('/tasks', { method: 'GET' });
}

// PUBLIC_INTERFACE
export async function addTask(title) {
  /** Add a new task with a title (incomplete by default) */
  return request('/tasks', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
}

// PUBLIC_INTERFACE
export async function updateTask(id, updates) {
  /** Update a task by id with provided fields */
  return request(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

// PUBLIC_INTERFACE
export async function toggleTask(id) {
  /** Toggle the completed status of a task */
  return request(`/tasks/${id}/toggle`, {
    method: 'PATCH',
  });
}

// PUBLIC_INTERFACE
export async function deleteTask(id) {
  /** Delete a task by id */
  return request(`/tasks/${id}`, {
    method: 'DELETE',
  });
}

const api = {
  getTasks,
  addTask,
  updateTask,
  toggleTask,
  deleteTask,
};
export default api;
