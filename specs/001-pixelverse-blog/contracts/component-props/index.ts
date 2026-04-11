/**
 * Core Component Props Type Definitions
 *
 * 定义核心交互组件的 Props 类型契约
 */

// ============================================
// UI 基础组件
// ============================================

/**
 * Callout 提示框组件
 * 用于文章中的信息提示、警告、错误提示
 */
export interface CalloutProps {
  /** 提示框类型 */
  type: 'info' | 'warn' | 'error' | 'tip';
  /** 可选标题 */
  title?: string;
  /** 子内容 */
  children: React.ReactNode;
  /** 是否可折叠 */
  collapsible?: boolean;
  /** 默认展开状态（collapsible 为 true 时有效） */
  defaultOpen?: boolean;
}

/**
 * Tabs 标签切换组件
 * 用于多标签内容切换（如不同语言代码对比）
 */
export interface TabsProps {
  /** 标签页配置 */
  tabs: Array<{
    /** 标签名称 */
    label: string;
    /** 标签 ID */
    id: string;
  }>;
  /** 默认激活的标签 ID */
  defaultTab?: string;
  /** 子内容（Tabs.Tab 子组件） */
  children: React.ReactNode;
  /** 标签切换回调 */
  onChange?: (tabId: string) => void;
}

/**
 * Accordion 折叠组件
 * 用于可折叠内容块
 */
export interface AccordionProps {
  /** 折叠项配置 */
  items: Array<{
    /** 标题 */
    title: string;
    /** 内容 */
    content: React.ReactNode;
    /** 默认展开状态 */
    defaultOpen?: boolean;
  }>;
  /** 是否允许同时展开多项 */
  allowMultiple?: boolean;
}

/**
 * ImageCompare 图片对比组件
 * 用于 Before/After 图片对比滑块
 */
export interface ImageCompareProps {
  /** Before 图片 */
  before: {
    src: string;
    alt: string;
  };
  /** After 图片 */
  after: {
    src: string;
    alt: string;
  };
  /** 初始滑块位置（0-1） */
  initialPosition?: number;
  /** 是否显示标签 */
  showLabels?: boolean;
}

// ============================================
// 代码相关组件
// ============================================

/**
 * CodePlayground 代码游乐场组件
 * 嵌入式代码编辑器 + 实时预览
 */
export interface CodePlaygroundProps {
  /** 初始代码 */
  code: string;
  /** 语言/模板类型 */
  template?: 'react' | 'vanilla' | 'node' | 'typescript';
  /** 标题 */
  title?: string;
  /** 是否显示文件树 */
  showNavigator?: boolean;
  /** 编辑器高度 */
  editorHeight?: number | string;
  /** 是否显示行号 */
  showLineNumbers?: boolean;
  /** 主题 */
  theme?: 'light' | 'dark' | 'auto';
}

/**
 * CodeBlock 代码块组件
 * Shiki 编译时高亮的代码块
 */
export interface CodeBlockProps {
  /** 代码内容 */
  code: string;
  /** 语言 */
  lang: string;
  /** 文件名标签 */
  filename?: string;
  /** 是否显示行号 */
  showLineNumbers?: boolean;
  /** 高亮行（数组或范围字符串） */
  highlightLines?: Array<number | string>;
  /** 是否显示复制按钮 */
  showCopy?: boolean;
  /** 是否可折叠 */
  collapsible?: boolean;
  /** 折叠时显示的行数 */
  collapseLines?: number;
}

/**
 * SandpackEmbed 组件
 * 完整的在线 IDE 沙盒环境
 */
export interface SandpackEmbedProps {
  /** 模板类型 */
  template: 'react' | 'vue' | 'vanilla' | 'node';
  /** 文件内容 */
  files: Record<string, string>;
  /** 依赖 */
  dependencies?: Record<string, string>;
  /** Sandpack 主题 */
  theme?: 'light' | 'dark' | 'auto';
  /** 编辑器高度 */
  height?: number | string;
  /** 是否显示预览 */
  showPreview?: boolean;
}

// ============================================
// 布局组件
// ============================================

/**
 * TOC 目录导航组件
 */
export interface TOCProps {
  /** 目录项 */
  items: Array<{
    /** 标题文本 */
    text: string;
    /** 标题级别 */
    depth: number;
    /** 锚点 ID */
    slug: string;
  }>;
  /** 当前高亮的锚点 ID */
  activeId?: string;
  /** 点击回调 */
  onItemClick?: (slug: string) => void;
}

/**
 * Header 导航栏组件
 */
export interface HeaderProps {
  /** Logo 配置 */
  logo?: {
    src: string;
    alt: string;
    href?: string;
  };
  /** 导航链接 */
  links?: Array<{
    label: string;
    href: string;
    isExternal?: boolean;
  }>;
  /** 是否显示主题切换按钮 */
  showThemeToggle?: boolean;
  /** 是否显示搜索入口 */
  showSearch?: boolean;
}

