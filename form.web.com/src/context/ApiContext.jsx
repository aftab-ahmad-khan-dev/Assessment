import React, { createContext, useContext, useState, useCallback } from "react";
import mockData from "../data/mockData.js"; // I use this for testing

const ApiContext = createContext();

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
};

export const ApiProvider = ({ children }) => {
  const [config] = useState({
    useApi: true, // true = real backend, false = mock
    baseUrl: import.meta.env.VITE_BASE_URL || "http://localhost:3000",
  });

  // ───────────────────────────────────────────────
  // Mock implementation (for development / testing)
  // ───────────────────────────────────────────────
  const mockApiCall = useCallback((endpoint, method = "GET", data = null) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (endpoint === "/submit" && method === "POST") {
          // You can expand this mock logic if needed
          // For now: just echo back what was sent + some id
          const mockResponse = {
            success: true,
            message: data?.resumeToken ? "Draft updated" : "Form submitted",
            recordId: `mock-${Date.now()}`,
            resumeToken: data?.resumeToken || `token-${Date.now()}`,
            ...data,
          };
          resolve({ data: mockResponse });
        } else if (endpoint === "/draft" && method === "GET") {
          // Mock draft retrieval
          resolve({
            data: {
              draft: mockData?.draft || null,
              resumeToken: mockData?.resumeToken || null,
            },
          });
        } else {
          reject(
            new Error(`Mock: Endpoint ${endpoint} (${method}) not implemented`),
          );
        }
      }, 400);
    });
  }, []);

  // ───────────────────────────────────────────────
  // Real backend calls
  // ───────────────────────────────────────────────
  const realApiCall = useCallback(
    async (endpoint, method = "GET", data = null) => {
      const url = `${config.baseUrl}${endpoint}`;
      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (data && method !== "GET") {
        options.body = JSON.stringify(data);
      }

      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          let errorMessage = response.statusText;
          try {
            const errData = await response.json();
            errorMessage = errData.message || errorMessage;
          } catch {}
          throw new Error(errorMessage);
        }
        return await response.json();
      } catch (err) {
        console.error(`API ${method} ${endpoint} failed:`, err);
        throw err;
      }
    },
    [config.baseUrl],
  );

  const apiCall = useCallback(
    (endpoint, method, data) =>
      config.useApi
        ? realApiCall(endpoint, method, data)
        : mockApiCall(endpoint, method, data),
    [config.useApi, realApiCall, mockApiCall],
  );

  // ───────────────────────────────────────────────
  // Public API methods (only the two you need)
  // ───────────────────────────────────────────────
  const submitForm = useCallback(
    (formData) => apiCall("/submit", "POST", formData),
    [apiCall],
  );

  const getDraft = useCallback(
    (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const endpoint = `/draft${query ? `?${query}` : ""}`;
      return apiCall(endpoint, "GET");
    },
    [apiCall],
  );

  const value = {
    config,
    submitForm,
    getDraft,
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};
