import { PluginObj } from '@babel/core'
import {
  isIdentifier,
  isVariableDeclarator,
  isArrowFunctionExpression,
  isTSTypeAnnotation,
  isTSUnionType,
  tSUndefinedKeyword,
  tsUnionType,
  Node,
  isVariableDeclaration,
  isExportNamedDeclaration,
  isFunctionDeclaration,
  isTSDeclareFunction,
  tsParenthesizedType,
  isTSParenthesizedType,
  isTSFunctionType,
  isTSUndefinedKeyword,
  isTSInterfaceDeclaration,
  isTSPropertySignature,
  isTSTypeReference,
  TSPropertySignature
} from '@babel/types'
import { NodePath } from '@babel/traverse'
import never from 'never'
import findInterface from './findInterface'

const transformInterface = (path: NodePath, node: Node): void => {
  if (isTSTypeReference(node) && isIdentifier(node.typeName)) {
    const { typeName: { name } } = node
    const interfaceDeclaration = findInterface(path, name)
    if (interfaceDeclaration !== undefined) {
      interfaceDeclaration.body.body.forEach((node: TSPropertySignature) => {
        transformTypeAnnotation(path, node.typeAnnotation, Boolean(node.optional))
      })
    }
  }
}

const transformTypeAnnotation = (
  path: NodePath,
  typeAnnotation: object | undefined | null,
  isOptional: boolean
): void => {
  if (
    isTSTypeAnnotation(typeAnnotation) &&
    !isOptional
  ) {
    if (isTSUnionType(typeAnnotation.typeAnnotation)) {
      if (!typeAnnotation.typeAnnotation.types.some(type => isTSUndefinedKeyword(type))) {
        typeAnnotation.typeAnnotation.types.push(tSUndefinedKeyword())
      }
      typeAnnotation.typeAnnotation.types.forEach(type => transformInterface(path, type))
    } else {
      transformInterface(path, typeAnnotation.typeAnnotation)
      typeAnnotation.typeAnnotation = tsUnionType([
        isTSFunctionType(typeAnnotation.typeAnnotation)
          ? isTSParenthesizedType(typeAnnotation.typeAnnotation)
            ? typeAnnotation.typeAnnotation
            : tsParenthesizedType(typeAnnotation.typeAnnotation)
          : typeAnnotation.typeAnnotation,
        tSUndefinedKeyword()
      ])
    }
  }
}

const transformNode = (path: NodePath, node: Node | null | undefined): void => {
  if (
    isArrowFunctionExpression(node) ||
    isFunctionDeclaration(node) ||
    isTSDeclareFunction(node)
  ) {
    node.params.forEach((param) => {
      const { typeAnnotation } = param
      transformTypeAnnotation(
        path,
        typeAnnotation,
        isIdentifier(param) && param.optional === true
      )
    })
  } else if (isTSInterfaceDeclaration(node)) {
    node.body.body.forEach(node => {
      if (isTSPropertySignature(node)) node.optional = true
    })
  }
}

const plugin: PluginObj = {
  visitor: {
    ExportDefaultDeclaration: path => {
      if (isIdentifier(path.node.declaration)) {
        const { name } = path.node.declaration
        const { path: { node } } = path.scope.getBinding(name) ?? never('No binding')
        if (isVariableDeclarator(node)) {
          transformNode(path, node.init)
        }
      } else {
        transformNode(path, path.node.declaration)
      }
    },
    ExportDeclaration: path => {
      if (isExportNamedDeclaration(path.node)) {
        if (isVariableDeclaration(path.node.declaration)) {
          transformNode(path, path.node.declaration.declarations[0].init)
        }
      }
    },
    ExportNamedDeclaration: path => {
      if (
        isTSDeclareFunction(path.node.declaration) ||
        isTSInterfaceDeclaration(path.node.declaration)
      ) {
        transformNode(path, path.node.declaration)
      }
    }
  }
}

export default plugin
