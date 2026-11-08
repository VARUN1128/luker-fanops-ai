import React from 'react';
import {
  LayoutGrid,
  CheckCircle2,
  Boxes,
  TrendingDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useOperations } from '../context/OperationsContext';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const { activeTab, setActiveTab, kpis, alerts } = useOperations();

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutGrid,
      badge: '7',
      badgeType: 'active-red',
    },
    {
      id: 'production',
      label: 'Production & WIP',
      icon: () => (
        <span className="flex flex-col gap-0.5 w-4 h-4 justify-center items-center">
          <span className="w-3.5 h-[2px] bg-current rounded-full" />
          <span className="w-2.5 h-[2px] bg-current rounded-full self-start ml-0.5" />
        </span>
      ),
      badge: `${kpis.delayedBatches || 1} delay`,
      badgeType: 'dark',
    },
    {
      id: 'quality',
      label: 'Quality Control',
      icon: CheckCircle2,
      badge: '168',
      badgeType: 'dark',
    },
    {
      id: 'materials',
      label: 'Material Readiness',
      icon: Boxes,
      badge: kpis.batchesBlockedByShortage > 0 ? 'Blocked' : 'Ready',
      badgeType: 'dark',
    },
    {
      id: 'analytics',
      label: 'Rejection Analytics',
      icon: TrendingDown,
      badge: `${kpis.totalRejectedUnits || 19}`,
      badgeType: 'dark',
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen bg-[#11141B] text-slate-300 border-r border-[#1C212B] transition-all duration-300 flex flex-col justify-between select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Brand Lockup */}
        <div className="p-5 border-b border-[#1C212B]">
          <div className="flex items-center justify-between">
            {!collapsed ? (
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-white tracking-wider">LUKER</span>
                  <span className="text-xl font-bold text-[#E53935] tracking-tight">FanOps</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 font-normal tracking-wide">
                  Manufacturing Operations Intelligence
                </div>
              </div>
            ) : (
              <div className="w-full text-center">
                <span className="text-lg font-black text-[#E53935]">L</span>
              </div>
            )}

            <button
              onClick={onToggleCollapse}
              aria-label="Toggle sidebar"
              className="p-1 rounded-md hover:bg-slate-800 text-slate-500 hover:text-white transition-colors"
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="py-4 px-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all group relative ${
                  isActive
                    ? 'bg-[#D32F2F] text-white shadow-sm'
                    : 'text-slate-300 hover:bg-[#1A1F2A] hover:text-white'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div className="w-5 flex items-center justify-center flex-shrink-0 text-slate-400 group-hover:text-white transition-colors">
                  <Icon size={18} />
                </div>

                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="truncate text-[13px] tracking-tight">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full whitespace-nowrap ml-2 ${
                          isActive
                            ? 'bg-black/25 text-white'
                            : 'bg-[#1D222D] text-slate-300 border border-[#272D3B]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Collapsed Tooltip */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-[11px] rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 z-50 whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Plant Status */}
      <div className="p-4 border-t border-[#1C212B]">
        {!collapsed ? (
          <div className="flex items-center gap-2 px-2 py-1.5 bg-[#171B24] rounded-lg border border-[#232938] text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
            <span className="truncate">Plant sensor sync • v1.0-prod</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
        )}
      </div>
    </aside>
  );
};
