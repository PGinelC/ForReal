import React, { createContext, useState, useEffect, useContext } from 'react';

const API_BASE_URL = 'http://localhost:8000';

const ApiContext = createContext();

export const useApi = () => {
  return useContext(ApiContext);
};

export const ApiProvider = ({ children }) => {
  const [streamData, setStreamData] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');

  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/stream`);

    eventSource.onopen = () => {
      setConnectionStatus('Connected');
    };

    eventSource.onerror = (error) => {
      console.error('EventSource Error:', error);
      setConnectionStatus('Error/Disconnected');
    };

    eventSource.addEventListener('http_request', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received http_request event:', data);
        setStreamData(prevData => [...prevData, { message: data.message }]);
      } catch (e) {
        console.error('Failed to parse http_request data:', e);
      }
    });

    return () => {
      eventSource.close();
      setConnectionStatus('Closed');
    };
  }, []);

  const sendGET = async (endpoint = '/') => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, response: data, status: response.status };
      } else {
        return { success: false, error: data, status: response.status };
      }
    } catch (error) {
      return { success: false, error: { message: error.message }, status: 0 };
    }
  };

  const sendPOST = async (endpoint = '/', payload = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok) {
        return { success: true, response: data, status: response.status };
      } else {
        return { success: false, error: data, status: response.status };
      }
    } catch (error) {
      return { success: false, error: { message: error.message }, status: 0 };
    }
  };

  const value = {
    streamData,
    connectionStatus,
    sendGET,
    sendPOST
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};