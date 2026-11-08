# FanOps AI — Manufacturing Operations Intelligence

> **AI-Ready Manufacturing Operations Intelligence Dashboard** designed around the operational challenges for the **Luker AI Efficiency Enabler** role.

An enterprise frontend prototype built with React, TypeScript, Vite, Tailwind CSS, Recharts, and Lucide React, using synthetic demonstration data and persistent `localStorage`.

---

## 🏭 Operational Overview

FanOps AI addresses four fundamental manufacturing questions for ceiling fan factory supervisors:

1. **Where is production getting stuck?**  
   *Module 1 (Production & WIP)*: Tracks batch movements through 7 illustrative manufacturing stages (*Material Receipt &rarr; Motor Assembly &rarr; Component Assembly &rarr; Electrical Testing &rarr; Performance Testing &rarr; Final Inspection &rarr; Packaging*), calculating active WIP without double-counting and flagging station bottlenecks.

2. **Are batches being quality checked?**  
   *Module 2 (Quality Control)*: Enforces strict traceability where `Passed + Failed = Inspected`. Records illustrative test measurements (RPM, Voltage, Current, Power, Acoustic Noise in dB, Vibration in mm/s, Visual Inspection) with clear demonstration disclaimers.

3. **Are all required materials ready before production?**  
   *Module 3 (Material Readiness)*: Enforces the vital operational rule that **Inventory Availability &ne; Production Readiness**. Distinguishes between **AVAILABLE** (in central store), **RESERVED** (allocated to batch), and **STAGED** (physically delivered to shop floor). A batch is blocked until 100% of required components are staged.

4. **What are the major reasons for product rejection?**  
   *Module 4 (Rejection Analytics)*: Interactive filtering and Root Cause Analysis (RCA) tracking. Clearly distinguishes **suspected causes** from **verified causes**, while keeping **rework** and **permanent scrap** separated in analytics so unique production counts remain accurate.

---

## 🎯 6-Step Connected Demonstration Scenario

Batch ID: `FAN-2026-001`  
Model: `Luker BLDC Demo Model` (500 units)

1. **Material Shortage**: Requires 500 run capacitors (`MAT-CAP-01`), but only 400 are in store. The batch status is `Blocked` with a critical shortage alert.
2. **Receipt & Staging**: Receive +100 units via GRN, reserve the full 500 units, and physically stage them to the shop floor. The batch automatically unblocks to `Scheduled`!
3. **Production Movements**: Advance units through Motor Assembly to Electrical Testing. WIP distributes accurately across active stations.
4. **Quality Inspection**: Inspect 500 units on test bench (480 passed, 20 failed) with test bench readings.
5. **Rejection & RCA**: 20 failed units logged (15 rework, 5 scrap). Record suspected vs verified root causes.
6. **Executive Dashboard Sync**: All KPI cards, WIP stage bars, rejection trends, and plant alerts update dynamically in real time.

*(Use the top interactive guide bar or perform actions manually across modules).*

---

## 🎨 Genuine Luker Brand Identity

- **Genuine Logo**: Official vector asset downloaded directly from `lukerindia.com`.
- **Palette**:
  - Primary Red: `#D32F2F` / `#DF3129`
  - Dark Brown: `#8B3B07`
  - Coral: `#F58285`
  - Background: `#F7F8FA`
  - Surface: `#FFFFFF`
  - Typography: `#202124` / `#6B7280`
- **Labeling**: Prominent `INTERNAL OPERATIONS DEMO` banner and footer disclaimer:
  *"Independent prototype inspired by publicly available Luker brand identity. Not an official Luker product. All operational data is synthetic."*

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev

# Run production build
npm run build

# Preview production build locally
npm run preview
```

Deployment-ready for Vercel with included `vercel.json`.
