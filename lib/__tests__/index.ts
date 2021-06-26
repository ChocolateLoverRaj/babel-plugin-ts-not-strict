import plugin from '../'
import { transformSync } from '@babel/core'
import pluginSyntaxTypescript from '@babel/plugin-syntax-typescript'
import never from 'never'
import test, { Macro } from 'ava'

const macro: Macro<[string]> = (t, input): void => {
  const { code } = transformSync(input, {
    plugins: [pluginSyntaxTypescript, plugin]
  }) ?? never('No result')
  t.snapshot(code)
}

const arrowFn = '(a: string): string => a;'

/* test('export default with const', macro, `
const fn = ${arrowFn}

export default fn
`)

test('export default directly', macro, `
export default ${arrowFn}
`)

test('export named', macro, `
export const fn = ${arrowFn}
`)

test('function', macro, `
export default function add(a: number): number {
  return a
}
`)

test('function dts', macro, `
export function a(n: number): number;
`)

test('useControlledState', macro, `
export function useControlledState<T>(value: T, defaultValue: T, onChange: ` + `
(value: T, ...args: any[]) => void): [T, (value: T | ((prevState: T) => T), ...args: any[]) => void];
`)

test('function parameter', macro, `
export function fn(cb: () => void): void;
`)

test('already parenthesized function parameter', macro, `
export function fn(cb: (() => void)): void;
`)

test('already includes undefined', macro, `
export function fn(a: string | undefined): void;
`) */

/* test('already optional', macro, `
export function fn(a?: string): void;
`) */

test('interface', macro, `
export interface Person {
  name: string
}
`);

test('interface param', macro, `
interface Person {
  name: string
}
export function fn(a: Person): void;
`)
