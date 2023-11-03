# 📘 vite-plugin-react-pages

<p>
  <a href="https://www.npmjs.com/package/vite-plugin-react-pages" target="_blank" rel="noopener"><img src="https://img.shields.io/npm/v/vite-plugin-react-pages.svg" alt="npm package" /></a>
</p>

[vite-plugin-react-pages](https://vitejs.github.io/vite-plugin-react-pages)（vite-pages）是一个由[vite](https://github.com/vitejs/vite)驱动的React应用框架，非常适用于以下场景：

- 博客网站
- 您的库或产品的文档网站
- 您的React组件或库的storybook/demo/本地开发调试环境（类似于[storybook.js](https://storybook.js.org/)）

它提供了许多功能，帮助开发者**快速构建React应用**：

- **出色的开发体验**。即使有很多页面，也可以在瞬间启动本地开发服务器。热模块替换与React和Mdx兼容，因此在编辑代码时可以即时获得反馈。
- **基于文件系统的路由**。遵循[简单的文件系统路由约定](https://vitejs.github.io/vite-plugin-react-pages/fs-routing)，创建、定位和开发页面变得轻而易举。您无需担心路由配置。对于复杂的使用场景，您可以[告诉vite-pages如何找到页面文件](https://vitejs.github.io/vite-plugin-react-pages/advanced-fs-routing)，以便vite-pages可以与任何项目文件结构配合使用。
- **支持Mdx**。您可以使用“普通的React”或[Mdx](https://mdxjs.com/)编写内容。普通的React更灵活和可组合。而Mdx源码更可读、更容易编辑。您可以根据任务选择适当的格式。这些格式的内容可以像普通的ES Modules一样互相引用。
- **强大的[主题定制功能](https://vitejs.github.io/vite-plugin-react-pages/theme-customization)**。Vite-pages本身不渲染任何具体的DOM节点。您可以使用主题来自定义页面上的**任何内容**。编写可共享和可配置的主题非常容易。如果您使用typescript，使用主题的时候将获得类型检查和智能感知。
- **基于页面的自动代码拆分**。访问者无需下载整个应用程序，只需在需要时加载页面数据。
- **原生支持静态站点生成**。通过在构建时将应用程序预渲染为HTML，用户可以在加载任何JS之前看到内容。有了这个功能，您可以[将您的单页应用程序部署到GitHub Pages](https://github.com/vitejs/vite-plugin-react-pages/tree/main/doc-site)(它本来[并不支持单页应用程序](https://www.google.com/search?q=github+pages+single+page+apps&oq=github+pages+single+page+apps))。
- **用于库文档的工具**。Vite-pages提供了[一些工具](https://vitejs.github.io/vite-plugin-react-pages/library-documentation-tools)，以减少库作者的维护成本，并使他们的文档更容易阅读。


## 这个README的其他翻译版本

- [English](/README.md)

## 入门指南

### 在StackBlitz上在线体验

您可以在浏览器中体验这些示例项目，无需在本地安装任何东西！

- [应用开发](https://stackblitz.com/fork/github/vitejs/vite-plugin-react-pages/tree/main/packages/create-project/template-app?file=README.md&terminal=dev)
- [库开发](https://stackblitz.com/fork/github/vitejs/vite-plugin-react-pages/tree/main/packages/create-project/template-lib?file=README.md&terminal=dev)
- [monorepo库开发](https://stackblitz.com/fork/github/vitejs/vite-plugin-react-pages/tree/main/packages/create-project/template-lib-monorepo?file=README.md&terminal=dev)

### 本地初始化演示项目

1. 初始化一个vite-pages项目（使用npm 7+）：
   - 执行`npm init vite-pages app-demo -- --template app`以初始化应用项目，或者
   - 执行`npm init vite-pages library-demo -- --template lib`以初始化库项目，或者
   - 执行`npm init vite-pages library-monorepo-demo -- --template lib-monorepo`以初始化带有monorepo设置的库项目。
   - 如果您使用**npm 6.x**，`--template`前面的额外双短横线应该删除。例如，`npm init vite-pages app-demo --template app`。
2. `npm install`
3. `npm run dev`并与本地开发环境互动。
4. `npm run build`。
5. `npm run ssr`。您可以[在浏览器中禁用javascript](https://developer.chrome.com/docs/devtools/javascript/disable/)，以验证它是否仍然可以渲染。

### 阅读文档

阅读[vite-plugin-react-pages的文档](https://vitejs.github.io/vite-plugin-react-pages/)。
