'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { CheckSquare, StickyNote, Repeat, FolderKanban, ArrowRight } from 'lucide-react';
import { useTasks } from '@/lib/hooks/use-tasks';
import { useNotes } from '@/lib/hooks/use-notes';
import { useHabits } from '@/lib/hooks/use-habits';
import { useProjects } from '@/lib/hooks/use-projects';

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { tasks } = useTasks();
  const { notes } = useNotes();
  const { habits } = useHabits();
  const { projects } = useProjects();

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-global-search', handler);
    return () => window.removeEventListener('open-global-search', handler);
  }, []);

  const runCommand = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Her yerde ara... (görevler, notlar, alışkanlıklar, projeler)" />
      <CommandList>
        <CommandEmpty>Sonuç bulunamadı</CommandEmpty>

        {projects.length > 0 && (
          <CommandGroup heading="Projeler">
            {projects.slice(0, 5).map((project) => (
              <CommandItem
                key={project.id}
                onSelect={() => runCommand(() => router.push(`/projects/${project.id}`))}
              >
                <FolderKanban className="mr-2 h-4 w-4" style={{ color: project.color }} />
                <span>{project.name}</span>
                <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {tasks.length > 0 && (
          <CommandGroup heading="Görevler">
            {tasks
              .filter((t) => t.status !== 'done')
              .slice(0, 8)
              .map((task) => (
                <CommandItem
                  key={task.id}
                  onSelect={() => runCommand(() => router.push(`/tasks/${task.id}`))}
                >
                  <CheckSquare className="mr-2 h-4 w-4" />
                  <span>{task.title}</span>
                  <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />
                </CommandItem>
              ))}
          </CommandGroup>
        )}

        {notes.length > 0 && (
          <CommandGroup heading="Notlar">
            {notes.slice(0, 8).map((note) => (
              <CommandItem
                key={note.id}
                onSelect={() => runCommand(() => router.push('/notes'))}
              >
                <StickyNote className="mr-2 h-4 w-4" />
                <span>{note.title}</span>
                {note.tags.length > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {note.tags.join(', ')}
                  </span>
                )}
                <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {habits.length > 0 && (
          <CommandGroup heading="Alışkanlıklar">
            {habits.slice(0, 5).map((habit) => (
              <CommandItem
                key={habit.id}
                onSelect={() => runCommand(() => router.push('/habits'))}
              >
                <Repeat className="mr-2 h-4 w-4" style={{ color: habit.color }} />
                <span>{habit.name}</span>
                <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
