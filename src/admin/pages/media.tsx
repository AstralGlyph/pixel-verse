/**
 * @fileoverview 媒体库页面
 * @description 网格/列表视图、拖拽上传、文件预览、搜索、删除 — Bento + Glassmorphism 风格
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Button } from '../components/common/Button';
import { Upload, Search, Grid, List as ListIcon, Trash2, X, Image as ImageIcon } from 'lucide-react';

interface MediaItem {
  id: string;
  filename: string;
  storedPath: string;
  mimeType: string;
  fileSize: number;
  altText: string | null;
  uploader: { id: string; username: string };
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export function MediaLibraryPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    perPage: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [savingAltTextId, setSavingAltTextId] = useState<string | null>(null);
  const [localAltText, setLocalAltText] = useState<Record<string, string>>({});

  const fetchMedia = async (page: number, searchQuery?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(pagination.perPage),
      });
      if (searchQuery) params.set('search', searchQuery);

      const response = await fetch(`/api/admin/media?${params.toString()}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('获取媒体列表失败');
      const data = await response.json();
      setMediaList(data.data.data);
      setPagination(data.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia(pagination.page, search || undefined);
  }, []);

  const handleSearch = () => {
    fetchMedia(1, search || undefined);
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/admin/media', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (!response.ok) throw new Error(`上传失败: ${file.name}`);
      }
      fetchMedia(pagination.page, search || undefined);
    } catch (err) {
      alert(err instanceof Error ? err.message : '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个文件吗？')) return;

    try {
      const response = await fetch(`/api/admin/media/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('删除失败');

      fetchMedia(pagination.page, search || undefined);
      if (selectedId === id) setSelectedId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handleAltTextChange = async (id: string) => {
    const newAltText = localAltText[id] ?? mediaList.find((m) => m.id === id)?.altText ?? '';
    setSavingAltTextId(id);
    try {
      const response = await fetch(`/api/admin/media/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ altText: newAltText || null }),
      });
      if (!response.ok) throw new Error('保存失败');

      setMediaList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, altText: newAltText || null } : item))
      );
      setLocalAltText((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : '保存 alt 文本失败');
    } finally {
      setSavingAltTextId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = (mimeType: string) => mimeType.startsWith('image/');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, []);

  if (loading && mediaList.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-text-tertiary">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 page-content">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">媒体库</h1>
        <div className="flex items-center gap-2">
          <button
            className={`rounded-md p-2 transition-all duration-fast ${viewMode === 'grid' ? 'bg-bg-secondary text-accent-primary' : 'text-text-secondary hover:bg-bg-secondary'}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            className={`rounded-md p-2 transition-all duration-fast ${viewMode === 'list' ? 'bg-bg-secondary text-accent-primary' : 'text-text-secondary hover:bg-bg-secondary'}`}
            onClick={() => setViewMode('list')}
          >
            <ListIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 搜索和上传 */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            className="w-full rounded-lg border border-glass-border bg-glass-bg-subtle py-2 pl-10 pr-4 text-sm text-text-primary backdrop-blur placeholder-text-tertiary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-fast"
            placeholder="搜索文件..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        <Button variant="primary" size="md" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          <Upload className="mr-1 h-4 w-4" />
          {uploading ? '上传中...' : '上传文件'}
        </Button>
      </div>

      {/* 拖拽上传区域 */}
      <div
        className={`rounded-xl border-2 border-dashed p-8 text-center transition-all duration-fast backdrop-blur ${
          dragOver ? 'border-accent-primary bg-accent-primary/10' : 'border-glass-border bg-glass-bg-subtle'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-8 w-8 text-text-tertiary" />
        <p className="mt-2 text-sm text-text-secondary">拖拽文件到此处上传</p>
      </div>

      {/* 媒体网格 */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {mediaList.map((item) => (
            <div
              key={item.id}
              className={`group relative cursor-pointer rounded-lg border bg-glass-bg-subtle p-2 backdrop-blur transition-all duration-fast ${
                selectedId === item.id ? 'border-accent-primary ring-2 ring-accent-primary/30' : 'border-glass-border hover:shadow-md'
              }`}
              onClick={() => setSelectedId(item.id)}
              onDoubleClick={() => setPreviewItem(item)}
            >
              <div className="aspect-square overflow-hidden rounded bg-glass-bg-hover">
                {isImage(item.mimeType) ? (
                  <img
                    src={`/${item.storedPath}`}
                    alt={item.altText || item.filename}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-text-tertiary" />
                  </div>
                )}
              </div>
              <div className="mt-2 truncate">
                <p className="text-xs font-medium text-text-primary" title={item.filename}>
                  {item.filename}
                </p>
                <p className="text-xs text-text-tertiary">{formatFileSize(item.fileSize)}</p>
                <input
                  className="mt-1 w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-xs text-text-primary placeholder-text-tertiary focus:border-glass-border focus:bg-glass-bg-subtle focus:outline-none transition-all duration-fast"
                  placeholder="添加描述..."
                  value={localAltText[item.id] ?? item.altText ?? ''}
                  onChange={(e) => setLocalAltText((prev) => ({ ...prev, [item.id]: e.target.value }))}
                  onBlur={() => handleAltTextChange(item.id)}
                  disabled={savingAltTextId === item.id}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <button
                className="absolute right-1 top-1 rounded bg-glass-bg p-1 opacity-0 shadow transition-opacity hover:text-error group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card overflow-hidden rounded-xl">
          <table className="min-w-full divide-y divide-glass-border">
            <thead className="bg-glass-bg-subtle">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">文件</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">描述</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">类型</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">大小</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">上传者</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-tertiary">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border">
              {mediaList.map((item) => (
                <tr
                  key={item.id}
                  className={`cursor-pointer transition-colors duration-fast hover:bg-bg-secondary ${selectedId === item.id ? 'bg-bg-secondary' : ''}`}
                  onClick={() => setSelectedId(item.id)}
                  onDoubleClick={() => setPreviewItem(item)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isImage(item.mimeType) ? (
                        <img src={`/${item.storedPath}`} alt={item.filename} className="h-8 w-8 rounded object-cover" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-text-tertiary" />
                      )}
                      <span className="text-sm font-medium text-text-primary">{item.filename}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      className="w-full rounded border border-transparent bg-transparent px-2 py-1 text-sm text-text-primary placeholder-text-tertiary focus:border-glass-border focus:bg-glass-bg-subtle focus:outline-none transition-all duration-fast"
                      placeholder="添加描述..."
                      value={localAltText[item.id] ?? item.altText ?? ''}
                      onChange={(e) => setLocalAltText((prev) => ({ ...prev, [item.id]: e.target.value }))}
                      onBlur={() => handleAltTextChange(item.id)}
                      disabled={savingAltTextId === item.id}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{item.mimeType}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{formatFileSize(item.fileSize)}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{item.uploader?.username}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className="rounded p-1 text-error/80 transition-colors hover:text-error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 空状态 */}
      {mediaList.length === 0 && !loading && (
        <div className="glass-card rounded-xl p-8 text-center text-text-tertiary">暂无媒体文件</div>
      )}

      {/* 分页 */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-text-secondary">
            共 {pagination.total} 个文件，第 {pagination.page}/{pagination.totalPages} 页
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-md border-2 border-glass-border bg-glass-bg px-3 py-1 text-sm font-medium text-text-primary backdrop-blur transition-all duration-fast disabled:opacity-50 hover:bg-glass-bg-hover"
              disabled={pagination.page <= 1}
              onClick={() => fetchMedia(pagination.page - 1, search || undefined)}
            >
              上一页
            </button>
            <button
              className="rounded-md border-2 border-glass-border bg-glass-bg px-3 py-1 text-sm font-medium text-text-primary backdrop-blur transition-all duration-fast disabled:opacity-50 hover:bg-glass-bg-hover"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchMedia(pagination.page + 1, search || undefined)}
            >
              下一页
            </button>
          </div>
        </div>
      )}

      {/* 预览模态框 */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative max-h-[90vh] max-w-[90vw] rounded-xl glass-card p-4">
            <button
              className="absolute right-2 top-2 rounded p-1 text-text-secondary hover:text-text-primary transition-colors"
              onClick={() => setPreviewItem(null)}
            >
              <X className="h-5 w-5" />
            </button>
            {isImage(previewItem.mimeType) ? (
              <img
                src={`/${previewItem.storedPath}`}
                alt={previewItem.altText || previewItem.filename}
                className="max-h-[80vh] max-w-full object-contain"
              />
            ) : (
              <div className="flex h-48 w-64 items-center justify-center">
                <p className="text-text-tertiary">不支持预览此文件类型</p>
              </div>
            )}
            <div className="mt-3 text-sm text-text-secondary">
              <p className="font-medium text-text-primary">{previewItem.filename}</p>
              <p>{formatFileSize(previewItem.fileSize)}</p>
              <p>上传于 {new Date(previewItem.createdAt).toLocaleDateString('zh-CN')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MediaLibraryPage;
