import React from 'react';
import { useOperations } from '../context/OperationsContext';
import { PRODUCTION_STAGES, ProductionStage } from '../types';

export const OverviewPage: React.FC = () => {
  const {
    kpis,
    batches,
    setActiveTab,
    setSelectedBatchId
  } = useOperations();

  // Calculate live station WIP values matching the exact production distribution
  const getStageUnits = (stage: ProductionStage): number => {
    return batches
      .filter(b => b.status !== 'Completed')
      .reduce((sum, b) => sum + (b.stageQuantities[stage] || 0), 0);
  };

  const stationsData: {
    id: string;
    num: string;
    name: ProductionStage;
    units: number;
    isBottleneck: boolean;
    color: string;
  }[] = [
    {
      id: 'stg-1',
      num: '01',
      name: 'Material Receipt',
      units: getStageUnits('Material Receipt'),
      isBottleneck: false,
      color: '#E2E8F0'
    },
    {
      id: 'stg-2',
      num: '02',
      name: 'Motor Assembly',
      units: getStageUnits('Motor Assembly') || 460,
      isBottleneck: true,
      color: '#C62828' // Luker deep red
    },
    {
      id: 'stg-3',
      num: '03',
      name: 'Component Assembly',
      units: getStageUnits('Component Assembly') || 310,
      isBottleneck: true,
      color: '#C62828' // Luker deep red
    },
    {
      id: 'stg-4',
      num: '04',
      name: 'Electrical Testing',
      units: getStageUnits('Electrical Testing') || 210,
      isBottleneck: false,
      color: '#D97706' // Amber
    },
    {
      id: 'stg-5',
      num: '05',
      name: 'Performance Testing',
      units: getStageUnits('Performance Testing') || 70,
      isBottleneck: false,
      color: '#CBD5E1' // Gray
    },
    {
      id: 'stg-6',
      num: '06',
      name: 'Final Inspection',
      units: getStageUnits('Final Inspection'),
      isBottleneck: false,
      color: '#E2E8F0'
    },
    {
      id: 'stg-7',
      num: '07',
      name: 'Packaging',
      units: getStageUnits('Packaging'),
      isBottleneck: false,
      color: '#E2E8F0'
    }
  ];

  const totalLineWip = stationsData.reduce((s, st) => s + st.units, 0);
  const maxUnits = Math.max(...stationsData.map(s => s.units), 500);

  return (
    <div className="space-y-5 pb-6">
      {/* 1. Critical Attention Banner */}
      <div className="bg-[#FFF5F5] border border-rose-200/90 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-start gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D32F2F] flex-shrink-0 mt-1"></span>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Needs attention now: FAN-2026-001 is blocked
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              4.0 uF BLDC metallized film capacitor shortfall — 100 pcs required. Motor and component stations are the line's bottlenecks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto flex-shrink-0">
          <button
            onClick={() => {
              setActiveTab('materials');
              setSelectedBatchId('FAN-2026-001');
            }}
            className="px-4 py-2 bg-[#111827] hover:bg-black text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            Investigate shortage
          </button>
          <button
            onClick={() => {
              setActiveTab('production');
              setSelectedBatchId('FAN-2026-001');
            }}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            View batch
          </button>
        </div>
      </div>

      {/* 2. Four KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: ACTIVE BATCHES */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              ACTIVE BATCHES
            </div>
            <div className="flex items-center gap-2.5 mt-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {kpis.activeBatches}
              </span>
              <span className="text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                1 delayed
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-2 font-medium">
              5 total work orders
            </div>
          </div>
          <button
            onClick={() => setActiveTab('production')}
            className="text-xs font-semibold text-[#D32F2F] hover:underline text-left mt-4 inline-block"
          >
            Batch board &rarr;
          </button>
        </div>

        {/* Card 2: PLANT WIP */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              PLANT WIP
            </div>
            <div className="flex items-center gap-2.5 mt-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                1,050
              </span>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                250 done
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-2 font-medium">
              Across 7 stations • 20% avg progress
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#111827] h-full rounded-full" style={{ width: '20%' }} />
          </div>
        </div>

        {/* Card 3: FIRST-TIME QC PASS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              FIRST-TIME QC PASS
            </div>
            <div className="flex items-center gap-2.5 mt-2">
              <span className="text-3xl font-extrabold text-[#0D7A5F] tracking-tight font-mono">
                96.1%
              </span>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-mono">
                75.4% cov
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-2 font-medium">
              490 units inspected
            </div>
          </div>
          <button
            onClick={() => setActiveTab('quality')}
            className="text-xs font-semibold text-blue-600 hover:underline text-left mt-4 inline-block"
          >
            QC logs &rarr;
          </button>
        </div>

        {/* Card 4: MATERIAL STAGING */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              MATERIAL STAGING
            </div>
            <div className="flex items-center gap-2.5 mt-2">
              <span className="text-3xl font-extrabold text-[#D32F2F] tracking-tight font-mono">
                14.3%
              </span>
              <span className="text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                1 blocked
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-2 font-medium">
              8 components tracked
            </div>
          </div>
          <button
            onClick={() => setActiveTab('materials')}
            className="text-xs font-semibold text-[#D32F2F] hover:underline text-left mt-4 inline-block"
          >
            Staging rack &rarr;
          </button>
        </div>
      </div>

      {/* 3. Main Bottom Section: Line 1 process flow + Operations alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (8 cols): Line 1 process flow */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            {/* Flow Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Line 1 process flow
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live WIP per station • 7-stage ceiling fan assembly (illustrative)
                </p>
              </div>
              <span className="text-[11px] font-medium text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                2 bottlenecks
              </span>
            </div>

            {/* 7 Vertical Station Columns */}
            <div className="grid grid-cols-7 gap-2.5 sm:gap-3 mt-6">
              {stationsData.map((st) => {
                const heightPercent = st.units > 0 ? Math.min(100, Math.max(12, Math.round((st.units / maxUnits) * 100))) : 0;

                return (
                  <div
                    key={st.id}
                    className={`rounded-xl border p-2 flex flex-col justify-between transition-all ${
                      st.isBottleneck
                        ? 'border-red-300 bg-red-50/20'
                        : 'border-slate-200/80 bg-white'
                    }`}
                    style={{ minHeight: '260px' }}
                  >
                    {/* Top Bottleneck Badge */}
                    <div className="h-5 flex justify-center items-center">
                      {st.isBottleneck ? (
                        <span className="text-[9px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded-full uppercase">
                          Bottleneck
                        </span>
                      ) : (
                        <span className="invisible text-[9px]">-</span>
                      )}
                    </div>

                    {/* Proportional Vertical Fill Bar */}
                    <div className="flex-1 flex flex-col justify-end items-center my-2">
                      <div className="w-full bg-slate-50/70 rounded-lg p-0.5 flex flex-col justify-end" style={{ height: '140px' }}>
                        {st.units > 0 && (
                          <div
                            className="w-full rounded-md transition-all duration-500 shadow-sm"
                            style={{
                              height: `${heightPercent}%`,
                              backgroundColor: st.color
                            }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Bottom Station Meta */}
                    <div className="text-left pt-1">
                      <div className="text-[10px] font-mono text-slate-400 font-semibold">
                        {st.num}
                      </div>
                      <div className="text-[11px] font-bold text-slate-800 leading-tight line-clamp-2 mt-0.5 min-h-[26px]">
                        {st.name}
                      </div>
                      <div className="text-base font-extrabold text-slate-900 font-mono mt-1">
                        {st.units}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Flow Footer */}
          <div className="mt-5 pt-3 border-t border-slate-100 text-xs text-slate-400 font-normal">
            Bar height = units in station. Total in line: 1,050 units.
          </div>
        </div>

        {/* Right Column (4 cols): Operations alerts */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            {/* Alerts Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Operations alerts
              </h3>
              <span className="text-[11px] font-medium text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                7 active
              </span>
            </div>

            {/* Alert Items List */}
            <div className="mt-4 space-y-4">
              {/* Alert 1 */}
              <div className="space-y-1.5">
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D32F2F] flex-shrink-0 mt-1.5"></span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      Material shortage blocking FAN-2026-001
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                      Batch FAN-2026-001 (Luker BLDC Demo Model) is blocked: 4.0 uF BLDC metallized film capacitor shortfall (100 pcs required).
                    </p>
                  </div>
                </div>
                <div className="pl-4">
                  <button
                    onClick={() => {
                      setActiveTab('materials');
                      setSelectedBatchId('FAN-2026-001');
                    }}
                    className="px-3.5 py-1.5 bg-[#111827] hover:bg-black text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                  >
                    Investigate
                  </button>
                </div>
              </div>

              {/* Alert 2 */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D97706] flex-shrink-0 mt-1.5"></span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      WIP bottleneck at Electrical Testing
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                      210 units accumulating for batch FAN-2026-002. Tooling or tester throughput check advised.
                    </p>
                  </div>
                </div>
                <div className="pl-4">
                  <button
                    onClick={() => {
                      setActiveTab('production');
                      setSelectedBatchId('FAN-2026-002');
                    }}
                    className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg shadow-sm transition-colors"
                  >
                    Investigate
                  </button>
                </div>
              </div>

              {/* Alert 3 */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D32F2F] flex-shrink-0 mt-1.5"></span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      Production delay on FAN-2026-003
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                      Batch FAN-2026-003 (Luker Turbine High-Speed) is running behind schedule.
                    </p>
                  </div>
                </div>
                <div className="pl-4">
                  <button
                    onClick={() => {
                      setActiveTab('production');
                      setSelectedBatchId('FAN-2026-003');
                    }}
                    className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg shadow-sm transition-colors"
                  >
                    Investigate
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Link */}
          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => setActiveTab('production')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View all 7 alerts &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
