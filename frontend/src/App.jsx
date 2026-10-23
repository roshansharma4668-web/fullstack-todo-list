import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://fullstack-todo-list-rdjs.onrender.com"; 
// 1. API Token ko define kiya
const API_TOKEN = import.meta.env.VITE_API_TOKEN || "local-task-manager-token-change-me-32";

function App() {
  const [title, setTitle] = useState('');
  const [tasks, setTasks] = useState([]);

  // Data lane wala function
  const fetchTasks = async () => {
    try {
      // 2. GET request mein headers ke andar token bheja
      const response = await fetch(`${BASE_URL}/api/tasks`, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'x-api-token': API_TOKEN, // Backup header agar middleware ye check karta ho
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setTasks(data);
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
      // 3. POST request mein bhi token bheja
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
        setTitle('');
        fetchTasks();
      }
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  return (
    // Aapka HTML/JSX code yahan rahega...
    <div>
      {/* ... */}
    </div>
  );
}

export default App;