import path from 'path'
// @ts-ignore
import babel from '@rollup/plugin-babel'
import * as enhancedResolve from 'enhanced-resolve'
import * as rollup from 'rollup'
import invariant from 'tiny-invariant'
import fs from 'fs-extra'
// @ts-ignore
import postcss from 'rollup-plugin-postcss'
import readPkgUp from 'read-pkg-up'

const extensions = ['.js', '.jsx', '.ts', '.tsx']
// never resolve modules from node_modules
const strictResolve = enhancedResolve.create({
  modules: [],
  extensions,
})

export async function analyzeSourceCode(entryModule: string) {
  const externals: Record<string, string> = {}

  const bundle = await rollup.rollup({
    input: entryModule,
    plugins: [
      babel({
        babelrc: false,
        // no need to add preset-env, this bunle will be processed by outer build system
        presets: ['@babel/preset-typescript', '@babel/preset-react'],
        babelHelpers: 'bundled',
        extensions,
      }),
      {
        name: 'analyse-source-code-resolver',
        resolveId(request, from) {
          if (!from) {
            invariant(request === entryModule)
            return null
          }
          // strict resolve only resolve relative path. never search node_modules.
          return new Promise((res, rej) => {
            const resolveFrom = path.dirname(from)
            strictResolve(resolveFrom, request, async (err, result) => {
              const bareImportRE = /^[^\/\.]/
              if (err) {
                if (bareImportRE.test(request)) {
                  const depVerMap: { [key: string]: string | undefined } = {}

                  const importerPkgJson = (
                    await readPkgUp({
                      cwd: resolveFrom,
                    })
                  )?.packageJson
                  if (importerPkgJson) {
                    Object.assign(depVerMap, {
                      // can import itself
                      [importerPkgJson.name]: importerPkgJson.version,
                      ...importerPkgJson.peerDependencies,
                      ...importerPkgJson.devDependencies,
                      ...importerPkgJson.dependencies,
                      // users can specify dependencies version in demoDependencies
                      ...importerPkgJson.demoDependencies,
                    })
                  }

                  const { scope, name } = parseNodeModuleRequest(request)
                  const requestPkgName = [scope, name].filter(Boolean).join('/')
                  const depVer = depVerMap[requestPkgName]
                  if (!depVer) {
                    return rej(
                      new Error(
                        `can not resolve package version for "${request}", imported by "${from}". You should list the dependency's version inside package.json#demoDependencies.`
                      )
                    )
                  }
                  // record external package and its version
                  externals[requestPkgName] = depVer
                  return res({
                    external: true,
                    id: request,
                  })
                } else {
                  rej(err)
                }
              } else {
                res(result)
              }
            })
          })
        },
      },
      postcss({
        extract: true,
      }),
    ],
  })

  const modules: {
    [key: string]: {
      code: string
    }
  } = {}

  // compute the base dir for all modules
  const pathBase = bundle.watchFiles
    .map(path.dirname)
    .reduce((currentPathBase, fileDir) => {
      let relativePath = path.relative(currentPathBase, fileDir)
      while (relativePath.startsWith('..')) {
        currentPathBase = path.resolve(currentPathBase, '../')
        relativePath = path.relative(currentPathBase, fileDir)
      }
      return currentPathBase
    })

  await Promise.all(
    bundle.watchFiles.map(async (filePath) => {
      invariant(await fs.pathExists(filePath))
      const relativePath = path.relative(pathBase, filePath)
      modules[relativePath] = {
        code: await fs.readFile(filePath, 'utf-8'),
      }
    })
  )

  const entry = path.relative(pathBase, entryModule)
  invariant(modules[entry])
  return {
    entry,
    modules,
    externals,
  }
}

function parseNodeModuleRequest(id: string) {
  const parts = id.split('/')
  let scope = '',
    name = '',
    inPkgPath = ''
  if (id.startsWith('@')) scope = parts.shift()!
  name = parts.shift()!
  inPkgPath = parts.join('/')
  return {
    scope,
    name,
    inPkgPath,
  }
}
