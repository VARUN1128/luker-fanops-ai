import React from 'react';
import { OperationsProvider } from './context/OperationsContext';
import { DashboardLayout } from './layouts/DashboardLayout';

export function App() {
  return (
    <OperationsProvider>
      <DashboardLayout />
    </OperationsProvider>
  );
}

export default App;
