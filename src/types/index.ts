export type ProductionStage =
  | 'Material Receipt'
  | 'Motor Assembly'
  | 'Component Assembly'
  | 'Electrical Testing'
  | 'Performance Testing'
  | 'Final Inspection'
  | 'Packaging';

export const PRODUCTION_STAGES: ProductionStage[] = [
  'Material Receipt',
  'Motor Assembly',
  'Component Assembly',
  'Electrical Testing',
  'Performance Testing',
  'Final Inspection',
  'Packaging',
];

export type BatchStatus =
  | 'Scheduled'
  | 'In Production'
  | 'Blocked'
  | 'QC Pending'
  | 'Completed'
  | 'Delayed';

export interface StageMovement {
  id: string;
  batchId: string;
  fromStage: ProductionStage | 'Start';
  toStage: ProductionStage;
  quantity: number;
  timestamp: string;
  operator: string;
  notes?: string;
}

export interface BatchMaterialRequirement {
  materialId: string;
  materialName: string;
  requiredPerUnit: number;
  totalRequired: number;
  reserved: number;
  staged: number;
  unit: string;
  status: 'Not Ready' | 'Partially Staged' | 'Fully Staged';
}

export interface ProductionBatch {
  id: string;
  fanModel: string;
  plannedQuantity: number;
  completedQuantity: number;
  currentStage: ProductionStage;
  wipQuantity: number;
  startDate: string;
  targetDate: string;
  status: BatchStatus;
  stageQuantities: Record<ProductionStage, number>; // current units active at that stage
  movements: StageMovement[];
  materialRequirements: BatchMaterialRequirement[];
  inspectedQuantity: number;
  passedQuantity: number;
  failedQuantity: number;
  stageEnteredAt?: Record<ProductionStage, string>;
  notes?: string;
}

export type DefectCategory =
  | 'Electrical failure'
  | 'Motor noise'
  | 'Vibration'
  | 'Blade imbalance'
  | 'Physical damage'
  | 'Cosmetic defect'
  | 'Assembly defect'
  | 'Other';

export const DEFECT_CATEGORIES: DefectCategory[] = [
  'Electrical failure',
  'Motor noise',
  'Vibration',
  'Blade imbalance',
  'Physical damage',
  'Cosmetic defect',
  'Assembly defect',
  'Other',
];

export interface QualityMeasurement {
  rpm?: number;
  voltage?: number;
  current?: number;
  power?: number;
  noiseDb?: number;
  vibrationMmS?: number;
  visualDefectCount?: number;
  isIllustrativeOnly: true;
}

export interface QualityInspection {
  id: string;
  batchId: string;
  fanModel: string;
  inspectionDate: string;
  unitsInspected: number;
  passed: number;
  failed: number;
  defectCategory: DefectCategory | 'None';
  inspector: string;
  status: 'Passed' | 'Failed' | 'Conditional';
  notes?: string;
  measurements: QualityMeasurement;
  reworkCount: number;
  scrapCount: number;
}

export type MaterialCategory =
  | 'Electrical'
  | 'Motor Parts'
  | 'Hardware'
  | 'Aesthetics & Blades'
  | 'Packaging';

export interface MaterialTransaction {
  id: string;
  materialId: string;
  batchId?: string;
  type: 'RECEIPT' | 'RESERVE' | 'STAGE' | 'CONSUME' | 'UNRESERVE';
  quantity: number;
  timestamp: string;
  reference: string;
  performedBy: string;
}

export interface MaterialItem {
  id: string;
  name: string;
  category: MaterialCategory;
  available: number; // free unreserved stock in store
  reserved: number;  // allocated to planned/in-progress batches
  staged: number;    // physically delivered to assembly shop floor
  unit: string;
  minStockLevel: number;
  status: 'Optimal' | 'Low Stock' | 'Critical Shortage';
  history: MaterialTransaction[];
}

export type DispositionType = 'Rework' | 'Scrap';

export type RootCauseStatus =
  | 'Under Investigation'
  | 'Suspected'
  | 'Verified'
  | 'Closed';

export interface RejectionRecord {
  id: string;
  batchId: string;
  fanModel: string;
  date: string;
  productionStage: ProductionStage;
  defectCategory: DefectCategory;
  quantity: number;
  disposition: DispositionType;
  suspectedRootCause: string;
  verifiedRootCause?: string;
  correctiveAction?: string;
  responsibleTeam: string;
  investigationStatus: RootCauseStatus;
  isVerified: boolean;
}

export interface FactoryAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  module: 'production' | 'quality' | 'materials' | 'analytics';
  targetId?: string;
  timestamp: string;
}
