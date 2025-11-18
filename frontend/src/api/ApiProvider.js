import React, { useState } from 'react';
import { ApiContext } from './ApiContext';

const BACKEND_URL = "http://127.0.0.1:8000/"

export const ApiProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [callbackFunctions, setCallbackFunctions] = useState({});

  useEffect(() => {
    const socket = new WebSocket(`${BACKEND_URL}/ws`);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const action = data.action; // Assuming the data has an 'action' field
      const callbacks = callbackFunctions[action] || [];
      callbacks.forEach(callback => callback(data));
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      socket.close();
    };
  }, [callbackFunctions]);

  const postData = async (endpoint, payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Success:', result);
      setLoading(false);
      return result;
    
    } catch (e) {
      setError(e.message);
      setLoading(false);
      return null;
    }
  };

  const getData = async (endpoint) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Success:', result);
      setLoading(false);
      return result;
    
    } catch (e) {
      setError(e.message);
      setLoading(false);
      return null;
    }
  };

  // what if you want to register several components to the same action
  const addCallback = (action, callbackFunction) => {
    setCallbackFunctions(prev => {
      const existingCallbacks = prev[action] || [];
      return { ...prev, [action]: [...existingCallbacks, callbackFunction] };
    });
  };

  const removeCallback = (action, callbackFunction) => {
    setCallbackFunctions(prev => {
      const existingCallbacks = prev[action] || [];
      const filteredCallbacks = existingCallbacks.filter(cb => cb !== callbackFunction);
      return { ...prev, [action]: filteredCallbacks };
    });
  };

  return (
    <ApiContext.Provider value={
      {loading,
      error,
      postData,
      getData,
      addCallback,
      removeCallback}}>
      {children}
    </ApiContext.Provider>
  );
};