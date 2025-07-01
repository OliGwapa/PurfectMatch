
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import TheRoutes from './pages/TheRoutes';
import { SidebarProvider } from './components/sidebar-c/SidebarContext';

function App() {
  return (
    <SidebarProvider>
      <Router>
        <TheRoutes />
      </Router>
    </SidebarProvider>
  );
}

export default App;