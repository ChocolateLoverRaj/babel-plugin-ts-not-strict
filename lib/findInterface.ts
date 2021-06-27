import { NodePath } from '@babel/traverse'
import { isTSInterfaceDeclaration, TSInterfaceDeclaration } from '@babel/types'

const findInterface = (
  path: NodePath | null,
  name: string
): TSInterfaceDeclaration | undefined => {
  while (true) {
    if (path === null) return
    if (path.isBlock()) {
      const interfaceNode = path.node.body.find(node => isTSInterfaceDeclaration(node) && node.id.name === name)
      if (interfaceNode !== undefined) return interfaceNode as TSInterfaceDeclaration
      path = path.parentPath
    } else path = path?.parentPath
  }
}

export default findInterface
