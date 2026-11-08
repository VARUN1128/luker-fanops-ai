import React, { useState } from 'react';
import {
  Factory,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Calendar,
  X,
  History,
  Info,
  ChevronDown,
  User,
  ArrowUpDown
} from 'lucide-react';
import { useOperations } from '../context/OperationsContext';
import {
  ProductionBatch,
  ProductionStage,
  PRODUCTION_STAGES,
  BatchStatus
} from '../types';
import { FAN_MODELS } from '../data/initialData';
import { formatNumber, formatDate } from '../lib/utils';

export const ProductionPage: React.FC = () => {
  const {
    batches,
    createBatch,
    recordStageMovement,
    selectedBatchId,
    setSelectedBatchId,
    kpis
  } = useOperations();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [modelFilter, setModelFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<'id' | 'plannedQuantity' | 'targetDate'>('id');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);

  // New Batch Form State
  const [newBatchId, setNewBatchId] = useState('');
  const [newFanModel, setNewFanModel] = useState(FAN_MODELS[0]);
  const [newPlannedQty, setNewPlannedQty] = useState(300);
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTargetDate, setNewTargetDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [newNotes, setNewNotes] = useState('');

  // Move Units Form State
  const [moveFromStage, setMoveFromStage] = useState<ProductionStage | 'Start'>('Material Receipt');
  const [moveToStage, setMoveToStage] = useState<ProductionStage>('Motor Assembly');
  const [moveQuantity, setMoveQuantity] = useState<number>(50);
  const [moveOperator, setMoveOperator] = useState('Shift Lead (Assembly)');
  const [moveNotes, setMoveNotes] = useState('');

  // Selected batch for drawer/modal
  const selectedBatch = batches.find(b => b.id === selectedBatchId) || null;

  // Filtered & Sorted Batches
  const filteredBatches = batches.filter(b => {
    const matchesSearch =
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.fanModel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchesModel = modelFilter === 'All' || b.fanModel === modelFilter;
    return matchesSearch && matchesStatus && matchesModel;
  }).sort((a, b) => {
    if (sortField === 'id') {
      return sortAsc ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
    }
    if (sortField === 'plannedQuantity') {
      return sortAsc ? a.plannedQuantity - b.plannedQuantity : b.plannedQuantity - a.plannedQuantity;
    }
    if (sortField === 'targetDate') {
      return sortAsc ? a.targetDate.localeCompare(b.targetDate) : b.targetDate.localeCompare(a.targetDate);
    }
    return 0;
  });

  const handleCreateBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchId.trim()) return;

    const success = createBatch({
      id: newBatchId.trim().toUpperCase(),
      fanModel: newFanModel,
      plannedQuantity: Number(newPlannedQty),
      currentStage: 'Material Receipt',
      startDate: newStartDate,
      targetDate: newTargetDate,
      materialRequirements: [
        {
          materialId: 'MAT-CAP-01',
          materialName: '4.0 uF BLDC Metallized Film Capacitor',
          requiredPerUnit: 1,
          totalRequired: Number(newPlannedQty),
          reserved: 0,
          staged: 0,
          unit: 'pcs',
          status: 'Not Ready'
        },
        {
          materialId: 'MAT-MOT-01',
          materialName: 'BLDC High-Torque Stator & Rotor Core Set',
          requiredPerUnit: 1,
          totalRequired: Number(newPlannedQty),
          reserved: 0,
          staged: 0,
          unit: 'sets',
          status: 'Not Ready'
        }
      ],
      notes: newNotes
    });

    if (success) {
      setShowCreateModal(false);
      setNewBatchId('');
      setNewNotes('');
    }
  };

  const handleMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    const success = recordStageMovement(
      selectedBatch.id,
      moveFromStage,
      moveToStage,
      Number(moveQuantity),
      moveOperator,
      moveNotes
    );

    if (success) {
      setShowMoveModal(false);
      setMoveNotes('');
    }
  };

  const openMoveModalForBatch = (b: ProductionBatch) => {
    setSelectedBatchId(b.id);
    // Find first stage with units
    const activeStage = PRODUCTION_STAGES.find(s => (b.stageQuantities[s] || 0) > 0);
    if (activeStage) {
      setMoveFromStage(activeStage);
      const nextIdx = PRODUCTION_STAGES.indexOf(activeStage) + 1;
      setMoveToStage(nextIdx < PRODUCTION_STAGES.length ? PRODUCTION_STAGES[nextIdx] : 'Packaging');
      setMoveQuantity(b.stageQuantities[activeStage]);
    } else {
      setMoveFromStage('Start');
      setMoveToStage('Material Receipt');
      setMoveQuantity(b.plannedQuantity);
    }
    setShowMoveModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Work Orders</span>
            <Factory size={15} className="text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{kpis.activeBatches} Batches</div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{batches.length} total scheduled</span>
            <span className="text-slate-700 font-medium">{formatNumber(batches.filter(b => b.status === 'In Production').reduce((s, b) => s + b.plannedQuantity, 0))} units</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Current Active WIP</span>
            <Layers size={15} className="text-[#D32F2F]" />
          </div>
          <div className="text-2xl font-bold text-[#D32F2F] mt-1 font-mono">{formatNumber(kpis.totalWip)} Units</div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Across 7 line stations</span>
            <span className="text-emerald-700 font-medium">{formatNumber(kpis.unitsCompleted)} finished</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Delayed Batches</span>
            <Clock size={15} className={kpis.delayedBatches > 0 ? "text-[#D32F2F]" : "text-slate-400"} />
          </div>
          <div className={`text-2xl font-bold mt-1 ${kpis.delayedBatches > 0 ? 'text-[#D32F2F]' : 'text-slate-900'}`}>
            {kpis.delayedBatches}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Target completion overdue</span>
            {kpis.delayedBatches > 0 && <span className="text-red-700 font-semibold text-[11px] bg-red-50 px-1.5 py-0.2 rounded">Action needed</span>}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Line Progress</span>
            <CheckCircle2 size={15} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{kpis.averageProgress}%</div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Weighted batch throughput</span>
            <span className="text-emerald-600 font-medium">Nominal pace</span>
          </div>
        </div>
      </div>

      {/* Action Bar & Controls */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Batch ID or Fan Model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F]"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-2.5 text-xs border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20"
            >
              <option value="All">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Production">In Production</option>
              <option value="Blocked">Blocked</option>
              <option value="Delayed">Delayed</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Model Filter */}
          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="py-2 px-2.5 text-xs border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20"
          >
            <option value="All">All Fan Models</option>
            {FAN_MODELS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Create Batch Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#D32F2F] hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex-shrink-0"
        >
          <Plus size={15} />
          <span>New Production Batch</span>
        </button>
      </div>

      {/* Production Batch Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Ceiling Fan Production Batches</h3>
            <p className="text-xs text-gray-500">Tracking lot status, current stage location, and active WIP</p>
          </div>
          <span className="text-xs text-gray-500 font-mono">
            {filteredBatches.length} batch(es) shown
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                <th
                  onClick={() => {
                    setSortField('id');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-4 cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    <span>Batch ID</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-3 px-4">Fan Model</th>
                <th
                  onClick={() => {
                    setSortField('plannedQuantity');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-4 cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    <span>Planned Qty</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-3 px-4">Completed</th>
                <th className="py-3 px-4">Current Stage</th>
                <th className="py-3 px-4">Active WIP</th>
                <th className="py-3 px-4">Start Date</th>
                <th
                  onClick={() => {
                    setSortField('targetDate');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-4 cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    <span>Target Date</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-gray-500">
                    No production batches match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch) => {
                  const isBlocked = batch.status === 'Blocked';
                  const isDelayed = batch.status === 'Delayed';
                  const isCompleted = batch.status === 'Completed';

                  return (
                    <tr
                      key={batch.id}
                      onClick={() => setSelectedBatchId(batch.id)}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedBatchId === batch.id ? 'bg-red-50/40 font-medium' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                        {batch.id}
                      </td>
                      <td className="py-3.5 px-4 text-gray-800">
                        {batch.fanModel}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-700">
                        {formatNumber(batch.plannedQuantity)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-700 font-semibold">
                        {formatNumber(batch.completedQuantity)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                          {batch.currentStage}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#D32F2F]">
                        {formatNumber(batch.wipQuantity)}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                        {formatDate(batch.startDate)}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                        {formatDate(batch.targetDate)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isBlocked
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : isDelayed
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : isCompleted
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {batch.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {!isCompleted && (
                            <button
                              onClick={() => openMoveModalForBatch(batch)}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-gray-100 hover:bg-[#D32F2F] hover:text-white text-gray-700 rounded transition-colors"
                              title="Record production movement"
                            >
                              Move Units
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedBatchId(batch.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-gray-600 hover:text-gray-900 hover:underline"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Details Drawer / Panel (when selected) */}
      {selectedBatch && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200 gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-50 text-[#D32F2F] rounded-lg">
                <Factory size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gray-900">
                    Batch Details: <span className="font-mono">{selectedBatch.id}</span>
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      selectedBatch.status === 'Blocked'
                        ? 'bg-red-100 text-red-700'
                        : selectedBatch.status === 'Delayed'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {selectedBatch.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedBatch.fanModel} • Target Completion: {formatDate(selectedBatch.targetDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openMoveModalForBatch(selectedBatch)}
                className="px-3.5 py-1.5 bg-[#D32F2F] hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                + Record Stage Movement
              </button>
              <button
                onClick={() => setSelectedBatchId(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close batch details"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Production Stage Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Illustrative Manufacturing Workflow Stages
              </h4>
              <span className="text-[11px] text-gray-400">
                Units processed and active outstanding quantity per station
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {PRODUCTION_STAGES.map((stage, idx) => {
                const qtyAtStage = selectedBatch.stageQuantities[stage] || 0;
                const isCurrent = selectedBatch.currentStage === stage;
                const isBottleneck = qtyAtStage >= 200 || (selectedBatch.status === 'Delayed' && isCurrent);

                return (
                  <div
                    key={stage}
                    className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${
                      qtyAtStage > 0
                        ? isBottleneck
                          ? 'bg-red-50 border-red-300 ring-1 ring-red-400'
                          : 'bg-red-50/20 border-red-200'
                        : 'bg-gray-50 border-gray-200 opacity-75'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-gray-400">0{idx + 1}</span>
                        {isBottleneck && (
                          <span className="text-[9px] font-bold text-red-600 bg-red-100 px-1 rounded uppercase">
                            Bottleneck
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-gray-900 line-clamp-1" title={stage}>
                        {stage}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-200/60 flex items-baseline justify-between">
                      <span className="text-[10px] text-gray-500 font-medium">In Station:</span>
                      <span
                        className={`text-sm font-mono font-bold ${
                          qtyAtStage > 0 ? (isBottleneck ? 'text-red-600' : 'text-gray-900') : 'text-gray-400'
                        }`}
                      >
                        {qtyAtStage} <span className="text-[10px] font-normal">units</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Movement History Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <History size={14} className="text-gray-500" />
                <span>Production Movement History</span>
              </h4>
              <span className="text-[11px] text-gray-500 font-mono">
                {selectedBatch.movements.length} log(s)
              </span>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Movement ID</th>
                    <th className="py-2.5 px-3">From Stage</th>
                    <th className="py-2.5 px-3">To Stage</th>
                    <th className="py-2.5 px-3">Quantity</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Operator</th>
                    <th className="py-2.5 px-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedBatch.movements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-gray-400 text-xs">
                        No production movements recorded yet. Use "+ Record Stage Movement" to advance units.
                      </td>
                    </tr>
                  ) : (
                    selectedBatch.movements.map((mov) => (
                      <tr key={mov.id} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3 font-mono text-gray-800 font-medium">{mov.id}</td>
                        <td className="py-2.5 px-3 text-gray-600">{mov.fromStage}</td>
                        <td className="py-2.5 px-3 font-semibold text-gray-900">{mov.toStage}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#D32F2F]">
                          {mov.quantity} units
                        </td>
                        <td className="py-2.5 px-3 text-gray-500 text-[11px]">{mov.timestamp}</td>
                        <td className="py-2.5 px-3 text-gray-700 flex items-center gap-1">
                          <User size={12} className="text-gray-400" />
                          <span>{mov.operator}</span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-500 italic max-w-xs truncate">
                          {mov.notes || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Production Batch */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <div className="flex items-center gap-2">
                <Factory size={18} className="text-[#D32F2F]" />
                <h3 className="text-base font-bold text-gray-900">Schedule New Production Batch</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBatchSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Batch Identifier (Unique)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FAN-2026-006"
                  value={newBatchId}
                  onChange={(e) => setNewBatchId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Fan Model
                </label>
                <select
                  value={newFanModel}
                  onChange={(e) => setNewFanModel(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20"
                >
                  {FAN_MODELS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Planned Quantity (Units)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newPlannedQty}
                  onChange={(e) => setNewPlannedQty(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Production Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Notes / Work Order Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Export order consignment or regional hub allocation"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20"
                />
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
                  Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Stage Movement */}
      {showMoveModal && selectedBatch && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Record Stage Movement: <span className="font-mono text-[#D32F2F]">{selectedBatch.id}</span>
                </h3>
                <p className="text-xs text-gray-500">{selectedBatch.fanModel}</p>
              </div>
              <button
                onClick={() => setShowMoveModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleMovementSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    From Stage
                  </label>
                  <select
                    value={moveFromStage}
                    onChange={(e) => setMoveFromStage(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="Start">Start (Release New Units)</option>
                    {PRODUCTION_STAGES.map(s => (
                      <option key={s} value={s}>{s} ({selectedBatch.stageQuantities[s] || 0} avail)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    To Stage
                  </label>
                  <select
                    value={moveToStage}
                    onChange={(e) => setMoveToStage(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                  >
                    {PRODUCTION_STAGES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Movement Quantity (Units)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={moveQuantity}
                  onChange={(e) => setMoveQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  * Must not exceed units available at origin station.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Operator / Supervisor Name
                </label>
                <input
                  type="text"
                  required
                  value={moveOperator}
                  onChange={(e) => setMoveOperator(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Movement Notes / Transfer Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cleared stator winding arbor press, passed to assembly bench 3"
                  value={moveNotes}
                  onChange={(e) => setMoveNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowMoveModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#D32F2F] hover:bg-red-700 rounded-lg shadow-sm"
                >
                  Confirm Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
