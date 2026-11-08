import {
  ProductionBatch,
  MaterialItem,
  QualityInspection,
  RejectionRecord,
  PRODUCTION_STAGES
} from '../types';

export const FAN_MODELS = [
  'Luker BLDC Demo Model',
  'Luker Panther BLDC 1200mm',
  'Luker Turbine High-Speed 1200mm',
  'Luker Radial Eco BLDC',
  'Luker AeroPlus Deco 1200mm',
];

export const INITIAL_MATERIALS: MaterialItem[] = [
  {
    id: 'MAT-CAP-01',
    name: '4.0 uF BLDC Metallized Film Capacitor',
    category: 'Electrical',
    available: 400, // shortage of 100 for batch FAN-2026-001 (requires 500)
    reserved: 400,
    staged: 0,
    unit: 'pcs',
    minStockLevel: 500,
    status: 'Critical Shortage',
    history: [
      {
        id: 'TXN-001',
        materialId: 'MAT-CAP-01',
        type: 'RECEIPT',
        quantity: 400,
        timestamp: '2026-10-25 09:30',
        reference: 'GRN-4491 from Luker Supplier',
        performedBy: 'Store Supervisor (Kochi Plant)'
      },
      {
        id: 'TXN-002',
        materialId: 'MAT-CAP-01',
        batchId: 'FAN-2026-001',
        type: 'RESERVE',
        quantity: 400,
        timestamp: '2026-11-01 10:15',
        reference: 'Allocated to Batch FAN-2026-001 (Shortfall: 100 pcs)',
        performedBy: 'System Auto-Reserve'
      }
    ]
  },
  {
    id: 'MAT-MOT-01',
    name: 'BLDC High-Torque Stator & Rotor Core Set',
    category: 'Motor Parts',
    available: 750,
    reserved: 500,
    staged: 0,
    unit: 'sets',
    minStockLevel: 300,
    status: 'Optimal',
    history: [
      {
        id: 'TXN-003',
        materialId: 'MAT-MOT-01',
        type: 'RECEIPT',
        quantity: 1250,
        timestamp: '2026-10-26 11:00',
        reference: 'GRN-4498 Luker Winding Facility',
        performedBy: 'Store Supervisor'
      },
      {
        id: 'TXN-004',
        materialId: 'MAT-MOT-01',
        batchId: 'FAN-2026-001',
        type: 'RESERVE',
        quantity: 500,
        timestamp: '2026-11-01 10:15',
        reference: 'Allocated to Batch FAN-2026-001',
        performedBy: 'System Auto-Reserve'
      }
    ]
  },
  {
    id: 'MAT-BLD-01',
    name: 'Aerodynamic Ribbed Aluminum Blades (Set of 3)',
    category: 'Aesthetics & Blades',
    available: 850,
    reserved: 500,
    staged: 0,
    unit: 'sets',
    minStockLevel: 400,
    status: 'Optimal',
    history: [
      {
        id: 'TXN-005',
        materialId: 'MAT-BLD-01',
        type: 'RECEIPT',
        quantity: 1350,
        timestamp: '2026-10-27 14:20',
        reference: 'GRN-4510 Press & Powder Coat Shop',
        performedBy: 'Store Supervisor'
      },
      {
        id: 'TXN-006',
        materialId: 'MAT-BLD-01',
        batchId: 'FAN-2026-001',
        type: 'RESERVE',
        quantity: 500,
        timestamp: '2026-11-01 10:15',
        reference: 'Allocated to Batch FAN-2026-001',
        performedBy: 'System Auto-Reserve'
      }
    ]
  },
  {
    id: 'MAT-HSG-01',
    name: 'Die-Cast Aluminum Top & Bottom Motor Housing',
    category: 'Motor Parts',
    available: 620,
    reserved: 500,
    staged: 0,
    unit: 'sets',
    minStockLevel: 250,
    status: 'Optimal',
    history: [
      {
        id: 'TXN-007',
        materialId: 'MAT-HSG-01',
        type: 'RECEIPT',
        quantity: 1120,
        timestamp: '2026-10-28 08:45',
        reference: 'GRN-4522 Casting Division',
        performedBy: 'Store Supervisor'
      },
      {
        id: 'TXN-008',
        materialId: 'MAT-HSG-01',
        batchId: 'FAN-2026-001',
        type: 'RESERVE',
        quantity: 500,
        timestamp: '2026-11-01 10:15',
        reference: 'Allocated to Batch FAN-2026-001',
        performedBy: 'System Auto-Reserve'
      }
    ]
  },
  {
    id: 'MAT-BRG-01',
    name: 'Precision Double Ball Bearing 6202-ZZ',
    category: 'Hardware',
    available: 1400,
    reserved: 1000,
    staged: 0,
    unit: 'pcs',
    minStockLevel: 800,
    status: 'Optimal',
    history: [
      {
        id: 'TXN-009',
        materialId: 'MAT-BRG-01',
        type: 'RECEIPT',
        quantity: 2400,
        timestamp: '2026-10-29 16:00',
        reference: 'GRN-4530 Bearing Consignment',
        performedBy: 'Store Supervisor'
      },
      {
        id: 'TXN-010',
        materialId: 'MAT-BRG-01',
        batchId: 'FAN-2026-001',
        type: 'RESERVE',
        quantity: 1000,
        timestamp: '2026-11-01 10:15',
        reference: 'Allocated to Batch FAN-2026-001 (2 per fan)',
        performedBy: 'System Auto-Reserve'
      }
    ]
  },
  {
    id: 'MAT-COP-01',
    name: 'Super Enameled Copper Wire Grade 2 (0.35mm)',
    category: 'Electrical',
    available: 320,
    reserved: 120,
    staged: 80,
    unit: 'kg',
    minStockLevel: 150,
    status: 'Optimal',
    history: [
      {
        id: 'TXN-011',
        materialId: 'MAT-COP-01',
        type: 'RECEIPT',
        quantity: 400,
        timestamp: '2026-10-30 10:00',
        reference: 'GRN-4541 Copper Spool Batch',
        performedBy: 'Store Supervisor'
      }
    ]
  },
  {
    id: 'MAT-SCW-01',
    name: 'High-Tensile Zinc Plated Assembly Fasteners M4x12',
    category: 'Hardware',
    available: 9500,
    reserved: 3000,
    staged: 1500,
    unit: 'pcs',
    minStockLevel: 4000,
    status: 'Optimal',
    history: []
  },
  {
    id: 'MAT-PKG-01',
    name: 'Luker Eco 5-Ply Master Carton & EPS Cushioning',
    category: 'Packaging',
    available: 720,
    reserved: 500,
    staged: 0,
    unit: 'sets',
    minStockLevel: 300,
    status: 'Optimal',
    history: [
      {
        id: 'TXN-012',
        materialId: 'MAT-PKG-01',
        type: 'RECEIPT',
        quantity: 1220,
        timestamp: '2026-10-31 15:30',
        reference: 'GRN-4552 Corrugation Unit',
        performedBy: 'Store Supervisor'
      },
      {
        id: 'TXN-013',
        materialId: 'MAT-PKG-01',
        batchId: 'FAN-2026-001',
        type: 'RESERVE',
        quantity: 500,
        timestamp: '2026-11-01 10:15',
        reference: 'Allocated to Batch FAN-2026-001',
        performedBy: 'System Auto-Reserve'
      }
    ]
  }
];