// ============================================
// 交互组件
// ============================================

/**
 * CommandPalette 命令面板组件
 */
export interface CommandPaletteProps {
  /** 搜索占位符 */
  placeholder?: string;
  /** 搜索结果分组 */
  groups?: Array<{
    id: string;
    label: string;
    items: Array<{
      id: string;
      label: string;
      description?: string;
      icon?: React.ReactNode;
      action: () => void;
    }>;
  }>;
  /** 是否打开 */
  open?: boolean;
  /** 关闭回调 */
  onClose?: () => void;
  /** 选择回调 */
  onSelect?: (itemId: string, groupId: string) => void;
}

/**
 * ThemeToggle 主题切换组件
 */
export interface ThemeToggleProps {
  /** 当前主题 */
  theme?: 'dark' | 'light' | 'system';
  /** 主题切换回调 */
  onChange?: (theme: 'dark' | 'light' | 'system') => void;
  /** 是否显示标签 */
  showLabel?: boolean;
}

/**
 * Search 搜索组件
 */
export interface SearchProps {
  /** 搜索索引路径 */
  indexPath?: string;
  /** 占位符 */
  placeholder?: string;
  /** 是否显示子结果 */
  showSubResults?: boolean;
}

/**
 * NewsletterForm 订阅表单组件
 */
export interface NewsletterFormProps {
  /** 表单标题 */
  title?: string;
  /** 描述文本 */
  description?: string;
  /** 占位符 */
  placeholder?: string;
  /** 提交按钮文本 */
  submitText?: string;
  /** 成功消息 */
  successMessage?: string;
  /** 提交回调 */
  onSubmit?: (email: string) => Promise<void>;
}

// ============================================
// 社交组件
// ============================================

/**
 * ShareButtons 分享按钮组件
 */
export interface ShareButtonsProps {
  /** 分享 URL */
  url: string;
  /** 分享标题 */
  title: string;
  /** 分享描述 */
  description?: string;
  /** 分享平台 */
  platforms?: Array<'twitter' | 'linkedin' | 'facebook' | 'copy'>;
  /** 是否显示标签 */
  showLabels?: boolean;
}

/**
 * Reactions 反应组件
 */
export interface ReactionsProps {
  /** 文章 ID */
  articleId: string;
  /** 反应类型配置 */
  types?: Array<{
    type: 'like' | 'love' | 'fire' | 'rocket' | 'eyes' | 'clap';
    label: string;
    emoji: string;
  }>;
  /** 初始反应数据 */
  initialReactions?: Record<string, number>;
  /** 用户已选反应 */
  userReactions?: string[];
  /** 反应回调 */
  onReact?: (type: string) => void;
}

/**
 * GiscusComments 评论组件
 */
export interface GiscusCommentsProps {
  /** GitHub 仓库 */
  repo: string;
  /** 仓库 ID */
  repoId: string;
  /** 分类 */
  category: string;
  /** 分类 ID */
  categoryId: string;
  /** 映射方式 */
  mapping?: 'pathname' | 'url' | 'title' | 'og:title';
  /** 主题 */
  theme?: 'light' | 'dark' | 'preferred_color_scheme';
  /** 语言 */
  lang?: string;
  /** 加载失败回调 */
  onError?: (error: Error) => void;
}

/**
 * SocialLinks 社交链接组件
 */
export interface SocialLinksProps {
  /** 社交链接配置 */
  links: Array<{
    platform: 'github' | 'twitter' | 'linkedin' | 'youtube' | 'zhihu' | 'weibo';
    username: string;
    href?: string;
  }>;
  /** 是否显示统计数据（GitHub stars 等） */
  showStats?: boolean;
  /** 统计数据 */
  stats?: Record<string, number>;
}

// ============================================
// 工具类型
// ============================================

/** 通用组件基础 Props */
export interface BaseComponentProps {
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 测试 ID */
  'data-testid'?: string;
}

/** 文章数据 */
export interface ArticleData {
  /** 文章 ID（文件名） */
  id: string;
  /** Slug（URL 路径） */
  slug: string;
  /** Frontmatter 数据 */
  data: {
    title: string;
    description: string;
    publishedAt: Date;
    updatedAt?: Date;
    tags: string[];
    category: string;
    draft: boolean;
    featured: boolean;
    cover?: {
      src: string;
      alt: string;
    };
    toc: boolean;
    readingTime: number;
  };
  /** 文章正文 */
  body: string;
  /** 渲染后的 HTML */
  rendered?: {
    html: string;
    metadata: {
      headings: Array<{
        depth: number;
        slug: string;
        text: string;
      }>;
      readingTime: number;
    };
  };
}

/** 项目数据 */
export interface ProjectData {
  id: string;
  title: string;
  description: string;
  tags: string[];
  image?: string;
  demoUrl?: string;
  sourceUrl?: string;
  featured: boolean;
  order: number;
}