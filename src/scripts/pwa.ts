/**
 * @fileoverview PWA Service Worker 注册
 * @description 在客户端注册 Service Worker 实现离线缓存
 */

export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker 注册成功:', registration.scope);
        })
        .catch((error) => {
          console.error('[PWA] Service Worker 注册失败:', error);
        });
    });
  }
}