export const INITIAL_BATCHES: ProductionBatch[] = [
  {
    id: 'FAN-2026-001',
    fanModel: 'Luker BLDC Demo Model',
    plannedQuantity: 500,
    completedQuantity: 0,
    currentStage: 'Material Receipt',
    wipQuantity: 0,
    startDate: '2026-11-01',
    targetDate: '2026-11-15',
    status: 'Blocked', // blocked due to 100 capacitor shortage
    stageQuantities: {
      'Material Receipt': 0,
      'Motor Assembly': 0,
      'Component Assembly': 0,
      'Electrical Testing': 0,
      'Performance Testing': 0,
      'Final Inspection': 0,
      'Packaging': 0
    },
    movements: [],
    materialRequirements: [
      {
        materialId: 'MAT-CAP-01',
        materialName: '4.0 uF BLDC Metallized Film Capacitor',
        requiredPerUnit: 1,
        totalRequired: 500,
        reserved: 400,
        staged: 0,
        unit: 'pcs',
        status: 'Not Ready' // Shortage of 100!
      },
      {
        materialId: 'MAT-MOT-01',
        materialName: 'BLDC High-Torque Stator & Rotor Core Set',
        requiredPerUnit: 1,
        totalRequired: 500,
        reserved: 500,
        staged: 0,
        unit: 'sets',
        status: 'Not Ready'
      },
      {
        materialId: 'MAT-BLD-01',
        materialName: 'Aerodynamic Ribbed Aluminum Blades (Set of 3)',
        requiredPerUnit: 1,
        totalRequired: 500,
        reserved: 500,
        staged: 0,
        unit: 'sets',
        status: 'Not Ready'
      },
      {
        materialId: 'MAT-HSG-01',
        materialName: 'Die-Cast Aluminum Top & Bottom Motor Housing',
        requiredPerUnit: 1,
        totalRequired: 500,
        reserved: 500,
        staged: 0,
        unit: 'sets',
        status: 'Not Ready'
      },
      {
        materialId: 'MAT-BRG-01',
        materialName: 'Precision Double Ball Bearing 6202-ZZ',
        requiredPerUnit: 2,
        totalRequired: 1000,
        reserved: 1000,
        staged: 0,
        unit: 'pcs',
        status: 'Not Ready'
      },
      {
        materialId: 'MAT-PKG-01',
        materialName: 'Luker Eco 5-Ply Master Carton & EPS Cushioning',
        requiredPerUnit: 1,
        totalRequired: 500,
        reserved: 500,
        staged: 0,
        unit: 'sets',
        status: 'Not Ready'
      }
    ],
    inspectedQuantity: 0,
    passedQuantity: 0,
    failedQuantity: 0,
    notes: 'Primary interactive demo batch for internship walkthrough: Material shortage blocks production until staging completed.'
  },
  {
    id: 'FAN-2026-002',
    fanModel: 'Luker Panther BLDC 1200mm',
    plannedQuantity: 350,
    completedQuantity: 0,
    currentStage: 'Electrical Testing',
    wipQuantity: 350,
    startDate: '2026-10-28',
    targetDate: '2026-11-10',
    status: 'In Production',
    stageQuantities: {
      'Material Receipt': 0,
      'Motor Assembly': 0,
      'Component Assembly': 70,
      'Electrical Testing': 210,
      'Performance Testing': 70,
      'Final Inspection': 0,
      'Packaging': 0
    },
    movements: [
      {
        id: 'MOV-101',
        batchId: 'FAN-2026-002',
        fromStage: 'Start',
        toStage: 'Material Receipt',
        quantity: 350,
        timestamp: '2026-10-28 08:30',
        operator: 'R. Nair',
        notes: 'Initial lot release after kitting'
      },
      {
        id: 'MOV-102',
        batchId: 'FAN-2026-002',
        fromStage: 'Material Receipt',
        toStage: 'Motor Assembly',
        quantity: 350,
        timestamp: '2026-10-29 09:15',
        operator: 'V. Sharma',
        notes: 'Stator insertion & bearing press'
      },
      {
        id: 'MOV-103',
        batchId: 'FAN-2026-002',
        fromStage: 'Motor Assembly',
        toStage: 'Component Assembly',
        quantity: 350,
        timestamp: '2026-10-31 11:00',
        operator: 'K. Pillai'
      },
      {
        id: 'MOV-104',
        batchId: 'FAN-2026-002',
        fromStage: 'Component Assembly',
        toStage: 'Electrical Testing',
        quantity: 280,
        timestamp: '2026-11-03 14:00',
        operator: 'M. George',
        notes: 'PCB connection & insulation flash check'
      },
      {
        id: 'MOV-105',
        batchId: 'FAN-2026-002',
        fromStage: 'Electrical Testing',
        toStage: 'Performance Testing',
        quantity: 70,
        timestamp: '2026-11-05 16:30',
        operator: 'A. Thomas',
        notes: 'First 70 tested passed to airflow tunnel'
      }
    ],
    materialRequirements: [
      {
        materialId: 'MAT-CAP-01',
        materialName: '4.0 uF BLDC Metallized Film Capacitor',
        requiredPerUnit: 1,
        totalRequired: 350,
        reserved: 350,
        staged: 350,
        unit: 'pcs',
        status: 'Fully Staged'
      }
    ],
    inspectedQuantity: 120,
    passedQuantity: 114,
    failedQuantity: 6,
    notes: 'Smooth progression in line 2. 6 units routed for minor rework.'
  },
  {
    id: 'FAN-2026-003',
    fanModel: 'Luker Turbine High-Speed 1200mm',
    plannedQuantity: 400,
    completedQuantity: 0,
    currentStage: 'Motor Assembly',
    wipQuantity: 400,
    startDate: '2026-10-20',
    targetDate: '2026-11-03', // Past target date -> Delayed!
    status: 'Delayed',
    stageQuantities: {
      'Material Receipt': 0,
      'Motor Assembly': 400, // Bottleneck: stuck > 72h
      'Component Assembly': 0,
      'Electrical Testing': 0,
      'Performance Testing': 0,
      'Final Inspection': 0,
      'Packaging': 0
    },
    movements: [
      {
        id: 'MOV-201',
        batchId: 'FAN-2026-003',
        fromStage: 'Start',
        toStage: 'Material Receipt',
        quantity: 400,
        timestamp: '2026-10-20 09:00',
        operator: 'R. Nair'
      },
      {
        id: 'MOV-202',
        batchId: 'FAN-2026-003',
        fromStage: 'Material Receipt',
        toStage: 'Motor Assembly',
        quantity: 400,
        timestamp: '2026-10-22 10:30',
        operator: 'V. Sharma',
        notes: 'Shaft alignment tooling calibration delay noted'
      }
    ],
    materialRequirements: [],
    inspectedQuantity: 40,
    passedQuantity: 34,
    failedQuantity: 6,
    notes: 'Exceeded target completion date. Tooling alignment bottleneck at station 3.'
  },
  {
    id: 'FAN-2026-004',
    fanModel: 'Luker Radial Eco BLDC',
    plannedQuantity: 250,
    completedQuantity: 250,
    currentStage: 'Packaging',
    wipQuantity: 0,
    startDate: '2026-10-15',
    targetDate: '2026-10-27',
    status: 'Completed',
    stageQuantities: {
      'Material Receipt': 0,
      'Motor Assembly': 0,
      'Component Assembly': 0,
      'Electrical Testing': 0,
      'Performance Testing': 0,
      'Final Inspection': 0,
      'Packaging': 0
    },
    movements: [
      {
        id: 'MOV-301',
        batchId: 'FAN-2026-004',
        fromStage: 'Start',
        toStage: 'Material Receipt',
        quantity: 250,
        timestamp: '2026-10-15 08:00',
        operator: 'R. Nair'
      },
      {
        id: 'MOV-302',
        batchId: 'FAN-2026-004',
        fromStage: 'Final Inspection',
        toStage: 'Packaging',
        quantity: 250,
        timestamp: '2026-10-26 14:00',
        operator: 'P. Menon'
      }
    ],
    materialRequirements: [],
    inspectedQuantity: 250,
    passedQuantity: 246,
    failedQuantity: 4,
    notes: 'Shipped to central regional warehouse on schedule.'
  },
  {
    id: 'FAN-2026-005',
    fanModel: 'Luker AeroPlus Deco 1200mm',
    plannedQuantity: 300,
    completedQuantity: 0,
    currentStage: 'Component Assembly',
    wipQuantity: 300,
    startDate: '2026-11-04',
    targetDate: '2026-11-18',
    status: 'In Production',
    stageQuantities: {
      'Material Receipt': 0,
      'Motor Assembly': 60,
      'Component Assembly': 240,
      'Electrical Testing': 0,
      'Performance Testing': 0,
      'Final Inspection': 0,
      'Packaging': 0
    },
    movements: [
      {
        id: 'MOV-401',
        batchId: 'FAN-2026-005',
        fromStage: 'Start',
        toStage: 'Material Receipt',
        quantity: 300,
        timestamp: '2026-11-04 09:00',
        operator: 'R. Nair'
      },
      {
        id: 'MOV-402',
        batchId: 'FAN-2026-005',
        fromStage: 'Material Receipt',
        toStage: 'Motor Assembly',
        quantity: 300,
        timestamp: '2026-11-05 10:15',
        operator: 'V. Sharma'
      },
      {
        id: 'MOV-403',
        batchId: 'FAN-2026-005',
        fromStage: 'Motor Assembly',
        toStage: 'Component Assembly',
        quantity: 240,
        timestamp: '2026-11-07 15:45',
        operator: 'K. Pillai'
      }
    ],
    materialRequirements: [],
    inspectedQuantity: 80,
    passedQuantity: 77,
    failedQuantity: 3,
    notes: 'Premium gold trim model line. Staging completed 100% on Day 1.'
  }
];

