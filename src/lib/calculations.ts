import {
  ProductionBatch,
  MaterialItem,
  QualityInspection,
  RejectionRecord,
  FactoryAlert,
  ProductionStage,
  PRODUCTION_STAGES
} from '../types';

export interface OperationsKPIs {
  activeBatches: number;
  totalWip: number;
  unitsCompleted: number;
  delayedBatches: number;
  averageProgress: number;
  qcCoverage: number;
  qcPassRate: number;
  totalUnitsInspected: number;
  totalUnitsPendingInspection: number;
  materialReadinessRate: number;
  batchesFullyReady: number;
  batchesBlockedByShortage: number;
  materialShortagesCount: number;
  totalProducedUnits: number;
  totalRejectedUnits: number;
  rejectionRatio: number;
  reworkQuantity: number;
  scrapQuantity: number;
  mostCommonDefect: string;
}

/**
 * Calculates all factory-wide operational intelligence KPIs from the shared source of truth
 */
export function calculateOperationsKPIs(
  batches: ProductionBatch[],
  materials: MaterialItem[],
  inspections: QualityInspection[],
  rejections: RejectionRecord[]
): OperationsKPIs {
  // 1. Production & WIP calculations
  const activeBatchesList = batches.filter(b => b.status !== 'Completed');
  const activeBatches = activeBatchesList.length;

  // Real WIP: Sum of outstanding units currently residing in stages (excluding Completed)
  let totalWip = 0;
  let unitsCompleted = 0;
  let totalPlanned = 0;
  let totalProgressAcc = 0;
  let delayedBatches = 0;

  for (const b of batches) {
    totalPlanned += b.plannedQuantity;
    unitsCompleted += b.completedQuantity;

    if (b.status === 'Delayed') {
      delayedBatches += 1;
    } else if (b.status !== 'Completed') {
      const now = new Date().toISOString().split('T')[0];
      if (b.targetDate < now) {
        delayedBatches += 1;
      }
    }

    if (b.status !== 'Completed') {
      // Calculate WIP as sum of stage quantities
      const batchStageSum = Object.values(b.stageQuantities).reduce((acc, qty) => acc + qty, 0);
      totalWip += batchStageSum > 0 ? batchStageSum : b.wipQuantity;

      // Progress percentage of batch
      const progress = b.plannedQuantity > 0 
        ? Math.min(100, Math.round((b.completedQuantity / b.plannedQuantity) * 100))
        : 0;
      totalProgressAcc += progress;
    } else {
      totalProgressAcc += 100;
    }
  }

  const averageProgress = batches.length > 0 
    ? Math.round(totalProgressAcc / batches.length) 
    : 0;

  // 2. Quality Control calculations
  // Total units eligible for inspection across batches that reached inspection stages or completed
  let totalUnitsRequiringInspection = 0;
  for (const b of batches) {
    if (b.status === 'Completed') {
      totalUnitsRequiringInspection += b.plannedQuantity;
    } else {
      // Units that entered Electrical Testing, Performance Testing, Final Inspection, or completed
      const inTestingOrPassed = 
        (b.stageQuantities['Electrical Testing'] || 0) +
        (b.stageQuantities['Performance Testing'] || 0) +
        (b.stageQuantities['Final Inspection'] || 0) +
        (b.stageQuantities['Packaging'] || 0) +
        b.completedQuantity;
      totalUnitsRequiringInspection += Math.min(b.plannedQuantity, Math.max(b.inspectedQuantity, inTestingOrPassed));
    }
  }

  const totalUnitsInspected = inspections.reduce((sum, ins) => sum + ins.unitsInspected, 0);
  const totalPassedUnits = inspections.reduce((sum, ins) => sum + ins.passed, 0);
  const totalFailedUnits = inspections.reduce((sum, ins) => sum + ins.failed, 0);

  const qcCoverage = totalUnitsRequiringInspection > 0 
    ? Math.min(100, (totalUnitsInspected / totalUnitsRequiringInspection) * 100)
    : 100;

  const qcPassRate = totalUnitsInspected > 0
    ? (totalPassedUnits / totalUnitsInspected) * 100
    : 100;

  const totalUnitsPendingInspection = Math.max(0, totalUnitsRequiringInspection - totalUnitsInspected);

  // 3. Material Readiness calculations
  let totalRequirementsCount = 0;
  let stagedRequirementsCount = 0;
  let batchesFullyReady = 0;
  let batchesBlockedByShortage = 0;

  for (const b of activeBatchesList) {
    if (!b.materialRequirements || b.materialRequirements.length === 0) {
      batchesFullyReady += 1;
      continue;
    }

    let batchAllStaged = true;
    let batchHasShortage = false;

    for (const req of b.materialRequirements) {
      totalRequirementsCount += 1;
      if (req.staged >= req.totalRequired) {
        stagedRequirementsCount += 1;
      } else {
        batchAllStaged = false;
        // Check if material is short in store
        const mat = materials.find(m => m.id === req.materialId);
        if (mat) {
          const totalStock = mat.available + mat.reserved;
          if (totalStock < req.totalRequired) {
            batchHasShortage = true;
          }
        }
      }
    }

    if (batchAllStaged) {
      batchesFullyReady += 1;
    }
    if (batchHasShortage || b.status === 'Blocked') {
      batchesBlockedByShortage += 1;
    }
  }

  const materialReadinessRate = totalRequirementsCount > 0
    ? (stagedRequirementsCount / totalRequirementsCount) * 100
    : 100;

  const materialShortagesCount = materials.filter(m => m.available < m.minStockLevel || m.status === 'Critical Shortage').length;

  // 4. Rejection Analytics calculations
  // Total produced units across all batches (units that have moved through production or are completed)
  const totalProducedUnits = unitsCompleted + totalUnitsInspected + (totalWip > 0 ? Math.round(totalWip * 0.4) : 0);
  const totalRejectedUnits = rejections.reduce((sum, r) => sum + r.quantity, 0);
  const reworkQuantity = rejections.filter(r => r.disposition === 'Rework').reduce((sum, r) => sum + r.quantity, 0);
  const scrapQuantity = rejections.filter(r => r.disposition === 'Scrap').reduce((sum, r) => sum + r.quantity, 0);

  const rejectionRatio = totalProducedUnits > 0
    ? (totalRejectedUnits / totalProducedUnits) * 100
    : 0;

  // Most common defect category
  const defectCounts: Record<string, number> = {};
  for (const r of rejections) {
    defectCounts[r.defectCategory] = (defectCounts[r.defectCategory] || 0) + r.quantity;
  }
  let mostCommonDefect = 'None';
  let maxCount = 0;
  for (const [cat, count] of Object.entries(defectCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostCommonDefect = cat;
    }
  }

  return {
    activeBatches,
    totalWip,
    unitsCompleted,
    delayedBatches,
    averageProgress,
    qcCoverage,
    qcPassRate,
    totalUnitsInspected,
    totalUnitsPendingInspection,
    materialReadinessRate,
    batchesFullyReady,
    batchesBlockedByShortage,
    materialShortagesCount,
    totalProducedUnits: Math.max(totalProducedUnits, totalRejectedUnits + unitsCompleted),
    totalRejectedUnits,
    rejectionRatio,
    reworkQuantity,
    scrapQuantity,
    mostCommonDefect
  };
}

