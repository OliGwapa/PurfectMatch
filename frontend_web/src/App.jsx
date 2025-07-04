
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import TheRoutes from './pages/TheRoutes';
import { SidebarProvider } from './contexts/SidebarContext';
import { AlertProvider } from './contexts/AlertContext';
import { DarkModeProvider } from './contexts/DarkModeContext';

function App() {
  return (
    <DarkModeProvider>
      <AlertProvider>
        <SidebarProvider>
          <Router>
            <TheRoutes />
          </Router>
        </SidebarProvider>
      </AlertProvider>
    </DarkModeProvider>
  );
}

export default App;