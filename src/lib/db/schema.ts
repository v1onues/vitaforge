import Dexie, { Table } from 'dexie';

export interface Profile {
  id: string;
  salt: string;
  verifier: string;
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  id: string;
  theme: 'light' | 'dark' | 'system';
  language: 'tr';
  lockTimeout: number;
  autoBackup: boolean;
  backupInterval: number;
  lastBackupAt: number | null;
  aiProvider: string;
  aiApiKey: string;
  aiModel: string;
  rawgApiKey: string;
  tmdbApiKey: string;
  googleBooksApiKey: string;
  lastfmApiKey: string;
}

export interface ProjectGroup {
  id: string;
  projectId: string;
  name: string;
  description: string;
  order: number;
  deadline: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  startDate: number | null;
  endDate: number | null;
  tags: string[];
  budget: number | null;
  url: string | null;
  estimatedHours: number | null;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface Task {
  id: string;
  projectId: string | null;
  groupId: string | null;
  title: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'waiting' | 'done';
  deadline: number | null;
  completedAt: number | null;
  parentId: string | null;
  order: number;
  tags: string[];
  // Recurring
  recurringPattern: string | null; // 'daily' | 'weekly:1,3,5' | 'monthly:15' | null
  lastRecurringAt: number | null;
  // Time tracking
  estimatedMinutes: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  startTime: number;
  endTime: number | null;
  duration: number; // seconds
  notes: string;
  createdAt: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'custom';
  customDays: number[];
  targetValue: number | null;
  unit: string;
  color: string;
  icon: string;
  reminderTime: string | null;
  archived: boolean;
  createdAt: number;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  value: number;
  notes: string;
  createdAt: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  links: string[];
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'objective' | 'key_result';
  parentId: string | null;
  lifeArea: string | null;
  targetValue: number | null;
  currentValue: number;
  unit: string;
  deadline: number | null;
  status: 'active' | 'completed' | 'abandoned';
  createdAt: number;
  updatedAt: number;
}

export interface LifeArea {
  id: string;
  name: string;
  icon: string;
  color: string;
  currentScore: number;
  targetScore: number;
  notes: string;
  updatedAt: number;
}

export interface MoodLog {
  id: string;
  date: string;
  mood: number;
  energy: number;
  notes: string;
  createdAt: number;
}

export interface Backup {
  id: string;
  encrypted: boolean;
  size: number;
  createdAt: number;
  data: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  whatIDid: string;
  whatILearned: string;
  tomorrowPlan: string;
  mood: number; // 1-5
  createdAt: number;
  updatedAt: number;
}

export interface GratitudeEntry {
  id: string;
  date: string; // YYYY-MM-DD
  items: string[]; // max 3
  createdAt: number;
  updatedAt: number;
}

export interface SleepLog {
  id: string;
  date: string; // YYYY-MM-DD (the night of)
  bedtime: string; // HH:mm
  wakeTime: string; // HH:mm
  quality: number; // 1-5
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface ReadingItem {
  id: string;
  title: string;
  author: string;
  type: 'book' | 'article' | 'podcast' | 'video';
  status: 'to_read' | 'reading' | 'finished';
  progress: number; // 0-100
  currentPage: number | null;
  totalPages: number | null;
  rating: number | null; // 1-5
  notes: string;
  url: string | null;
  imageUrl: string | null;
  metadata: string; // JSON string (pageCount, publisher, categories, etc.)
  createdAt: number;
  updatedAt: number;
}

export interface MediaItem {
  id: string;
  title: string;
  type: 'movie' | 'series' | 'music_album' | 'music_song' | 'game';
  status: 'planned' | 'active' | 'done' | 'abandoned';
  metadata: string; // JSON for flexible fields (director, artist, genre, year, duration, etc.)
  rating: number | null; // 1-10
  review: string;
  progress: number; // 0-100 or episode/total
  totalEpisodes: number | null;
  currentEpisode: number | null;
  url: string | null;
  imageUrl: string | null;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  tags: string[];
  recurringPattern: string | null; // 'monthly' | 'yearly' | null
  lastRecurringAt: number | null;
  budgetLimit: number | null; // category budget limit in TRY
  createdAt: number;
  updatedAt: number;
}

export interface ActivityLog {
  id: string;
  summary: string;
  details: string;
  type: string; // 'task_done', 'media_watched', 'habit_logged', etc.
  relatedId: string | null;
  relatedType: string | null;
  timestamp: number;
  createdAt: number;
}

export interface AiChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCalls: string | null; // JSON
  toolResults: string | null; // JSON
  createdAt: number;
}

export interface FitnessLog {
  id: string;
  date: string; // YYYY-MM-DD
  workoutDone: boolean;
  workoutType: string; // 'cardio' | 'strength' | 'yoga' | 'walk' | 'other' | ''
  workoutDuration: number; // minutes
  weight: number | null; // kg
  calories: number | null;
  water: number; // glasses
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface DictionLog {
  id: string;
  date: string; // YYYY-MM-DD
  duration: number; // seconds
  completed: boolean;
  notes: string;
  createdAt: number;
}

export interface MonitoredEndpoint {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface RadioStation {
  id: string;
  name: string;
  url: string;
  category: 'turkish' | 'international' | 'custom';
  genre: string;
  country: string | null;
  faviconUrl: string | null;
  order: number;
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
}

export class VitaForgeDB extends Dexie {
  profiles!: Table<Profile>;
  settings!: Table<Settings>;
  projects!: Table<Project>;
  projectGroups!: Table<ProjectGroup>;
  tasks!: Table<Task>;
  timeEntries!: Table<TimeEntry>;
  tags!: Table<Tag>;
  habits!: Table<Habit>;
  habitLogs!: Table<HabitLog>;
  notes!: Table<Note>;
  goals!: Table<Goal>;
  lifeAreas!: Table<LifeArea>;
  moodLogs!: Table<MoodLog>;
  backups!: Table<Backup>;
  journalEntries!: Table<JournalEntry>;
  gratitudeEntries!: Table<GratitudeEntry>;
  sleepLogs!: Table<SleepLog>;
  readingItems!: Table<ReadingItem>;
  mediaItems!: Table<MediaItem>;
  transactions!: Table<Transaction>;
  activityLogs!: Table<ActivityLog>;
  aiChatMessages!: Table<AiChatMessage>;
  fitnessLogs!: Table<FitnessLog>;
  dictionLogs!: Table<DictionLog>;
  monitoredEndpoints!: Table<MonitoredEndpoint>;
  radioStations!: Table<RadioStation>;

