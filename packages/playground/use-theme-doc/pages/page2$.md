---
title: page2 title
subGroup: sub-group
---

# Page 2

This is page2.

This is a page defined with markdown.
This is a page defined with markdown. This is a page defined with markdown. This is a page defined with markdown. This is a page defined with markdown. This is a page defined with markdown. This is a page defined with markdown. This is a page defined with markdown. This is a page defined with markdown. This is a page defined with markdown. This is a page defined with markdown. This is a page defined with markdown. This is a page defined with markdown. This is a page defined with markdown. This is a page defined with markdown. This is a page defined with markdown.

[Link to page1](/page1).

## code render demo

The official guide also assumes that you have intermediate knowledge about HTML, CSS, and JavaScript, and React. `If you are just starting to learn front-end or React`, it may not be the best idea to use the UI framework as your first step.

Click the "Open in Editor" icon in the first example to open an editor with source code to use out-of-the-box. Now you can import the `Alert` component into the codesandbox:

```diff
- import { DatePicker, message } from 'antd';
+ import { DatePicker, message, Alert } from 'antd';
```

Now add the following jsx inside the `render` function.

```diff
  <DatePicker onChange={value => this.handleChange(value)} />
  <div style={{ marginTop: 20 }}>
-   Selected Date: {date ? date.format('YYYY-MM-DD') : 'None'}
+   <Alert message="Selected Date" description={date ? date.format('YYYY-MM-DD') : 'None'} />
  </div>
```

Select a date, and you can see the effect in the preview area on the right:

If you use `create-react-app` follow the instructions [here](/docs/react/use-with-create-react-app#Test-with-Jest) instead.

Jest does not support `esm` modules, and Ant Design uses them. In order to test your Ant Design application with Jest you have to add the following to your Jest config :

```json
"transform": { "^.+\\.(ts|tsx|js|jsx)?$": "ts-jest" }
```
