# local jotai

Copied from [jotai@0.15.5](https://unpkg.com/jotai@0.15.5/index.module.js).
We don't use jotai package from npm, because we want to avoid install the package inside `vite-plugin-react-pages`, which would be conflict with user's jotai package if they intall a different version in their projects.

TODO: We will remove jotai from `vite-plugin-react-pages` entirely in the future.
