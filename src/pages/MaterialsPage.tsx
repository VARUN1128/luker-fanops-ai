import React, { useState } from 'react';
import {
  PackageCheck,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Boxes,
  Layers,
  AlertTriangle,
  CheckCircle2,
  X,
  History,
  RotateCw,
  Truck,
  MoveRight,
  Sparkles,
  Info
} from 'lucide-react';
import { useOperations } from '../context/OperationsContext';
import {
  MaterialItem,
  MaterialCategory,
  ProductionBatch
} from '../types';
import { formatNumber, formatPercent } from '../lib/utils';

export const MaterialsPage: React.FC = () => {
  const {
    materials,
    batches,
    addMaterial,
    recordMaterialReceipt,
    reserveMaterialForBatch,
    stageMaterialForBatch,
    consumeMaterial,
    selectedBatchId,
    setSelectedBatchId,
    kpis
  } = useOperations();

  // Search & Category Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [viewHistoryMat, setViewHistoryMat] = useState<MaterialItem | null>(null);

  // Active target material for modals
  const [activeMaterialId, setActiveMaterialId] = useState<string>(materials[0]?.id || '');
  const targetMaterial = materials.find(m => m.id === activeMaterialId) || materials[0];

  // Forms State
  // 1. Receipt
  const [receiptQty, setReceiptQty] = useState<number>(100);
  const [receiptRef, setReceiptRef] = useState('GRN-INBOUND Supplier Consignment');
  const [receiptUser, setReceiptUser] = useState('Store Supervisor (Coimbatore Plant)');

  // 2. Reserve
  const [reserveBatchId, setReserveBatchId] = useState<string>(batches[0]?.id || '');
  const [reserveQty, setReserveQty] = useState<number>(100);
  const [reserveUser, setReserveUser] = useState('Production Planner');

  // 3. Stage
  const [stageBatchId, setStageBatchId] = useState<string>(batches[0]?.id || '');
  const [stageQty, setStageQty] = useState<number>(500);
  const [stageUser, setStageUser] = useState('Shop Floor Material Handler');

  // 4. Add Material
  const [newMatId, setNewMatId] = useState('');
  const [newMatName, setNewMatName] = useState('');
  const [newMatCategory, setNewMatCategory] = useState<MaterialCategory>('Electrical');
  const [newMatUnit, setNewMatUnit] = useState('pcs');
  const [newMatAvailable, setNewMatAvailable] = useState<number>(500);
  const [newMatMinStock, setNewMatMinStock] = useState<number>(200);

  // Selected batch for Material Readiness Bill of Materials inspection
  const targetBatch = batches.find(b => b.id === (selectedBatchId || 'FAN-2026-001')) || batches[0];

  // Filtered materials
  const filteredMaterials = materials.filter(m => {
    const matchesSearch =
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || m.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const handleReceiptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMaterial) return;
    const ok = recordMaterialReceipt(targetMaterial.id, Number(receiptQty), receiptRef, receiptUser);
    if (ok) setShowReceiptModal(false);
  };

  const handleReserveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMaterial || !reserveBatchId) return;
    const ok = reserveMaterialForBatch(reserveBatchId, targetMaterial.id, Number(reserveQty), reserveUser);
    if (ok) setShowReserveModal(false);
  };

  const handleStageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMaterial || !stageBatchId) return;
    const ok = stageMaterialForBatch(stageBatchId, targetMaterial.id, Number(stageQty), stageUser);
    if (ok) setShowStageModal(false);
  };

  const handleAddMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatId.trim() || !newMatName.trim()) return;

    const ok = addMaterial({
      id: newMatId.trim().toUpperCase(),
      name: newMatName.trim(),
      category: newMatCategory,
      available: Number(newMatAvailable),
      unit: newMatUnit,
      minStockLevel: Number(newMatMinStock)
    });

    if (ok) {
      setShowAddModal(false);
      setNewMatId('');
      setNewMatName('');
    }
  };

  const openReceiptFor = (mat: MaterialItem) => {
    setActiveMaterialId(mat.id);
    setReceiptQty(mat.id === 'MAT-CAP-01' ? 100 : 250);
    setShowReceiptModal(true);
  };

  const openReserveFor = (mat: MaterialItem) => {
    setActiveMaterialId(mat.id);
    setReserveQty(mat.id === 'MAT-CAP-01' ? 100 : 100);
    setReserveBatchId(selectedBatchId || 'FAN-2026-001');
    setShowReserveModal(true);
  };

  const openStageFor = (mat: MaterialItem) => {
    setActiveMaterialId(mat.id);
    setStageQty(mat.id === 'MAT-CAP-01' ? 500 : 500);
    setStageBatchId(selectedBatchId || 'FAN-2026-001');
    setShowStageModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Staging Readiness</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-mono">
              {formatPercent(kpis.materialReadinessRate)}
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {kpis.batchesFullyReady} / {batches.filter(b => b.status !== 'Completed').length}
            <span className="text-xs font-normal text-slate-400 font-sans ml-1">batches fully ready</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Staging bay status</span>
            <span className="text-slate-700 font-medium">{materials.reduce((s, m) => s + m.staged, 0)} items on floor</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Store Available Stock</span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-mono">
              Unreserved
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono">
            {formatNumber(materials.reduce((s, m) => s + m.available, 0))}
            <span className="text-xs font-normal text-slate-400 font-sans ml-1">units in store</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Catalog items</span>
            <span className="text-slate-700 font-medium">{materials.length} active SKUs</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Material Shortages</span>
            <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full font-mono">
              Below Safety
            </span>
          </div>
          <div className={`text-2xl font-bold mt-1 font-mono ${kpis.materialShortagesCount > 0 ? 'text-[#D32F2F]' : 'text-slate-900'}`}>
            {kpis.materialShortagesCount}
            <span className="text-xs font-normal text-slate-400 font-sans ml-1">critical shortfall</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Inbound expedites</span>
            <span className="text-red-700 font-medium">Capacitors MAT-CAP-01</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Batches Blocked</span>
            <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full font-mono">
              Floor Hold
            </span>
          </div>
          <div className={`text-2xl font-bold mt-1 font-mono ${kpis.batchesBlockedByShortage > 0 ? 'text-[#D32F2F]' : 'text-slate-900'}`}>
            {kpis.batchesBlockedByShortage}
            <span className="text-xs font-normal text-slate-400 font-sans ml-1">batch blocked</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Shop floor hold</span>
            <span className="text-red-700 font-medium">Batch FAN-2026-001</span>
          </div>
        </div>
      </div>

      {/* Critical Manufacturing Concept Distinction Card */}
      <div className="bg-white p-5 rounded-xl border-l-4 border-l-[#D32F2F] border border-gray-200 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-50 text-[#D32F2F] rounded-lg flex-shrink-0 mt-0.5">
            <Boxes size={22} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span>Operational Rule: Inventory Availability &ne; Production Readiness</span>
              <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-mono font-bold">
                MANDATORY STAGING
              </span>
            </h3>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              In lean manufacturing, holding parts in central stores does not mean the line can run. A batch is <strong>Ready</strong> only when 100% of required materials have physically been staged on the shop floor:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-100 text-xs">
              <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                <span className="font-bold text-gray-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> 1. AVAILABLE
                </span>
                <p className="text-gray-500 mt-1 text-[11px]">
                  Unreserved physical stock sitting inside central warehouse stores.
                </p>
              </div>

              <div className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-200">
                <span className="font-bold text-amber-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> 2. RESERVED
                </span>
                <p className="text-gray-600 mt-1 text-[11px]">
                  Earmarked for a scheduled production batch; cannot be stolen by other orders.
                </p>
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="font-bold text-emerald-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 3. STAGED
                </span>
                <p className="text-gray-600 mt-1 text-[11px]">
                  Physically transferred to the ceiling fan line kitting bay ready for assembly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Batch Material Readiness Inspector */}
      {targetBatch && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-gray-200 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900">
                  Batch Material Readiness: <span className="font-mono text-[#D32F2F]">{targetBatch.id}</span>
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    targetBatch.status === 'Blocked'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {targetBatch.status === 'Blocked' ? 'Blocked on Materials' : 'Materials Ready'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {targetBatch.fanModel} • Planned Quantity: {targetBatch.plannedQuantity} units
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 font-medium">Switch Batch:</label>
              <select
                value={targetBatch.id}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="py-1 px-2.5 text-xs border border-gray-300 rounded-lg bg-white"
              >
                {batches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.id} ({b.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Component Requirements Bill of Materials */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Material Component</th>
                  <th className="py-2.5 px-3">Total Required</th>
                  <th className="py-2.5 px-3">In Store (Avail)</th>
                  <th className="py-2.5 px-3">Reserved</th>
                  <th className="py-2.5 px-3">Staged on Floor</th>
                  <th className="py-2.5 px-3">Shortfall</th>
                  <th className="py-2.5 px-3">Readiness</th>
                  <th className="py-2.5 px-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {targetBatch.materialRequirements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-gray-400">
                      No component bill-of-materials configured for this batch.
                    </td>
                  </tr>
                ) : (
                  targetBatch.materialRequirements.map((req) => {
                    const mat = materials.find(m => m.id === req.materialId);
                    const avail = mat?.available ?? 0;
                    const shortfall = Math.max(0, req.totalRequired - (req.reserved + req.staged));
                    const isFullyStaged = req.staged >= req.totalRequired;
                    const canStageNow = (req.reserved - req.staged) > 0;

                    return (
                      <tr key={req.materialId} className="hover:bg-gray-50">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-gray-900">{req.materialName}</div>
                          <div className="font-mono text-[10px] text-gray-400">{req.materialId}</div>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-gray-900">
                          {req.totalRequired} {req.unit}
                        </td>
                        <td className="py-3 px-3 font-mono text-gray-600">
                          {avail} {req.unit}
                        </td>
                        <td className="py-3 px-3 font-mono text-amber-700">
                          {req.reserved} {req.unit}
                        </td>
                        <td className="py-3 px-3 font-mono text-emerald-700 font-bold">
                          {req.staged} {req.unit}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold">
                          {shortfall > 0 ? (
                            <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded">
                              -{shortfall} {req.unit}
                            </span>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              isFullyStaged
                                ? 'bg-emerald-100 text-emerald-800'
                                : shortfall > 0
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isFullyStaged ? 'Fully Staged' : shortfall > 0 ? 'Shortage' : 'Ready to Stage'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {shortfall > 0 && mat && (
                              <button
                                onClick={() => openReceiptFor(mat)}
                                className="px-2 py-1 text-[10px] font-semibold bg-red-50 text-red-700 hover:bg-red-100 rounded border border-red-200"
                              >
                                + Receive Stock
                              </button>
                            )}
                            {canStageNow && mat && (
                              <button
                                onClick={() => openStageFor(mat)}
                                className="px-2 py-1 text-[10px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded"
                              >
                                Stage to Floor &rarr;
                              </button>
                            )}
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
      )}

      {/* Control Bar for Central Inventory Table */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search component inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-2 px-2.5 text-xs border border-gray-300 rounded-lg bg-white text-gray-700"
          >
            <option value="All">All Categories</option>
            <option value="Electrical">Electrical</option>
            <option value="Motor Parts">Motor Parts</option>
            <option value="Hardware">Hardware</option>
            <option value="Aesthetics & Blades">Aesthetics & Blades</option>
            <option value="Packaging">Packaging</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-2.5 text-xs border border-gray-300 rounded-lg bg-white text-gray-700"
          >
            <option value="All">All Stock Statuses</option>
            <option value="Optimal">Optimal</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Critical Shortage">Critical Shortage</option>
          </select>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#D32F2F] hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex-shrink-0"
        >
          <Plus size={15} />
          <span>Add New Material</span>
        </button>
      </div>

      {/* Central Material Inventory Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Central Component Inventory</h3>
            <p className="text-xs text-gray-500">Available vs Reserved vs Staged quantities with safety stock thresholds</p>
          </div>
          <span className="text-xs text-gray-500 font-mono">
            {filteredMaterials.length} item(s) listed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Material ID</th>
                <th className="py-3 px-4">Material Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Available (Store)</th>
                <th className="py-3 px-4">Reserved</th>
                <th className="py-3 px-4">Staged (Floor)</th>
                <th className="py-3 px-4">Min Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMaterials.map((mat) => {
                const isCritical = mat.status === 'Critical Shortage';
                const isLow = mat.status === 'Low Stock';

                return (
                  <tr key={mat.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">{mat.id}</td>
                    <td className="py-3 px-4 font-medium text-gray-800">{mat.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-gray-100 text-gray-700">
                        {mat.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      {formatNumber(mat.available)} {mat.unit}
                    </td>
                    <td className="py-3 px-4 font-mono text-amber-700">
                      {formatNumber(mat.reserved)} {mat.unit}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-700 font-semibold">
                      {formatNumber(mat.staged)} {mat.unit}
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-500">
                      {formatNumber(mat.minStockLevel)} {mat.unit}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isCritical
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : isLow
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {mat.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openReceiptFor(mat)}
                          className="px-2 py-1 text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 rounded transition-colors"
                          title="Record inbound goods receipt"
                        >
                          + Receive
                        </button>
                        <button
                          onClick={() => openReserveFor(mat)}
                          className="px-2 py-1 text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 rounded transition-colors"
                          title="Allocate to production batch"
                        >
                          Reserve
                        </button>
                        <button
                          onClick={() => openStageFor(mat)}
                          className="px-2 py-1 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded transition-colors"
                          title="Stage to factory floor"
                        >
                          Stage
                        </button>
                        <button
                          onClick={() => setViewHistoryMat(mat)}
                          className="p-1 text-gray-400 hover:text-gray-700 rounded"
                          title="View material transactions"
                        >
                          <History size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Record Material Receipt */}
      {showReceiptModal && targetMaterial && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Record Inbound Receipt</h3>
                <p className="text-xs text-gray-500">{targetMaterial.name} ({targetMaterial.id})</p>
              </div>
              <button onClick={() => setShowReceiptModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReceiptSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Received Quantity ({targetMaterial.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={receiptQty}
                  onChange={(e) => setReceiptQty(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Current store available: {targetMaterial.available} {targetMaterial.unit} &rarr; New: {targetMaterial.available + Number(receiptQty)} {targetMaterial.unit}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  GRN / Inbound Delivery Reference
                </label>
                <input
                  type="text"
                  required
                  value={receiptRef}
                  onChange={(e) => setReceiptRef(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Store In-Charge / Receiver
                </label>
                <input
                  type="text"
                  required
                  value={receiptUser}
                  onChange={(e) => setReceiptUser(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#D32F2F] hover:bg-red-700 rounded-lg shadow-sm"
                >
                  Post Inbound Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reserve Material for Batch */}
      {showReserveModal && targetMaterial && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Allocate Stock to Production Batch</h3>
                <p className="text-xs text-gray-500">{targetMaterial.name} ({targetMaterial.id})</p>
              </div>
              <button onClick={() => setShowReserveModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReserveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Target Production Batch
                </label>
                <select
                  value={reserveBatchId}
                  onChange={(e) => setReserveBatchId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                >
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.id} ({b.fanModel})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Quantity to Reserve ({targetMaterial.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  max={targetMaterial.available}
                  required
                  value={reserveQty}
                  onChange={(e) => setReserveQty(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-mono font-bold"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Available in store: {targetMaterial.available} {targetMaterial.unit}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Planner Name
                </label>
                <input
                  type="text"
                  required
                  value={reserveUser}
                  onChange={(e) => setReserveUser(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowReserveModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm"
                >
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Stage Material to Shop Floor */}
      {showStageModal && targetMaterial && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Physical Transfer to Shop Floor (Stage)</h3>
                <p className="text-xs text-gray-500">{targetMaterial.name} ({targetMaterial.id})</p>
              </div>
              <button onClick={() => setShowStageModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleStageSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Target Production Batch
                </label>
                <select
                  value={stageBatchId}
                  onChange={(e) => setStageBatchId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                >
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.id} ({b.fanModel})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Quantity to Stage ({targetMaterial.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stageQty}
                  onChange={(e) => setStageQty(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-mono font-bold"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  * Transfers component physically from reserved store stock to the ceiling fan line staging rack.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Handler / Floor Marshall
                </label>
                <input
                  type="text"
                  required
                  value={stageUser}
                  onChange={(e) => setStageUser(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowStageModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Transfer & Stage Materials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Material Item */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <h3 className="text-base font-bold text-gray-900">Add New Component to Central Catalog</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddMaterialSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Material Part Number / ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MAT-CAN-02"
                    value={newMatId}
                    onChange={(e) => setNewMatId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newMatCategory}
                    onChange={(e) => setNewMatCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="Electrical">Electrical</option>
                    <option value="Motor Parts">Motor Parts</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Aesthetics & Blades">Aesthetics & Blades</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Material Name & Specification
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BLDC Downrod 300mm with safety wire loop"
                  value={newMatName}
                  onChange={(e) => setNewMatName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newMatAvailable}
                    onChange={(e) => setNewMatAvailable(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={newMatUnit}
                    onChange={(e) => setNewMatUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="pcs">pcs</option>
                    <option value="sets">sets</option>
                    <option value="kg">kg</option>
                    <option value="meters">meters</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Min Safety Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newMatMinStock}
                    onChange={(e) => setNewMatMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#D32F2F] hover:bg-red-700 rounded-lg shadow-sm"
                >
                  Save Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Material Transaction History */}
      {viewHistoryMat && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Inventory Movement Audit Log</h3>
                <p className="text-xs text-gray-500">{viewHistoryMat.name} ({viewHistoryMat.id})</p>
              </div>
              <button onClick={() => setViewHistoryMat(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Qty</th>
                    <th className="py-2.5 px-3">Reference / Batch</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {viewHistoryMat.history.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-400">
                        No transactions recorded for this item yet.
                      </td>
                    </tr>
                  ) : (
                    viewHistoryMat.history.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="py-2 px-3 font-semibold">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] ${
                              tx.type === 'RECEIPT'
                                ? 'bg-blue-100 text-blue-800'
                                : tx.type === 'STAGE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-gray-900">
                          {tx.quantity} {viewHistoryMat.unit}
                        </td>
                        <td className="py-2 px-3 text-gray-600 truncate max-w-xs">{tx.reference}</td>
                        <td className="py-2 px-3 text-gray-500 text-[11px]">{tx.timestamp}</td>
                        <td className="py-2 px-3 text-gray-700">{tx.performedBy}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-3 mt-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setViewHistoryMat(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
