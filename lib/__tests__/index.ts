import plugin from '../'
import { transformSync } from '@babel/core'
import pluginSyntaxTypescript from '@babel/plugin-syntax-typescript'
import never from 'never'
import snapshot from 'snap-shot'

const transformAndMatchSnapshot = (input: string): void => {
  const { code } = transformSync(input, {
    plugins: [pluginSyntaxTypescript, plugin]
  }) ?? never('No result')
  snapshot(code)
}

const arrowFn = '(a: string): string => a;'

it('export default with const', () => {
  transformAndMatchSnapshot(`
  const fn = ${arrowFn}

  export default fn
  `)
})

it('export default directly', () => {
  transformAndMatchSnapshot(`
  export default ${arrowFn}
  `)
})

it('export named', () => {
  transformAndMatchSnapshot(`
  export const fn = ${arrowFn}
  `)
})

it('function', () => {
  transformAndMatchSnapshot(`
  export default function add(a: number): number {
    return a
  }
  `)
})

it('function dts', () => {
  transformAndMatchSnapshot(`
  export function a(n: number): number;
  `)
})

it('useControlledState', () => {
  transformAndMatchSnapshot(`
  export function useControlledState<T>(value: T, defaultValue: T, onChange: ` + `
  (value: T, ...args: any[]) => void): [T, (value: T | ((prevState: T) => T), ...args: any[]) => void];
  `)
})

it('function parameter', () => {
  transformAndMatchSnapshot(`
  export function fn(cb: () => void): void;
  `)
})

it('already parenthesized function parameter', () => {
  transformAndMatchSnapshot(`
  export function fn(cb: (() => void)): void;
  `)
})

it('already includes undefined', () => {
  transformAndMatchSnapshot(`
  export function fn(a: string | undefined): void;
  `)
})

it('already optional', () => {
  transformAndMatchSnapshot(`
  export function fn(a?: string): void;
  `)
})

it('interface', () => transformAndMatchSnapshot(`
export interface Person {
  name: string
}
`))
