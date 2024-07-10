import { PropsWithChildren, createContext, useContext, useMemo, useReducer } from "react";
import { ItemComponent } from "../Items";
import Egg from "../Items/Egg";
import { PaprikaChips, SaltChips } from "../Items/Chips";

type Slot = { x: number, y: number };

export const DOUBLE_SLOTS: Slot[] = [
  { y: 0, x: 0 }, { y: 0, x: 2 }, { y: 0, x: 4 }, { y: 0, x: 6 },
  { y: 1, x: 0 }, { y: 1, x: 2 }, { y: 1, x: 4 }, { y: 1, x: 6 },
  { y: 2, x: 0 }, { y: 2, x: 2 }, { y: 2, x: 4 }, { y: 2, x: 6 },
];

const DOUBLE_ITEMS: ItemComponent[] = [Egg, SaltChips, PaprikaChips];

export const SINGLE_SLOTS: Slot[] = [
  { y: 3, x: 0 }, { y: 3, x: 1 }, { y: 3, x: 2 }, { y: 3, x: 3 },
  { y: 3, x: 4 }, { y: 3, x: 5 }, { y: 3, x: 6 }, { y: 3, x: 7 },
  { y: 4, x: 0 }, { y: 4, x: 1 }, { y: 4, x: 2 }, { y: 4, x: 3 },
  { y: 4, x: 4 }, { y: 4, x: 5 }, { y: 4, x: 6 }, { y: 4, x: 7 },
];

type StoreProviderProps = PropsWithChildren;

export type StoreItem = {
  id: number;
  type: ItemComponent;
  state: 'inStore' | 'ordering';
  x: number;
  y: number;
  double: boolean;
};

type StoreState = StoreItem[];

type StoreAction =
  | { type: 'order', id: number }
  | { type: 'release', id: number };

const reducer = (prevState: StoreState, action: StoreAction): StoreState => {
  switch (action.type) {
    case 'order':
      return prevState.map(s => s.id === action.id && s.state === 'inStore' ? { ...s, state: 'ordering' } : s);
    case 'release':
      return prevState.filter(s => s.id !== action.id);
    default:
      return prevState;
  }
};

const initializer = (state: StoreState): StoreState => {
  let id = 0;
  const emptySlots: Slot[] = [];
  const distributed: ItemComponent[] = [];

  DOUBLE_SLOTS.forEach(({ x, y }) => {
    if (Math.random() > 0.3) {
      emptySlots.push({ x, y });
      return;
    }

    const type = DOUBLE_ITEMS[Math.floor(Math.random() * DOUBLE_ITEMS.length)];
    distributed.push(type);

    state = [...state, { id: id++, type, state: 'inStore', x, y, double: true }];
  });

  DOUBLE_ITEMS.filter(i => !distributed.includes(i)).forEach(type => {
    const slotIndex = Math.floor(Math.random() * emptySlots.length);
    const { x, y } = emptySlots[slotIndex];
    emptySlots.splice(slotIndex, 1);
    state = [...state, { id: id++, type, state: 'inStore', x, y, double: true }];
  });

  return state;
};

const parseCode = (val: string): [number, number] => {
  if (val.length !== 2) {
    return [NaN, NaN];
  }

  return [parseInt(val.charAt(1)) - 1, parseInt(val.charAt(0)) - 1];
};

const StoreContext = createContext<{
  store: StoreState;
  available: (val: string) => boolean;
  order: (val: string) => void;
  release: (id: number) => void;
} | undefined>(undefined);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};

export const useItem = (x: number, y: number) => {
  const { store } = useStore();
  return useMemo(() => store.find(i => i.x === x && i.y === y), [store, x, y]);
};

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const [store, dispatch] = useReducer(reducer, [] as StoreState, initializer);

  const find = (x: number, y: number) => store.find(s => s.state === 'inStore' && s.x === x && s.y === y);

  const available = (val: string) => {
    const [x, y] = parseCode(val);
    return !!find(x, y);
  };

  const order = (val: string) => {
    const [x, y] = parseCode(val);
    const item = find(x, y);
    item && dispatch({ type: 'order', id: item.id });
  };

  const release = (id: number) => {
    dispatch({ type: 'release', id });
  };

  const value = useMemo(() => ({ store, available, order, release }), [store]);

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};
