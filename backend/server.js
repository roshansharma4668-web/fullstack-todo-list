const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const createApiTokenMiddleware = require('./middleware/requireApiToken');
require('dotenv').config();

const taskRoutes = require('./routes/taskRoutes');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10kb' }));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Task Manager Backend is running!' });
});

app.get('/api/health', (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? 'OK' : 'Unavailable',
    database: databaseConnected ? 'Connected' : 'Disconnected'
  });
});

const apiToken = process.env.API_TOKEN || (
  process.env.NODE_ENV === 'production' ? '' : 'local-task-manager-token-change-me-32'
);
app.use('/api/tasks', createApiTokenMiddleware(apiToken));
app.use('/api/tasks', taskRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
});

app.use((error, req, res, next) => {
  console.error('Request error:', error);

  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ message: error.message });
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body must contain valid JSON.' });
  }

  return res.status(500).json({ message: 'An unexpected server error occurred.' });
});

async function startServer() {
  const mongoUri = process.env.MONGO_URI;
  const port = Number(process.env.PORT) || 5000;

  if (!mongoUri) {
    throw new Error('MONGO_URI is missing from the backend environment.');
  }
  if (!apiToken || Buffer.byteLength(apiToken, 'utf8') < 32) {
    throw new Error('API_TOKEN must be configured with at least 32 bytes.');
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB.');

  return app.listen(port, () => {
    console.log(`Task Manager API listening on http://localhost:${port}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Backend startup failed:', error.message);
    process.exitCode = 1;
  });
}

module.exports = { app, startServer };
