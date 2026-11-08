import React, { useState } from 'react';
import {
  RotateCcw,
  X,
  AlertTriangle,
  Info,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { useOperations } from '../context/OperationsContext';

interface HeaderProps {
  collapsed: boolean;
  onOpenDemoGuide?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ collapsed }) => {
  const { activeTab, setActiveTab, alerts, resetDemoData, setSelectedBatchId } = useOperations();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'overview':
        return 'Operations Overview';
      case 'production':
        return 'Production & WIP';
      case 'quality':
        return 'Quality Control';
      case 'materials':
        return 'Material Readiness';
      case 'analytics':
        return 'Rejection Analytics';
      default:
        return 'Operations Overview';
    }
  };

  const title = getPageTitle(activeTab);

  const handleAlertClick = (alert: (typeof alerts)[0]) => {
    setShowNotifications(false);
    if (alert.module) {
      setActiveTab(alert.module);
      if (alert.targetId) {
        setSelectedBatchId(alert.targetId);
      }
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-20 bg-[#F4F5F7] transition-all duration-300 ${
          collapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        <div className="px-8 pt-6 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Breadcrumb & Title */}
          <div>
            <div className="text-xs font-medium text-slate-500 tracking-wide">
              Coimbatore Plant • Line 1 • Sun, 08 Nov 2026
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              {title}
            </h1>
          </div>

          {/* Top Right Controls */}
          <div className="flex items-center gap-3 self-end md:self-auto flex-shrink-0">
            {/* Reset Demo Button */}
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-colors"
            >
              Reset demo
            </button>

            {/* Alerts Pill Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
              >
                <span>Alerts</span>
                <span className="flex items-center justify-center text-[10px] font-bold text-[#D32F2F] bg-red-50 border border-red-200 px-1.5 py-0.2 rounded-full min-w-4 text-center">
                  {alerts.length || 7}
                </span>
              </button>

              {/* Notification Popup */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in duration-150">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">Plant Alerts & Actions</span>
                      <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded-full">
                        {alerts.length} Triggered
                      </span>
                    </div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {alerts.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        <CheckCircle size={22} className="mx-auto mb-2 text-emerald-500" />
                        No active operational bottlenecks or material shortages.
                      </div>
                    ) : (
                      alerts.map((alert) => (
                        <div
                          key={alert.id}
                          onClick={() => handleAlertClick(alert)}
                          className="p-3 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3"
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {alert.type === 'critical' ? (
                              <AlertTriangle size={15} className="text-[#D32F2F]" />
                            ) : alert.type === 'warning' ? (
                              <AlertTriangle size={15} className="text-amber-500" />
                            ) : (
                              <Info size={15} className="text-blue-500" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-slate-900">{alert.title}</span>
                              <ExternalLink size={12} className="text-slate-400" />
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                              {alert.message}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-lg bg-[#FEEBED] text-[#D32F2F] flex items-center justify-center font-bold text-xs">
                LE
              </div>
              <div className="text-left leading-tight">
                <div className="text-xs font-bold text-slate-900">
                  Luker Enabler
                </div>
                <div className="text-[10px] text-slate-400">
                  Operations Lead
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Confirmation Modal for Reset Demo */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="p-2.5 bg-red-50 rounded-lg">
                <RotateCcw size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reset Demo Data?</h3>
                <p className="text-xs text-slate-500">Restore baseline synthetic demonstration state</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              This action will reset all recorded movements, quality inspection logs, material staging updates, and rejection root-cause investigations back to the initial baseline (including the 100-capacitor shortage for batch <strong>FAN-2026-001</strong>).
            </p>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetDemoData();
                  setShowResetConfirm(false);
                }}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-[#D32F2F] hover:bg-red-700 rounded-lg transition-colors shadow-sm"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
