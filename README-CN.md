# 📘 vite-plugin-react-pages

<p>
  <a href="https://www.npmjs.com/package/vite-plugin-react-pages" target="_blank" rel="noopener"><img src="https://img.shields.io/npm/v/vite-plugin-react-pages.svg" alt="npm package" /></a>
</p>

[vite-plugin-react-pages](https://vitejs.github.io/vite-plugin-react-pages) (vite-pages) 是一个由 [vite](https://github.com/vitejs/vite) 驱动的React应用程序框架。 它非常适合于以下场景:

- 博客网站
- 您的仓库库或产品的文档网站
- 您的React组件或库的故事/演示/操场(如 [故事书](https://storybook.js.org/))

它为开发者提供了许多特性：

- **快速创建React项目**。
- **极好的开发体验**。 即使有大量页面，也能在瞬间启动本地开发服务器。 热模块替换与 React 和 Mdx 配合使用，因此您在编辑代码时可以获得即时反馈。
- **基于文件系统的路由**。通过遵循 [简单的文件系统路由约定](https://vitejs.github.io/vite-plugin-react-pages/fs-routing)，可以轻松创建、定位和开发页面。您无需担心路由配置。对于高级用户，您可以 [告诉 vite-pages 如何找到页面文件](https://vitejs.github.io/vite-plugin-react-pages/advanced-fs-routing)，以便 vite-pages 可以与任何项目文件结构一起工作。
- **支持 Mdx**。您可以使用“普通 React”或 [Mdx](https://mdxjs.com/) 编写内容。普通 Reactjs 更灵活、更可组合。而 Mdx 更易读且更易于编辑。您可以选择适合您任务的适当格式。这些格式可以像普通的 esModules 一样相互导入。
- **强大的主题定制功能**。 Vite-pages 本身不渲染任何具体的 DOM 节点。您可以使用主题定制页面的 **任何内容**。 很容易编写可共享和可配置的主题。如果您使用 TypeScript，您的主题的用户将获得类型检查和智能感知。
- **基于页面的自动代码拆分**。访问者不需要下载整个应用程序，他们只需要按需加载页面数据。
- **开箱即支持静态网站生成**。通过在构建时预渲染应用程序为HTML，用户可以在任何JS加载之前查看内容。有了这个功能，您可以将单页应用程序部署在[GitHub Pages](https://github.com/vitejs/vite-plugin-react-pages/tree/main/doc-site)上（它不支持单页应用程序）。
- **库文档工具**。 Vite-pages 提供了 [一些工具](https://vitejs.github.io/vite-plugin-react-pages/library-documentation-tools) 来降低库作者的维护成本，并使他们的文档更易于阅读。

## 快速开始

### 在 StackBlitz 上进行在线体验

您可以在浏览器中体验这些示例项目，无需在您的计算机上安装任何东西。

- [应用程序示例](https://stackblitz.com/fork/github/vitejs/vite-plugin-react-pages/tree/main/packages/create-project/template-app?file=README.md&terminal=dev)
- [库示例](https://stackblitz.com/fork/github/vitejs/vite-plugin-react-pages/tree/main/packages/create-project/template-lib?file=README.md&terminal=dev)
- [库单体仓库示例](https://stackblitz.com/fork/github/vitejs/vite-plugin-react-pages/tree/main/packages/create-project/template-lib-monorepo?file=README.md&terminal=dev)

您可以通过 StackBlitz 在线体验这些示例项目，无需在您的计算机上安装任何东西。以上链接将带您进入相应的在线开发环境，并加载示例项目的源代码。在浏览器中打开链接后，您可以随时通过编辑器查看和编辑代码，并实时查看更改的效果。此外，您还可以使用内置的控制台来调试和运行代码。
### 本地创建项目

1. 初始化一个 Vite Pages 项目（使用 npm 7+）：

* 执行 `npm init vite-pages app-demo -- --template app` 初始化一个应用程序项目，或者
* 执行 `npm init vite-pages library-demo -- --template lib` 初始化一个库项目，或者
* 执行 `npm init vite-pages library-monorepo-demo -- --template lib-monorepo` 初始化一个带有 monorepo 设置的库项目。
* 如果您使用的是 **npm 6.x**，应在 `--template` 之前删除额外的双破折号。例如，`npm init vite-pages app-demo --template app`。
2. `npm install`
3. `npm run dev` 然后在本地开发环境中使用。
4. `npm run build`.
5. `npm run ssr`. 你可以 [在浏览器中禁用JavaScript](https://developer.chrome.com/docs/devtools/javascript/disable/), 以查看网页是否仍然可以渲染。

### 阅读文档

阅读 [vite-plugin-react-pages的文档](https://vitejs.github.io/vite-plugin-react-pages/).