export const INITIAL_INSPECTIONS: QualityInspection[] = [
  {
    id: 'INS-1001',
    batchId: 'FAN-2026-002',
    fanModel: 'Luker Panther BLDC 1200mm',
    inspectionDate: '2026-11-04',
    unitsInspected: 70,
    passed: 66,
    failed: 4,
    defectCategory: 'Motor noise',
    inspector: 'Rajesh K. (Senior QC)',
    status: 'Conditional',
    reworkCount: 3,
    scrapCount: 1,
    notes: 'Subtle bearing hum at 380 RPM test point. 3 units routed to arbor press realignment, 1 bearing scrapped.',
    measurements: {
      rpm: 382,
      voltage: 230,
      current: 0.14,
      power: 32,
      noiseDb: 44.5,
      vibrationMmS: 1.8,
      visualDefectCount: 0,
      isIllustrativeOnly: true
    }
  },
  {
    id: 'INS-1002',
    batchId: 'FAN-2026-002',
    fanModel: 'Luker Panther BLDC 1200mm',
    inspectionDate: '2026-11-05',
    unitsInspected: 50,
    passed: 48,
    failed: 2,
    defectCategory: 'Electrical failure',
    inspector: 'Sunitha M. (Electrical QA)',
    status: 'Passed',
    reworkCount: 2,
    scrapCount: 0,
    notes: 'High-pot insulation test 1.5kV passed. 2 units had loose neutral terminal crimps (reworked on spot).',
    measurements: {
      rpm: 380,
      voltage: 228,
      current: 0.13,
      power: 30,
      noiseDb: 41.2,
      vibrationMmS: 1.2,
      visualDefectCount: 0,
      isIllustrativeOnly: true
    }
  },
  {
    id: 'INS-1003',
    batchId: 'FAN-2026-003',
    fanModel: 'Luker Turbine High-Speed 1200mm',
    inspectionDate: '2026-10-24',
    unitsInspected: 40,
    passed: 34,
    failed: 6,
    defectCategory: 'Vibration',
    inspector: 'Rajesh K. (Senior QC)',
    status: 'Failed',
    reworkCount: 4,
    scrapCount: 2,
    notes: 'Vibration reading exceeded 2.5 mm/s on test bench 2 due to arbor misalignment.',
    measurements: {
      rpm: 395,
      voltage: 232,
      current: 0.22,
      power: 48,
      noiseDb: 48.0,
      vibrationMmS: 2.8,
      visualDefectCount: 1,
      isIllustrativeOnly: true
    }
  },
  {
    id: 'INS-1004',
    batchId: 'FAN-2026-004',
    fanModel: 'Luker Radial Eco BLDC',
    inspectionDate: '2026-10-25',
    unitsInspected: 250,
    passed: 246,
    failed: 4,
    defectCategory: 'Cosmetic defect',
    inspector: 'Sunitha M. (Electrical QA)',
    status: 'Passed',
    reworkCount: 4,
    scrapCount: 0,
    notes: 'Batch audit completed before master packaging. 4 canopy scuffs buffed and cleared.',
    measurements: {
      rpm: 375,
      voltage: 230,
      current: 0.12,
      power: 28,
      noiseDb: 39.8,
      vibrationMmS: 1.1,
      visualDefectCount: 4,
      isIllustrativeOnly: true
    }
  },
  {
    id: 'INS-1005',
    batchId: 'FAN-2026-005',
    fanModel: 'Luker AeroPlus Deco 1200mm',
    inspectionDate: '2026-11-06',
    unitsInspected: 80,
    passed: 77,
    failed: 3,
    defectCategory: 'Blade imbalance',
    inspector: 'Anand Babu (QA Lead)',
    status: 'Conditional',
    reworkCount: 3,
    scrapCount: 0,
    notes: 'Dynamic balancing clip calibration required on 3 blade sets.',
    measurements: {
      rpm: 360,
      voltage: 230,
      current: 0.15,
      power: 34,
      noiseDb: 42.1,
      vibrationMmS: 2.1,
      visualDefectCount: 0,
      isIllustrativeOnly: true
    }
  }
];

