import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  ProductionBatch,
  MaterialItem,
  QualityInspection,
  RejectionRecord,
  StageMovement,
  ProductionStage,
  FactoryAlert,
  PRODUCTION_STAGES
} from '../types';
import {
  INITIAL_BATCHES,
  INITIAL_MATERIALS,
  INITIAL_INSPECTIONS,
  INITIAL_REJECTIONS
} from '../data/initialData';
import {
  calculateOperationsKPIs,
  generateFactoryAlerts,
  OperationsKPIs
} from '../lib/calculations';

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface OperationsContextType {
  batches: ProductionBatch[];
  materials: MaterialItem[];
  inspections: QualityInspection[];
  rejections: RejectionRecord[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedBatchId: string | null;
  setSelectedBatchId: (id: string | null) => void;
  kpis: OperationsKPIs;
  alerts: FactoryAlert[];
  notifications: ToastNotification[];
  dismissNotification: (id: string) => void;
  addNotification: (type: 'success' | 'error' | 'info', title: string, message: string) => void;

  // Batch actions
  createBatch: (batch: Omit<ProductionBatch, 'stageQuantities' | 'movements' | 'wipQuantity' | 'completedQuantity' | 'inspectedQuantity' | 'passedQuantity' | 'failedQuantity' | 'status'>) => boolean;
  recordStageMovement: (batchId: string, fromStage: ProductionStage | 'Start', toStage: ProductionStage, quantity: number, operator: string, notes?: string) => boolean;

  // Material actions
  addMaterial: (material: Omit<MaterialItem, 'history' | 'staged' | 'reserved' | 'status'>) => boolean;
  recordMaterialReceipt: (materialId: string, quantity: number, reference: string, performedBy: string) => boolean;
  reserveMaterialForBatch: (batchId: string, materialId: string, quantity: number, performedBy: string) => boolean;
  stageMaterialForBatch: (batchId: string, materialId: string, quantity: number, performedBy: string) => boolean;
  consumeMaterial: (materialId: string, quantity: number, reference: string, performedBy: string) => boolean;

  // Quality actions
  createInspection: (inspection: Omit<QualityInspection, 'id'>) => boolean;
  updateInspection: (id: string, updates: Partial<QualityInspection>) => boolean;

  // Rejection actions
  createRejection: (rejection: Omit<RejectionRecord, 'id'>) => boolean;
  updateRootCause: (id: string, updates: Partial<RejectionRecord>) => boolean;

  // System
  resetDemoData: () => void;
}

const OperationsContext = createContext<OperationsContextType | undefined>(undefined);

const STORAGE_KEYS = {
  BATCHES: 'fanops_batches_v1',
  MATERIALS: 'fanops_materials_v1',
  INSPECTIONS: 'fanops_inspections_v1',
  REJECTIONS: 'fanops_rejections_v1',
};

export const OperationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage or initial fallback
  const [batches, setBatches] = useState<ProductionBatch[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BATCHES);
      return saved ? JSON.parse(saved) : INITIAL_BATCHES;
    } catch {
      return INITIAL_BATCHES;
    }
  });

  const [materials, setMaterials] = useState<MaterialItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MATERIALS);
      return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
    } catch {
      return INITIAL_MATERIALS;
    }
  });

  const [inspections, setInspections] = useState<QualityInspection[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INSPECTIONS);
      return saved ? JSON.parse(saved) : INITIAL_INSPECTIONS;
    } catch {
      return INITIAL_INSPECTIONS;
    }
  });

  const [rejections, setRejections] = useState<RejectionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REJECTIONS);
      return saved ? JSON.parse(saved) : INITIAL_REJECTIONS;
    } catch {
      return INITIAL_REJECTIONS;
    }
  });

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(batches));
    } catch (e) {
      console.error('Failed to save batches to localStorage', e);
    }
  }, [batches]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
    } catch (e) {
      console.error('Failed to save materials to localStorage', e);
    }
  }, [materials]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(inspections));
    } catch (e) {
      console.error('Failed to save inspections to localStorage', e);
    }
  }, [inspections]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REJECTIONS, JSON.stringify(rejections));
    } catch (e) {
      console.error('Failed to save rejections to localStorage', e);
    }
  }, [rejections]);

  // Derived KPIs and alerts
  const kpis = useMemo(() => {
    return calculateOperationsKPIs(batches, materials, inspections, rejections);
  }, [batches, materials, inspections, rejections]);

  const alerts = useMemo(() => {
    return generateFactoryAlerts(batches, materials, inspections, rejections);
  }, [batches, materials, inspections, rejections]);

  const addNotification = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setNotifications(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      dismissNotification(id);
    }, 4500);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const resetDemoData = () => {
    setBatches(INITIAL_BATCHES);
    setMaterials(INITIAL_MATERIALS);
    setInspections(INITIAL_INSPECTIONS);
    setRejections(INITIAL_REJECTIONS);
    setSelectedBatchId(null);
    localStorage.removeItem(STORAGE_KEYS.BATCHES);
    localStorage.removeItem(STORAGE_KEYS.MATERIALS);
    localStorage.removeItem(STORAGE_KEYS.INSPECTIONS);
    localStorage.removeItem(STORAGE_KEYS.REJECTIONS);
    addNotification('info', 'Demo Data Reset', 'Restored initial synthetic baseline for Luker operations demo.');
  };

  // 1. Create Batch
  const createBatch = (
    batchData: Omit<ProductionBatch, 'stageQuantities' | 'movements' | 'wipQuantity' | 'completedQuantity' | 'inspectedQuantity' | 'passedQuantity' | 'failedQuantity' | 'status'>
  ): boolean => {
    if (batches.some(b => b.id.trim().toUpperCase() === batchData.id.trim().toUpperCase())) {
      addNotification('error', 'Batch Creation Error', `Batch ID ${batchData.id} already exists.`);
      return false;
    }

    const stageQuantities: Record<ProductionStage, number> = {
      'Material Receipt': 0,
      'Motor Assembly': 0,
      'Component Assembly': 0,
      'Electrical Testing': 0,
      'Performance Testing': 0,
      'Final Inspection': 0,
      'Packaging': 0
    };

    const newBatch: ProductionBatch = {
      ...batchData,
      id: batchData.id.trim().toUpperCase(),
      completedQuantity: 0,
      wipQuantity: 0,
      status: 'Scheduled',
      stageQuantities,
      movements: [],
      inspectedQuantity: 0,
      passedQuantity: 0,
      failedQuantity: 0,
    };

    setBatches(prev => [newBatch, ...prev]);
    addNotification('success', 'Batch Created', `Production batch ${newBatch.id} scheduled for ${newBatch.plannedQuantity} units.`);
    return true;
  };

  // 2. Record Stage Movement
  const recordStageMovement = (
    batchId: string,
    fromStage: ProductionStage | 'Start',
    toStage: ProductionStage,
    quantity: number,
    operator: string,
    notes?: string
  ): boolean => {
    if (quantity <= 0) {
      addNotification('error', 'Invalid Quantity', 'Movement quantity must be greater than zero.');
      return false;
    }

    const batch = batches.find(b => b.id === batchId);
    if (!batch) {
      addNotification('error', 'Batch Not Found', `Batch ${batchId} was not found.`);
      return false;
    }

    // Material Readiness Check for entering production from Start / Material Receipt
    if (fromStage === 'Start' || fromStage === 'Material Receipt') {
      const unstaged = batch.materialRequirements?.filter(r => r.staged < r.totalRequired);
      if (unstaged && unstaged.length > 0 && batch.status === 'Blocked') {
        addNotification(
          'error',
          'Production Blocked',
          `Cannot advance batch: ${unstaged.length} required material(s) not fully staged yet. Please stage materials in Module 3 first.`
        );
        return false;
      }
    }

    // Check availability at fromStage
    if (fromStage !== 'Start') {
      const currentAtFrom = batch.stageQuantities[fromStage] || 0;
      if (quantity > currentAtFrom) {
        addNotification(
          'error',
          'Insufficient Units at Stage',
          `Cannot move ${quantity} units from ${fromStage}. Only ${currentAtFrom} units available.`
        );
        return false;
      }
    } else {
      // From Start: check against planned quantity minus already started units
      const startedSoFar = Object.values(batch.stageQuantities).reduce((acc, q) => acc + q, 0) + batch.completedQuantity;
      const remainingToStart = batch.plannedQuantity - startedSoFar;
      if (quantity > remainingToStart) {
        addNotification(
          'error',
          'Exceeds Planned Units',
          `Cannot release ${quantity} units. Only ${remainingToStart} units remaining to start for batch ${batch.id}.`
        );
        return false;
      }
    }

    const newMovement: StageMovement = {
      id: `MOV-${Date.now()}`,
      batchId,
      fromStage,
      toStage,
      quantity,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      operator: operator || 'Shift Lead',
      notes
    };

    setBatches(prev => prev.map(b => {
      if (b.id !== batchId) return b;

      const updatedStages = { ...b.stageQuantities };
      if (fromStage !== 'Start') {
        updatedStages[fromStage] = Math.max(0, (updatedStages[fromStage] || 0) - quantity);
      }
      updatedStages[toStage] = (updatedStages[toStage] || 0) + quantity;

      // Check if moving to Packaging or completing
      let newCompleted = b.completedQuantity;
      let newStatus = b.status;

      if (toStage === 'Packaging') {
        // If units reached packaging and are finalized
        // In this flow, we mark completed if Packaging stage units are wrapped
      }

      // Calculate total active WIP
      const currentWip = Object.values(updatedStages).reduce((acc, q) => acc + q, 0);

      if (newStatus === 'Scheduled' || newStatus === 'Blocked') {
        newStatus = 'In Production';
      }

      return {
        ...b,
        currentStage: toStage,
        wipQuantity: currentWip,
        completedQuantity: newCompleted,
        status: newStatus,
        stageQuantities: updatedStages,
        movements: [newMovement, ...b.movements]
      };
    }));

    addNotification('success', 'Production Movement Recorded', `Moved ${quantity} units of ${batchId} to ${toStage}.`);
    return true;
  };

  // 3. Add Material
  const addMaterial = (
    matData: Omit<MaterialItem, 'history' | 'staged' | 'reserved' | 'status'>
  ): boolean => {
    if (materials.some(m => m.id.toUpperCase() === matData.id.trim().toUpperCase())) {
      addNotification('error', 'Material Exists', `Material ID ${matData.id} already exists.`);
      return false;
    }

    const newMat: MaterialItem = {
      ...matData,
      id: matData.id.trim().toUpperCase(),
      reserved: 0,
      staged: 0,
      status: matData.available < matData.minStockLevel ? 'Low Stock' : 'Optimal',
      history: [
        {
          id: `TXN-${Date.now()}`,
          materialId: matData.id.trim().toUpperCase(),
          type: 'RECEIPT',
          quantity: matData.available,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          reference: 'Initial master stock creation',
          performedBy: 'Store Supervisor'
        }
      ]
    };

    setMaterials(prev => [...prev, newMat]);
    addNotification('success', 'Material Added', `Added ${newMat.name} to central inventory.`);
    return true;
  };

  // 4. Record Material Receipt
  const recordMaterialReceipt = (
    materialId: string,
    quantity: number,
    reference: string,
    performedBy: string
  ): boolean => {
    if (quantity <= 0) {
      addNotification('error', 'Invalid Quantity', 'Receipt quantity must be positive.');
      return false;
    }

    const mat = materials.find(m => m.id === materialId);
    if (!mat) {
      addNotification('error', 'Material Not Found', `Material ${materialId} not found.`);
      return false;
    }

    const newAvailable = mat.available + quantity;
    const newStatus = newAvailable < mat.minStockLevel ? 'Low Stock' : 'Optimal';

    const txn = {
      id: `TXN-${Date.now()}`,
      materialId,
      type: 'RECEIPT' as const,
      quantity,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      reference: reference || 'Store GRN Inbound',
      performedBy: performedBy || 'Store In-Charge'
    };

    setMaterials(prev => prev.map(m => {
      if (m.id !== materialId) return m;
      return {
        ...m,
        available: newAvailable,
        status: newStatus,
        history: [txn, ...m.history]
      };
    }));

    addNotification('success', 'Material Receipt Logged', `Received +${quantity} ${mat.unit} of ${mat.name}. Available: ${newAvailable}.`);
    return true;
  };

  // 5. Reserve Material for Batch
  const reserveMaterialForBatch = (
    batchId: string,
    materialId: string,
    quantity: number,
    performedBy: string
  ): boolean => {
    if (quantity <= 0) {
      addNotification('error', 'Invalid Quantity', 'Reservation quantity must be positive.');
      return false;
    }

    const mat = materials.find(m => m.id === materialId);
    if (!mat) {
      addNotification('error', 'Material Not Found', `Material ${materialId} not found.`);
      return false;
    }

    if (quantity > mat.available) {
      addNotification(
        'error',
        'Insufficient Available Stock',
        `Cannot reserve ${quantity} ${mat.unit}. Only ${mat.available} ${mat.unit} available in store.`
      );
      return false;
    }

    const txn = {
      id: `TXN-${Date.now()}`,
      materialId,
      batchId,
      type: 'RESERVE' as const,
      quantity,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      reference: `Reserved for Batch ${batchId}`,
      performedBy: performedBy || 'Production Planner'
    };

    // Deduct from available, add to reserved
    setMaterials(prev => prev.map(m => {
      if (m.id !== materialId) return m;
      return {
        ...m,
        available: m.available - quantity,
        reserved: m.reserved + quantity,
        history: [txn, ...m.history]
      };
    }));

    // Update batch requirement
    setBatches(prev => prev.map(b => {
      if (b.id !== batchId) return b;
      const updatedReqs = b.materialRequirements.map(req => {
        if (req.materialId !== materialId) return req;
        const newReserved = req.reserved + quantity;
        return {
          ...req,
          reserved: newReserved,
        };
      });
      return {
        ...b,
        materialRequirements: updatedReqs
      };
    }));

    addNotification('success', 'Materials Reserved', `Reserved ${quantity} ${mat.unit} of ${mat.name} for ${batchId}.`);
    return true;
  };

  // 6. Stage Material for Batch (Move from Reserved to Staged on shop floor)
  const stageMaterialForBatch = (
    batchId: string,
    materialId: string,
    quantity: number,
    performedBy: string
  ): boolean => {
    if (quantity <= 0) {
      addNotification('error', 'Invalid Quantity', 'Staging quantity must be positive.');
      return false;
    }

    const mat = materials.find(m => m.id === materialId);
    if (!mat) {
      addNotification('error', 'Material Not Found', `Material ${materialId} not found.`);
      return false;
    }

    const batch = batches.find(b => b.id === batchId);
    if (!batch) {
      addNotification('error', 'Batch Not Found', `Batch ${batchId} not found.`);
      return false;
    }

    const req = batch.materialRequirements?.find(r => r.materialId === materialId);
    if (!req) {
      addNotification('error', 'Requirement Error', `Material ${materialId} is not in requirement list for ${batchId}.`);
      return false;
    }

    const availableToStage = req.reserved - req.staged;
    if (quantity > availableToStage) {
      addNotification(
        'error',
        'Staging Exceeds Reservation',
        `Cannot stage ${quantity} ${mat.unit}. Only ${availableToStage} ${mat.unit} currently reserved for this batch.`
      );
      return false;
    }

    const txn = {
      id: `TXN-${Date.now()}`,
      materialId,
      batchId,
      type: 'STAGE' as const,
      quantity,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      reference: `Transferred to Shop Floor for ${batchId}`,
      performedBy: performedBy || 'Shop Floor Material Handler'
    };

    // Update Materials inventory: move from reserved to staged
    setMaterials(prev => prev.map(m => {
      if (m.id !== materialId) return m;
      return {
        ...m,
        reserved: Math.max(0, m.reserved - quantity),
        staged: m.staged + quantity,
        history: [txn, ...m.history]
      };
    }));

    // Update Batch Requirements and unlock batch if all requirements are staged
    setBatches(prev => prev.map(b => {
      if (b.id !== batchId) return b;

      const updatedReqs = b.materialRequirements.map(r => {
        if (r.materialId !== materialId) return r;
        const newStaged = r.staged + quantity;
        const isFullyStaged = newStaged >= r.totalRequired;
        return {
          ...r,
          staged: newStaged,
          status: isFullyStaged ? ('Fully Staged' as const) : ('Partially Staged' as const)
        };
      });

      // Check if ALL requirements are now fully staged
      const allFullyStaged = updatedReqs.every(r => r.staged >= r.totalRequired);
      let newStatus = b.status;
      if (allFullyStaged && b.status === 'Blocked') {
        newStatus = 'Scheduled'; // unblocked!
      }

      return {
        ...b,
        materialRequirements: updatedReqs,
        status: newStatus
      };
    }));

    addNotification('success', 'Materials Staged', `Staged ${quantity} ${mat.unit} of ${mat.name} to shop floor for ${batchId}.`);
    return true;
  };

  // 7. Consume Material
  const consumeMaterial = (
    materialId: string,
    quantity: number,
    reference: string,
    performedBy: string
  ): boolean => {
    const mat = materials.find(m => m.id === materialId);
    if (!mat) return false;

    if (quantity > mat.staged) {
      addNotification('error', 'Insufficient Staged Stock', `Cannot consume ${quantity} ${mat.unit}. Only ${mat.staged} staged.`);
      return false;
    }

    const txn = {
      id: `TXN-${Date.now()}`,
      materialId,
      type: 'CONSUME' as const,
      quantity,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      reference: reference || 'Production Assembly Consumption',
      performedBy: performedBy || 'Assembly Technician'
    };

    setMaterials(prev => prev.map(m => {
      if (m.id !== materialId) return m;
      return {
        ...m,
        staged: m.staged - quantity,
        history: [txn, ...m.history]
      };
    }));

    addNotification('info', 'Material Consumed', `Consumed ${quantity} ${mat.unit} for assembly.`);
    return true;
  };

  // 8. Quality Inspection Creation
  const createInspection = (
    inspectionData: Omit<QualityInspection, 'id'>
  ): boolean => {
    // Validation: Passed + Failed must equal Units Inspected
    if (inspectionData.passed + inspectionData.failed !== inspectionData.unitsInspected) {
      addNotification(
        'error',
        'QC Validation Error',
        `Passed (${inspectionData.passed}) + Failed (${inspectionData.failed}) must equal Units Inspected (${inspectionData.unitsInspected}).`
      );
      return false;
    }

    const batch = batches.find(b => b.id === inspectionData.batchId);
    if (!batch) {
      addNotification('error', 'Batch Not Found', `Batch ${inspectionData.batchId} not found.`);
      return false;
    }

    // Inspection quantities cannot exceed eligible uninspected batch quantity
    const remainingUninspected = batch.plannedQuantity - batch.inspectedQuantity;
    if (inspectionData.unitsInspected > remainingUninspected) {
      addNotification(
        'error',
        'Exceeds Eligible Units',
        `Cannot inspect ${inspectionData.unitsInspected} units. Only ${remainingUninspected} uninspected units remain for ${batch.id}.`
      );
      return false;
    }

    const newId = `INS-${1000 + inspections.length + 1}`;
    const newInspection: QualityInspection = {
      ...inspectionData,
      id: newId
    };

    setInspections(prev => [newInspection, ...prev]);

    // Update batch inspection totals and auto-route to Rejections if failed > 0
    setBatches(prev => prev.map(b => {
      if (b.id !== inspectionData.batchId) return b;
      const newInspected = b.inspectedQuantity + inspectionData.unitsInspected;
      const newPassed = b.passedQuantity + inspectionData.passed;
      const newFailed = b.failedQuantity + inspectionData.failed;

      let newStatus = b.status;
      if (newInspected >= b.plannedQuantity) {
        newStatus = 'In Production';
      }

      return {
        ...b,
        inspectedQuantity: newInspected,
        passedQuantity: newPassed,
        failedQuantity: newFailed,
        status: newStatus
      };
    }));

    // If failed units exist, auto-create initial rejection entry for tracking
    if (inspectionData.failed > 0) {
      const rework = inspectionData.reworkCount > 0 ? inspectionData.reworkCount : Math.ceil(inspectionData.failed * 0.7);
      const scrap = inspectionData.scrapCount > 0 ? inspectionData.scrapCount : (inspectionData.failed - rework);

      if (rework > 0) {
        setRejections(prev => [
          {
            id: `REJ-${500 + prev.length + 1}`,
            batchId: inspectionData.batchId,
            fanModel: inspectionData.fanModel,
            date: inspectionData.inspectionDate,
            productionStage: 'Performance Testing',
            defectCategory: inspectionData.defectCategory !== 'None' ? inspectionData.defectCategory : 'Motor noise',
            quantity: rework,
            disposition: 'Rework',
            suspectedRootCause: inspectionData.notes || 'Identified during quality inspection station check',
            responsibleTeam: 'Assembly Cell',
            investigationStatus: 'Under Investigation',
            isVerified: false
          },
          ...prev
        ]);
      }

      if (scrap > 0) {
        setRejections(prev => [
          {
            id: `REJ-${500 + prev.length + 1}`,
            batchId: inspectionData.batchId,
            fanModel: inspectionData.fanModel,
            date: inspectionData.inspectionDate,
            productionStage: 'Final Inspection',
            defectCategory: inspectionData.defectCategory !== 'None' ? inspectionData.defectCategory : 'Electrical failure',
            quantity: scrap,
            disposition: 'Scrap',
            suspectedRootCause: 'Component internal defect exceeding allowable rework limits',
            responsibleTeam: 'QA & Receiving',
            investigationStatus: 'Suspected',
            isVerified: false
          },
          ...prev
        ]);
      }
    }

    addNotification(
      'success',
      'Inspection Recorded',
      `Logged QC record ${newId}: ${inspectionData.passed} passed, ${inspectionData.failed} failed (${inspectionData.defectCategory}).`
    );
    return true;
  };

  const updateInspection = (id: string, updates: Partial<QualityInspection>): boolean => {
    setInspections(prev => prev.map(ins => {
      if (ins.id !== id) return ins;
      return { ...ins, ...updates };
    }));
    addNotification('success', 'QC Record Updated', `Updated inspection ${id}.`);
    return true;
  };

  // 9. Rejection & Root Cause
  const createRejection = (rejectionData: Omit<RejectionRecord, 'id'>): boolean => {
    const newId = `REJ-${500 + rejections.length + 1}`;
    const record: RejectionRecord = {
      ...rejectionData,
      id: newId
    };

    setRejections(prev => [record, ...prev]);
    addNotification('success', 'Rejection Logged', `Logged ${record.quantity} units for ${record.disposition} (${record.defectCategory}).`);
    return true;
  };

  const updateRootCause = (id: string, updates: Partial<RejectionRecord>): boolean => {
    setRejections(prev => prev.map(r => {
      if (r.id !== id) return r;
      const isVerified = updates.verifiedRootCause ? true : (updates.isVerified ?? r.isVerified);
      return {
        ...r,
        ...updates,
        isVerified
      };
    }));
    addNotification('success', 'Root Cause Updated', `Investigation record ${id} updated.`);
    return true;
  };

  return (
    <OperationsContext.Provider
      value={{
        batches,
        materials,
        inspections,
        rejections,
        activeTab,
        setActiveTab,
        selectedBatchId,
        setSelectedBatchId,
        kpis,
        alerts,
        notifications,
        dismissNotification,
        addNotification,
        createBatch,
        recordStageMovement,
        addMaterial,
        recordMaterialReceipt,
        reserveMaterialForBatch,
        stageMaterialForBatch,
        consumeMaterial,
        createInspection,
        updateInspection,
        createRejection,
        updateRootCause,
        resetDemoData
      }}
    >
      {children}
    </OperationsContext.Provider>
  );
};

export function useOperations() {
  const context = useContext(OperationsContext);
  if (!context) {
    throw new Error('useOperations must be used within an OperationsProvider');
  }
  return context;
}
