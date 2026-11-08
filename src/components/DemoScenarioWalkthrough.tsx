import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  X,
  Layers,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { useOperations } from '../context/OperationsContext';

interface DemoScenarioWalkthroughProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoScenarioWalkthrough: React.FC<DemoScenarioWalkthroughProps> = ({ isOpen, onClose }) => {
  const {
    batches,
    materials,
    inspections,
    rejections,
    setActiveTab,
    setSelectedBatchId,
    recordMaterialReceipt,
    reserveMaterialForBatch,
    stageMaterialForBatch,
    recordStageMovement,
    createInspection,
    resetDemoData
  } = useOperations();

  if (!isOpen) return null;

  // Demo batch lookup
  const demoBatch = batches.find(b => b.id === 'FAN-2026-001');
  const capMaterial = materials.find(m => m.id === 'MAT-CAP-01');
  const capReq = demoBatch?.materialRequirements.find(r => r.materialId === 'MAT-CAP-01');

  // Step state evaluations
  const isShortageActive = (capMaterial?.available ?? 0) < 500 && (capReq?.staged ?? 0) < 500 && demoBatch?.status === 'Blocked';
  const isMaterialReady = Boolean(demoBatch && demoBatch.materialRequirements.every(r => r.staged >= r.totalRequired));
  const isProductionMoved = Boolean(
    demoBatch && (
      (demoBatch.stageQuantities['Motor Assembly'] || 0) > 0 ||
      (demoBatch.stageQuantities['Component Assembly'] || 0) > 0 ||
      (demoBatch.stageQuantities['Electrical Testing'] || 0) > 0 ||
      (demoBatch.stageQuantities['Performance Testing'] || 0) > 0 ||
      (demoBatch.stageQuantities['Packaging'] || 0) > 0 ||
      demoBatch.completedQuantity > 0 ||
      demoBatch.movements.length > 0
    )
  );
  const demoInspections = inspections.filter(i => i.batchId === 'FAN-2026-001');
  const totalDemoInspected = demoInspections.reduce((s, i) => s + i.unitsInspected, 0);
  const isQCCompleted = totalDemoInspected >= 500;
  const demoRejections = rejections.filter(r => r.batchId === 'FAN-2026-001');
  const totalDemoRejections = demoRejections.reduce((s, r) => s + r.quantity, 0);
  const isRejectionLogged = totalDemoRejections >= 20;

  // Actions
  const handleQuickResolveStep2 = () => {
    recordMaterialReceipt('MAT-CAP-01', 100, 'GRN-EXPRESS-100 Luker Supplier Consignment', 'Auto Demo Guide');
    reserveMaterialForBatch('FAN-2026-001', 'MAT-CAP-01', 100, 'Auto Demo Guide');
    stageMaterialForBatch('FAN-2026-001', 'MAT-CAP-01', 500, 'Auto Demo Guide');
    if (demoBatch) {
      demoBatch.materialRequirements.forEach(r => {
        if (r.materialId !== 'MAT-CAP-01' && r.staged < r.totalRequired) {
          const needed = r.totalRequired - r.staged;
          stageMaterialForBatch('FAN-2026-001', r.materialId, needed, 'Auto Demo Guide');
        }
      });
    }
    setActiveTab('materials');
    setSelectedBatchId('FAN-2026-001');
    onClose();
  };

  const handleQuickMoveStep3 = () => {
    recordStageMovement('FAN-2026-001', 'Start', 'Material Receipt', 500, 'R. Nair', 'Kitting lot released');
    recordStageMovement('FAN-2026-001', 'Material Receipt', 'Motor Assembly', 500, 'V. Sharma', 'Stator winding & bearing fit');
    recordStageMovement('FAN-2026-001', 'Motor Assembly', 'Component Assembly', 500, 'K. Pillai', 'Housing subassembly');
    recordStageMovement('FAN-2026-001', 'Component Assembly', 'Electrical Testing', 500, 'M. George', 'Ready for insulation & high-pot check');
    setActiveTab('production');
    setSelectedBatchId('FAN-2026-001');
    onClose();
  };

  const handleQuickInspectStep4 = () => {
    createInspection({
      batchId: 'FAN-2026-001',
      fanModel: 'Luker BLDC Demo Model',
      inspectionDate: new Date().toISOString().split('T')[0],
      unitsInspected: 500,
      passed: 480,
      failed: 20,
      defectCategory: 'Motor noise',
      inspector: 'Rajesh K. (Senior QC Lead)',
      status: 'Conditional',
      notes: '480 passed electrical & sound booth testing. 20 units exhibited bearing vibration hum.',
      reworkCount: 15,
      scrapCount: 5,
      measurements: {
        rpm: 385,
        voltage: 230,
        current: 0.14,
        power: 32,
        noiseDb: 46.2,
        vibrationMmS: 2.4,
        visualDefectCount: 0,
        isIllustrativeOnly: true
      }
    });
    setActiveTab('quality');
    setSelectedBatchId('FAN-2026-001');
    onClose();
  };

