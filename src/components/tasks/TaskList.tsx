import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTasks } from '../../contexts/TaskContext';
import type { Task } from '../../types';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { Button } from '../ui/Button';
import { Plus, ListFilter as Filter, ListTodo } from 'lucide-react';
import { cn } from '../../utils/helpers';

type FilterType = 'all' | 'active' | 'completed' | 'missed';
type SortType = 'deadline' | 'risk' | 'created';

interface TaskListProps {
  onRescue: (task: Task) => void;
}

export function TaskList({ onRescue }: TaskListProps) {
  const { activeTasks, completedTasks, missedTasks, tasks } = useTasks();
  const [filter, setFilter] = useState<FilterType>('active');
  const [sort, setSort] = useState<SortType>('risk');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const getFilteredTasks = () => {
    let filtered: Task[];
    switch (filter) {
      case 'active':
        filtered = activeTasks;
        break;
      case 'completed':
        filtered = completedTasks;
        break;
      case 'missed':
        filtered = missedTasks;
        break;
      default:
        filtered = tasks;
    }

    const sorted = [...filtered];
    switch (sort) {
      case 'deadline':
        sorted.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
        break;
      case 'risk':
        sorted.sort((a, b) => b.riskScore - a.riskScore);
        break;
      case 'created':
        sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
    }

    return sorted;
  };

  const filteredTasks = getFilteredTasks();

  const filterTabs: { key: FilterType; label: string; count: number }[] = [
    { key: 'active', label: 'Active', count: activeTasks.length },
    { key: 'completed', label: 'Completed', count: completedTasks.length },
    { key: 'missed', label: 'Missed', count: missedTasks.length },
  ];

  return (
    <div className="page-container pb-24">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="p-3 rounded-xl"
            style={{ background: 'var(--stat-icon-bg)' }}
          >
            <ListTodo className="w-5 h-5 text-theme-accent" />
          </div>
          <div>
            <h1 className="page-title">Tasks</h1>
            <p className="page-subtitle">{activeTasks.length} active</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortType)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm"
          >
            <option value="risk">Sort by Risk</option>
            <option value="deadline">Sort by Deadline</option>
            <option value="created">Sort by Created</option>
          </select>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingTask(null);
              setShowTaskForm(true);
            }}
            className="flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Task</span>
          </Button>
        </div>
      </header>

      {/* Filter tabs */}
      <div
        className="flex items-center gap-2 p-2 rounded-xl border"
        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
      >
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'flex-1 py-3 px-4 rounded-lg text-xs font-semibold',
              'transition-all duration-200',
              'flex items-center justify-center gap-2',
              filter === tab.key
                ? 'nav-item--active'
                : 'text-theme-muted hover:text-theme-secondary'
            )}
            style={filter === tab.key ? undefined : { background: 'transparent', border: 'none' }}
          >
            {tab.label}
            <span
              className={cn(
                'text-[10px] px-2 py-0.5 rounded-full font-bold tabular-nums',
                filter === tab.key ? 'bg-[var(--bg-nav-active)] text-theme-accent' : 'bg-[var(--bg-card)] text-theme-muted'
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center"
            >
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 border"
                style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
              >
                <Filter className="w-7 h-7 text-theme-muted" />
              </div>
              <p className="text-theme-secondary font-medium">No tasks found</p>
              <p className="text-sm text-theme-muted mt-2">
                {filter === 'active'
                  ? 'Add your first task to get started'
                  : `No ${filter} tasks yet`}
              </p>
              {filter === 'active' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setEditingTask(null);
                    setShowTaskForm(true);
                  }}
                  className="mt-6"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </Button>
              )}
            </motion.div>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onRescue={onRescue}
                onEdit={(t) => {
                  setEditingTask(t);
                  setShowTaskForm(true);
                }}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Task form modal */}
      <TaskForm
        isOpen={showTaskForm}
        onClose={() => {
          setShowTaskForm(false);
          setEditingTask(null);
        }}
        editTask={editingTask}
      />
    </div>
  );
}
