/**
 * @fileoverview CodePlayground 代码游乐场组件
 * @description 嵌入式代码编辑器 + 实时预览
 */

import { type ReactNode, useState, useCallback } from 'react';

/**
 * 支持的语言类型
 */
export type PlaygroundLanguage = 'react' | 'html' | 'css' | 'javascript' | 'typescript';

/**
 * CodePlayground 组件属性
 */
export interface CodePlaygroundProps {
  /** 初始代码 */
  code?: string;
  /** 语言类型 */
  language?: PlaygroundLanguage;
  /** 标题 */
  title?: string;
  /** 是否显示预览 */
  showPreview?: boolean;
  /** 是否可编辑 */
  editable?: boolean;
  /** 额外类名 */
  className?: string;
}

/**
 * 默认代码模板
 */
const defaultTemplates: Record<PlaygroundLanguage, string> = {
  react: `function App() {
  const [count, setCount] = React.useState(0);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">计数器: {count}</h1>
      <button
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => setCount(c => c + 1)}
      >
        增加
      </button>
    </div>
  );
}`,
  html: `<div class="container">
  <h1>Hello World</h1>
  <p>这是一个 HTML 示例</p>
</div>

<style>
  .container {
    padding: 20px;
    font-family: sans-serif;
  }
  h1 {
    color: #333;
  }
</style>`,
  css: `.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
}

.button:hover {
  transform: scale(1.05);
}`,
  javascript: `// JavaScript 示例
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');

// 数组操作示例
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log('Doubled:', doubled);`,
  typescript: `// TypeScript 示例
interface User {
  id: number;
  name: string;
  email: string;
}

function createUser(name: string, email: string): User {
  return {
    id: Math.floor(Math.random() * 1000),
    name,
    email,
  };
}

const user = createUser('Alice', 'alice@example.com');
console.log(user);`,
};

/**
 * CodePlayground 组件
 */
export function CodePlayground({
  code: initialCode,
  language = 'javascript',
  title,
  showPreview = true,
  editable = true,
  className = '',
}: CodePlaygroundProps): ReactNode {
  const [code, setCode] = useState(initialCode || defaultTemplates[language]);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');

  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  }, []);

  return (
    <div className={`my-6 rounded-lg border border-border overflow-hidden ${className}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-2 bg-bg-tertiary border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary">
            {title || '代码游乐场'}
          </span>
          <span className="text-xs text-text-tertiary bg-bg px-2 py-0.5 rounded">
            {language.toUpperCase()}
          </span>
        </div>
        {showPreview && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                activeTab === 'code'
                  ? 'bg-accent text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              代码
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                activeTab === 'preview'
                  ? 'bg-accent text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              预览
            </button>
          </div>
        )}
      </div>

      {/* 内容区域 */}
      <div className="relative">
        {activeTab === 'code' ? (
          <div className="relative">
            <textarea
              value={code}
              onChange={editable ? handleCodeChange : undefined}
              readOnly={!editable}
              className="w-full min-h-[200px] p-4 font-mono text-sm bg-bg-secondary text-text-primary resize-y focus:outline-none focus:ring-2 focus:ring-accent"
              spellCheck={false}
            />
            {/* 行号覆盖层 */}
            <div className="absolute top-0 left-0 p-4 font-mono text-sm text-text-tertiary pointer-events-none select-none opacity-50">
              {code.split('\n').map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          </div>
        ) : (
          <div className="min-h-[200px] p-4 bg-white">
            {/* 简化的预览区域 - 实际项目中可使用 Sandpack 或 iframe */}
            <iframe
              srcDoc={`
                <!DOCTYPE html>
                <html>
                  <head>
                    <script src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
                    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
                    <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
                    <style>
                      body { margin: 0; font-family: sans-serif; }
                    </style>
                  </head>
                  <body>
                    <div id="root"></div>
                    <script type="text/babel">
                      ${code}
                      ReactDOM.render(<App />, document.getElementById('root'));
                    <\/script>
                  </body>
                </html>
              `}
              className="w-full h-[200px] border-0"
              title="代码预览"
              sandbox="allow-scripts"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default CodePlayground;