import plugin from '../'
import { transformSync } from '@babel/core'
import pluginSyntaxTypescript from '@babel/plugin-syntax-typescript'
import never from 'never'

const transformAndMatchSnapshot = (input: string): void => {
  const { code } = transformSync(input, {
    plugins: [pluginSyntaxTypescript, plugin]
  }) ?? never('No result')
  expect(code).toMatchSnapshot()
}

const arrowFn = '(a: string): string => a;'

test('export default with const', () => {
  transformAndMatchSnapshot(`
  const fn = ${arrowFn}

  export default fn
  `)
})

test('export default directly', () => {
  transformAndMatchSnapshot(`
  export default ${arrowFn}
  `)
})

test('export named', () => {
  transformAndMatchSnapshot(`
  export const fn = ${arrowFn}
  `)
})

test('function', () => {
  transformAndMatchSnapshot(`
  export default function add(a: number): number {
    return a
  }
  `)
})

test('function dts', () => {
  transformAndMatchSnapshot(`
  export function a(n: number): number;
  `)
})

test('useControlledState', () => {
  transformAndMatchSnapshot(`
  export function useControlledState<T>(value: T, defaultValue: T, onChange: ` + `
  (value: T, ...args: any[]) => void): [T, (value: T | ((prevState: T) => T), ...args: any[]) => void];
  `)
})

test('function parameter', () => {
  transformAndMatchSnapshot(`
  export function fn(cb: () => void): void;
  `)
})

test('already parenthesized function parameter', () => {
  transformAndMatchSnapshot(`
  export function fn(cb: (() => void)): void;
  `)
})

test('already includes undefined', () => {
  transformAndMatchSnapshot(`
  export function fn(a: string | undefined): void;
  `)
})

test('already optional', () => {
  transformAndMatchSnapshot(`
  export function fn(a?: string): void;
  `)
})

test('interface', () => transformAndMatchSnapshot(`
export interface Person {
  name: string
}
`))

test('already optional interface', () => transformAndMatchSnapshot(`
export interface Person {
  name?: string
}
`))

test('interface param', () => transformAndMatchSnapshot(`
interface Person {
  name: string
}
export function fn(a: Person): void;
`))

test('interface union param', () => transformAndMatchSnapshot(`
interface Person {
  name: string
}
export function fn(a: Person | string): void;
`))
