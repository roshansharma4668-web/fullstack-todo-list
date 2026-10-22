import { useState, useEffect } from 'react';


const BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://fullstack-todo-list-rdjs.onrender.com"; 


function App() {
  const [title, setTitle] = useState('');
  const [tasks, setTasks] = useState([]);

  // Data lane wala function
  const fetchTasks = async () => {
    try {
      // 2. API call mein BASE_URL lagayein
      const response = await fetch(`${BASE_URL}/api/tasks`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Naya task add karne wala function jahan aapki line hai
  const handleAddTask = async (e) => {
    e.preventDefault();
    
    // Aapki line yahan hai
    const trimmedTitle = title.trim();
    
    if (!trimmedTitle) {
      alert("Please enter a task");
      return;
    }

    try {
      // 3. Post request mein bhi BASE_URL lagayein
      const response = await fetch(`${BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

  return (
    // Aapka HTML/JSX code yahan rahega...
    <div>
      {/* ... */}
    </div>
  );
}

export default App;