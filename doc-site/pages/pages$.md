# Pages

Vite pages use filesystem based routing. You can create a page by simply creating a file: `page-name$.tsx`. Notice the `$` **at the end of the filename**. Vite pages recognize it and know it is a page file.

If the filename is `index$.tsx`, the page url path will be the path of the directory.

> All file extensions `.ts|.tsx|.js|.jsx|.md|.mdx` works, as long as `$` is the last character before the extension.

## Examples

| file path                  | page url path          |
| -------------------------- | ---------------------- |
| `index$.tsx`               | `/`                    |
| `page-one$.tsx`            | `/page-one`            |
| `page-two$.md`             | `/page-two`            |
| `dir-name/index$.jsx`      | `/dir-name`            |
| `dir-name/page-three$.mdx` | `/dir-name/page-three` |
