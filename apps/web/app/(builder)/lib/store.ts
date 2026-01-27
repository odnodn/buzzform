import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import type { Node, FieldType } from './types';
import { builderFieldRegistry } from './registry';

type Store = {
    nodes: Record<string, Node>;
    rootIds: string[];
    selectedId: string | null;

    createNode: (type: FieldType, parentId: string | null, index?: number) => void;
    moveNode: (id: string, newParentId: string | null, index: number) => void;
    selectNode: (id: string | null) => void;
    removeNode: (id: string) => void;
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
        selectedId: null,

        createNode: (type, parentId, index = 0) => {
            const id = nanoid();
            const entry = builderFieldRegistry[type];
            if (!entry) return;

            const name = `${type}_${id.slice(0, 4)}`;

            set(state => {
                const fieldProps = entry.kind === 'data'
                    ? { ...entry.defaultProps, name }
                    : { ...entry.defaultProps };

                state.nodes[id] = {
                    id,
                    field: fieldProps as Node['field'],
                    parentId,
                    children: [],
                };

                if (parentId === null) {
                    state.rootIds.splice(index, 0, id);
                } else {
                    state.nodes[parentId].children.splice(index, 0, id);
                }

                state.selectedId = id;
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

        selectNode: (id) => set({ selectedId: id }),

        removeNode: (id) => {
            set(state => {
                const node = state.nodes[id];
                if (!node) return;

                const removeRecursive = (nodeId: string) => {
                    const n = state.nodes[nodeId];
                    if (n) {
                        n.children.forEach(removeRecursive);
                        delete state.nodes[nodeId];
                    }
                };

                const parentId = node.parentId;
                const list = parentId === null ? state.rootIds : state.nodes[parentId].children;
                const idx = list.indexOf(id);
                if (idx !== -1) list.splice(idx, 1);

                removeRecursive(id);

                if (state.selectedId === id) {
                    state.selectedId = null;
                }
            });
        },

        dropIndicator: null,
        setDropIndicator: (value) => set({ dropIndicator: value }),
    }))
);
