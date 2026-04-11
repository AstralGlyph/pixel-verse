/**
 * @fileoverview 全局类型声明
 * @description 扩展 Window 接口以支持自定义方法
 */

declare global {
  interface Window {
    /**
     * 切换主题方法
     */
    toggleTheme?: () => void;
  }
}

export {};