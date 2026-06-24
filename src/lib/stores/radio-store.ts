import { create } from 'zustand';
import type { RadioStation } from '@/lib/db/schema';

interface RadioState {
  activeStation: RadioStation | null;
  setActiveStation: (station: RadioStation | null) => void;
}

export const useRadioStore = create<RadioState>((set) => ({
  activeStation: null,
  setActiveStation: (station) => set({ activeStation: station }),
}));