  constructor() {
    super('VitaForgeDB');

    this.version(2).stores({
      profiles: 'id',
      settings: 'id',
      projects: 'id, status, order',
      tasks: 'id, projectId, parentId, status, deadline, *tags, order, recurringPattern',
      timeEntries: 'id, taskId, startTime, createdAt',
      tags: 'id, name',
      habits: 'id, archived',
      habitLogs: 'id, habitId, [habitId+date]',
      notes: 'id, *tags, *links, pinned',
      goals: 'id, type, parentId, lifeArea, status',
      lifeAreas: 'id',
      moodLogs: 'id, date',
      backups: 'id, createdAt',
      journalEntries: 'id, date',
      gratitudeEntries: 'id, date',
      sleepLogs: 'id, date',
      readingItems: 'id, status, type',
    });

    this.version(3).stores({
      mediaItems: 'id, type, status, *tags',
      transactions: 'id, type, category, date, *tags',
      activityLogs: 'id, type, timestamp',
      aiChatMessages: 'id, conversationId, role, createdAt',
    });

    this.version(4).stores({
      projectGroups: 'id, projectId, order',
      tasks: 'id, projectId, groupId, parentId, status, deadline, *tags, order, recurringPattern',
      projects: 'id, status, priority, order',
    });

    this.version(5).stores({
      fitnessLogs: 'id, date',
      dictionLogs: 'id, date',
      readingItems: 'id, status, type',
    });

    this.version(6).stores({
      monitoredEndpoints: 'id, url, order',
      radioStations: 'id, category, order',
    }).upgrade(async (tx) => {
      const now = Date.now();

      // Seed default monitored endpoints
      const epTable = tx.table('monitoredEndpoints');
      if ((await epTable.count()) === 0) {
        await epTable.bulkAdd([
          { id: crypto.randomUUID(), name: 'treas.net.tr', url: 'https://treas.net.tr', enabled: true, order: 0, createdAt: now, updatedAt: now },
          { id: crypto.randomUUID(), name: 'PayTR', url: 'https://www.paytr.com', enabled: true, order: 1, createdAt: now, updatedAt: now },
        ]);
      }

      // Seed default radio stations
      const radioTable = tx.table('radioStations');
      if ((await radioTable.count()) === 0) {
        await radioTable.bulkAdd([
          { id: crypto.randomUUID(), name: 'Power FM', url: 'https://broadcast.powerapp.com.tr/powerfm/mpeg/icecast.audio', category: 'turkish', genre: 'Pop', country: 'TR', faviconUrl: null, order: 0, isDefault: true, createdAt: now, updatedAt: now },
          { id: crypto.randomUUID(), name: 'Power Türk', url: 'https://broadcast.powerapp.com.tr/powerturk/mpeg/icecast.audio', category: 'turkish', genre: 'Pop', country: 'TR', faviconUrl: null, order: 1, isDefault: true, createdAt: now, updatedAt: now },
          { id: crypto.randomUUID(), name: 'Radyo Eksen', url: 'https://broadcast.powerapp.com.tr/eksenfm/mpeg/icecast.audio', category: 'turkish', genre: 'Rock', country: 'TR', faviconUrl: null, order: 2, isDefault: true, createdAt: now, updatedAt: now },
          { id: crypto.randomUUID(), name: 'Super FM', url: 'https://broadcast.powerapp.com.tr/superfm/mpeg/icecast.audio', category: 'turkish', genre: 'Pop', country: 'TR', faviconUrl: null, order: 3, isDefault: true, createdAt: now, updatedAt: now },
          { id: crypto.randomUUID(), name: 'TRT FM', url: 'https://radio-trtfm.live.trt.com.tr/master.m3u8', category: 'turkish', genre: 'Pop', country: 'TR', faviconUrl: null, order: 4, isDefault: true, createdAt: now, updatedAt: now },
          { id: crypto.randomUUID(), name: 'NTV Radyo', url: 'https://broadcast.powerapp.com.tr/ntvradyo/mpeg/icecast.audio', category: 'turkish', genre: 'Haber', country: 'TR', faviconUrl: null, order: 5, isDefault: true, createdAt: now, updatedAt: now },
          { id: crypto.randomUUID(), name: 'BBC Radio 1', url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one', category: 'international', genre: 'Pop', country: 'UK', faviconUrl: null, order: 6, isDefault: true, createdAt: now, updatedAt: now },
          { id: crypto.randomUUID(), name: 'Jazz FM', url: 'https://jazz-wr01.ice.infomaniak.ch/jazz-wr01-128.mp3', category: 'international', genre: 'Jazz', country: 'CH', faviconUrl: null, order: 7, isDefault: true, createdAt: now, updatedAt: now },
          { id: crypto.randomUUID(), name: 'Classic FM', url: 'https://media-ice.musicradio.com/ClassicFMMP3', category: 'international', genre: 'Classical', country: 'UK', faviconUrl: null, order: 8, isDefault: true, createdAt: now, updatedAt: now },
        ]);
      }
    });
  }
}

export const db = new VitaForgeDB();
