import { createContext, useContext } from 'react';

export const QuickViewContext = createContext(() => {});
export const useQuickView = () => useContext(QuickViewContext);
