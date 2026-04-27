import React, { useState } from "react";
import { Settings, Droplet, Calculator, Download } from "lucide-react";
import Section from "../components/Section";
import InputRow from "../components/InputRow";
import ResultRow from "../components/ResultRow";
import { inputStyle, selectStyle } from "../styles/styles";

// ─── Pipe Schedule Data ────────────────────────────────────────────────────
const PIPE_SCHEDULE_DATA = {
  schedules: ['5S','10S','10','20','30','40','STD','60','80','XS','100','120','140','160','XXS'],
  scheduleNumbers: [5,9,10,20,30,40,41,60,80,81,100,120,140,160,200],
  nominalDiameters: [
    0.125,0.25,0.5,0.75,1,1.5,2,2.5,3,4,6,8,10,12,
    14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48
  ],
  internalDiameters: {
    0.125:[0,0.307,0,0,0,0.269,0.269,0,0.215,0.215,0,0,0,0,0],
    0.25: [0,0.41,0,0,0,0.364,0.364,0,0.302,0.302,0,0,0,0,0],
    0.5:  [0.71,0.674,0,0,0,0.622,0.622,0,0.546,0.546,0,0,0,0.466,0.252],
    0.75: [0.92,0.884,0,0,0,0.824,0.824,0,0.742,0.742,0,0,0,0.612,0.434],
    1:    [1.185,1.097,0,0,0,1.049,1.049,0,0.957,0.957,0,0,0,0.815,0.599],
    1.5:  [1.77,1.682,0,0,0,1.61,1.61,0,1.5,1.5,0,0,0,1.338,1.1],
    2:    [2.245,2.157,0,0,0,2.067,2.067,0,1.939,1.939,0,0,0,1.687,1.503],
    2.5:  [2.709,2.635,0,0,0,2.469,2.469,0,2.323,2.323,0,0,0,2.125,1.771],
    3:    [3.334,3.26,0,0,0,3.068,3.068,0,2.9,2.9,0,0,0,2.624,2.3],
    4:    [4.334,4.26,0,0,0,4.026,4.026,0,3.826,3.826,0,3.624,0,3.438,3.152],
    6:    [6.407,6.357,0,0,0,6.065,6.065,0,5.761,5.761,0,5.501,0,5.187,4.897],
    8:    [8.407,8.329,0,8.125,8.071,7.981,7.981,7.813,7.625,7.625,7.437,7.187,7.001,6.813,6.875],
    10:   [10.482,10.42,0,10.25,10.136,10.02,10.02,9.75,9.562,9.75,9.312,9.062,8.75,8.5,8.75],
    12:   [12.438,12.39,0,12.25,12.09,11.938,12,11.626,11.374,11.75,11.062,10.75,10.5,10.126,10.75],
    14:   [13.688,13.624,13.5,13.376,13.25,13.124,13.25,12.812,12.5,13,12.124,11.812,11.5,11.188,0],
    16:   [15.67,15.624,15.5,15.376,15.25,15.0,15.25,14.688,14.312,15,13.938,13.562,13.124,12.812,0],
    18:   [17.67,17.624,17.5,17.376,17.124,16.876,17.25,16.5,16.124,17,15.688,15.25,14.876,14.438,0],
    20:   [19.624,19.564,19.5,19.25,19.0,18.812,19.25,18.376,17.938,19,17.438,17.0,16.5,16.062,0],
    22:   [21.812,21.782,21.75,21.625,21.5,0,21.625,21.125,20.875,21.5,20.625,20.375,20.125,19.875,0],
    24:   [23.564,23.5,23.5,23.25,22.876,22.624,23.25,22.062,21.562,23,20.938,20.376,19.876,19.312,0],
    26:   [0,0,25.376,25.0,0,0,25.25,0,0,25,0,0,0,0,0],
    28:   [0,0,27.376,27.0,26.75,0,27.25,0,0,27,0,0,0,0,0],
    30:   [29.5,29.376,29.376,29.0,28.75,0,29.25,0,0,29,0,0,0,0,0],
    32:   [0,0,31.376,31.0,30.75,30.624,31.25,0,0,31,0,0,0,0,0],
    34:   [0,0,33.312,33.0,32.75,32.624,33.25,0,0,33,0,0,0,0,0],
    36:   [0,0,35.376,35.0,34.75,34.5,35.25,0,0,35,0,0,0,0,0],
    38:   [0,0,0,0,0,0,37.625,0,0,37.5,0,0,0,0,0],
    40:   [0,0,0,0,0,0,39.625,0,0,39.5,0,0,0,0,0],
    42:   [0,0,0,0,0,0,41.625,0,0,41.5,0,0,0,0,0],
    44:   [0,0,0,0,0,0,43.625,0,0,43.5,0,0,0,0,0],
    46:   [0,0,0,0,0,0,45.625,0,0,45.5,0,0,0,0,0],
    48:   [0,0,0,0,0,0,47.625,0,0,47.5,0,0,0,0,0],
  }
};

