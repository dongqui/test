import { find } from 'lodash';
import { v4 as uuid } from 'uuid';

const saveChildrenId = (before: string[], key: string) => {
  const result = before.concat(key);
  return result;
};

const changeNodeDepthById = (nodes: LP.Node[], childId: string, parentNode: LP.Node) => {
  const changeNode = find(nodes, { id: childId });
  let memory: string[] = [];

  if (changeNode) {
    changeNode.id = uuid();
    changeNode.parentId = parentNode.id;
    changeNode.filePath = parentNode.filePath + `\\${parentNode.name}`;

    parentNode.childrens = parentNode.childrens.concat(changeNode.id);

    nodes = nodes.concat(changeNode);

    if (changeNode.childrens.length > 0) {
      changeNode.childrens.map((child) => {
        memory = saveChildrenId(memory, child);
        changeNodeDepthById(nodes, child, changeNode);
      });
    }

    changeNode.childrens = changeNode.childrens.filter((key) => !memory.includes(key));
  }
};

export default changeNodeDepthById;
