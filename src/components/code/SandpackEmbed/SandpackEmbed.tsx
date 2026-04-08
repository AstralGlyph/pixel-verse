/**
 * @fileoverview SandpackEmbed Sandpack 嵌入组件
 * @description 完整的在线 IDE 沙盒环境，基于 CodeSandbox Sandpack
 */

import { type ReactNode } from 'react';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackConsole,
} from '@codesandbox/sandpack-react';
import type { SandpackProviderProps } from '@codesandbox/sandpack-react';

/**
 * Sandpack 主题类型
 */
export type SandpackTheme = 'light' | 'dark' | 'auto';

/**
 * SandpackEmbed 组件属性
 */
export interface SandpackEmbedProps extends Partial<SandpackProviderProps> {
  /** 主题 */
  theme?: SandpackTheme;
  /** 是否显示控制台 */
  showConsole?: boolean;
  /** 是否显示预览 */
  showPreview?: boolean;
  /** 是否显示文件路径 */
  showFilePath?: boolean;
  /** 是否可编辑 */
  editable?: boolean;
  /** 额外类名 */
  className?: string;
}

/**
 * 自动检测系统主题
 */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Sandpack 嵌入组件
 */
export function SandpackEmbed({
  template = 'react',
  files = {},
  theme = 'auto',
  showConsole = false,
  showPreview = true,
  showFilePath = true,
  editable = true,
  className = '',
  ...rest
}: SandpackEmbedProps): ReactNode {
  // 确定实际使用的主题
  const actualTheme = theme === 'auto' ? getSystemTheme() : theme;

  return (
    <div className={`my-6 sandpack-container ${className}`}>
      <SandpackProvider
        template={template}
        files={files}
        theme={actualTheme}
        {...rest}
      >
        <SandpackLayout>
          <div className="flex-1">
            <SandpackCodeEditor
              showTabs={showFilePath}
              showLineNumbers
              readOnly={!editable}
            />
          </div>
          {showPreview && (
            <div className="flex-1 min-h-[300px]">
              <SandpackPreview
                showNavigator
                showRefreshButton
                showOpenInCodeSandbox={false}
              />
            </div>
          )}
        </SandpackLayout>
        {showConsole && (
          <div className="mt-2">
            <SandpackConsole
              style={{ height: '150px' }}
              showHeader
            />
          </div>
        )}
      </SandpackProvider>
    </div>
  );
}

export default SandpackEmbed;