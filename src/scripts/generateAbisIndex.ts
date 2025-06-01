import fs from 'node:fs'

const FOLDER_PATH = './src/abis'

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

  return fileNames
    .map(fileName => {
      return `export {default as ${fileName}} from './${fileName}'`
    })
    .join('\n')
}

function writeIndexFile() {
  const abisIndexContent = generateIndexContent()

  fs.writeFileSync(`${FOLDER_PATH}/index.ts`, abisIndexContent, {
    flag: 'w',
  })
}

writeIndexFile()
