import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Toast } from '../components/Toast';
import { DemoScenarioWalkthrough } from '../components/DemoScenarioWalkthrough';
import { useOperations } from '../context/OperationsContext';

// Pages
import { OverviewPage } from '../pages/OverviewPage';
import { ProductionPage } from '../pages/ProductionPage';
import { QualityPage } from '../pages/QualityPage';
import { MaterialsPage } from '../pages/MaterialsPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';

export const DashboardLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showDemoGuide, setShowDemoGuide] = useState(false);
  const { activeTab } = useOperations();

  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPage />;
      case 'production':
        return <ProductionPage />;
      case 'quality':
        return <QualityPage />;
      case 'materials':
        return <MaterialsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-slate-900 flex flex-col font-sans antialiased selection:bg-[#D32F2F] selection:text-white">
      {/* Persistent Left Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <Header
          collapsed={sidebarCollapsed}
          onOpenDemoGuide={() => setShowDemoGuide(true)}
        />

        {/* Dynamic Page Content */}
        <main
          className={`flex-1 px-8 py-5 transition-all duration-300 ${
            sidebarCollapsed ? 'pl-24' : 'pl-72'
          }`}
        >
          <div className="max-w-[1400px] mx-auto">
            {renderActivePage()}
            <Footer />
          </div>
        </main>
      </div>

      {/* Slide-over Guided Demo Scenario Walkthrough Modal */}
      <DemoScenarioWalkthrough
        isOpen={showDemoGuide}
        onClose={() => setShowDemoGuide(false)}
      />

      {/* Floating Toast Notification Stack */}
      <Toast />
    </div>
  );
};
