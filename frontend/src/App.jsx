import { useState, useEffect } from 'react';
import './index.css';

const BASE_URL = "https://fullstack-todo-list-rdjs.onrender.com";
const API_TOKEN = import.meta.env.VITE_API_TOKEN || "local-task-manager-token-change-me-32";

function App() {
  const [title, setTitle] = useState('');
  const [tasks, setTasks] = useState([]);

  // Fetch Tasks
  const fetchTasks = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/tasks`, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'x-api-token': API_TOKEN,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (Array.isArray(data)) setTasks(data);
      else if (data && Array.isArray(data.tasks)) setTasks(data.tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Add Task
  const handleAddTask = async (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    try {
      const response = await fetch(`${BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`,
          'x-api-token': API_TOKEN
        },
        // Naya task by default 'Pending' rahega
        body: JSON.stringify({ title: trimmedTitle, status: 'Pending' })
      });

      if (response.ok) {
        setTitle(''); 
        fetchTasks(); 
      }
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  // Delete Task Function
  const handleDeleteTask = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'x-api-token': API_TOKEN
        }
      });
      if (response.ok) fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Update Task Status Function (Process / Complete)
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`${BASE_URL}/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`,
          'x-api-token': API_TOKEN
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) fetchTasks();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="app-container">
      <h1 className="header">My Tasks</h1>

      <form onSubmit={handleAddTask} className="task-form">
        <input
          type="text"
          className="task-input"
          placeholder="What would you like to get done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit" className="add-btn">Add Task</button>
      </form>

      <ul className="task-list">
        {tasks && tasks.length > 0 ? (
          tasks.map((task, index) => (
            <li key={task._id || index} className={`task-item ${task.status === 'Completed' ? 'completed-task' : ''}`}>
              
              <div className="task-content">
                <span className="task-text" style={{ textDecoration: task.status === 'Completed' ? 'line-through' : 'none' }}>
                  {task.title}
                </span>
                <span className={`status-badge ${task.status ? task.status.toLowerCase() : 'pending'}`}>
                  {task.status || 'Pending'}
                </span>
              </div>

              <div className="task-actions">
                {task.status !== 'Completed' && (
                  <>
                    <button onClick={() => handleUpdateStatus(task._id, 'Processing')} className="action-btn process-btn" title="Mark as Processing">
                      ⏳ Process
                    </button>
                    <button onClick={() => handleUpdateStatus(task._id, 'Completed')} className="action-btn complete-btn" title="Mark as Complete">
                      ✅ Complete
                    </button>
                  </>
                )}
                <button onClick={() => handleDeleteTask(task._id)} className="action-btn delete-btn" title="Delete Task">
                  🗑️ Delete
                </button>
              </div>

            </li>
          ))
        ) : (
          <div className="empty-state">
            <p>No tasks yet. A fresh start!</p>
          </div>
        )}
      </ul>
    </div>
  );
}

export default App;