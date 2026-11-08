import React from 'react';
import { useOperations } from '../context/OperationsContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { notifications, dismissNotification } = useOperations();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`pointer-events-auto p-3.5 rounded-xl shadow-xl border flex items-start gap-3 transition-all animate-in slide-in-from-bottom-3 duration-200 ${
            n.type === 'success'
              ? 'bg-white border-emerald-300 text-gray-900 shadow-emerald-500/10'
              : n.type === 'error'
              ? 'bg-white border-red-300 text-gray-900 shadow-red-500/10'
              : 'bg-white border-blue-300 text-gray-900 shadow-blue-500/10'
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {n.type === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-600" />
            ) : n.type === 'error' ? (
              <AlertTriangle size={18} className="text-red-600" />
            ) : (
              <Info size={18} className="text-blue-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-bold text-gray-900">{n.title}</h5>
            <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">{n.message}</p>
          </div>
          <button
            onClick={() => dismissNotification(n.id)}
            className="text-gray-400 hover:text-gray-600 p-0.5"
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
