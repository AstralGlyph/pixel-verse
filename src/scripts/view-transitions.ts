/**
 * @fileoverview View Transitions API 封装
 * @description 提供页面过渡动画和主题切换动画支持
 */

/**
 * 检查浏览器是否支持 View Transitions API
 */
export function supportsViewTransitions(): boolean {
  return typeof document !== 'undefined' && 'startViewTransition' in document;
}

/**
 * 使用 View Transitions API 执行回调
 * @param callback - 要执行的回调函数
 * @returns 是否成功执行
 */
export function withViewTransition(callback: () => void): boolean {
  if (!supportsViewTransitions()) {
    callback();
    return false;
  }

  document.startViewTransition(callback);
  return true;
}

/**
 * 主题切换动画
 * 使用圆形扩散动画效果
 * @param newTheme - 新主题
 * @param event - 点击事件（用于获取动画起点）
 */
export function animateThemeTransition(
  newTheme: 'light' | 'dark',
  event?: MouseEvent
): void {
  if (!supportsViewTransitions()) {
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    return;
  }

  // 获取动画起点（点击位置或默认为中心）
  const x = event?.clientX ?? window.innerWidth / 2;
  const y = event?.clientY ?? window.innerHeight / 2;

  // 计算最大半径（覆盖整个视口）
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  // 设置 CSS 变量
  document.documentElement.style.setProperty('--transition-x', `${x}px`);
  document.documentElement.style.setProperty('--transition-y', `${y}px`);
  document.documentElement.style.setProperty('--transition-radius', `${endRadius}px`);

  // 执行过渡动画
  const transition = document.startViewTransition(() => {
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  // 动画结束后清理
  transition.finished.then(() => {
    document.documentElement.style.removeProperty('--transition-x');
    document.documentElement.style.removeProperty('--transition-y');
    document.documentElement.style.removeProperty('--transition-radius');
  });
}

/**
 * 页面过渡动画类型
 */
export type PageTransitionType = 'fade' | 'slide' | 'none';

/**
 * 页面过渡配置
 */
export interface PageTransitionOptions {
  /** 过渡类型 */
  type?: PageTransitionType;
  /** 过渡持续时间（毫秒） */
  duration?: number;
}

/**
 * 添加页面过渡样式
 */
export function setupPageTransitions(options: PageTransitionOptions = {}): void {
  const { type = 'fade', duration = 300 } = options;

  if (!supportsViewTransitions()) return;

  // 添加 CSS 样式
  const style = document.createElement('style');
  style.textContent = `
    @keyframes page-transition-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes page-transition-fade-out {
      from { opacity: 1; }
      to { opacity: 0; }
    }

    @keyframes page-transition-slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    @keyframes page-transition-slide-out {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(-100%); opacity: 0; }
    }

    ::view-transition-old(root) {
      animation: page-transition-${type}-out ${duration}ms ease-out;
    }

    ::view-transition-new(root) {
      animation: page-transition-${type}-in ${duration}ms ease-in;
    }

    /* 主题切换圆形扩散动画 */
    ::view-transition-old(root),
    ::view-transition-new(root) {
      animation: none;
      mix-blend-mode: normal;
    }

    ::view-transition-new(root) {
      clip-path: circle(0% at var(--transition-x, 50%) var(--transition-y, 50%));
      animation: theme-transition-circle var(--transition-duration, 500ms) ease-out;
    }

    @keyframes theme-transition-circle {
      to {
        clip-path: circle(var(--transition-radius, 100%) at var(--transition-x, 50%) var(--transition-y, 50%));
      }
    }
  `;
  document.head.appendChild(style);
}

export default {
  supportsViewTransitions,
  withViewTransition,
  animateThemeTransition,
  setupPageTransitions,
};