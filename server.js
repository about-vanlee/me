// 原生的nodejs 模块
const http = require('http');
const fs = require('fs').promises;
const path = require('path');

// 第三方模块
const marked = require('marked');
const matter = require('gray-matter');
const highlight = require('highlight.js');

// 常量
const { MARKED_OPTIONS } = require('./src/constants/markdown');
const { pages } = require('./src/constants/routes');
const {
  TEMPLATE_FILE,
  VIEWS_DIR,
  PAGES_DIR,
  POSTS_DIR,
  PUBLIC_DIR,
  MIME_TYPES,
  PORT,
} = require('./src/constants/server');

// 配置 marked
marked.setOptions({
  highlight: function (code, lang) {
    if (lang && highlight.getLanguage(lang)) {
      return highlight.highlight(lang, code).value;
    }
    return highlight.highlightAuto(code).value;
  },
  ...MARKED_OPTIONS,
});

// 博客文章处理函数
async function renderBlogPost(slug) {
  try {
    const filePath = path.join(POSTS_DIR, `${slug}.md`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    const htmlContent = marked(content);

    const formattedDate = new Date(data.date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const articleHtml = `
      <article class="blog-post">
        <header class="blog-header">
          <h1>${data.title}</h1>
          <div class="blog-meta">
            <span class="date">发布于：${formattedDate}</span>
            <span class="author">作者：${data.author}</span>
            ${
              data.tags
                ? `
              <div class="tags">
                标签：${data.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}
              </div>
            `
                : ''
            }
          </div>
        </header>
        <div class="blog-content">
          ${htmlContent}
        </div>
        <footer class="blog-footer">
          <div class="blog-nav">
            <a href="/html/blog" class="back-to-blog">← 返回博客列表</a>
          </div>
        </footer>
      </article>
    `;

    return {
      title: data.title,
      content: articleHtml,
      metadata: {
        ...data,
        date: formattedDate,
      },
    };
  } catch (error) {
    console.error('渲染博客文章时出错:', error);
    throw new Error('文章不存在或无法访问');
  }
}

// 获取博客列表函数
async function getBlogPosts() {
  try {
    const files = await fs.readdir(POSTS_DIR);
    const posts = [];

    for (const file of files) {
      if (file.endsWith('.md')) {
        const content = await fs.readFile(path.join(POSTS_DIR, file), 'utf-8');
        const { data, excerpt, content: fullContent } = matter(content, { excerpt: true });
        const summary = excerpt || fullContent.slice(0, 200) + '...';

        posts.push({
          slug: file.replace('.md', ''),
          title: data.title,
          date: data.date,
          author: data.author,
          tags: data.tags || [],
          excerpt: summary,
        });
      }
    }

    return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('获取博客列表时出错:', error);
    return [];
  }
}

// 页面渲染函数
async function renderPage(route) {
  try {
    if (!pages[route]) {
      throw new Error('Page not found');
    }

    const templatePath = path.join(VIEWS_DIR, 'template.html');
    let template = await fs.readFile(templatePath, 'utf-8');
    const pageInfo = pages[route];
    const contentPath = path.join(PAGES_DIR, pageInfo.file);

    let content;
    try {
      content = await fs.readFile(contentPath, 'utf-8');
    } catch (err) {
      console.error(`无法读取页面文件: ${contentPath}`);
      content = '<h1>页面内容未找到</h1>';
    }

    // 如果是博客列表页面，获取并渲染博客列表
    if (route === '/html/blog') {
      const posts = await getBlogPosts();
      const postsHtml = posts
        .map(
          (post) => `
        <article class="blog-post">
          <h2><a href="/blog/${post.slug}">${post.title}</a></h2>
          <div class="blog-meta">
            <span class="date">${new Date(post.date).toLocaleDateString('zh-CN')}</span>
            <span class="author">作者：${post.author}</span>
            <span class="tags">标签：${post.tags.join(', ')}</span>
          </div>
          <div class="blog-excerpt">${post.excerpt}</div>
          <a href="/blog/${post.slug}" class="read-more">阅读更多</a>
        </article>
      `
        )
        .join('');

      content = content.replace('{{blogPosts}}', postsHtml);
    }

    const activeStates = {
      home: '',
      ai: '',
      html: '',
      css: '',
      js: '',
    };
    activeStates[pageInfo.active] = 'class="active"';

    const htmlSubNavStates = {
      basic: '',
      advanced: '',
      blog: '',
    };

    if (pageInfo.htmlSection) {
      htmlSubNavStates[pageInfo.htmlSection] = 'class="active"';
    }

    template = template
      .replace('{{title}}', pageInfo.title)
      .replace('{{content}}', content)
      .replace('{{activeHOME}}', activeStates.home)
      .replace('{{activeAI}}', activeStates.ai)
      .replace('{{activeHTML}}', activeStates.html)
      .replace('{{activeCSS}}', activeStates.css)
      .replace('{{activeJS}}', activeStates.js)
      .replace('{{#if isHTML}}', pageInfo.isHTML ? '' : '<!--')
      .replace('{{/if}}', pageInfo.isHTML ? '' : '-->')
      .replace('{{activeHTMLBasic}}', htmlSubNavStates.basic)
      .replace('{{activeHTMLAdvanced}}', htmlSubNavStates.advanced)
      .replace('{{activeHTMLBlog}}', htmlSubNavStates.blog);

    return template;
  } catch (err) {
    console.error('渲染页面时出错:', err);
    throw err;
  }
}

// 处理静态文件
async function handleStaticFile(req, res) {
  try {
    const filePath = path.join(__dirname, req.url);
    const ext = path.extname(filePath);
    const content = await fs.readFile(filePath);

    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
    });
    res.end(content);
  } catch (err) {
    res.writeHead(404);
    res.end('File not found');
  }
}

// 创建服务器
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    // 处理静态文件请求
    if (pathname.startsWith('/public/')) {
      return handleStaticFile(req, res);
    }

    // 处理博客文章请求
    if (pathname.startsWith('/blog/')) {
      const slug = pathname.replace('/blog/', '');
      const post = await renderBlogPost(slug);
      const template = await renderPage('/html/blog'); // 使用博客模板

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(template.replace('{{content}}', post.content));
      return;
    }

    // 处理页面请求
    const html = await renderPage(pathname);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  } catch (err) {
    console.error('请求处理错误:', err);
    res.writeHead(404);
    res.end('Page not found');
  }
});

server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
