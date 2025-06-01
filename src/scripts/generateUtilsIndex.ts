import fs from 'node:fs'

const FOLDER_PATH = './src/utils'

function generateIndexContent() {
  const fileNames = fs
    .readdirSync(FOLDER_PATH, {withFileTypes: true})
    .filter(
      file =>
        file.isFile() &&
        file.name !== 'index.ts' &&
        file.name.endsWith('.ts') &&
        !file.name.endsWith('.test.ts') &&
        !file.name.endsWith('.test-d.ts'),
    )
    .map(file => file.name.replace('.ts', ''))

  return [
    '/* eslint-disable no-barrel-files/no-barrel-files -- must be a barrel file */',
    ...fileNames.map(fileName => {
      return `export * from './${fileName}'`
    }),
    '/* eslint-enable no-barrel-files/no-barrel-files -- must be a barrel file */',
  ].join('\n')
}

function writeIndexFile() {
  const abisIndexContent = generateIndexContent()

  fs.writeFileSync(`${FOLDER_PATH}/index.ts`, abisIndexContent, {
    flag: 'w',
  })
}

writeIndexFile()
