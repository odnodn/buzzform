export type NodeType =
    | 'text'
    | 'email'
    | 'password'
    | 'group'
    | 'row';

export type Node = {
    id: string;
    type: NodeType;
    parentId: string | null;
    children: string[];
};
