import { TaskList } from '../components/tasks/TaskList';
import type { Task } from '../types';

interface TasksPageProps {
  onRescue: (task: Task) => void;
}

export function TasksPage({ onRescue }: TasksPageProps) {
  return <TaskList onRescue={onRescue} />;
}
