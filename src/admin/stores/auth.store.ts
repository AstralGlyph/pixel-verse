/**
 * @fileoverview 认证状态管理
 * @description 使用 Zustand 管理已认证用户状态
 * @dependencies zustand
 */

import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  setUser: (user: User | null) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  /** 从 API 获取当前用户 */
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/admin/auth/me');
      if (!res.ok) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }
      const json = await res.json();
      set({ user: json.data, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : '获取用户信息失败',
        isLoading: false,
      });
    }
  },
}));
