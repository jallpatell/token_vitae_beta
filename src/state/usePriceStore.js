import { create } from 'zustand';

export const usePriceStore = create((set) => ({
  priceData: null, // { price, source }
  isLoading: false,
  progress: 0,
  error: null,
  setPriceData: (data) => set({ priceData: data }),
  setIsLoading: (flag) => set({ isLoading: flag }),
  setProgress: (progress) => set({ progress }),
  setError: (error) => set({ error }),
})); 