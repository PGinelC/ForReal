import { createContext, useContext, useState } from 'react';

const defaultApiState = {
  loading: false,
  error: null,
  sendData: async (data) => {},
};

export const ApiContext = createContext(defaultApiState);

export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};