/**
 * Derives actionable operational alerts from the shared state
 */
export function generateFactoryAlerts(
  batches: ProductionBatch[],
  materials: MaterialItem[],
  inspections: QualityInspection[],
  rejections: RejectionRecord[]
): FactoryAlert[] {
  const alerts: FactoryAlert[] = [];

  // Check 1: Material shortages blocking batches
  for (const b of batches) {
    if (b.status === 'Blocked') {
      const shortReq = b.materialRequirements?.find(r => r.status === 'Not Ready' || r.staged < r.totalRequired);
      alerts.push({
        id: `alert-blocked-${b.id}`,
        type: 'critical',
        title: `Material Shortage Blocking ${b.id}`,
        message: shortReq 
          ? `Batch ${b.id} (${b.fanModel}) is blocked: ${shortReq.materialName} shortfall (${shortReq.totalRequired - shortReq.reserved} ${shortReq.unit} required).`
          : `Batch ${b.id} (${b.fanModel}) is blocked on material readiness before shop floor staging.`,
        module: 'materials',
        targetId: b.id,
        timestamp: 'Active Now'
      });
    }
  }

  // Check 2: Delayed batches or bottleneck stages
  for (const b of batches) {
    if (b.status === 'Delayed') {
      alerts.push({
        id: `alert-delay-${b.id}`,
        type: 'critical',
        title: `Production Delay on ${b.id}`,
        message: `Batch ${b.id} (${b.fanModel}) is delayed at ${b.currentStage} with ${b.stageQuantities[b.currentStage] || b.wipQuantity} units pending past target date (${b.targetDate}).`,
        module: 'production',
        targetId: b.id,
        timestamp: 'Active Now'
      });
    } else if (b.status === 'In Production') {
      // Check for bottleneck (> 150 units at one stage)
      for (const [stage, qty] of Object.entries(b.stageQuantities)) {
        if (qty >= 200) {
          alerts.push({
            id: `alert-bottleneck-${b.id}-${stage}`,
            type: 'warning',
            title: `WIP Bottleneck at ${stage}`,
            message: `${qty} units accumulating at ${stage} for batch ${b.id}. Tooling or tester throughput check advised.`,
            module: 'production',
            targetId: b.id,
            timestamp: 'Attention Needed'
          });
        }
      }
    }
  }

  // Check 3: Materials available in stock but not yet staged
  for (const b of batches) {
    if (b.status !== 'Completed') {
      const unstagedReady = b.materialRequirements?.filter(r => r.staged < r.totalRequired && r.reserved >= r.totalRequired);
      if (unstagedReady && unstagedReady.length > 0) {
        alerts.push({
          id: `alert-stage-needed-${b.id}`,
          type: 'info',
          title: `Materials Allocated But Not Staged: ${b.id}`,
          message: `${unstagedReady.length} allocated components for ${b.id} are in central stores awaiting physical transfer to shop floor.`,
          module: 'materials',
          targetId: b.id,
          timestamp: 'Actionable'
        });
      }
    }
  }

  // Check 4: QC Pending for units that completed assembly
  for (const b of batches) {
    const uninspected = (b.stageQuantities['Electrical Testing'] || 0) + (b.stageQuantities['Final Inspection'] || 0);
    if (uninspected > 50 && b.inspectedQuantity < b.plannedQuantity) {
      alerts.push({
        id: `alert-qc-${b.id}`,
        type: 'warning',
        title: `Quality Inspection Pending for ${b.id}`,
        message: `${uninspected} units in testing stages awaiting electrical/safety QC sign-off for ${b.fanModel}.`,
        module: 'quality',
        targetId: b.id,
        timestamp: 'QC Queue'
      });
    }
  }

  // Check 5: Rejection ratio notice
  const scrapUnits = rejections.filter(r => r.disposition === 'Scrap').reduce((s, r) => s + r.quantity, 0);
  if (scrapUnits > 0) {
    alerts.push({
      id: `alert-scrap-trend`,
      type: 'warning',
      title: `Scrap Alert: ${scrapUnits} Units Disposed`,
      message: `Casting porosity & bearing indentations led to permanent scrap. Supplier RCA investigation open.`,
      module: 'analytics',
      timestamp: 'Analytics'
    });
  }

  return alerts;
}

/**
 * Calculates WIP distribution across all production stages
 */
export function getWipByStage(batches: ProductionBatch[]): { stage: ProductionStage; units: number }[] {
  const map: Record<ProductionStage, number> = {
    'Material Receipt': 0,
    'Motor Assembly': 0,
    'Component Assembly': 0,
    'Electrical Testing': 0,
    'Performance Testing': 0,
    'Final Inspection': 0,
    'Packaging': 0
  };

  for (const b of batches) {
    if (b.status === 'Completed') continue;
    for (const stage of PRODUCTION_STAGES) {
      map[stage] += (b.stageQuantities[stage] || 0);
    }
  }

  return PRODUCTION_STAGES.map(stage => ({
    stage,
    units: map[stage]
  }));
}
