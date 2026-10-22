import { useEffect, useMemo, useState } from 'react'
import './App.css'

const FILTERS = ['all', 'active', 'completed']

async function requestTasks(path = '', options = {}) {
  const response = await fetch(`/api/tasks${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })
  const result = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(result?.message || `Request failed with status ${response.status}.`)
  }

  return result
}

function normalizeTask(task) {
  return {
    id: String(task._id),
    title: task.title,
    description: task.description || '',
    completed: task.completed,
    createdAt: task.createdAt,
  }
}

function TaskItem({ task, onToggle, onEdit, onDelete }) {
  return (
    <li className={`task-card${task.completed ? ' task-card--completed' : ''}`}>
      <button
        className="task-check"
        type="button"
        aria-label={task.completed ? `Mark ${task.title} active` : `Complete ${task.title}`}
        aria-pressed={task.completed}
        onClick={() => onToggle(task.id)}
      >
        {task.completed ? '✓' : ''}
      </button>

      <div className="task-content">
        <div className="task-title-row">
          <h3>{task.title}</h3>
          <span className={`task-status${task.completed ? ' task-status--done' : ''}`}>
            {task.completed ? 'Done' : 'In progress'}
          </span>
        </div>
        {task.description && <p className="task-description">{task.description}</p>}
        <p className="task-date">
          Added {new Date(task.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>

      <div className="task-actions">
        <button className="icon-button" type="button" onClick={() => onEdit(task)} aria-label={`Edit ${task.title}`}>
          Edit
        </button>
        <button className="icon-button icon-button--danger" type="button" onClick={() => onDelete(task.id)} aria-label={`Delete ${task.title}`}>
          Delete
        </button>
      </div>
    </li>
  )
}

function App() {
  const [tasks, setTasks] = useState([])
  const [apiError, setApiError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let isCurrent = true

    requestTasks()
      .then((data) => {
        if (isCurrent) setTasks(data.map(normalizeTask))
      })
      .catch((error) => {
        if (isCurrent) {
          setApiError(`Could not load tasks from the backend. ${error.message}`)
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [])

  const visibleTasks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return tasks.filter((task) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && !task.completed) ||
        (filter === 'completed' && task.completed)
      const matchesSearch =
        !normalizedSearch ||
        `${task.title} ${task.description}`.toLowerCase().includes(normalizedSearch)

      return matchesFilter && matchesSearch
    })
  }, [tasks, filter, search])

  const completedCount = tasks.filter((task) => task.completed).length
  const remainingCount = tasks.length - completedCount
  const completionPercent = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0

  function resetForm() {
    setTitle('')
    setDescription('')
    setEditingTaskId(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()

    if (!trimmedTitle) return

    setIsSaving(true)
    setApiError('')
    try {
      if (editingTaskId) {
        const updatedTask = await requestTasks(`/${editingTaskId}`, {
          method: 'PUT',
          body: JSON.stringify({ title: trimmedTitle, description: trimmedDescription }),
        })
        const normalizedTask = normalizeTask(updatedTask)
        setTasks((currentTasks) => currentTasks.map((task) =>
          task.id === editingTaskId ? normalizedTask : task,
        ))
      } else {
        const createdTask = await requestTasks('', {
          method: 'POST',
          body: JSON.stringify({ title: trimmedTitle, description: trimmedDescription }),
        })
        setTasks((currentTasks) => [normalizeTask(createdTask), ...currentTasks])
      }
      resetForm()
    } catch (error) {
      setApiError(`Could not save the task. ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  function handleEdit(task) {
    setEditingTaskId(task.id)
    setTitle(task.title)
    setDescription(task.description)
    document.getElementById('task-title')?.focus()
  }

  async function handleToggle(taskId) {
    const task = tasks.find((currentTask) => currentTask.id === taskId)
    if (!task) return

    setIsSaving(true)
    setApiError('')
    try {
      const updatedTask = await requestTasks(`/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ completed: !task.completed }),
      })
      const normalizedTask = normalizeTask(updatedTask)
      setTasks((currentTasks) => currentTasks.map((currentTask) =>
        currentTask.id === taskId ? normalizedTask : currentTask,
      ))
    } catch (error) {
      setApiError(`Could not update the task. ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(taskId) {
    setIsSaving(true)
    setApiError('')
    try {
      await requestTasks(`/${taskId}`, { method: 'DELETE' })
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId))
      if (editingTaskId === taskId) resetForm()
    } catch (error) {
      setApiError(`Could not delete the task. ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Taskflow home">
          <span className="brand-mark" aria-hidden="true">✓</span>
          <span>taskflow</span>
        </a>
        <span className="topbar-label">Your personal workspace</span>
      </header>

      <section className="page-heading">
        <p className="eyebrow">MAKE SPACE FOR WHAT MATTERS</p>
        <h1>Good things get done, one task at a time.</h1>
        <p className="page-subtitle">A little progress every day adds up to a lot.</p>
      </section>

      <section className="dashboard" aria-label="Task overview">
        <article className="summary-card summary-card--primary">
          <div>
            <p className="summary-label">Tasks completed</p>
            <p className="summary-value">{completedCount}<span> / {tasks.length}</span></p>
          </div>
          <div className="progress-ring" aria-label={`${completionPercent}% complete`}>
            <span>{completionPercent}%</span>
          </div>
        </article>
        <article className="summary-card">
          <span className="summary-icon summary-icon--purple" aria-hidden="true">↗</span>
          <div>
            <p className="summary-label">Still in progress</p>
            <p className="summary-value">{remainingCount}</p>
          </div>
        </article>
        <article className="summary-card">
          <span className="summary-icon summary-icon--green" aria-hidden="true">✓</span>
          <div>
            <p className="summary-label">All tasks</p>
            <p className="summary-value">{tasks.length}</p>
          </div>
        </article>
      </section>

      <section className="workspace">
        <aside className="composer-panel">
          <div className="section-heading">
            <span className="section-icon" aria-hidden="true">{editingTaskId ? '✎' : '+'}</span>
            <div>
              <h2>{editingTaskId ? 'Edit task' : 'Create a task'}</h2>
              <p>{editingTaskId ? 'Make a quick update.' : 'What would you like to get done?'}</p>
            </div>
          </div>

          <form className="task-form" onSubmit={handleSubmit}>
            <label htmlFor="task-title">Task name</label>
            <input
              id="task-title"
              name="title"
              type="text"
              placeholder="e.g. Plan the week"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={100}
              required
            />

            <label htmlFor="task-description">Description <span>(optional)</span></label>
            <textarea
              id="task-description"
              name="description"
              placeholder="Add a few details..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={500}
              rows={4}
            />

            <button className="primary-button" type="submit" disabled={isLoading || isSaving}>
              <span aria-hidden="true">{editingTaskId ? '✓' : '+'}</span>
              {isSaving ? 'Saving...' : editingTaskId ? 'Save changes' : 'Add task'}
            </button>
            {editingTaskId && (
              <button className="cancel-button" type="button" onClick={resetForm}>
                Cancel editing
              </button>
            )}
          </form>
        </aside>

        <section className="task-panel" aria-labelledby="tasks-heading">
          <div className="task-panel-header">
            <div>
              <p className="eyebrow">YOUR WORKSPACE</p>
              <h2 id="tasks-heading">My tasks <span className="task-count">{tasks.length}</span></h2>
            </div>
            <label className="search-box">
              <span className="visually-hidden">Search tasks</span>
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Search tasks"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>

          <div className="filter-row" role="group" aria-label="Filter tasks">
            {FILTERS.map((filterOption) => (
              <button
                className={`filter-button${filter === filterOption ? ' filter-button--active' : ''}`}
                type="button"
                key={filterOption}
                aria-pressed={filter === filterOption}
                onClick={() => setFilter(filterOption)}
              >
                {filterOption[0].toUpperCase() + filterOption.slice(1)}
                {filterOption === 'all' && <span>{tasks.length}</span>}
                {filterOption === 'active' && <span>{remainingCount}</span>}
                {filterOption === 'completed' && <span>{completedCount}</span>}
              </button>
            ))}
          </div>

          {apiError && <p className="notice notice--error" role="alert">{apiError}</p>}

          {isLoading ? (
            <div className="empty-state" role="status"><p>Loading tasks...</p></div>
          ) : visibleTasks.length > 0 ? (
            <ul className="task-list">
              {visibleTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <span className="empty-icon" aria-hidden="true">{search ? '⌕' : '✦'}</span>
              <h3>{search ? 'No matching tasks' : tasks.length ? 'Nothing in this filter' : 'A fresh start'}</h3>
              <p>
                {search
                  ? 'Try another search term.'
                  : tasks.length
                    ? 'Choose another filter or add a new task.'
                    : 'Add your first task and build a little momentum.'}
              </p>
            </div>
          )}

          <p className="storage-note">
            <span aria-hidden="true">ⓘ</span>
            Tasks are stored in MongoDB and shared with the backend.
          </p>
        </section>
      </section>

      <footer className="app-footer">
        <span>Made for focused days.</span>
        <span>Small steps. Real progress.</span>
      </footer>
    </main>
  )
}

export default App
