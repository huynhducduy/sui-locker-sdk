import fs from 'node:fs'

import packageJson from '../../package.json'

const FOLDER_PATH = './src'
const FOLDER_BLACKLIST = ['@types', 'scripts']
const FILE_BLACKLIST = ['index.ts', 'setupTest.ts']

function generateExportsContent() {
  const fileNames = fs
    .readdirSync(FOLDER_PATH, {withFileTypes: true})
    .filter(
      item =>
        (item.isDirectory() && !FOLDER_BLACKLIST.includes(item.name)) ||
        (item.isFile() &&
          !FILE_BLACKLIST.includes(item.name) &&
          item.name.endsWith('.ts') &&
          !item.name.endsWith('.test.ts') &&
          !item.name.endsWith('.test-d.ts')),
    )
    .map(file => {
      if (file.name.endsWith('.ts')) return file.name.replace('.ts', '')
      return `${file.name}/index`
    })

  const exports: Record<string, unknown> = {
    '.': {
      import: {
        types: './dist/index.d.ts',
        default: './dist/index.js',
      },
      // require: {
      //   types: './dist/index.d.cts',
      //   default: './dist/index.cjs',
      // },
    },
  }

  fileNames.forEach(fileName => {
    exports[`./${fileName}`] = {
      import: {
        types: `./dist/${fileName}.d.ts`,
        default: `./dist/${fileName}.js`,
      },
      // require: {
      //   types: `./dist/${fileName}.d.cts`,
      //   default: `./dist/${fileName}.cjs`,
      // },
    }
  })

  return exports
}

function updatePackageJson() {
  const exportsContent = generateExportsContent()

  // @ts-expect-error -- don't need typecheck here
  packageJson.exports = exportsContent

  const packageJsonContent = JSON.stringify(packageJson, null, 2)

  fs.writeFileSync(`./package.json`, packageJsonContent, {
    flag: 'w',
  })
}

updatePackageJson()
