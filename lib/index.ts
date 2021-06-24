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
  isTSPropertySignature
} from '@babel/types'
import never from 'never'

const transformNode = (node: Node | null | undefined): void => {
  if (
    isArrowFunctionExpression(node) ||
    isFunctionDeclaration(node) ||
    isTSDeclareFunction(node)
  ) {
    node.params.forEach((param) => {
      const { typeAnnotation } = param
      if (
        isTSTypeAnnotation(typeAnnotation) &&
        !(isIdentifier(param) && param.optional === true)
      ) {
        if (isTSUnionType(typeAnnotation.typeAnnotation)) {
          if (!typeAnnotation.typeAnnotation.types.some(type => isTSUndefinedKeyword(type))) {
            typeAnnotation.typeAnnotation.types.push(tSUndefinedKeyword())
          }
        } else {
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
          transformNode(node.init)
        }
      } else {
        transformNode(path.node.declaration)
      }
    },
    ExportDeclaration: path => {
      if (isExportNamedDeclaration(path.node)) {
        if (isVariableDeclaration(path.node.declaration)) {
          transformNode(path.node.declaration.declarations[0].init)
        }
      }
    },
    ExportNamedDeclaration: ({ node: { declaration } }) => {
      if (
        isTSDeclareFunction(declaration) ||
        isTSInterfaceDeclaration(declaration)
      ) {
        transformNode(declaration)
      }
    }
  }
}

export default plugin