  const steps = [
    {
      num: 1,
      title: 'Step 1: Material Shortage Blocks Batch',
      module: 'Module 3: Material Readiness',
      desc: 'Batch FAN-2026-001 requires 500 run capacitors. Only 400 available in stock (100 short). Status is locked to Blocked.',
      done: !isShortageActive && isMaterialReady,
      current: isShortageActive,
      actionText: 'Inspect Shortage in Module 3',
      onClick: () => {
        setActiveTab('materials');
        setSelectedBatchId('FAN-2026-001');
        onClose();
      }
    },
    {
      num: 2,
      title: 'Step 2: Receipt, Reserve & Shop Floor Staging',
      module: 'Module 3: Material Readiness',
      desc: 'Receive +100 units via GRN, reserve the required 500, and physically stage all parts to the line. Status flips to Scheduled!',
      done: isMaterialReady,
      current: isShortageActive && !isMaterialReady,
      actionText: '1-Click Receive, Reserve & Stage',
      onClick: handleQuickResolveStep2
    },
    {
      num: 3,
      title: 'Step 3: Move Units Through Production Stages',
      module: 'Module 1: Production & WIP',
      desc: 'Transfer 500 units from Material Receipt through Motor Assembly into Electrical Testing. WIP balances without double counting.',
      done: isProductionMoved,
      current: isMaterialReady && !isProductionMoved,
      actionText: '1-Click Advance Production Line',
      onClick: handleQuickMoveStep3
    },
    {
      num: 4,
      title: 'Step 4: Execute Batch Quality Inspection',
      module: 'Module 2: Quality Control',
      desc: 'Record QC inspection on 500 units: 480 passed, 20 failed with illustrative acoustic and vibration test readings.',
      done: isQCCompleted,
      current: isProductionMoved && !isQCCompleted,
      actionText: '1-Click Record 500u Inspection',
      onClick: handleQuickInspectStep4
    },
    {
      num: 5,
      title: 'Step 5: Track Rejection Rework vs Scrap & Root Cause',
      module: 'Module 4: Rejection Analytics',
      desc: '20 failed units routed: 15 rework (bearing alignment) and 5 scrap (core void). Record suspected vs verified causes.',
      done: isRejectionLogged,
      current: isQCCompleted && !isRejectionLogged,
      actionText: 'Open Rejection Analytics & RCA',
      onClick: () => {
        setActiveTab('analytics');
        onClose();
      }
    },
    {
      num: 6,
      title: 'Step 6: Real-Time Executive Dashboard Sync',
      module: 'Overview Dashboard',
      desc: 'Inspect executive KPIs, stage WIP distribution, pass rates, and actionable plant alerts update seamlessly.',
      done: isQCCompleted && isRejectionLogged,
      current: isRejectionLogged,
      actionText: 'Return to Operations Overview',
      onClick: () => {
        setActiveTab('overview');
        onClose();
      }
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight text-white">
                  Connected Demonstration Scenario
                </h3>
                <span className="bg-red-500/30 text-red-300 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                  BATCH: FAN-2026-001
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Luker AI Efficiency Enabler • 6-Step End-to-End Operational Walkthrough
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetDemoData}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
              title="Reset scenario to Step 1"
            >
              <RotateCcw size={12} />
              <span>Reset Baseline</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Steps List */}
        <div className="p-6 overflow-y-auto space-y-3.5 bg-slate-50/50">
          <div className="text-xs text-slate-600 bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-center justify-between">
            <span>
              💡 <strong>Interview Guide:</strong> You can execute this 6-step workflow via the 1-click action buttons below, or perform each action manually inside the respective modules.
            </span>
          </div>

          <div className="space-y-3">
            {steps.map((s) => (
              <div
                key={s.num}
                className={`p-4 rounded-xl border transition-all ${
                  s.done
                    ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                    : s.current
                    ? 'bg-white border-[#D32F2F] shadow-md ring-1 ring-[#D32F2F]/20'
                    : 'bg-white border-slate-200 text-slate-600 opacity-80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                        s.done
                          ? 'bg-emerald-600 text-white'
                          : s.current
                          ? 'bg-[#D32F2F] text-white animate-pulse'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {s.done ? <CheckCircle2 size={14} /> : s.num}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{s.title}</h4>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {s.module}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>

                  <button
                    onClick={s.onClick}
                    className={`self-start sm:self-center px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm ${
                      s.current
                        ? 'bg-[#D32F2F] hover:bg-red-700 text-white'
                        : s.done
                        ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{s.actionText}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>All operational changes are automatically preserved in localStorage.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
