const pages = {
  '/': {
    title: '首页',
    file: 'home.html',
    active: 'home',
  },
  '/ai': {
    title: 'AI 学习',
    file: 'ai.html',
    active: 'ai',
  },
  '/html': {
    title: 'HTML 教程',
    file: 'html.html',
    active: 'html',
    isHTML: true,
  },
  '/html/basic': {
    title: 'HTML 基础课程',
    file: 'html/basic.html',
    active: 'html',
    isHTML: true,
    htmlSection: 'basic',
  },
  '/html/advanced': {
    title: 'HTML 高级课程',
    file: 'html/advanced.html',
    active: 'html',
    isHTML: true,
    htmlSection: 'advanced',
  },
  '/html/blog': {
    title: 'HTML 博客',
    file: 'html/blog.html',
    active: 'html',
    isHTML: true,
    htmlSection: 'blog',
  },
  '/css': {
    title: 'CSS 教程',
    file: 'css.html',
    active: 'css',
  },
  '/javascript': {
    title: 'JavaScript 教程',
    file: 'javascript.html',
    active: 'js',
  },
  '/ai/grok': {
    title: 'Grok - AI 模型详情',
    file: 'ai/grok.html',
    active: 'ai',
  },
};

// HTML 课程配置
const HTML_COURSES = {
  doctype: {
    title: 'HTML DOCTYPE 声明',
    duration: '15分钟',
    level: '基础难度',
    description: '了解 HTML 文档类型声明的重要性和使用方法',
  },
  structure: {
    title: 'HTML 基本结构',
    duration: '20分钟',
    level: '基础难度',
    description: '掌握 HTML 文档的基本结构和必要元素',
  },
};

module.exports = {
  pages,
  HTML_COURSES,
};
