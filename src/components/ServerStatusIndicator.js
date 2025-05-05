import React, { useState, useEffect } from "react";
import api from "../services/api";

/**
 * Component to display the server connection status
 * Can be added to any page that needs to show backend connectivity
 */
const ServerStatusIndicator = ({ onStatusChange = () => {} }) => {
  const [status, setStatus] = useState("checking");
  const [lastChecked, setLastChecked] = useState(null);
  const [error, setError] = useState("");

  const checkServerStatus = async () => {
    try {
      setStatus("checking");
      const result = await api.pingServer();

      if (result.isConnected) {
        setStatus("connected");
        setError("");
      } else {
        setStatus("disconnected");
        setError(result.error || "Could not connect to the server");
      }

      setLastChecked(new Date());
      onStatusChange(status === "connected");
    } catch (err) {
      setStatus("error");
      setError(err.message || "Error checking server status");
      onStatusChange(false);
    }
  };

  useEffect(() => {
    checkServerStatus();
    // Check status every 30 seconds
    const intervalId = setInterval(checkServerStatus, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // Different status indicator styles
  const statusStyles = {
    checking: "bg-blue-100 text-blue-800",
    connected: "bg-green-100 text-green-800",
    disconnected: "bg-red-100 text-red-800",
    error: "bg-orange-100 text-orange-800",
  };

  const getStatusText = () => {
    switch (status) {
      case "checking":
        return "Checking server status...";
      case "connected":
        return "Connected to server";
      case "disconnected":
        return "Disconnected from server";
      case "error":
        return "Error connecting to server";
      default:
        return "Unknown status";
    }
  };

  const getLastCheckedText = () => {
    if (!lastChecked) return "";
    return `Last checked: ${lastChecked.toLocaleTimeString()}`;
  };

  if (status === "connected") {
    return null; // Don't show anything when connected
  }

  return (
    <div className={`px-4 py-3 rounded mb-4 ${statusStyles[status]}`}>
      <div className="flex items-center">
        <div
          className={`w-3 h-3 rounded-full mr-2 ${
            status === "connected" ? "bg-green-500" : "bg-red-500"
          }`}
        ></div>
        <div>
          <p className="font-medium">{getStatusText()}</p>
          {error && <p className="text-sm mt-1">{error}</p>}
          {status !== "checking" && (
            <p className="text-xs mt-1">{getLastCheckedText()}</p>
          )}
          {(status === "disconnected" || status === "error") && (
            <div className="mt-2">
              <button
                onClick={checkServerStatus}
                className="text-sm px-3 py-1 bg-white rounded border hover:bg-gray-50"
              >
                Retry Connection
              </button>
              <p className="text-sm mt-2">
                Make sure the backend server is running at the correct URL
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServerStatusIndicator;
