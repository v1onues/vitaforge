import { create } from 'zustand';
import { db } from '../db/schema';
import { encryption } from '../crypto/encryption';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastActivity: number;
  isSetup: boolean | null;
  
  setup: (password: string) => Promise<void>;
  login: (password: string) => Promise<void>;
  logout: () => void;
  checkTimeout: () => void;
  updateActivity: () => void;
  checkSetup: () => Promise<void>;
}

const MAX_ATTEMPTS = 5;
const ATTEMPT_DELAY = 30000;

let failedAttempts = 0;
let lastFailedAttempt = 0;

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: false,
  error: null,
  lastActivity: Date.now(),
  isSetup: null,

  checkSetup: async () => {
    try {
      const profile = await db.profiles.get('main');
      set({ isSetup: !!profile });
    } catch {
      set({ isSetup: false });
    }
  },

  setup: async (password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const { salt, verifier } = await encryption.setupPassword(password);
      
      await db.profiles.put({
        id: 'main',
        salt,
        verifier,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      
      await db.settings.put({
        id: 'main',
        theme: 'dark',
        language: 'tr',
        lockTimeout: 15,
        autoBackup: false,
        backupInterval: 24,
        lastBackupAt: null,
        aiProvider: '',
        aiApiKey: '',
        aiModel: '',
        tmdbApiKey: '',
        rawgApiKey: '',
        googleBooksApiKey: '',
        lastfmApiKey: '',
      });
      
      set({
        isAuthenticated: true,
        isLoading: false,
        isSetup: true,
        lastActivity: Date.now()
      });
    } catch {
      set({
        isLoading: false,
        error: 'Kurulum başarısız oldu'
      });
    }
  },

  login: async (password: string) => {
    if (failedAttempts >= MAX_ATTEMPTS) {
      const timeSinceLastAttempt = Date.now() - lastFailedAttempt;
      if (timeSinceLastAttempt < ATTEMPT_DELAY) {
        const remaining = Math.ceil(
          (ATTEMPT_DELAY - timeSinceLastAttempt) / 1000
        );
        set({ error: `Çok fazla deneme. ${remaining} sn bekleyin.` });
        return;
      }
      failedAttempts = 0;
    }

    set({ isLoading: true, error: null });
    
    try {
      const profile = await db.profiles.get('main');
      
      if (!profile) {
        set({
          isLoading: false,
          error: 'Profil bulunamadı'
        });
        return;
      }
      
      const isValid = await encryption.verifyPassword(
        password,
        profile.salt,
        profile.verifier
      );
      
      if (!isValid) {
        failedAttempts++;
        lastFailedAttempt = Date.now();
        set({
          isLoading: false,
          error: `Yanlış şifre (${failedAttempts}/${MAX_ATTEMPTS})`
        });
        return;
      }
      
      failedAttempts = 0;
      set({
        isAuthenticated: true,
        isLoading: false,
        lastActivity: Date.now()
      });
    } catch {
      set({
        isLoading: false,
        error: 'Giriş başarısız oldu'
      });
    }
  },

  logout: () => {
    encryption.clearSession();
    set({
      isAuthenticated: false,
      error: null
    });
  },

  checkTimeout: async () => {
    const { lastActivity, isAuthenticated } = get();
    if (!isAuthenticated) return;

    const settings = await db.settings.get('main');
    const lockTimeoutMs = (settings?.lockTimeout ?? 15) * 60 * 1000;

    if (Date.now() - lastActivity > lockTimeoutMs) {
      get().logout();
    }
  },

  updateActivity: () => {
    set({ lastActivity: Date.now() });
  }
}));
