'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Flag, GripVertical } from 'lucide-react';
import { Task } from '@/lib/db/schema';

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  onClickTask: (task: Task) => void;
}

const columns: { status: Task['status']; label: string; color: string }[] = [
  { status: 'todo', label: 'Yapılacak', color: 'border-t-gray-500' },
  { status: 'in_progress', label: 'Devam Ediyor', color: 'border-t-yellow-500' },
  { status: 'waiting', label: 'Beklemede', color: 'border-t-blue-500' },
  { status: 'done', label: 'Tamamlandı', color: 'border-t-green-500' },
];

const priorityConfig = {
  low: { label: 'Düşük', color: 'text-blue-500' },
  normal: { label: 'Normal', color: 'text-gray-500' },
  high: { label: 'Yüksek', color: 'text-orange-500' },
  urgent: { label: 'Acil', color: 'text-red-500' },
};

function SortableTaskCard({
  task,
  onClick,
}: {
  task: Task;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: 'task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow group"
        onClick={onClick}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <button
              className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
              {...listeners}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-2">{task.title}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className={`text-xs ${priorityConfig[task.priority].color}`}>
                  <Flag className="w-3 h-3 mr-1" />
                  {priorityConfig[task.priority].label}
                </Badge>
                {task.deadline && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(task.deadline).toLocaleDateString('tr-TR')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KanbanColumn({
  label,
  color,
  tasks,
  onClickTask,
}: {
  status: Task['status'];
  label: string;
  color: string;
  tasks: Task[];
  onClickTask: (task: Task) => void;
}) {
  return (
    <div className="space-y-3">
      <div className={`flex items-center gap-2 pb-2 border-t-2 ${color} pt-3`}>
        <span className="font-medium text-sm">{label}</span>
        <Badge variant="secondary" className="ml-auto text-xs">
          {tasks.length}
        </Badge>
      </div>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[200px] p-2 rounded-lg bg-muted/30">
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onClick={() => onClickTask(task)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export function KanbanBoard({ tasks, onStatusChange, onClickTask }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Check if dropped on a column (status)
    if (columns.some((c) => c.status === overId)) {
      const newStatus = overId as Task['status'];
      if (activeTask.status !== newStatus) {
        onStatusChange(activeId, newStatus);
      }
      return;
    }

    // Check if dropped on another task
    const overTask = tasks.find((t) => t.id === overId);
    if (overTask && activeTask.status !== overTask.status) {
      onStatusChange(activeId, overTask.status);
    }
  };

  const tasksByStatus = columns.map((col) => ({
    ...col,
    tasks: tasks.filter((t) => t.status === col.status),
  }));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-4 gap-4">
        {tasksByStatus.map((col) => (
          <KanbanColumn
            key={col.status}
            status={col.status}
            label={col.label}
            color={col.color}
            tasks={col.tasks}
            onClickTask={onClickTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <Card className="shadow-lg rotate-2">
            <CardContent className="p-3">
              <p className="text-sm font-medium">{activeTask.title}</p>
            </CardContent>
          </Card>
        )}
      </DragOverlay>
    </DndContext>
  );
}
