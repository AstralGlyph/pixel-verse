/**
 * @fileoverview 媒体选择器组件
 * @description 模态框选择已有媒体文件，返回选中文件的 URL — Glassmorphism 风格
 */

import React, { useState, useEffect } from 'react';
import { X, Search, Image, Check } from 'lucide-react';

interface MediaItem {
  id: string;
  filename: string;
  storedPath: string;
  mimeType: string;
  fileSize: number;
  altText: string | null;
}

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, altText: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPicker({ isOpen, onClose, onSelect }: MediaPickerProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      setSelectedId(null);
      setSearch('');
      setPage(1);
    }
  }, [isOpen, page]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: '20',
      });
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/media?${params}`);
      const data = await res.json();
      const items = data.data?.data || data.data || [];
      if (Array.isArray(items)) {
        setMedia(items);
        setTotalPages(data.data?.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('获取媒体列表失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMedia();
  };

  const handleSelect = (item: MediaItem) => {
    setSelectedId(item.id);
    const url = `/${item.storedPath}`;
    const altText = item.altText || item.filename;
    onSelect(url, altText);
    onClose();
  };

  const isImage = (mimeType: string) => mimeType.startsWith('image/');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card flex max-h-[80vh] w-full max-w-4xl flex-col rounded-xl">
        {/* 头部 */}
        <div className="flex items-center justify-between border-b border-glass-border p-4">
          <h2 className="text-lg font-semibold text-text-primary">选择媒体文件</h2>
          <button onClick={onClose} className="text-text-secondary transition-colors hover:text-text-primary">
            <X size={20} />
          </button>
        </div>

        {/* 搜索 */}
        <form onSubmit={handleSearch} className="border-b border-glass-border p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索文件名..."
                className="w-full rounded-md border border-glass-border bg-glass-bg-subtle backdrop-blur pl-10 pr-4 py-2 text-text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-fast"
              />
            </div>
            <button
              type="submit"
              className="rounded-md px-4 py-2 text-white shadow-sm transition-all duration-fast ease-smooth hover:-translate-y-[1px] hover:shadow-md"
              style={{ background: 'var(--gradient-primary)' }}
            >
              搜索
            </button>
          </div>
        </form>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-text-tertiary">加载中...</div>
          ) : media.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-text-tertiary">
              <Image size={48} className="mb-2 text-text-tertiary/50" />
              <p>暂无媒体文件</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {media.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all duration-fast ${
                    selectedId === item.id
                      ? 'border-accent-primary ring-2 ring-accent-primary/30'
                      : 'border-glass-border hover:border-accent-primary/50'
                  }`}
                >
                  {isImage(item.mimeType) ? (
                    <img
                      src={`/${item.storedPath}`}
                      alt={item.altText || item.filename}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-glass-bg-subtle">
                      <Image size={32} className="text-text-tertiary" />
                    </div>
                  )}
                  {selectedId === item.id && (
                    <div className="absolute right-2 top-2 rounded-full bg-accent-primary p-1 text-white">
                      <Check size={14} />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 text-xs text-white truncate">
                    {item.filename}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-glass-border px-4 py-3">
            <div className="text-sm text-text-secondary">
              第 {page} / {totalPages} 页
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border-2 border-glass-border bg-glass-bg px-3 py-1 text-text-primary backdrop-blur transition-all duration-fast disabled:cursor-not-allowed disabled:opacity-50 hover:bg-glass-bg-hover"
              >
                上一页
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-md border-2 border-glass-border bg-glass-bg px-3 py-1 text-text-primary backdrop-blur transition-all duration-fast disabled:cursor-not-allowed disabled:opacity-50 hover:bg-glass-bg-hover"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
