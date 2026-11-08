import React, { useState } from 'react';
import {
  CheckCircle2,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  FileCheck,
  Activity,
  Layers,
  X,
  User,
  Info,
  Calendar,
  Gauge,
  Zap,
  Volume2,
  Vibrate,
  Eye,
  Sliders,
  Edit2
} from 'lucide-react';
import { useOperations } from '../context/OperationsContext';
import {
  QualityInspection,
  DefectCategory,
  DEFECT_CATEGORIES
} from '../types';
import { formatNumber, formatPercent, formatDate } from '../lib/utils';

export const QualityPage: React.FC = () => {
  const {
    inspections,
    batches,
    createInspection,
    updateInspection,
    kpis,
    selectedBatchId,
    setSelectedBatchId
  } = useOperations();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [defectFilter, setDefectFilter] = useState<string>('All');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewInspection, setViewInspection] = useState<QualityInspection | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Form State for New Inspection
  const [selectedBatchForInspection, setSelectedBatchForInspection] = useState<string>(
    batches.find(b => b.status !== 'Completed' && b.plannedQuantity > b.inspectedQuantity)?.id || batches[0]?.id || ''
  );
  const [inspDate, setInspDate] = useState(new Date().toISOString().split('T')[0]);
  const [unitsInspected, setUnitsInspected] = useState<number>(50);
  const [passedQty, setPassedQty] = useState<number>(48);
  const [failedQty, setFailedQty] = useState<number>(2);
  const [defectCategory, setDefectCategory] = useState<DefectCategory | 'None'>('Motor noise');
  const [inspectorName, setInspectorName] = useState('Rajesh K. (Senior QC Lead)');
  const [reworkCount, setReworkCount] = useState<number>(2);
  const [scrapCount, setScrapCount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Illustrative Measurements
  const [rpm, setRpm] = useState<number>(380);
  const [voltage, setVoltage] = useState<number>(230);
  const [current, setCurrent] = useState<number>(0.14);
  const [power, setPower] = useState<number>(32);
  const [noiseDb, setNoiseDb] = useState<number>(42.5);
  const [vibrationMmS, setVibrationMmS] = useState<number>(1.6);
  const [visualDefects, setVisualDefects] = useState<number>(0);

  // Target batch
  const targetBatch = batches.find(b => b.id === selectedBatchForInspection);
  const remainingUninspected = targetBatch ? Math.max(0, targetBatch.plannedQuantity - targetBatch.inspectedQuantity) : 0;

  // Sync failed count to rework + scrap
  const handleUnitsInspectedChange = (val: number) => {
    setUnitsInspected(val);
    const pass = Math.max(0, val - failedQty);
    setPassedQty(pass);
  };

  const handlePassedChange = (val: number) => {
    setPassedQty(val);
    const fail = Math.max(0, unitsInspected - val);
    setFailedQty(fail);
    setReworkCount(Math.ceil(fail * 0.8));
    setScrapCount(fail - Math.ceil(fail * 0.8));
  };

  const handleFailedChange = (val: number) => {
    setFailedQty(val);
    const pass = Math.max(0, unitsInspected - val);
    setPassedQty(pass);
    setReworkCount(Math.ceil(val * 0.8));
    setScrapCount(val - Math.ceil(val * 0.8));
    if (val === 0) {
      setDefectCategory('None');
    } else if (defectCategory === 'None') {
      setDefectCategory('Motor noise');
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBatch) return;

    const status = failedQty === 0 ? 'Passed' : failedQty < unitsInspected * 0.1 ? 'Conditional' : 'Failed';

    const success = createInspection({
      batchId: targetBatch.id,
      fanModel: targetBatch.fanModel,
      inspectionDate: inspDate,
      unitsInspected: Number(unitsInspected),
      passed: Number(passedQty),
      failed: Number(failedQty),
      defectCategory,
      inspector: inspectorName,
      status,
      notes,
      reworkCount: Number(reworkCount),
      scrapCount: Number(scrapCount),
      measurements: {
        rpm: Number(rpm),
        voltage: Number(voltage),
        current: Number(current),
        power: Number(power),
        noiseDb: Number(noiseDb),
        vibrationMmS: Number(vibrationMmS),
        visualDefectCount: Number(visualDefects),
        isIllustrativeOnly: true
      }
    });

    if (success) {
      setShowCreateModal(false);
      setNotes('');
    }
  };

  // Filtered Inspections
  const filteredInspections = inspections.filter(ins => {
    const matchesSearch =
      ins.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ins.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ins.fanModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ins.inspector.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || ins.status === statusFilter;
    const matchesDefect = defectFilter === 'All' || ins.defectCategory === defectFilter;
    return matchesSearch && matchesStatus && matchesDefect;
  });

  return (
    <div className="space-y-6">
      {/* Quality Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">QC Inspection Coverage</span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-mono">
              {formatPercent(kpis.qcCoverage)}
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {formatNumber(kpis.totalUnitsInspected)}
            <span className="text-xs font-normal text-slate-400 font-sans ml-1">/ {formatNumber(kpis.totalUnitsInspected + kpis.totalUnitsPendingInspection)} units</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Eligible volume tested</span>
            <span className="text-slate-700 font-medium">{inspections.length} inspection logs</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">First-Time Pass Rate</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-mono">
              Target &gt; 95%
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono">
            {formatPercent(kpis.qcPassRate)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Passed sound & electrical</span>
            <span className="text-emerald-700 font-medium">{formatNumber(inspections.reduce((s, i) => s + i.passed, 0))} units cleared</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Non-Conforming Units</span>
            <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full font-mono">
              {inspections.reduce((s, i) => s + i.failed, 0)} Units
            </span>
          </div>
          <div className="text-2xl font-bold text-[#D32F2F] mt-1 font-mono">
            {inspections.reduce((s, i) => s + i.failed, 0)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Routed to disposition</span>
            <span className="text-slate-700 font-medium">{kpis.reworkQuantity} Rework • {kpis.scrapQuantity} Scrap</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Test Bench Queue</span>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-mono">
              Pending
            </span>
          </div>
          <div className={`text-2xl font-bold mt-1 font-mono ${kpis.totalUnitsPendingInspection > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {formatNumber(kpis.totalUnitsPendingInspection)}
            <span className="text-xs font-normal text-slate-400 font-sans ml-1">units</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Awaiting final inspection</span>
            <span className="text-amber-700 font-medium">Station throughput active</span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Inspection ID, Batch, Fan Model, or Inspector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-2.5 text-xs border border-gray-300 rounded-lg bg-white text-gray-700"
            >
              <option value="All">All QC Statuses</option>
              <option value="Passed">Passed</option>
              <option value="Conditional">Conditional</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <select
            value={defectFilter}
            onChange={(e) => setDefectFilter(e.target.value)}
            className="py-2 px-2.5 text-xs border border-gray-300 rounded-lg bg-white text-gray-700"
          >
            <option value="All">All Defects</option>
            <option value="None">None (100% Pass)</option>
            {DEFECT_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#D32F2F] hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex-shrink-0"
        >
          <Plus size={15} />
          <span>Record Quality Inspection</span>
        </button>
      </div>

      {/* Quality Notice Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-blue-900">
        <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Quality Inspection Rules & Traceability:</span>
          <span className="text-blue-800 ml-1">
            Passed + Failed units must strictly balance with Units Inspected. Failed units automatically route to Rejection Analytics (Module 4) where rework and scrap classifications are monitored without contaminating unique completed batch counts.
          </span>
        </div>
      </div>

      {/* Inspection Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Batch Inspection Records</h3>
            <p className="text-xs text-gray-500">Traceable electrical, acoustic, and mechanical test results</p>
          </div>
          <span className="text-xs text-gray-500 font-mono">
            {filteredInspections.length} record(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Inspection ID</th>
                <th className="py-3 px-4">Batch ID</th>
                <th className="py-3 px-4">Fan Model</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Inspected</th>
                <th className="py-3 px-4">Passed</th>
                <th className="py-3 px-4">Failed</th>
                <th className="py-3 px-4">Defect Category</th>
                <th className="py-3 px-4">Inspector</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInspections.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-gray-500">
                    No inspection records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredInspections.map((ins) => (
                  <tr
                    key={ins.id}
                    onClick={() => {
                      setViewInspection(ins);
                      setEditMode(false);
                    }}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                      {ins.id}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-700">
                      {ins.batchId}
                    </td>
                    <td className="py-3.5 px-4 text-gray-800">
                      {ins.fanModel}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                      {formatDate(ins.inspectionDate)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-gray-900">
                      {formatNumber(ins.unitsInspected)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-700 font-bold">
                      {formatNumber(ins.passed)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#D32F2F] font-bold">
                      {ins.failed > 0 ? ins.failed : '0'}
                    </td>
                    <td className="py-3.5 px-4">
                      {ins.defectCategory !== 'None' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          {ins.defectCategory}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">None (Clean)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-gray-700">
                      {ins.inspector}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          ins.status === 'Passed'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : ins.status === 'Conditional'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}
                      >
                        {ins.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewInspection(ins);
                          setEditMode(false);
                        }}
                        className="text-xs text-[#D32F2F] hover:underline font-semibold"
                      >
                        Inspect &rarr;
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Record Quality Inspection */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-[#D32F2F]" />
                <h3 className="text-base font-bold text-gray-900">Record Batch Quality Inspection</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Batch selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Select Production Batch
                  </label>
                  <select
                    value={selectedBatchForInspection}
                    onChange={(e) => setSelectedBatchForInspection(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                  >
                    {batches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.id} ({b.fanModel}) — Uninspected: {b.plannedQuantity - b.inspectedQuantity} units
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Inspection Date
                  </label>
                  <input
                    type="date"
                    required
                    value={inspDate}
                    onChange={(e) => setInspDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Quantities */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                <div className="text-xs font-bold text-gray-700 flex items-center justify-between">
                  <span>Unit Inspection Quantities</span>
                  <span className="font-mono text-[11px] text-gray-500">
                    Remaining Uninspected: {remainingUninspected} units
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Units Inspected
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={remainingUninspected || 500}
                      required
                      value={unitsInspected}
                      onChange={(e) => handleUnitsInspectedChange(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-700 mb-1">
                      Passed Units
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={unitsInspected}
                      required
                      value={passedQty}
                      onChange={(e) => handlePassedChange(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-emerald-300 rounded-lg font-mono font-bold text-emerald-700 bg-emerald-50/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-red-700 mb-1">
                      Failed Units
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={unitsInspected}
                      required
                      value={failedQty}
                      onChange={(e) => handleFailedChange(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-red-300 rounded-lg font-mono font-bold text-red-700 bg-red-50/20"
                    />
                  </div>
                </div>

                {failedQty > 0 && (
                  <div className="pt-2 border-t border-gray-200 grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Defect Category
                      </label>
                      <select
                        value={defectCategory}
                        onChange={(e) => setDefectCategory(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                      >
                        {DEFECT_CATEGORIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-amber-700 mb-1">
                        Awaiting Rework
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={failedQty}
                        value={reworkCount}
                        onChange={(e) => setReworkCount(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-red-700 mb-1">
                        Direct Scrap
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={failedQty}
                        value={scrapCount}
                        onChange={(e) => setScrapCount(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Illustrative Demonstration Measurement Fields */}
              <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <Sliders size={14} className="text-amber-700" />
                    <span>Illustrative Measurement Test Bench Fields</span>
                  </div>
                  <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-medium">
                    Demo Fields • Not Luker Factory Tolerances
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">
                      RPM (Speed)
                    </label>
                    <input
                      type="number"
                      value={rpm}
                      onChange={(e) => setRpm(Number(e.target.value))}
                      className="w-full px-2.5 py-1 text-xs border border-gray-300 rounded font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">
                      Voltage (V)
                    </label>
                    <input
                      type="number"
                      value={voltage}
                      onChange={(e) => setVoltage(Number(e.target.value))}
                      className="w-full px-2.5 py-1 text-xs border border-gray-300 rounded font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">
                      Current (A)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={current}
                      onChange={(e) => setCurrent(Number(e.target.value))}
                      className="w-full px-2.5 py-1 text-xs border border-gray-300 rounded font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">
                      Power (Watts)
                    </label>
                    <input
                      type="number"
                      value={power}
                      onChange={(e) => setPower(Number(e.target.value))}
                      className="w-full px-2.5 py-1 text-xs border border-gray-300 rounded font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">
                      Noise (dB)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={noiseDb}
                      onChange={(e) => setNoiseDb(Number(e.target.value))}
                      className="w-full px-2.5 py-1 text-xs border border-gray-300 rounded font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">
                      Vibration (mm/s)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={vibrationMmS}
                      onChange={(e) => setVibrationMmS(Number(e.target.value))}
                      className="w-full px-2.5 py-1 text-xs border border-gray-300 rounded font-mono"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">
                      Visual Paint / Scuff Defect Count
                    </label>
                    <input
                      type="number"
                      value={visualDefects}
                      onChange={(e) => setVisualDefects(Number(e.target.value))}
                      className="w-full px-2.5 py-1 text-xs border border-gray-300 rounded font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Inspector & Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Inspector Name & Certification
                  </label>
                  <input
                    type="text"
                    required
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Inspection Notes / Observations
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sound booth audit completed, no bearing rattle observed"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#D32F2F] hover:bg-red-700 rounded-lg shadow-sm"
                >
                  Save Inspection Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View / Edit Inspection Details */}
      {viewInspection && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span>Inspection: {viewInspection.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      viewInspection.status === 'Passed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : viewInspection.status === 'Conditional'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {viewInspection.status}
                  </span>
                </h3>
                <p className="text-xs text-gray-500">
                  Batch {viewInspection.batchId} ({viewInspection.fanModel})
                </p>
              </div>
              <button
                onClick={() => setViewInspection(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg text-center">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold">Inspected</div>
                  <div className="text-base font-bold text-gray-900 mt-0.5">{viewInspection.unitsInspected}</div>
                </div>
                <div>
                  <div className="text-[10px] text-emerald-700 uppercase font-bold">Passed</div>
                  <div className="text-base font-bold text-emerald-600 mt-0.5">{viewInspection.passed}</div>
                </div>
                <div>
                  <div className="text-[10px] text-red-700 uppercase font-bold">Failed</div>
                  <div className="text-base font-bold text-[#D32F2F] mt-0.5">{viewInspection.failed}</div>
                </div>
              </div>

              {/* Illustrative Measurements Display */}
              <div className="p-3 bg-amber-50/40 border border-amber-200/70 rounded-lg">
                <div className="text-[11px] font-bold text-amber-900 mb-2 flex items-center justify-between">
                  <span>Recorded Illustrative Test Bench Parameters:</span>
                  <span className="text-[10px] text-amber-700 font-mono">Demo Only</span>
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                  <div>RPM: <span className="font-bold text-gray-900">{viewInspection.measurements.rpm ?? '—'}</span></div>
                  <div>Voltage: <span className="font-bold text-gray-900">{viewInspection.measurements.voltage ?? '—'} V</span></div>
                  <div>Current: <span className="font-bold text-gray-900">{viewInspection.measurements.current ?? '—'} A</span></div>
                  <div>Power: <span className="font-bold text-gray-900">{viewInspection.measurements.power ?? '—'} W</span></div>
                  <div>Noise: <span className="font-bold text-gray-900">{viewInspection.measurements.noiseDb ?? '—'} dB</span></div>
                  <div>Vibration: <span className="font-bold text-gray-900">{viewInspection.measurements.vibrationMmS ?? '—'} mm/s</span></div>
                </div>
              </div>

              <div>
                <div className="font-semibold text-gray-700 mb-0.5">Inspector & Date:</div>
                <div className="text-gray-900">{viewInspection.inspector} on {formatDate(viewInspection.inspectionDate)}</div>
              </div>

              <div>
                <div className="font-semibold text-gray-700 mb-0.5">Observation Notes:</div>
                <div className="p-2.5 bg-gray-50 rounded border border-gray-200 text-gray-700 italic">
                  {viewInspection.notes || 'No qualitative observations logged.'}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setViewInspection(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