// ─── Fitting L/D Values ────────────────────────────────────────────────────
const FITTING_LD_VALUES = {
  elbow45Standard: 16, elbow90Standard: 30, elbow90LR: 20, elbow90Street: 50,
  elbow45Street: 26, elbowSquareCorner: 57, globeValveFullOpen: 450,
  teeThruFlow: 20, teeBranchFlow: 60, checkValveConventionalSwing: 135,
  checkValveClearwaySwing: 50, checkValveGlobeLift: 450, checkValveAngleLift: 200,
  ballValveInLine: 150, gateValveFullOpen: 13, valvePlugBall: 18,
  valveButterflyValve: 40, valveAngleValve: 200
};

// ─── Pipe Roughness Materials ──────────────────────────────────────────────
const ROUGHNESS_MATERIALS = [
  { label: "— Select Material —",            mm: null,        inches: null },
  { label: "Carbon Steel",                    mm: 0.0457,      inches: 0.001799 },
  { label: "Commercial Steel",                mm: 0.05,        inches: 0.001969 },
  { label: "Slightly Rusted Steel",           mm: 0.4,         inches: 0.015748 },
  { label: "Very Rusted Steel",               mm: 4,           inches: 0.157480 },
  { label: "Galvanized Iron",                 mm: 0.15,        inches: 0.005906 },
  { label: "Cast Iron",                       mm: 0.26,        inches: 0.010236 },
  { label: "Rusty Cast Iron",                 mm: 1.5,         inches: 0.059055 },
  { label: "Stainless Steel",                 mm: 0.0450088,   inches: 0.001772 },
  { label: "Aluminium",                       mm: 0.0014986,   inches: 0.000059 },
  { label: "Copper",                          mm: 0.0014986,   inches: 0.000059 },
  { label: "Glass",                           mm: 0.0001,      inches: 0.000004 },
  { label: "Neoprene",                        mm: 0.0817626,   inches: 0.003219 },
  { label: "Reinforced PVC",                  mm: 0.1400048,   inches: 0.005512 },
  { label: "Concrete (Smooth)",               mm: 0.305,       inches: 0.012008 },
  { label: "Riveted Steel",                   mm: 9.1,         inches: 0.358268 },
  { label: "Wood Stave",                      mm: 0.91,        inches: 0.035827 },
  { label: "Asphalted Cast Iron",             mm: 0.12,        inches: 0.004724 },
  { label: "Drawn Tubing",                    mm: 0.0015,      inches: 0.000059 },
  { label: "Welded Steel",                    mm: 0.1,         inches: 0.003937 },
  { label: "Steel with Light Scaling",        mm: 1,           inches: 0.039370 },
  { label: "Steel with Heavy Scaling",        mm: 1.5,         inches: 0.059055 },
  { label: "Cast Iron with Scaling",          mm: 1,           inches: 0.039370 },
  { label: "Concrete (Rough)",                mm: 1,           inches: 0.039370 },
  { label: "Lead",                            mm: 0.0015,      inches: 0.000059 },
  { label: "Brass",                           mm: 0.0015,      inches: 0.000059 },
  { label: "Drawn Steel",                     mm: 0.000000,    inches: 0.000000 },
];

