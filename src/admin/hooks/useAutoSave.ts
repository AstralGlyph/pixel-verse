/**
 * @fileoverview 自动保存 Hook
 * @description 内容变更防抖保存、本地草稿存储、网络恢复同步
 */

import { useEffect, useRef, useCallback, useState } from 'react';

interface UseAutoSaveOptions {
  /** 防抖延迟时间（毫秒） */
  delay?: number;
  /** 保存回调函数 */
  onSave: (content: unknown) => Promise<void>;
  /** 是否启用自动保存 */
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  /** 是否正在保存 */
  isSaving: boolean;
  /** 是否有未保存的更改 */
  isDirty: boolean;
  /** 上次保存成功的时间 */
  lastSavedAt: Date | null;
  /** 上次保存的错误 */
  saveError: string | null;
  /** 手动触发保存 */
  triggerSave: () => Promise<void>;
  /** 启动自动保存 */
  startAutoSave: (content: unknown) => void;
  /** 停止自动保存 */
  stopAutoSave: () => void;
}

export function useAutoSave({
  delay = 3000,
  onSave,
  enabled = true,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const contentRef = useRef<unknown>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enabledRef = useRef(enabled);

  // 更新 enabled 引用
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // 执行保存
  const performSave = useCallback(async () => {
    if (!contentRef.current) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      await onSave(contentRef.current);
      setLastSavedAt(new Date());
      setIsDirty(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setIsSaving(false);
    }
  }, [onSave]);

  // 启动自动保存
  const startAutoSave = useCallback(
    (content: unknown) => {
      contentRef.current = content;
      setIsDirty(true);

      if (!enabledRef.current) return;

      // 清除之前的定时器
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // 设置新的防抖定时器
      timerRef.current = setTimeout(() => {
        performSave();
      }, delay);
    },
    [delay, performSave]
  );

  // 停止自动保存
  const stopAutoSave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 手动触发保存
  const triggerSave = useCallback(async () => {
    stopAutoSave();
    await performSave();
  }, [stopAutoSave, performSave]);

  return {
    isSaving,
    isDirty,
    lastSavedAt,
    saveError,
    triggerSave,
    startAutoSave,
    stopAutoSave,
  };
}

export default useAutoSave;
