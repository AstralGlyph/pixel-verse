/**
 * @fileoverview MDX 组件映射配置
 * @description 为 MDX 文件提供全局组件导入
 */

import Callout from '@components/ui/Callout';
import { Tabs, TabList, Tab, TabPanel } from '@components/ui/Tabs';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@components/ui/Accordion';
import CodePlayground from '@components/code/CodePlayground';
import SandpackEmbed from '@components/code/SandpackEmbed';

/**
 * MDX 组件映射
 * 这些组件可以在 MDX 文件中直接使用，无需导入
 */
export const components = {
  // UI 组件
  Callout,

  // Tabs 组件
  Tabs,
  TabList,
  Tab,
  TabPanel,

  // Accordion 组件
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,

  // 代码组件
  CodePlayground,
  SandpackEmbed,
};

export default components;