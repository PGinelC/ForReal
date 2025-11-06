import React, { useState, useEffect, useRef } from "react";

function Dispatcher() {
    const [message, setMessage] = useState("");
    const [responses, setResponses] = useState([]); // log of messages
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef(null);

    useEffect(() => {
        let reconnectTimeout = null;

        const connectWebSocket = () => {
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
                reconnectTimeout = null;
            }
            if (
                ws.current?.readyState === WebSocket.OPEN ||
                ws.current?.readyState === WebSocket.CONNECTING
            ) {
                return;
            }

            ws.current = new WebSocket("ws://127.0.0.1:8000/ws");

            ws.current.onopen = () => {
                console.log("Connected to Python WebSocket");
                setIsConnected(true);
                setResponses((prev) => [...prev, "Connected to Python..."]);
            };

            ws.current.onerror = (error) => {
                console.error("WebSocket error:", error);
                setResponses((prev) => [...prev, "Error: WebSocket connection failed"]);
            };

            // Handle messages received
            ws.current.onmessage = (event) => {
                try {
                    const payload = JSON.parse(event.data);
                    const action = payload.action;
                    const data = payload.data;

                    // (NEW) Route the message based on the action
                    switch (action) {
                    case "acknowledgement":
                        // This is a reply to our "echo" message
                        setResponses((prev) => [...prev, `Python (Ack): ${data}`]);
                        break;

                    case "server_push":
                        // This is a broadcast message from the server (from the /push-test endpoint)
                        setResponses((prev) => [
                        ...prev,
                        `>>> SERVER PUSH: ${data.message}`,
                        ]);
                        break;

                    case "broadcast_message":
                        // This is a broadcast from another user
                        setResponses((prev) => [...prev, `Broadcast: ${data}`]);
                        break;

                    case "error":
                        // This is an error message from the server
                        setResponses((prev) => [...prev, `!!! Python (Error): ${data}`]);
                        break;

                    default:
                        // Handle unknown actions
                        setResponses((prev) => [...prev, `Unknown action: ${action}`]);
                    }
                } catch (error) {
                    console.error("Failed to parse incoming message:", event.data, error);
                    setResponses((prev) => [...prev, `Failed to parse: ${event.data}`]);
                }
            };

            ws.current.onclose = (event) => {
                if (event.code !== 1000) {
                    // 1000 is normal closure
                    console.log("WebSocket disconnected", event.code, event.reason);
                    setIsConnected(false);
                    setResponses((prev) => [
                    ...prev,
                    "Disconnected from Python... Attempting to reconnect...",
                    ]);

                    // Attempt to reconnect after 3 seconds if not unmounting
                    reconnectTimeout = setTimeout(connectWebSocket, 3000);
                }
            };
        };

        // Initial connection
        connectWebSocket();

        // Cleanup on unmount
        return () => {
            // Clear any pending reconnection attempts
            if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
            }

            if (ws.current) {
            ws.current.close(1000, "Component unmounting");
            ws.current = null;
            }
        };
    }, []);

    const sendMessage = (action) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
        setResponses((prev) => [...prev, "Error: WebSocket is not connected"]);
        return;
    }

    if (message) {
        const payload = {
        action: action,
        data: message,
        };
        ws.current.send(JSON.stringify(payload));
        setResponses((prev) => [...prev, `Me (${action}): ${message}`]);
        setMessage("");
    }
    };

    return <></>

    }