export const INITIAL_REJECTIONS: RejectionRecord[] = [
  {
    id: 'REJ-501',
    batchId: 'FAN-2026-002',
    fanModel: 'Luker Panther BLDC 1200mm',
    date: '2026-11-04',
    productionStage: 'Performance Testing',
    defectCategory: 'Motor noise',
    quantity: 3,
    disposition: 'Rework',
    suspectedRootCause: 'Axial clearance tolerance stack-up during bearing seat press',
    verifiedRootCause: 'Upper bearing seat press pressure exceeded nominal 2.2 bar setting',
    correctiveAction: 'Calibrated pneumatic press cylinder valve and updated standard operating procedure',
    responsibleTeam: 'Mechanical Assembly Team',
    investigationStatus: 'Verified',
    isVerified: true
  },
  {
    id: 'REJ-502',
    batchId: 'FAN-2026-002',
    fanModel: 'Luker Panther BLDC 1200mm',
    date: '2026-11-04',
    productionStage: 'Performance Testing',
    defectCategory: 'Motor noise',
    quantity: 1,
    disposition: 'Scrap',
    suspectedRootCause: 'Race groove micro-indentation during manual handling',
    verifiedRootCause: undefined,
    correctiveAction: undefined,
    responsibleTeam: 'Inbound Quality',
    investigationStatus: 'Suspected',
    isVerified: false
  },
  {
    id: 'REJ-503',
    batchId: 'FAN-2026-002',
    fanModel: 'Luker Panther BLDC 1200mm',
    date: '2026-11-05',
    productionStage: 'Electrical Testing',
    defectCategory: 'Electrical failure',
    quantity: 2,
    disposition: 'Rework',
    suspectedRootCause: 'Terminal crimping die worn causing intermittent connection',
    verifiedRootCause: 'Crimp tool pin #4 wear verified with micrometer check',
    correctiveAction: 'Replaced crimp tool cartridge and re-crimped 2 harnesses',
    responsibleTeam: 'Electrical Subassembly',
    investigationStatus: 'Verified',
    isVerified: true
  },
  {
    id: 'REJ-504',
    batchId: 'FAN-2026-003',
    fanModel: 'Luker Turbine High-Speed 1200mm',
    date: '2026-10-24',
    productionStage: 'Performance Testing',
    defectCategory: 'Vibration',
    quantity: 4,
    disposition: 'Rework',
    suspectedRootCause: 'Rotor balancing fixture weight offset error',
    verifiedRootCause: undefined,
    correctiveAction: 'Scheduled dynamic balancer re-zeroing check',
    responsibleTeam: 'Tooling & Maintenance',
    investigationStatus: 'Under Investigation',
    isVerified: false
  },
  {
    id: 'REJ-505',
    batchId: 'FAN-2026-003',
    fanModel: 'Luker Turbine High-Speed 1200mm',
    date: '2026-10-24',
    productionStage: 'Performance Testing',
    defectCategory: 'Vibration',
    quantity: 2,
    disposition: 'Scrap',
    suspectedRootCause: 'Die-cast rotor eccentricity exceeding 0.08mm runout threshold',
    verifiedRootCause: 'Casting shrinkage void in rotor core hub',
    correctiveAction: 'Notified Luker casting foundry supplier of porosity defect on Lot #784',
    responsibleTeam: 'Vendor Quality Assurance',
    investigationStatus: 'Verified',
    isVerified: true
  },
  {
    id: 'REJ-506',
    batchId: 'FAN-2026-004',
    fanModel: 'Luker Radial Eco BLDC',
    date: '2026-10-25',
    productionStage: 'Final Inspection',
    defectCategory: 'Cosmetic defect',
    quantity: 4,
    disposition: 'Rework',
    suspectedRootCause: 'Conveyor guide rail friction against decorative canopy',
    verifiedRootCause: 'Rubber protective sleeve slipped off guide bracket #6',
    correctiveAction: 'Reinstalled and secured anti-scratch silicone bumper on conveyor',
    responsibleTeam: 'Packaging & Dispatch',
    investigationStatus: 'Closed',
    isVerified: true
  },
  {
    id: 'REJ-507',
    batchId: 'FAN-2026-005',
    fanModel: 'Luker AeroPlus Deco 1200mm',
    date: '2026-11-06',
    productionStage: 'Final Inspection',
    defectCategory: 'Blade imbalance',
    quantity: 3,
    disposition: 'Rework',
    suspectedRootCause: 'Blade pair weight variance exceeded 1.5 grams',
    verifiedRootCause: undefined,
    correctiveAction: 'Re-grouped blades by precision electronic gram scale matching',
    responsibleTeam: 'Blade Assembly Cell',
    investigationStatus: 'Suspected',
    isVerified: false
  }
];
