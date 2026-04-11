/**
 * @fileoverview 用户管理页面
 * @description 用户列表、创建、编辑角色、重置密码、删除（仅超级管理员）— Bento + Glassmorphism 风格
 */

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, KeyRound, X, UserPlus } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  displayName: string;
  readOnly: boolean;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: { id: string; name: string; displayName: string } | null;
  createdAt: string;
}

interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  roleId: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<CreateUserInput>({
    username: '',
    email: '',
    password: '',
    roleId: '',
  });
  const [resetPassword, setResetPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.data);
    } catch (err) {
      setError('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/admin/roles');
      const data = await res.json();
      if (data.data) {
        setRoles(data.data);
      }
    } catch (err) {
      setError('获取角色列表失败');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (data.data) {
        setSuccess('用户创建成功');
        setShowCreateModal(false);
        setNewUser({ username: '', email: '', password: '', roleId: '' });
        fetchUsers();
      } else {
        setError(data.error?.message || '创建用户失败');
      }
    } catch (err) {
      setError('创建用户失败');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedUser) return;

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: resetPassword }),
      });
      const data = await res.json();
      if (data.data) {
        setSuccess('密码重置成功');
        setShowResetModal(false);
        setResetPassword('');
        setSelectedUser(null);
      } else {
        setError(data.error?.message || '重置密码失败');
      }
    } catch (err) {
      setError('重置密码失败');
    }
  };

  const handleUpdateRole = async (userId: string, roleId: string) => {
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId }),
      });
      const data = await res.json();
      if (data.data) {
        setSuccess('角色更新成功');
        fetchUsers();
      } else {
        setError(data.error?.message || '更新角色失败');
      }
    } catch (err) {
      setError('更新角色失败');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('确定要删除此用户吗？此操作不可撤销。')) return;

    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      if (res.status === 204) {
        setSuccess('用户已删除');
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.error?.message || '删除用户失败');
      }
    } catch (err) {
      setError('删除用户失败');
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'super_admin': return 'border-red-500/30 bg-red-500/10 text-red-400';
      case 'editor': return 'border-blue-500/30 bg-blue-500/10 text-blue-400';
      case 'author': return 'border-green-500/30 bg-green-500/10 text-green-400';
      default: return 'border-text-tertiary/30 bg-text-tertiary/10 text-text-tertiary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">加载中...</div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto page-content">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">用户管理</h1>
          <p className="text-text-secondary mt-1">管理系统用户和角色分配</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-md shadow-sm hover:-translate-y-[1px] hover:shadow-md transition-all duration-fast ease-smooth"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <UserPlus size={18} />
          创建用户
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 border border-error/30 bg-error/10 text-error rounded-lg">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 border border-success/30 bg-success/10 text-success rounded-lg">{success}</div>
      )}

      {/* 用户列表 */}
      <div className="glass-card overflow-hidden rounded-xl overflow-x-auto">
        <table className="min-w-full divide-y divide-glass-border">
          <thead className="bg-glass-bg-subtle">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase">用户名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase">邮箱</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase">角色</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase">创建时间</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-text-tertiary uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-glass-border">
            {users.map(user => (
              <tr key={user.id} className="transition-colors duration-fast hover:bg-glass-bg-hover">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-text-primary">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-text-secondary">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role?.id || ''}
                    onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                    className="text-sm border border-glass-border bg-glass-bg-subtle backdrop-blur rounded-md px-2 py-1 text-text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.displayName}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-text-tertiary">
                  {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  <button
                    onClick={() => { setSelectedUser(user); setShowResetModal(true); }}
                    className="inline-flex items-center justify-center p-1.5 rounded-md text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 transition-all duration-fast"
                    title="重置密码"
                  >
                    <KeyRound size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="inline-flex items-center justify-center p-1.5 rounded-md text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all duration-fast"
                    title="删除用户"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="p-8 text-center text-text-tertiary">暂无用户</div>
        )}
      </div>

      {/* 创建用户模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-text-primary">创建用户</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-text-secondary hover:text-text-primary transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">用户名</label>
                <input
                  type="text"
                  required
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full border border-glass-border bg-glass-bg-subtle backdrop-blur rounded-md px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-fast"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">邮箱</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full border border-glass-border bg-glass-bg-subtle backdrop-blur rounded-md px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-fast"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">密码</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full border border-glass-border bg-glass-bg-subtle backdrop-blur rounded-md px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-fast"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">角色</label>
                <select
                  required
                  value={newUser.roleId}
                  onChange={(e) => setNewUser({ ...newUser, roleId: e.target.value })}
                  className="w-full border border-glass-border bg-glass-bg-subtle backdrop-blur rounded-md px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-fast"
                >
                  <option value="">选择角色</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.displayName}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-glass-border rounded-md text-text-secondary hover:bg-glass-bg-hover transition-all duration-fast"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-md hover:-translate-y-[1px] hover:shadow-md transition-all duration-fast ease-smooth"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 重置密码模态框 */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-text-primary">重置密码</h2>
              <button onClick={() => { setShowResetModal(false); setSelectedUser(null); }} className="text-text-secondary hover:text-text-primary transition-colors">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-text-secondary mb-4">为用户 <strong className="text-text-primary">{selectedUser.username}</strong> 重置密码</p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">新密码</label>
                <input
                  type="password"
                  required
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  className="w-full border border-glass-border bg-glass-bg-subtle backdrop-blur rounded-md px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-fast"
                  placeholder="输入新密码"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowResetModal(false); setSelectedUser(null); }}
                  className="px-4 py-2 border border-glass-border rounded-md text-text-secondary hover:bg-glass-bg-hover transition-all duration-fast"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-warning text-white rounded-md hover:-translate-y-[1px] hover:shadow-md transition-all duration-fast ease-smooth"
                >
                  重置密码
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
