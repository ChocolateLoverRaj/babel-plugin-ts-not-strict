import { NodePath } from '@babel/traverse'
import { isTSInterfaceDeclaration, TSInterfaceDeclaration } from '@babel/types'

const findInterface = (path: NodePath, name: string): TSInterfaceDeclaration | undefined => {
  while (true) {
    if (path.isBlock()) {
      const interfaceNode = path.node.body.find(node => isTSInterfaceDeclaration(node) && node.id.name === name)
      if (interfaceNode !== undefined) return interfaceNode as TSInterfaceDeclaration
      if (path.parentPath === null) return undefined
      path = path.parentPath
    }
  }
}

export default findInterface
