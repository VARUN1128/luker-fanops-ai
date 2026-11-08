import React, { useState } from 'react';
import {
  TrendingDown,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Wrench,
  Trash2,
  ChevronRight,
  Edit2,
  X,
  FileSpreadsheet,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { useOperations } from '../context/OperationsContext';
import {
  RejectionRecord,
  DefectCategory,
  DEFECT_CATEGORIES,
  ProductionStage,
  PRODUCTION_STAGES,
  DispositionType,
  RootCauseStatus
} from '../types';
import { FAN_MODELS } from '../data/initialData';
import { formatNumber, formatPercent, formatDate } from '../lib/utils';

export const AnalyticsPage: React.FC = () => {
  const { rejections, batches, updateRootCause, createRejection, kpis } = useOperations();

  // Filters
  const [modelFilter, setModelFilter] = useState<string>('All');
  const [batchFilter, setBatchFilter] = useState<string>('All');
  const [defectFilter, setDefectFilter] = useState<string>('All');
  const [stageFilter, setStageFilter] = useState<string>('All');
  const [dispositionFilter, setDispositionFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedRecord, setSelectedRecord] = useState<RejectionRecord | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);

  // Edit Root Cause state
  const [verifiedCause, setVerifiedCause] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [responsibleTeam, setResponsibleTeam] = useState('');
  const [investigationStatus, setInvestigationStatus] = useState<RootCauseStatus>('Under Investigation');

  // New Rejection record state
  const [newBatchId, setNewBatchId] = useState(batches[0]?.id || 'FAN-2026-001');
  const [newStage, setNewStage] = useState<ProductionStage>('Performance Testing');
  const [newDefect, setNewDefect] = useState<DefectCategory>('Motor noise');
  const [newQty, setNewQty] = useState<number>(5);
  const [newDisposition, setNewDisposition] = useState<DispositionType>('Rework');
  const [newSuspectedCause, setNewSuspectedCause] = useState('');
  const [newTeam, setNewTeam] = useState('Assembly Cell');

  // Filter rejections dynamically
  const filteredRejections = rejections.filter((r) => {
    const matchesModel = modelFilter === 'All' || r.fanModel === modelFilter;
    const matchesBatch = batchFilter === 'All' || r.batchId === batchFilter;
    const matchesDefect = defectFilter === 'All' || r.defectCategory === defectFilter;
    const matchesStage = stageFilter === 'All' || r.productionStage === stageFilter;
    const matchesDisposition = dispositionFilter === 'All' || r.disposition === dispositionFilter;
    const matchesSearch =
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.defectCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.suspectedRootCause.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesModel && matchesBatch && matchesDefect && matchesStage && matchesDisposition && matchesSearch;
  });

  // Filtered metrics
  const totalFilteredUnits = filteredRejections.reduce((s, r) => s + r.quantity, 0);
  const reworkFiltered = filteredRejections.filter(r => r.disposition === 'Rework').reduce((s, r) => s + r.quantity, 0);
  const scrapFiltered = filteredRejections.filter(r => r.disposition === 'Scrap').reduce((s, r) => s + r.quantity, 0);

  // 1. Chart: Weekly Rejection Trend
  const weeklyTrendData = [
    { week: 'W41 (Oct 12)', rework: 10, scrap: 4, total: 14 },
    { week: 'W42 (Oct 19)', rework: 8, scrap: 3, total: 11 },
    { week: 'W43 (Oct 26)', rework: 12, scrap: 6, total: 18 },
    { week: 'W44 (Nov 02)', rework: 9, scrap: 3, total: 12 },
    {
      week: 'Current Week',
      rework: reworkFiltered,
      scrap: scrapFiltered,
      total: totalFilteredUnits
    }
  ];

  // 2. Chart: Rejections by Fan Model
  const modelCounts: Record<string, number> = {};
  filteredRejections.forEach(r => {
    modelCounts[r.fanModel] = (modelCounts[r.fanModel] || 0) + r.quantity;
  });
  const modelChartData = Object.entries(modelCounts).map(([model, qty]) => ({
    model: model.replace('Luker ', ''),
    quantity: qty
  }));

  // 3. Chart: Rejections by Defect Category
  const defectCounts: Record<string, number> = {};
  filteredRejections.forEach(r => {
    defectCounts[r.defectCategory] = (defectCounts[r.defectCategory] || 0) + r.quantity;
  });
  const defectChartData = Object.entries(defectCounts).map(([cat, qty]) => ({
    category: cat,
    quantity: qty
  })).sort((a, b) => b.quantity - a.quantity);

  // 4. Chart: Rejections by Production Stage
  const stageCounts: Record<string, number> = {};
  filteredRejections.forEach(r => {
    stageCounts[r.productionStage] = (stageCounts[r.productionStage] || 0) + r.quantity;
  });
  const stageChartData = Object.entries(stageCounts).map(([stg, qty]) => ({
    stage: stg,
    quantity: qty
  }));

  // 5. Chart: Rework vs Scrap Distribution
  const dispositionChartData = [
    { name: 'Rework (Recoverable)', value: reworkFiltered, color: '#F59E0B' },
    { name: 'Scrap (Permanent Loss)', value: scrapFiltered, color: '#D32F2F' }
  ];

  const handleEditRecordOpen = (rec: RejectionRecord) => {
    setSelectedRecord(rec);
    setVerifiedCause(rec.verifiedRootCause || '');
    setCorrectiveAction(rec.correctiveAction || '');
    setResponsibleTeam(rec.responsibleTeam || '');
    setInvestigationStatus(rec.investigationStatus);
  };

  const handleSaveRootCause = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    updateRootCause(selectedRecord.id, {
      verifiedRootCause: verifiedCause.trim() || undefined,
      correctiveAction: correctiveAction.trim() || undefined,
      responsibleTeam: responsibleTeam.trim() || selectedRecord.responsibleTeam,
      investigationStatus,
      isVerified: Boolean(verifiedCause.trim())
    });

    setSelectedRecord(null);
  };

  const handleCreateRejectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const batch = batches.find(b => b.id === newBatchId);
    if (!batch) return;

    createRejection({
      batchId: newBatchId,
      fanModel: batch.fanModel,
      date: new Date().toISOString().split('T')[0],
      productionStage: newStage,
      defectCategory: newDefect,
      quantity: Number(newQty),
      disposition: newDisposition,
      suspectedRootCause: newSuspectedCause || 'Initial defect logging during line audit',
      responsibleTeam: newTeam,
      investigationStatus: 'Under Investigation',
      isVerified: false
    });

    setShowLogModal(false);
    setNewSuspectedCause('');
  };

  return (
    <div className="space-y-6">
      {/* Analytics KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Defect Rejection Ratio</span>
            <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full font-mono">
              {formatPercent(kpis.rejectionRatio)}
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {formatNumber(totalFilteredUnits)}
            <span className="text-xs font-normal text-slate-400 font-sans ml-1">rejected units</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Baseline Volume</span>
            <span className="text-slate-700 font-medium">{formatNumber(kpis.totalProducedUnits)} produced</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Recoverable Rework</span>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-mono">
              Bench Fixable
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1 font-mono">
            {formatNumber(reworkFiltered)}
            <span className="text-xs font-normal text-slate-400 font-sans ml-1">units</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Rework Routing</span>
            <span className="text-amber-700 font-medium">Re-enters testing</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Permanent Scrap</span>
            <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full font-mono">
              Written Off
            </span>
          </div>
          <div className="text-2xl font-bold text-[#D32F2F] mt-1 font-mono">
            {formatNumber(scrapFiltered)}
            <span className="text-xs font-normal text-slate-400 font-sans ml-1">units</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Material Loss</span>
            <span className="text-red-700 font-medium">Foundry / Hub alert</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Leading Defect Mode</span>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
              Rank #1
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1 truncate" title={kpis.mostCommonDefect}>
            {kpis.mostCommonDefect}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Root Cause Tracking</span>
            <span className="text-slate-700 font-medium">Investigation active</span>
          </div>
        </div>
      </div>

      {/* Dynamic Multi-Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[#D32F2F]" />
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Analytics Filters & Segmentation
            </h3>
          </div>
          <button
            onClick={() => {
              setModelFilter('All');
              setBatchFilter('All');
              setDefectFilter('All');
              setStageFilter('All');
              setDispositionFilter('All');
              setSearchQuery('');
            }}
            className="text-[11px] font-semibold text-gray-500 hover:text-[#D32F2F] flex items-center gap-1"
          >
            <RotateCcw size={12} />
            <span>Reset Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Model */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Fan Model</label>
            <select
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className="w-full py-1.5 px-2 text-xs border border-gray-300 rounded-lg bg-white"
            >
              <option value="All">All Models</option>
              {FAN_MODELS.map(m => (
                <option key={m} value={m}>{m.replace('Luker ', '')}</option>
              ))}
            </select>
          </div>

          {/* Batch */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Production Batch</label>
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="w-full py-1.5 px-2 text-xs border border-gray-300 rounded-lg bg-white"
            >
              <option value="All">All Batches</option>
              {batches.map(b => (
                <option key={b.id} value={b.id}>{b.id}</option>
              ))}
            </select>
          </div>

          {/* Defect */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Defect Category</label>
            <select
              value={defectFilter}
              onChange={(e) => setDefectFilter(e.target.value)}
              className="w-full py-1.5 px-2 text-xs border border-gray-300 rounded-lg bg-white"
            >
              <option value="All">All Defect Types</option>
              {DEFECT_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Stage */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Production Stage</label>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full py-1.5 px-2 text-xs border border-gray-300 rounded-lg bg-white"
            >
              <option value="All">All Stages</option>
              {PRODUCTION_STAGES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Disposition */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Disposition</label>
            <select
              value={dispositionFilter}
              onChange={(e) => setDispositionFilter(e.target.value)}
              className="w-full py-1.5 px-2 text-xs border border-gray-300 rounded-lg bg-white"
            >
              <option value="All">All (Rework + Scrap)</option>
              <option value="Rework">Rework Only</option>
              <option value="Scrap">Scrap Only</option>
            </select>
          </div>

          {/* Keyword Search */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="RCA keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-1.5 px-2 text-xs border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5 Recharts Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Weekly Rejection Trend */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Weekly Rejection Quantity Trend (Rework vs Scrap)</h3>
              <p className="text-xs text-gray-500">Defect volume tracking across chronological factory shifts</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 font-medium text-amber-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> Rework
              </span>
              <span className="flex items-center gap-1 font-medium text-red-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#D32F2F]"></span> Scrap
              </span>
            </div>
          </div>

          <div className="h-64 mt-3 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                <Tooltip
                  formatter={(val: number, name: string) => [`${val} Units`, name.toUpperCase()]}
                  contentStyle={{ backgroundColor: '#1F242C', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="rework" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} maxBarSize={45} />
                <Bar dataKey="scrap" stackId="a" fill="#D32F2F" radius={[4, 4, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Rework vs Scrap Donut Chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Rework vs Scrap Distribution</h3>
              <span className="text-xs font-mono font-bold text-gray-500">
                {totalFilteredUnits} Units
              </span>
            </div>

            <div className="h-56 mt-2 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dispositionChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {dispositionChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [`${val} Units`, 'Quantity']}
                    contentStyle={{ backgroundColor: '#1F242C', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-500 text-center">
            Reworked units return to verification line; scrap is written off permanently.
          </div>
        </div>
      </div>

      {/* Row 2 Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 2. Rejections by Fan Model */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="pb-3 border-b border-gray-100">
            <h4 className="text-sm font-bold text-gray-900">Rejections by Fan Model</h4>
            <p className="text-xs text-gray-500">Defects attributed to model SKU</p>
          </div>

          <div className="h-52 mt-3 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis dataKey="model" tick={{ fontSize: 9, fill: '#4B5563' }} angle={-15} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 10, fill: '#4B5563' }} />
                <Tooltip
                  formatter={(val: number) => [`${val} Units`, 'Defects']}
                  contentStyle={{ backgroundColor: '#1F242C', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="quantity" fill="#8B3B07" radius={[4, 4, 0, 0]} maxBarSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Rejections by Defect Category */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="pb-3 border-b border-gray-100">
            <h4 className="text-sm font-bold text-gray-900">Rejections by Defect Category</h4>
            <p className="text-xs text-gray-500">Failure modes ranked by frequency</p>
          </div>

          <div className="h-52 mt-3 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={defectChartData}
                margin={{ top: 5, right: 15, left: 35, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F0F0F0" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#4B5563' }} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 9, fill: '#4B5563' }} width={80} />
                <Tooltip
                  formatter={(val: number) => [`${val} Units`, 'Defects']}
                  contentStyle={{ backgroundColor: '#1F242C', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="quantity" fill="#D32F2F" radius={[0, 4, 4, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Rejections by Production Stage */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="pb-3 border-b border-gray-100">
            <h4 className="text-sm font-bold text-gray-900">Rejections by Production Stage</h4>
            <p className="text-xs text-gray-500">Station where defects are intercepted</p>
          </div>

          <div className="h-52 mt-3 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis dataKey="stage" tick={{ fontSize: 9, fill: '#4B5563' }} angle={-15} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 10, fill: '#4B5563' }} />
                <Tooltip
                  formatter={(val: number) => [`${val} Units`, 'Defects']}
                  contentStyle={{ backgroundColor: '#1F242C', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="quantity" fill="#F58285" radius={[4, 4, 0, 0]} maxBarSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Rejection Records Table & Root Cause Tracking */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Rejection & Root Cause Investigation Registry
            </h3>
            <p className="text-xs text-gray-500">
              Distinct tracking between suspected vs verified root causes & corrective actions
            </p>
          </div>

          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D32F2F] hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors self-start sm:self-auto"
          >
            <span>+ Log Rejection Event</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Rejection ID</th>
                <th className="py-3 px-4">Batch ID</th>
                <th className="py-3 px-4">Model</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Defect Category</th>
                <th className="py-3 px-4">Qty</th>
                <th className="py-3 px-4">Disposition</th>
                <th className="py-3 px-4">Root Cause (Suspected / Verified)</th>
                <th className="py-3 px-4">Investigation Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRejections.map((rec) => (
                <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-gray-900">{rec.id}</td>
                  <td className="py-3 px-4 font-mono text-gray-700">{rec.batchId}</td>
                  <td className="py-3 px-4 text-gray-800">{rec.fanModel.replace('Luker ', '')}</td>
                  <td className="py-3 px-4 text-gray-500 text-[11px]">{formatDate(rec.date)}</td>
                  <td className="py-3 px-4 text-gray-700">{rec.productionStage}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">{rec.defectCategory}</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#D32F2F]">{rec.quantity}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        rec.disposition === 'Rework'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {rec.disposition}
                    </span>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    {rec.isVerified && rec.verifiedRootCause ? (
                      <div>
                        <div className="font-semibold text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 size={12} className="text-emerald-600 flex-shrink-0" />
                          <span className="truncate" title={rec.verifiedRootCause}>
                            Verified: {rec.verifiedRootCause}
                          </span>
                        </div>
                        {rec.correctiveAction && (
                          <div className="text-[10px] text-gray-500 italic truncate" title={rec.correctiveAction}>
                            Action: {rec.correctiveAction}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-600 truncate" title={rec.suspectedRootCause}>
                        <span className="text-amber-700 font-semibold">[Suspected]</span> {rec.suspectedRootCause}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        rec.investigationStatus === 'Closed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rec.investigationStatus === 'Verified'
                          ? 'bg-blue-100 text-blue-800'
                          : rec.investigationStatus === 'Suspected'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {rec.investigationStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleEditRecordOpen(rec)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:text-[#D32F2F] bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                      Investigate RCA
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Investigate Root Cause */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  RCA Investigation: <span className="font-mono text-[#D32F2F]">{selectedRecord.id}</span>
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedRecord.fanModel} • {selectedRecord.quantity} units ({selectedRecord.defectCategory})
                </p>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRootCause} className="space-y-4">
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs">
                <span className="font-bold text-amber-900">Suspected Root Cause (Initial Observation):</span>
                <p className="text-amber-800 mt-0.5">{selectedRecord.suspectedRootCause}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Verified Root Cause (Laboratory / Teardown Confirmed)
                </label>
                <textarea
                  rows={2}
                  placeholder="Record verified physical/metallurgical/tooling root cause once proven..."
                  value={verifiedCause}
                  onChange={(e) => setVerifiedCause(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  * Note: Only populate when verified through engineering teardown or micrometer inspection.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Corrective & Preventive Action (CAPA)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Recalibrate arbor press valve #2 and inspect lot supplier"
                  value={correctiveAction}
                  onChange={(e) => setCorrectiveAction(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Responsible Engineering Team
                  </label>
                  <input
                    type="text"
                    value={responsibleTeam}
                    onChange={(e) => setResponsibleTeam(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Investigation Status
                  </label>
                  <select
                    value={investigationStatus}
                    onChange={(e) => setInvestigationStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="Suspected">Suspected</option>
                    <option value="Verified">Verified</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#D32F2F] hover:bg-red-700 rounded-lg shadow-sm"
                >
                  Save RCA Findings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Rejection Event */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <h3 className="text-base font-bold text-gray-900">Log Production Rejection Event</h3>
              <button onClick={() => setShowLogModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRejectionSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Target Batch
                  </label>
                  <select
                    value={newBatchId}
                    onChange={(e) => setNewBatchId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                  >
                    {batches.map(b => (
                      <option key={b.id} value={b.id}>{b.id} ({b.fanModel})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Production Stage
                  </label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                  >
                    {PRODUCTION_STAGES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Defect Category
                  </label>
                  <select
                    value={newDefect}
                    onChange={(e) => setNewDefect(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white"
                  >
                    {DEFECT_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Quantity (Units)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newQty}
                    onChange={(e) => setNewQty(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Disposition
                  </label>
                  <select
                    value={newDisposition}
                    onChange={(e) => setNewDisposition(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white font-semibold"
                  >
                    <option value="Rework">Rework</option>
                    <option value="Scrap">Scrap</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Suspected Root Cause
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arbor misalignment causing bearing tilt during press"
                  value={newSuspectedCause}
                  onChange={(e) => setNewSuspectedCause(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Responsible Team
                </label>
                <input
                  type="text"
                  required
                  value={newTeam}
                  onChange={(e) => setNewTeam(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#D32F2F] hover:bg-red-700 rounded-lg shadow-sm"
                >
                  Log Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
