---
title: Button title
subGroup: general
---

# Button

This is a **markdown** document of the `Button` component.

You can put this page in a subGroup of the side menu using `staticData.subGroup`.

## demos

You can import demos like this:

<Demo src="./demos/demo1.tsx" />

<Demo src="./demos/demo2.tsx" />

## Extract API info from Typescript code

You can extract API from ts interface and render it into page.

The following markdown

```tsx
<TsInfo src="./src/types.ts" name="ButtonProps" />
```

will result in:

<TsInfo src="./src/types.ts" name="ButtonProps" />

In jsx page, You can render TsInfo like this:

```tsx
import _TsInfo0 from './src/types.ts?tsInfo=ButtonProps'
import { TsInfo } from 'vite-pages-theme-doc'

export default function Page() {
  return <TsInfo {..._TsInfo0} />
}
```
