# 📝 Full Stack Web Application

A well-structured Full Stack web application using a modern decoupled architecture. The backend follows the MVC (Model-View-Controller) pattern with Express and MongoDB, while the frontend is powered by Vite.

## 🚀 Tech Stack
- **Frontend:** HTML, CSS, JavaScript, Vite
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (Mongoose)
- **Environment:** dotenv

## 📂 Project Structure & File Explanations

```text
full-stack-project/
│
├── backend/              # Node.js API Server
│   ├── middleware/       # Custom middleware (e.g., authentication, error handling)
│   ├── models/           # Mongoose database schemas and models
│   ├── routes/           # API endpoints and route definitions
│   ├── test/             # Automated test files for backend logic
│   ├── .env              # Environment variables (Hidden from Git)
│   ├── .env.example      # Template for environment variables
│   ├── package.json      # Backend dependencies and scripts
│   └── server.js         # Main entry point for the Express server
│
├── frontend/             # Frontend Client (Vite)
│   ├── public/           # Static assets (favicon, images)
│   ├── src/              # Main source code (JS, CSS, components)
│   ├── index.html        # Main HTML template
│   ├── package.json      # Frontend dependencies and scripts
│   └── vite.config.js    # Vite bundler configuration
│
└── Readme.md             # Project documentation