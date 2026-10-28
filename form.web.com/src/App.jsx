import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ApiProvider } from "./context/ApiContext.jsx";
import { AppProvider } from "./context/AppContext.jsx";
import Form from "./pages/Form.jsx";
function App() {
  return (
    <ApiProvider>
      <AppProvider>
        <Router>
          <div className='min-h-screen bg-gray-50'>
            <Routes>
              <Route path='/' element={<Form />} />
            </Routes>
            <Toaster
              position='top-right'
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#fff",
                  color: "#374151",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                },
              }}
            />
          </div>
        </Router>
      </AppProvider>
    </ApiProvider>
  );
}

export default App;
