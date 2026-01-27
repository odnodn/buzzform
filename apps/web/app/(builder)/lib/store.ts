import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import { Node, NodeType } from './types';

type Store = {
    nodes: Record<string, Node>;
    rootIds: string[];

    createNode: (type: NodeType, parentId: string | null, index?: number) => void;
    moveNode: (id: string, newParentId: string | null, index: number) => void;
    dropIndicator: {
        parentId: string | null;
        index: number;
    } | null;
    setDropIndicator: (value: { parentId: string | null; index: number } | null) => void;

};

export const useBuilderStore = create<Store>()(
    immer((set) => ({
        nodes: {},
        rootIds: [],

        createNode: (type, parentId, index = 0) => {
            const id = nanoid();

            set(state => {
                state.nodes[id] = {
                    id,
                    type,
                    parentId,
                    children: [],
                };

                if (parentId === null) {
                    state.rootIds.splice(index, 0, id);
                } else {
                    state.nodes[parentId].children.splice(index, 0, id);
                }
            });
        },

        moveNode: (id, newParentId, index) => {
            set(state => {
                const node = state.nodes[id];

                const oldParentId = node.parentId;
                const oldList =
                    oldParentId === null
                        ? state.rootIds
                        : state.nodes[oldParentId].children;

                const oldIndex = oldList.indexOf(id);
                oldList.splice(oldIndex, 1);
                if (oldParentId === newParentId && oldIndex < index) {
                    index -= 1;
                }
                node.parentId = newParentId;

                const newList =
                    newParentId === null
                        ? state.rootIds
                        : state.nodes[newParentId].children;

                newList.splice(index, 0, id);
            });
        },
        dropIndicator: null,
        setDropIndicator: (value) => set({ dropIndicator: value }),
    }))
);
