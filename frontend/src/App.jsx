import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://fullstack-todo-list-rdjs.onrender.com"; 
const API_TOKEN = import.meta.env.VITE_API_TOKEN || "local-task-manager-token-change-me-32";

function App() {
  const [title, setTitle] = useState('');
  const [tasks, setTasks] = useState([]);

  // Data lane wala function
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
      
      // API se aane wale array ko set karna
      if (Array.isArray(data)) {
        setTasks(data);
      } else if (data && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Naya task add karne wala function
  const handleAddTask = async (e) => {
    e.preventDefault();
    
    const trimmedTitle = title.trim();
    
    if (!trimmedTitle) {
      alert("Please enter a task");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`,
          'x-api-token': API_TOKEN
        },
        body: JSON.stringify({ title: trimmedTitle })
      });

      if (response.ok) {
        setTitle(''); // Input clear karein
        fetchTasks(); // List ko update karein
      }
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  // 4. Yahan actual UI design add kiya gaya hai
  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>My Tasks</h1>

      {/* Task add karne ka form */}
      <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="What would you like to get done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: 1, padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '5px' }}>
          Add Task
        </button>
      </form>

      {/* Tasks ki list */}
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {tasks && tasks.length > 0 ? (
          tasks.map((task, index) => (
            <li key={task._id || index} style={{ padding: '15px', borderBottom: '1px solid #eee', fontSize: '18px', backgroundColor: '#f9f9f9', marginBottom: '5px', borderRadius: '5px' }}>
              {task.title}
            </li>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            <p>No tasks yet. A fresh start!</p>
          </div>
        )}
      </ul>
    </div>
  );
}

export default App;