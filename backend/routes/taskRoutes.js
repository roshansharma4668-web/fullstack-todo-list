const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/Task');

const router = express.Router();
const editableFields = new Set(['title', 'description', 'completed']);
const creatableFields = new Set(['title', 'description']);

function validateTaskBody(body, { partial = false } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Request body must be a JSON object.' };
  }

  const fields = Object.keys(body);
  const allowedFields = partial ? editableFields : creatableFields;
  if (partial && fields.length === 0) {
    return { error: 'Provide at least one task field to update.' };
  }

  if (fields.some((field) => !allowedFields.has(field))) {
    return { error: 'Request contains an unsupported task field.' };
  }

  if (!partial && (typeof body.title !== 'string' || !body.title.trim())) {
    return { error: 'Task title is required.' };
  }
  if (partial && 'title' in body && (typeof body.title !== 'string' || !body.title.trim())) {
    return { error: 'Task title must be a non-empty string.' };
  }
  if ('description' in body && typeof body.description !== 'string') {
    return { error: 'Task description must be a string.' };
  }
  if ('completed' in body && typeof body.completed !== 'boolean') {
    return { error: 'Task completed must be a boolean.' };
  }

  return { data: body };
}

function validateTaskId(id, res) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'Invalid task ID.' });
    return false;
  }
  return true;
}

router.get('/', async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.status(200).json(tasks);
});

router.get('/:id', async (req, res) => {
  if (!validateTaskId(req.params.id, res)) return;

  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ message: 'Task not found.' });
  }
  return res.status(200).json(task);
});

router.post('/', async (req, res) => {
  const validation = validateTaskBody(req.body);
  if (validation.error) {
    return res.status(400).json({ message: validation.error });
  }

  const task = await Task.create({
    title: validation.data.title.trim(),
    description: validation.data.description?.trim() ?? ''
  });
  return res.status(201).json(task);
});

async function updateTask(req, res) {
  if (!validateTaskId(req.params.id, res)) return;

  const validation = validateTaskBody(req.body, { partial: true });
  if (validation.error) {
    return res.status(400).json({ message: validation.error });
  }

  const update = { ...validation.data };
  if (typeof update.title === 'string') update.title = update.title.trim();
  if (typeof update.description === 'string') update.description = update.description.trim();

  const task = await Task.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true
  });
  if (!task) {
    return res.status(404).json({ message: 'Task not found.' });
  }
  return res.status(200).json(task);
}

router.patch('/:id', updateTask);
router.put('/:id', updateTask);

router.delete('/:id', async (req, res) => {
  if (!validateTaskId(req.params.id, res)) return;

  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) {
    return res.status(404).json({ message: 'Task not found.' });
  }
  return res.status(200).json({ message: 'Task deleted.', id: task._id });
});

module.exports = router;