// ─── PDF Generation Helper ─────────────────────────────────────────────────
const generatePDF = (inputs, results, selectedMaterial) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const phaseLabel = inputs.phase === "L" ? "Liquid" : inputs.phase === "G" ? "Gas" : "Mixed (Two-Phase)";

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>Pipeline Hydraulics Report</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Source+Sans+3:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Source Sans 3',sans-serif; background:#fff; color:#1e293b; font-size:13px; line-height:1.6; }
  .page { max-width:794px; margin:0 auto; padding:48px 52px; }
  .header { background:linear-gradient(135deg,#1e3a8a,#3b82f6); border-radius:12px; padding:32px 36px; margin-bottom:28px; color:#fff; }
  .header h1 { font-family:'Rajdhani',sans-serif; font-size:30px; font-weight:700; letter-spacing:0.04em; margin-bottom:4px; }
  .header .subtitle { font-size:14px; opacity:0.85; margin-bottom:16px; }
  .header .meta { display:flex; gap:32px; font-size:12px; opacity:0.75; margin-top:12px; border-top:1px solid rgba(255,255,255,0.2); padding-top:12px; }
  .section { margin-bottom:22px; }
  .section-title { font-family:'Rajdhani',sans-serif; font-size:16px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#1d4ed8; border-bottom:2px solid #dbeafe; padding-bottom:6px; margin-bottom:12px; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  th { background:#eff6ff; color:#1e40af; font-weight:600; padding:8px 12px; text-align:left; font-size:12px; text-transform:uppercase; letter-spacing:0.04em; }
  td { padding:7px 12px; border-bottom:1px solid #f1f5f9; vertical-align:middle; }
  tr:last-child td { border-bottom:none; }
  tr:nth-child(even) td { background:#fafbfd; }
  .val { font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:500; text-align:right; color:#0f172a; }
  .unit { font-size:11px; color:#94a3b8; margin-left:4px; }
  .highlight td { background:#eff6ff !important; font-weight:600; }
  .important td { background:#fef9c3 !important; }
  .important .val { color:#b45309; font-size:14px; font-weight:700; }
  .important .lbl { font-weight:700; color:#92400e; font-size:13px; }
  .two-col { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
  .badge { display:inline-block; background:#dbeafe; color:#1d4ed8; font-size:11px; font-weight:600; padding:2px 10px; border-radius:20px; letter-spacing:0.03em; }
  .footer { margin-top:36px; border-top:1px solid #e2e8f0; padding-top:16px; display:flex; justify-content:space-between; align-items:center; font-size:11px; color:#94a3b8; }
  @media print { body{-webkit-print-color-adjust:exact;print-color-adjust:exact;} }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <h1>Pipeline Hydraulics Calculator</h1>
    <div class="subtitle">Comprehensive Pressure Drop, Velocity &amp; Flow Analysis Report</div>
    <div class="meta">
      <span>&#128197; Generated: ${dateStr} at ${timeStr}</span>
      <span>&#128300; Phase: ${phaseLabel}</span>
    </div>
  </div>

  <div class="two-col">
    <div class="section">
      <div class="section-title">Piping Details</div>
      <table>
        <tbody>
          <tr><td>Nominal Diameter</td><td class="val">${inputs.nominalDiameter} <span class="unit">in</span></td></tr>
          <tr><td>Diameter Type</td><td class="val">${inputs.diameterType === "N" ? "Nominal" : "Internal"}</td></tr>
          <tr><td>Pipe Schedule</td><td class="val">${inputs.pipeSchedule}</td></tr>
          <tr><td>Pipe Material</td><td class="val">${selectedMaterial || "Custom"}</td></tr>
          <tr><td>Pipe Roughness</td><td class="val">${inputs.pipeRoughness} <span class="unit">in</span></td></tr>
        </tbody>
      </table>
    </div>
    <div class="section">
      <div class="section-title">Physical Details</div>
      <table>
        <tbody>
          <tr><td>Physical Length</td><td class="val">${inputs.physicalLength} <span class="unit">m</span></td></tr>
          <tr><td>Delta Elevation</td><td class="val">${inputs.deltaElevation} <span class="unit">m</span></td></tr>
          <tr><td>Phase</td><td class="val"><span class="badge">${phaseLabel}</span></td></tr>
          <tr><td>Pressure</td><td class="val">${inputs.pressure} <span class="unit">barg</span></td></tr>
          <tr><td>Temperature</td><td class="val">${inputs.temperature} <span class="unit">°C</span></td></tr>
        </tbody>
      </table>
    </div>
  </div>

  ${(inputs.phase === "L" || inputs.phase === "M") ? `
  <div class="section">
    <div class="section-title">Liquid Properties</div>
    <table>
      <thead><tr><th>Parameter</th><th>Value</th></tr></thead>
      <tbody>
        <tr><td>Liquid Flowrate</td><td class="val">${inputs.liquidFlowrate} <span class="unit">kg/h</span></td></tr>
        <tr><td>Liquid Density</td><td class="val">${inputs.liquidDensity} <span class="unit">kg/m³</span></td></tr>
        <tr><td>Liquid Viscosity</td><td class="val">${inputs.liquidViscosity} <span class="unit">cP</span></td></tr>
        ${inputs.phase === "M" ? `<tr><td>Surface Tension</td><td class="val">${inputs.liquidSurfaceTension} <span class="unit">dyne/cm</span></td></tr>` : ""}
      </tbody>
    </table>
  </div>` : ""}

  ${(inputs.phase === "G" || inputs.phase === "M") ? `
  <div class="section">
    <div class="section-title">Gas Properties</div>
    <table>
      <thead><tr><th>Parameter</th><th>Value</th></tr></thead>
      <tbody>
        <tr><td>Gas Flowrate</td><td class="val">${inputs.gasFlowrate} <span class="unit">kg/h</span></td></tr>
        <tr><td>Molecular Weight</td><td class="val">${inputs.molecularWeight}</td></tr>
        <tr><td>Compressibility (Z)</td><td class="val">${inputs.gasCompressibility}</td></tr>
        <tr><td>Cp/Cv</td><td class="val">${inputs.cpCv}</td></tr>
      </tbody>
    </table>
  </div>` : ""}

  <div class="section">
    <div class="section-title">&#9889; Hydraulic Results</div>
    <table>
      <thead><tr><th>Parameter</th><th style="text-align:right">Value</th></tr></thead>
      <tbody>
        <tr><td>Internal Diameter</td><td class="val">${results.internalDiameter.toFixed(3)} <span class="unit">in</span></td></tr>
        <tr><td>Flow Characteristic</td><td class="val"><span class="badge">${results.flowCharacteristic}</span></td></tr>
        <tr><td>Mass Flowrate</td><td class="val">${results.massFlowrate.toFixed(2)} <span class="unit">kg/h</span></td></tr>
        <tr><td>Volumetric Flowrate</td><td class="val">${results.volumetricFlowrate.toFixed(2)} <span class="unit">m³/h</span></td></tr>
        <tr class="highlight"><td>Velocity</td><td class="val">${results.velocity.toFixed(3)} <span class="unit">m/s</span></td></tr>
        <tr><td>Reynolds Number</td><td class="val">${results.reynoldsNumber.toFixed(0)}</td></tr>
        <tr><td>Friction Factor (Darcy)</td><td class="val">${results.darcyFrictionFactor.toFixed(6)}</td></tr>
        <tr><td>Equivalent Length</td><td class="val">${results.equivalentLengthM.toFixed(2)} <span class="unit">m</span></td></tr>
        <tr><td>Total K</td><td class="val">${results.totalK.toFixed(4)}</td></tr>
        <tr class="highlight"><td>ΔP Friction</td><td class="val">${results.frictionPressureDrop.toFixed(4)} <span class="unit">bar</span></td></tr>
        <tr><td>ΔP Static (Elevation)</td><td class="val">${results.staticPressureDrop.toFixed(4)} <span class="unit">bar</span></td></tr>
        <tr class="important"><td class="lbl">Total Pressure Drop</td><td class="val">${results.totalPressureDrop.toFixed(4)} <span class="unit">bar</span></td></tr>
        <tr><td>ΔP per 100m</td><td class="val">${results.pressureDropPerLength.toFixed(6)} <span class="unit">bar/100m</span></td></tr>
        <tr><td>ρV² (Momentum Flux)</td><td class="val">${results.rhoV2.toFixed(2)} <span class="unit">kg/m·s²</span></td></tr>
        ${inputs.phase !== "L" ? `
        <tr><td>Sonic Velocity</td><td class="val">${results.sonicVelocity.toFixed(2)} <span class="unit">m/s</span></td></tr>
        <tr><td>Mach Number</td><td class="val">${results.machNumber.toFixed(4)}</td></tr>
        <tr><td>Max Allowable Velocity</td><td class="val">${results.maxVelocity.toFixed(2)} <span class="unit">m/s</span></td></tr>` : ""}
        ${inputs.phase === "M" && results.minVelocity > 0 ? `<tr><td>Min Velocity (Two-Phase)</td><td class="val">${results.minVelocity.toFixed(2)} <span class="unit">m/s</span></td></tr>` : ""}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <span>Pipeline Hydraulics Calculator &mdash; Confidential Engineering Report</span>
    <span>Generated ${dateStr}</span>
  </div>
</div>
<script>window.onload = () => window.print();</script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (!win) alert("Please allow popups to download the report.");
};

// ─── Main Component ────────────────────────────────────────────────────────
export default function PipelineCalculator() {
  const [inputs, setInputs] = useState({
    nominalDiameter: 10,
    diameterType: "N",
    pipeSchedule: "40",
    pipeRoughness: 0.001799,
    physicalLength: 2500,
    deltaElevation: 5,
    fittings: {
      elbow45Standard: 0, elbow90Standard: 0, elbow90LR: 0,
      elbow90Street: 0, elbow45Street: 0, elbowSquareCorner: 0,
      globeValveFullOpen: 0, teeThruFlow: 0, teeBranchFlow: 0,
      checkValveConventionalSwing: 0, checkValveClearwaySwing: 0,
      checkValveGlobeLift: 4, checkValveAngleLift: 0,
      ballValveInLine: 0, gateValveFullOpen: 4,
      valvePlugBall: 0, valveButterflyValve: 0, valveAngleValve: 0
    },
    expanderDia: 0, reducerDia: 0,
    sharpEdgedEntrances: 0, pipeExits: 0,
    otherLeD: 0, otherK: 0, otherPressureDrops: 0,
    phase: "L",
    pressure: 1.6, temperature: 40,
    liquidFlowrate: 63000, liquidDensity: 1000, liquidViscosity: 0.1, liquidSurfaceTension: 1,
    gasFlowrate: 0, gasDensity: 0, gasCompressibility: 1, gasViscosity: 0,
    cpCv: 0.7, molecularWeight: 0
  });

  const [selectedMaterial, setSelectedMaterial] = useState("Carbon Steel");
  const [results, setResults] = useState(null);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const getScheduleColumnIndex = (schedule) => {
    const scheduleMap = { "5S": 5, "10S": 9, "STD": 41, "X": 41, "XS": 81, "XXS": 200 };
    const schedNum = scheduleMap[schedule] || parseInt(schedule);
    return PIPE_SCHEDULE_DATA.scheduleNumbers.indexOf(schedNum);
  };

  const getInternalDiameter = (nomDia, schedule, diaType) => {
    if (diaType === "I") return nomDia;
    const schedIdx = getScheduleColumnIndex(schedule);
    if (schedIdx === -1 || !PIPE_SCHEDULE_DATA.internalDiameters[nomDia]) return 0;
    return PIPE_SCHEDULE_DATA.internalDiameters[nomDia][schedIdx] || 0;
  };

  const calcGasDensity = (p, t, MW, Z) =>
    ((p + 1.01325) * MW) / ((273.15 + t) * 0.083145 * Z);

  const calcGasViscosity = (t, MW, density) => {
    const tempR = 1.8 * (t + 273.15);
    const rhoLb = density / 1000;
    const exp = (2.576 + 1914.45 / tempR + 0.00953 * MW) * Math.pow(rhoLb, 1.108 + 0.0404 * (2.576 + 1914.45 / tempR + 0.00953 * MW));
    return ((7.77 + 0.006276 * MW) * Math.pow(tempR, 1.5) * Math.exp(exp)) / ((122.44 + 12.95 * MW + tempR) * 10000);
  };

  const calcDarcyFF = (Re, roughness, diameter) => {
    const e_D = roughness / diameter;
    let f = 0.02;
    for (let i = 0; i < 7; i++) f = Math.pow(1 / (-2 * Math.log10(e_D / 3.7 + 2.51 / (Re * Math.sqrt(f)))), 2);
    return f;
  };

  // ── Calculate ────────────────────────────────────────────────────────────
  const calculateResults = () => {
    try {
      const inp = inputs;
      const internalDia = getInternalDiameter(inp.nominalDiameter, inp.pipeSchedule, inp.diameterType);
      if (internalDia === 0) { alert("Invalid pipe schedule / nominal diameter combination"); return; }

      let workingDensity, gasDens = 0, gasVisc = 0, massFlowrate;

      if (inp.phase === "G") {
        if (!inp.molecularWeight) { alert("Missing gas molecular weight"); return; }
        gasDens = calcGasDensity(inp.pressure, inp.temperature, inp.molecularWeight, inp.gasCompressibility);
        gasVisc = inp.gasViscosity || calcGasViscosity(inp.temperature, inp.molecularWeight, gasDens);
        workingDensity = gasDens;
        massFlowrate = inp.gasFlowrate;
      } else if (inp.phase === "L") {
        workingDensity = inp.liquidDensity;
        massFlowrate = inp.liquidFlowrate;
      } else {
        gasDens = calcGasDensity(inp.pressure, inp.temperature, inp.molecularWeight, inp.gasCompressibility);
        gasVisc = calcGasViscosity(inp.temperature, inp.molecularWeight, gasDens);
        massFlowrate = inp.liquidFlowrate + inp.gasFlowrate;
        const xG = inp.gasFlowrate / massFlowrate;
        workingDensity = 1 / (xG / gasDens + (1 - xG) / inp.liquidDensity);
      }

      const volFlowrate = massFlowrate / workingDensity;
      const viscosity = inp.phase === "G" ? gasVisc : inp.liquidViscosity;
      const reynolds = 6.31 * massFlowrate * 2.2046 / internalDia / viscosity;

      let totalLeD = inp.otherLeD;
      Object.keys(inp.fittings).forEach(f => { totalLeD += inp.fittings[f] * (FITTING_LD_VALUES[f] || 0); });

      const equivalentLengthFt = (inp.physicalLength / 0.3048) + (inp.nominalDiameter * totalLeD / 12);
      const equivalentLengthM = equivalentLengthFt * 0.3048;

      let enlargeContractK = 0;
      if (inp.expanderDia > inp.nominalDiameter) enlargeContractK += Math.pow(1 - Math.pow(inp.nominalDiameter / inp.expanderDia, 2), 2);
      if (inp.reducerDia > 0 && inp.reducerDia < inp.nominalDiameter) {
        const r = inp.reducerDia / inp.nominalDiameter;
        enlargeContractK += -0.36653 * r * r - 0.151245 * r + 0.5;
      }
      const totalK = enlargeContractK + 0.5 * inp.sharpEdgedEntrances + inp.pipeExits + inp.otherK;

      let frictionFactor;
      if (reynolds < 2000) frictionFactor = 64 / reynolds;
      else if (reynolds > 400 * internalDia / inp.pipeRoughness)
        frictionFactor = 0.25 / Math.pow(Math.log10(3.7 * internalDia / inp.pipeRoughness), 2);
      else frictionFactor = calcDarcyFF(reynolds, inp.pipeRoughness, internalDia);

      const velocityFtS = 0.16 * massFlowrate * 2.2046 / (workingDensity * 0.062428) / Math.PI / Math.pow(internalDia, 2);
      const velocityMS = velocityFtS * 0.3048;

      const pressureDropPerLength = 0.000336 * frictionFactor * Math.pow(massFlowrate * 2.2046, 2) / (workingDensity / 16.02) / Math.pow(internalDia, 5);
      const frictionPressureDropPsi = pressureDropPerLength * equivalentLengthFt / 100 +
        0.000021727 * totalK * Math.pow(massFlowrate, 2) / workingDensity / Math.pow(internalDia, 4) +
        inp.otherPressureDrops * 14.5038;

      const frictionPressureDropBar = frictionPressureDropPsi / 14.5038;
      const staticPressureDropBar = inp.deltaElevation * (workingDensity / 1000) * 0.098;
      const totalPressureDropBar = frictionPressureDropBar + staticPressureDropBar;

      let flowChar;
      if (reynolds < 2000) flowChar = "Laminar";
      else if (reynolds < 4000) flowChar = "Critical";
      else if (reynolds > 400 * internalDia / inp.pipeRoughness) flowChar = "Fully Turbulent";
      else flowChar = "Turbulent";

      let sonicVelocity = 0, machNumber = 0;
      if (inp.phase !== "L" && inp.molecularWeight > 0) {
        const tempR = 9 / 5 * inp.temperature + 32 + 460;
        sonicVelocity = 223 * Math.sqrt((inp.gasCompressibility * inp.cpCv * tempR) / inp.molecularWeight);
        machNumber = velocityFtS / sonicVelocity;
      }

      const maxVelocityMS = inp.phase !== "L" ? (100 / Math.sqrt(workingDensity * 0.0626)) * 0.3048 : 0;
      const minVelocityMS = inp.phase === "M" ? (60 / Math.sqrt(workingDensity * 0.0626)) * 0.3048 : 0;

      setResults({
        internalDiameter: internalDia, flowCharacteristic: flowChar,
        volumetricFlowrate: volFlowrate, massFlowrate,
        equivalentLengthM, equivalentLengthFt, totalK, density: workingDensity,
        gasDensity: gasDens, gasViscosity: gasVisc, reynoldsNumber: reynolds,
        darcyFrictionFactor: frictionFactor, velocity: velocityMS,
        pressureDropPerLength: pressureDropPerLength / 14.5038 / 0.3048,
        frictionPressureDrop: frictionPressureDropBar,
        staticPressureDrop: staticPressureDropBar, totalPressureDrop: totalPressureDropBar,
        sonicVelocity: sonicVelocity * 0.3048, machNumber,
        maxVelocity: maxVelocityMS, minVelocity: minVelocityMS,
        rhoV2: workingDensity * Math.pow(velocityMS, 2)
      });
    } catch (err) {
      console.error(err);
      alert("Calculation error: " + err.message);
    }
  };

  const updateInput = (path, value) => {
    const keys = path.split(".");
    setInputs(prev => {
      const next = { ...prev };
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) { cur[keys[i]] = { ...cur[keys[i]] }; cur = cur[keys[i]]; }
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleMaterialChange = (e) => {
    const label = e.target.value;
    setSelectedMaterial(label);
    const mat = ROUGHNESS_MATERIALS.find(m => m.label === label);
    if (mat && mat.inches !== null) {
      updateInput("pipeRoughness", mat.inches);
    }
  };

  // ── Styles ───────────────────────────────────────────────────────────────
  const base = {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%)",
    fontFamily: '"IBM Plex Sans",-apple-system,BlinkMacSystemFont,sans-serif',
    color: "#e2e8f0", padding: "2rem"
  };
  const inp = {
    width: "100%", padding: "0.65rem 1rem", borderRadius: "9px",
    border: "1px solid rgba(100,116,139,0.25)", background: "rgba(7,15,30,0.8)",
    color: "#e2e8f0", fontSize: "14px", fontFamily: "JetBrains Mono,monospace", outline: "none"
  };
  const sel = { ...inp, cursor: "pointer", appearance: "none" };
  const roughnessRowStyle = {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", alignItems: "center"
  };

  return (
    <div style={base}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{
          background: "linear-gradient(135deg,#1e40af 0%,#3b82f6 100%)",
          padding: "2.5rem", borderRadius: "16px", marginBottom: "2rem",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)", border: "1px solid rgba(59,130,246,0.3)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
            <Calculator size={36} strokeWidth={2.5} />
            <h1 style={{ margin: 0, fontSize: "2.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
              Pipeline Hydraulics Calculator
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: "1.1rem", opacity: 0.9 }}>
            Comprehensive pressure drop, velocity and flow analysis
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(450px,1fr))", gap: "2rem" }}>

          {/* ── LEFT COLUMN ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

            {/* Piping Details */}
            <Section title="Piping Details" icon={<Settings size={20} />}>
              <InputRow label="Pipe Diameter" unit="in">
                <input type="number" value={inputs.nominalDiameter} style={inp}
                  step="0.125" onChange={e => updateInput("nominalDiameter", parseFloat(e.target.value) || 0)} />
              </InputRow>

              <InputRow label="Diameter Type">
                <select value={inputs.diameterType} style={sel} onChange={e => updateInput("diameterType", e.target.value)}>
                  <option value="N">Nominal (N)</option>
                  <option value="I">Internal (I)</option>
                </select>
              </InputRow>

              <InputRow label="Pipe Schedule">
                <select value={inputs.pipeSchedule} style={sel} onChange={e => updateInput("pipeSchedule", e.target.value)}>
                  {PIPE_SCHEDULE_DATA.schedules.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </InputRow>

              {/* Material dropdown + roughness value */}
              <div style={{ padding: "0.625rem 0", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={roughnessRowStyle}>
                  <label style={{ fontSize: "15px", fontWeight: 500, color: "#94a3b8" }}>
                    Pipe Material
                  </label>
                  <select value={selectedMaterial} style={sel} onChange={handleMaterialChange}>
                    {ROUGHNESS_MATERIALS.map(m => (
                      <option key={m.label} value={m.label}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div style={roughnessRowStyle}>
                  <label style={{ fontSize: "15px", fontWeight: 500, color: "#94a3b8" }}>
                    Pipe Roughness <span style={{ fontSize: "13px", color: "#4a5a72" }}>(in)</span>
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <input type="number" value={inputs.pipeRoughness} style={inp} step="0.000001"
                      onChange={e => { setSelectedMaterial("— Select Material —"); updateInput("pipeRoughness", parseFloat(e.target.value) || 0); }} />
                    {selectedMaterial && selectedMaterial !== "— Select Material —" && (() => {
                      const mat = ROUGHNESS_MATERIALS.find(m => m.label === selectedMaterial);
                      return mat && mat.mm !== null ? (
                        <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "JetBrains Mono,monospace" }}>
                          {mat.mm} mm
                        </span>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>
            </Section>

            {/* Physical Details */}
            <Section title="Physical Details" icon={<Droplet size={20} />}>
              <InputRow label="Physical Length" unit="m">
                <input type="number" value={inputs.physicalLength} style={inp}
                  onChange={e => updateInput("physicalLength", parseFloat(e.target.value) || 0)} />
              </InputRow>
              <InputRow label="Delta Elevation" unit="m">
                <input type="number" value={inputs.deltaElevation} style={inp}
                  onChange={e => updateInput("deltaElevation", parseFloat(e.target.value) || 0)} />
              </InputRow>
            </Section>

            {/* Fittings */}
            <Section title="Fittings & Valves" collapsible>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                {Object.keys(FITTING_LD_VALUES).map(fitting => (
                  <InputRow key={fitting}
                    label={fitting.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}
                    compact>
                    <input type="number" value={inputs.fittings[fitting]} min="0" style={{ ...inp, padding: "0.4rem 0.6rem" }}
                      onChange={e => updateInput(`fittings.${fitting}`, parseInt(e.target.value) || 0)} />
                  </InputRow>
                ))}
              </div>
              <InputRow label="Other Le/D">
                <input type="number" value={inputs.otherLeD} style={inp}
                  onChange={e => updateInput("otherLeD", parseFloat(e.target.value) || 0)} />
              </InputRow>
              <InputRow label="Other K">
                <input type="number" value={inputs.otherK} style={inp}
                  onChange={e => updateInput("otherK", parseFloat(e.target.value) || 0)} />
              </InputRow>
            </Section>

            {/* Operating Conditions */}
            <Section title="Operating Conditions">
              <InputRow label="Phase">
                <select value={inputs.phase} style={sel} onChange={e => updateInput("phase", e.target.value)}>
                  <option value="L">Liquid (L)</option>
                  <option value="G">Gas (G)</option>
                  <option value="M">Mixed (M)</option>
                </select>
              </InputRow>
              <InputRow label="Pressure" unit="barg">
                <input type="number" value={inputs.pressure} style={inp}
                  onChange={e => updateInput("pressure", parseFloat(e.target.value) || 0)} />
              </InputRow>
              <InputRow label="Temperature" unit="°C">
                <input type="number" value={inputs.temperature} style={inp}
                  onChange={e => updateInput("temperature", parseFloat(e.target.value) || 0)} />
              </InputRow>
            </Section>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

            {(inputs.phase === "L" || inputs.phase === "M") && (
              <Section title="Liquid Properties">
                <InputRow label="Liquid Flowrate" unit="kg/h">
                  <input type="number" value={inputs.liquidFlowrate} style={inp}
                    onChange={e => updateInput("liquidFlowrate", parseFloat(e.target.value) || 0)} />
                </InputRow>
                <InputRow label="Liquid Density" unit="kg/m³">
                  <input type="number" value={inputs.liquidDensity} style={inp}
                    onChange={e => updateInput("liquidDensity", parseFloat(e.target.value) || 0)} />
                </InputRow>
                <InputRow label="Liquid Viscosity" unit="cP">
                  <input type="number" value={inputs.liquidViscosity} style={inp}
                    onChange={e => updateInput("liquidViscosity", parseFloat(e.target.value) || 0)} />
                </InputRow>
                {inputs.phase === "M" && (
                  <InputRow label="Surface Tension" unit="dyne/cm">
                    <input type="number" value={inputs.liquidSurfaceTension} style={inp}
                      onChange={e => updateInput("liquidSurfaceTension", parseFloat(e.target.value) || 0)} />
                  </InputRow>
                )}
              </Section>
            )}

            {(inputs.phase === "G" || inputs.phase === "M") && (
              <Section title="Gas Properties">
                <InputRow label="Gas Flowrate" unit="kg/h">
                  <input type="number" value={inputs.gasFlowrate} style={inp}
                    onChange={e => updateInput("gasFlowrate", parseFloat(e.target.value) || 0)} />
                </InputRow>
                <InputRow label="Molecular Weight">
                  <input type="number" value={inputs.molecularWeight} style={inp}
                    onChange={e => updateInput("molecularWeight", parseFloat(e.target.value) || 0)} />
                </InputRow>
                <InputRow label="Compressibility (Z)">
                  <input type="number" value={inputs.gasCompressibility} step="0.01" style={inp}
                    onChange={e => updateInput("gasCompressibility", parseFloat(e.target.value) || 1)} />
                </InputRow>
                <InputRow label="Cp/Cv">
                  <input type="number" value={inputs.cpCv} step="0.01" style={inp}
                    onChange={e => updateInput("cpCv", parseFloat(e.target.value) || 0)} />
                </InputRow>
              </Section>
            )}

            {/* Calculate Button */}
            <button onClick={calculateResults} style={{
              background: "linear-gradient(135deg,#10b981 0%,#059669 100%)", color: "#fff",
              border: "none", padding: "1.25rem", borderRadius: "12px", fontSize: "1.1rem",
              fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 30px rgba(16,185,129,0.3)",
              transition: "all 0.3s ease", letterSpacing: "0.02em", textTransform: "uppercase"
            }}
              onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 15px 40px rgba(16,185,129,0.4)"; }}
              onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(16,185,129,0.3)"; }}>
              Calculate Hydraulics
            </button>

            {/* Results */}
            {results && (
              <>
                <Section title="Hydraulic Results">
                  <ResultRow label="Internal Diameter" value={results.internalDiameter.toFixed(3)} unit="in" />
                  <ResultRow label="Flow Characteristic" value={results.flowCharacteristic} />
                  <ResultRow label="Mass Flowrate" value={results.massFlowrate.toFixed(2)} unit="kg/h" />
                  <ResultRow label="Volumetric Flowrate" value={results.volumetricFlowrate.toFixed(2)} unit="m³/h" />
                  <ResultRow label="Velocity" value={results.velocity.toFixed(3)} unit="m/s" highlight />
                  <ResultRow label="Reynolds Number" value={results.reynoldsNumber.toFixed(0)} />
                  <ResultRow label="Friction Factor (fD)" value={results.darcyFrictionFactor.toFixed(6)} />
                  <ResultRow label="Equivalent Length" value={results.equivalentLengthM.toFixed(2)} unit="m" />
                  <ResultRow label="Total K" value={results.totalK.toFixed(4)} />
                  <ResultRow label="Pressure Drop (Friction)" value={results.frictionPressureDrop.toFixed(4)} unit="bar" highlight />
                  <ResultRow label="Pressure Drop (Static)" value={results.staticPressureDrop.toFixed(4)} unit="bar" />
                  <ResultRow label="Total Pressure Drop" value={results.totalPressureDrop.toFixed(4)} unit="bar" highlight important />
                  <ResultRow label="ΔP per 100m" value={results.pressureDropPerLength.toFixed(6)} unit="bar/100m" />
                  <ResultRow label="ρV²" value={results.rhoV2.toFixed(2)} unit="kg/m/s²" />
                  {inputs.phase !== "L" && <>
                    <ResultRow label="Sonic Velocity" value={results.sonicVelocity.toFixed(2)} unit="m/s" />
                    <ResultRow label="Mach Number" value={results.machNumber.toFixed(4)} />
                    <ResultRow label="Max Allowable Velocity" value={results.maxVelocity.toFixed(2)} unit="m/s" />
                  </>}
                  {inputs.phase === "M" && results.minVelocity > 0 && (
                    <ResultRow label="Min Velocity (Two-Phase)" value={results.minVelocity.toFixed(2)} unit="m/s" />
                  )}
                </Section>

                {/* Download PDF Button */}
                <button
                  onClick={() => generatePDF(inputs, results, selectedMaterial)}
                  style={{
                    background: "linear-gradient(135deg,#1d4ed8 0%,#3b82f6 100%)", color: "#fff",
                    border: "none", padding: "1rem 1.5rem", borderRadius: "12px", fontSize: "1rem",
                    fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 24px rgba(59,130,246,0.3)",
                    transition: "all 0.3s ease", letterSpacing: "0.02em", textTransform: "uppercase",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.625rem"
                  }}
                  onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(59,130,246,0.45)"; }}
                  onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(59,130,246,0.3)"; }}>
                  <Download size={18} />
                  Download Calculations (PDF)
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}