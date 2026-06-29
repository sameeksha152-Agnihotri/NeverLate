import { useState, useEffect } from 'react';
import { useTasks } from '../../contexts/TaskContext';
import type { Task } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  editTask?: Task | null;
}

export function TaskForm({ isOpen, onClose, editTask }: TaskFormProps) {
  const { createTask, updateTask } = useTasks();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [freeHours, setFreeHours] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      const date = new Date(editTask.deadline);
      setDeadline(date.toISOString().split('T')[0]);
      setDeadlineTime(date.toTimeString().slice(0, 5));
      setEstimatedHours(editTask.estimatedHours.toString());
      setFreeHours(editTask.freeHours.toString());
    } else {
      resetForm();
    }
  }, [editTask, isOpen]);

  const resetForm = () => {
    setTitle('');
    const now = new Date();
    now.setHours(now.getHours() + 24);
    setDeadline(now.toISOString().split('T')[0]);
    setDeadlineTime('23:59');
    setEstimatedHours('2');
    setFreeHours('4');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const deadlineDate = new Date(`${deadline}T${deadlineTime}`);
      const estHours = parseFloat(estimatedHours);
      const freeHrs = parseFloat(freeHours);

      if (deadlineDate <= new Date()) {
        throw new Error('Deadline must be in the future');
      }

      if (isNaN(estHours) || estHours <= 0) {
        throw new Error('Please enter valid estimated hours');
      }

      if (isNaN(freeHrs) || freeHrs < 0) {
        throw new Error('Please enter valid free hours');
      }

      if (editTask) {
        await updateTask(editTask.id, {
          title: title.trim(),
          deadline: deadlineDate,
          estimatedHours: estHours,
          freeHours: freeHrs,
        });
      } else {
        await createTask({
          title: title.trim(),
          deadline: deadlineDate,
          estimatedHours: estHours,
          freeHours: freeHrs,
          postponeCount: 0,
          status: 'active',
        });
      }

      onClose();
      if (!editTask) resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save task';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editTask ? 'Edit Task' : 'Add New Task'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Task Title
          </label>
          <Input
            type="text"
            placeholder="What do you need to do?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Deadline Date
            </label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Time
            </label>
            <Input
              type="time"
              value={deadlineTime}
              onChange={(e) => setDeadlineTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Estimated Hours
            </label>
            <Input
              type="number"
              min="0.5"
              step="0.5"
              placeholder="How long will it take?"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Free Hours Available
            </label>
            <Input
              type="number"
              min="0"
              step="0.5"
              placeholder="How much time do you have?"
              value={freeHours}
              onChange={(e) => setFreeHours(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {editTask ? 'Save Changes' : 'Add Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
