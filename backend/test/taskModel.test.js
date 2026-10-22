const assert = require('node:assert/strict');
const test = require('node:test');
const Task = require('../models/Task');

test('task model trims title and applies optional-field defaults', () => {
  const task = new Task({ title: '  Learn React  ' });

  assert.equal(task.title, 'Learn React');
  assert.equal(task.description, '');
  assert.equal(task.completed, false);
});

test('task model requires a non-empty title', async () => {
  const task = new Task({ title: '   ' });

  await assert.rejects(task.validate(), (error) => {
    assert.ok(error.errors.title);
    return true;
  });
});

test('task model enforces title and description length limits', async () => {
  const task = new Task({
    title: 't'.repeat(101),
    description: 'd'.repeat(501)
  });

  await assert.rejects(task.validate(), (error) => {
    assert.ok(error.errors.title);
    assert.ok(error.errors.description);
    return true;
  });
});

test('task schema enables createdAt and updatedAt timestamps', () => {
  assert.ok(Task.schema.path('createdAt'));
  assert.ok(Task.schema.path('updatedAt'));
});
