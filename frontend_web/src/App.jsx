
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import TheRoutes from './pages/TheRoutes';
import { SidebarProvider } from './contexts/SidebarContext';
import { AlertProvider } from './contexts/AlertContext';

function App() {
  return (
    <AlertProvider>
      <SidebarProvider>
        <Router>
          <TheRoutes />
        </Router>
      </SidebarProvider>
    </AlertProvider>
  );
}

export default App;