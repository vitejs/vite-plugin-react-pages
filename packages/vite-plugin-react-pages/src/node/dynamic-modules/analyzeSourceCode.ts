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

const resolveNodeModules = enhancedResolve.create({
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
                  // resolve the actual file from node_modules
                  resolveNodeModules(
                    resolveFrom,
                    request,
                    async (err, result) => {
                      if (err) {
                        return rej(err)
                      }
                      const importerPkgJson = (
                        await readPkgUp({
                          cwd: resolveFrom,
                        })
                      )?.packageJson
                      if (!importerPkgJson) {
                        return rej(
                          new Error(
                            `can not resolve package.json from "${from}"`
                          )
                        )
                      }
                      const { scope, name } = parseNodeModuleRequest(request)
                      const requestPkgName = [scope, name]
                        .filter(Boolean)
                        .join('/')

                      const depVerMap: { [key: string]: string | undefined } = {
                        // can import itself
                        [importerPkgJson.name]: importerPkgJson.version,
                        ...importerPkgJson.devDependencies,
                        ...importerPkgJson.dependencies,
                      }
                      const depVer = depVerMap[requestPkgName]
                      if (!depVer) {
                        return rej(
                          new Error(
                            `can not resolve package version for "${request}", requested by "${from}". You should list the package as in package.json.`
                          )
                        )
                      }
                      // record external package and its version
                      externals[requestPkgName] = depVer
                      return res({
                        external: true,
                        id: request,
                      })
                    }
                  )
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
        inject(cssVariableName: string) {
          return `__stylesθ["${cssVariableName}"] = ${cssVariableName}`
        },
      }),
    ],
  })

  const modules: {
    [key: string]: {
      code: string
    }
  } = {}

  await Promise.all(
    bundle.watchFiles.map(async (filePath) => {
      invariant(await fs.pathExists(filePath))
      const relativePath = path.relative(path.dirname(entryModule), filePath)
      modules[relativePath] = {
        code: await fs.readFile(filePath, 'utf-8'),
      }
    })
  )
  const entry = path.basename(entryModule)
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
