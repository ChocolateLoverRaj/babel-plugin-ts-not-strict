import { join } from 'path'
import { writeFileSync, readFileSync } from 'jsonfile'
import plugin from '../lib'
import { transformSync } from '@babel/core'
import pluginSyntaxTypescript from '@babel/plugin-syntax-typescript'
import never from 'never'
import { Command } from 'commander'
import { strictEqual } from 'assert'

const arrowFn = '(a: string): string => a;'
const tests: Record<string, string> = {
  'export default with const': `
const fn = ${arrowFn}

export default fn
`,
  'export default directly': `
export default ${arrowFn}
`,
  'export named': `
export const fn = ${arrowFn}
`,
  function: `
export default function add(a: number): number {
  return a
}
`,
  'function dts': `
export function a(n: number): number;
`,
  useControlledState: `
export function useControlledState<T>(value: T, defaultValue: T, onChange: ` + `
(value: T, ...args: any[]) => void): [T, (value: T | ((prevState: T) => T), ...args: any[]) => void];
`,
  'function parameter': `
export function fn(cb: () => void): void;
`,
  'already parenthesized function parameter': `
export function fn(cb: (() => void)): void;
`,
  'already includes undefined': `
export function fn(a: string | undefined): void;
`,
  'already optional': `
export function fn(a?: string): void;
`,
  interface: `
export interface Person {
  name: string
}
`
}

const snapshotFile = join(__dirname, 'snapshot.json')
const readSnapshotFile = (): Record<string, string> => {
  try {
    return readFileSync(snapshotFile)
  } catch (e) {
    if (e.code === 'ENOENT') return {}
    else throw e
  }
}

type Tester = (input: string) => string
const tester: Tester = input => (transformSync(input, {
  plugins: [pluginSyntaxTypescript, plugin]
}))?.code ?? never('No result')

interface Options {
  ci: boolean
  update: boolean
}
new Command()
  .option('--ci', 'fail on new snapshots')
  .option('-u --update', 'update failing snapshots')
  .action(({ ci = false, update = false }: Options) => {
    const snapshot = readSnapshotFile()
    const newSnapshot: Record<string, string> = {}
    Object.entries(tests).forEach(([name, input]) => {
      console.log(name)
      const output = tester(input)
      if (Object.prototype.hasOwnProperty.call(snapshot, name)) {
        try {
          strictEqual(output, snapshot[name])
        } catch (e) {
          if (update) newSnapshot[name] = output
          else throw e
        }
      } else if (!ci) newSnapshot[name] = output
      else throw new Error('Cannot create snapshot in ci')
    })
    if (Object.keys(newSnapshot).length > 0) {
      writeFileSync(snapshotFile, newSnapshot, { spaces: 2 })
    }
  })
  .allowExcessArguments(false)
  .parse(process.argv)
