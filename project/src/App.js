import React, { useState } from 'react';
import { Calculator, Droplet, Settings, Activity, TrendingUp } from 'lucide-react';
import Section from './components/Section';
import InputRow from './components/InputRow';
import ResultRow from './components/ResultRow';
import { PIPE_SCHEDULE_DATA, FITTING_NAMES } from './data/pipeData';
import { performCalculations } from './utils/calculations';
import './styles/App.css';

function App() {
  const [inputs, setInputs] = useState({
    // ── Pipe Details ──────────────────────────────────────────────────────────
    nominalDiameter: 10,
    diameterType:    'N',
    pipeSchedule:    '40',
    pipeRoughness:   0.0018,    // in  (default "X" in Excel → 0.0018)

    // ── Physical Details ──────────────────────────────────────────────────────
    physicalLength:  2500,      // m  (Excel F19)
    deltaElevation:  5,         // m  (Excel F20)

    // ── Fittings ──────────────────────────────────────────────────────────────
    // Excel liquid line default:
    //   90° Std Elbows = F19/100*4 = 2500/100*4 = 100   (L/D = 30)
    //   Globe Lift Check Valves    = 4                   (L/D = 450)
    //   Gate Valve full open       = 4                   (L/D = 13)
    // All other fittings = 0
    fittings: {
      elbow45Standard:             0,
      elbow90Standard:             100,   // FIX: was 0 — Excel auto-sets 2500/100*4 = 100
      elbow90LR:                   0,
      elbow90Street:               0,
      elbow45Street:               0,
      elbowSquareCorner:           0,
      globeValveFullOpen:          0,
      teeThruFlow:                 0,
      teeBranchFlow:               0,
      checkValveConventionalSwing: 0,
      checkValveClearwaySwing:     0,
      checkValveGlobeLift:         4,     // Excel F32 = 4
      checkValveAngleLift:         0,
      ballValveInLine:             0,
      gateValveFullOpen:           4,     // Excel F35 = 4
      valvePlugBall:               0,
      valveButterflyValve:         0,
      valveAngleValve:             0,
    },

    // ── Additional K / Le/D ───────────────────────────────────────────────────
    expanderDia:        0,
    reducerDia:         0,
    sharpEdgedEntrances: 0,
    pipeExits:          0,
    otherLeD:           0,
    otherK:             0,
    otherPressureDrops: 0,

    // ── Operating Conditions ──────────────────────────────────────────────────
    pressure:    1.6,    // barg  (Excel F48)
    temperature: 40,     // °C   (Excel F49)
    phase:       'L',    // L / G / M

    // ── Liquid Properties ─────────────────────────────────────────────────────
    liquidFlowrate:       63000,  // kg/h   (Excel F53)
    liquidDensity:        1000,   // kg/m³  (Excel F54)
    liquidViscosity:      0.1,    // cP     (Excel F55)
    liquidSurfaceTension: 1,      // dyne/cm (Excel F56)

    // ── Gas Properties ────────────────────────────────────────────────────────
    gasFlowrate:        0,    // kg/h   (Excel G58)
    gasDensity:         0,    // kg/m³  (Excel G59 — 0 means auto-calculate)
    gasCompressibility: 1,    // Z      (Excel G60)
    gasViscosity:       0,    // cP     (Excel G61 — 0 means auto-calculate)
    cpCv:               0.7,  // k      (Excel G62)
    molecularWeight:    0,    // MW     (Excel G63)
  });

  const [results, setResults] = useState(null);
  const [error,   setError  ] = useState(null);

  // ── Nested state updater ───────────────────────────────────────────────────
  const updateInput = (path, value) => {
    const keys = path.split('.');
    setInputs(prev => {
      const next = { ...prev };
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) {
        cur[keys[i]] = { ...cur[keys[i]] };
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleCalculate = () => {
    try {
      setError(null);
      setResults(performCalculations(inputs));
    } catch (err) {
      setError(err.message);
      setResults(null);
    }
  };

  return (
    <div className="app-container">

      {/* ── Header ── */}
      <div className="app-header">
        <div className="header-content">
          <Calculator className="header-icon" />
          <div className="header-text">
            <h1>Pipeline Hydraulics Calculator</h1>
            <p>Comprehensive pressure drop, velocity and flow analysis for pipeline systems</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="main-grid">

        {/* ══════════════════════════════════════════════════════════════════════
            LEFT COLUMN — inputs
        ══════════════════════════════════════════════════════════════════════ */}
        <div>

          {/* Piping Details */}
          <Section title="PIPING DETAILS" icon={<Settings size={22} />}>

            <InputRow label="Pipe Diameter, D" unit="in">
              <input
                type="number"
                value={inputs.nominalDiameter}
                onChange={e => updateInput('nominalDiameter', parseFloat(e.target.value) || 0)}
                step="0.125"
              />
            </InputRow>

            <InputRow label="Nominal or Internal Diameter (N/I)">
              <select
                value={inputs.diameterType}
                onChange={e => updateInput('diameterType', e.target.value)}
              >
                <option value="N">Nominal (N)</option>
                <option value="I">Internal (I)</option>
              </select>
            </InputRow>

            <InputRow label="Pipe Schedule">
              <select
                value={inputs.pipeSchedule}
                onChange={e => updateInput('pipeSchedule', e.target.value)}
              >
                {PIPE_SCHEDULE_DATA.schedules.map(sch => (
                  <option key={sch} value={sch}>{sch}</option>
                ))}
              </select>
            </InputRow>

            <InputRow label="Pipe Roughness" unit="in">
              <input
                type="number"
                value={inputs.pipeRoughness}
                onChange={e => updateInput('pipeRoughness', parseFloat(e.target.value) || 0.0018)}
                step="0.0001"
              />
            </InputRow>

          </Section>

          {/* Equivalent Length */}
          <Section title="EQUIVALENT LENGTH CALCULATIONS" icon={<Activity size={22} />}>

            <InputRow label="Physical Length" unit="m">
              <input
                type="number"
                value={inputs.physicalLength}
                onChange={e => updateInput('physicalLength', parseFloat(e.target.value) || 0)}
              />
            </InputRow>

            <InputRow label="Delta Elevation (Δh)" unit="m">
              <input
                type="number"
                value={inputs.deltaElevation}
                onChange={e => updateInput('deltaElevation', parseFloat(e.target.value) || 0)}
              />
            </InputRow>

          </Section>

          {/* Fittings & Valves */}
          <Section title="FITTINGS & VALVES" icon={<Settings size={22} />} collapsible>

            <div className="fittings-grid">
              {Object.keys(inputs.fittings).map(key => (
                <div key={key} className="fitting-item">
                  <label className="fitting-label">{FITTING_NAMES[key]}</label>
                  <input
                    type="number"
                    value={inputs.fittings[key]}
                    onChange={e => updateInput(`fittings.${key}`, parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
              ))}
            </div>

            <div className="divider" />

            <InputRow label="Expander (Expanded Dia)" unit="in">
              <input
                type="number"
                value={inputs.expanderDia}
                onChange={e => updateInput('expanderDia', parseFloat(e.target.value) || 0)}
                step="0.125"
              />
            </InputRow>

            <InputRow label="Reducer (Reduced Dia)" unit="in">
              <input
                type="number"
                value={inputs.reducerDia}
                onChange={e => updateInput('reducerDia', parseFloat(e.target.value) || 0)}
                step="0.125"
              />
            </InputRow>

            <InputRow label="Sharp Edged Entrances (K=0.5)">
              <input
                type="number"
                value={inputs.sharpEdgedEntrances}
                onChange={e => updateInput('sharpEdgedEntrances', parseInt(e.target.value) || 0)}
                min="0"
              />
            </InputRow>

            <InputRow label="Number of Pipe Exits (K=1)">
              <input
                type="number"
                value={inputs.pipeExits}
                onChange={e => updateInput('pipeExits', parseInt(e.target.value) || 0)}
                min="0"
              />
            </InputRow>

            <InputRow label="Other Equivalent Length (Le/D)">
              <input
                type="number"
                value={inputs.otherLeD}
                onChange={e => updateInput('otherLeD', parseFloat(e.target.value) || 0)}
              />
            </InputRow>

            <InputRow label="Sum of Other K's">
              <input
                type="number"
                value={inputs.otherK}
                onChange={e => updateInput('otherK', parseFloat(e.target.value) || 0)}
              />
            </InputRow>

            <InputRow label="Other Pressure Drops" unit="bar">
              <input
                type="number"
                value={inputs.otherPressureDrops}
                onChange={e => updateInput('otherPressureDrops', parseFloat(e.target.value) || 0)}
              />
            </InputRow>

          </Section>

          {/* Operating Conditions */}
          <Section title="OPERATING CONDITIONS" icon={<TrendingUp size={22} />}>

            <InputRow label="Phase" fullWidth>
              <div className="phase-toggle">
                {['L', 'G', 'M'].map(p => (
                  <button
                    key={p}
                    className={`phase-button ${inputs.phase === p ? 'active' : ''}`}
                    onClick={() => updateInput('phase', p)}
                  >
                    {p === 'L' ? 'Liquid (L)' : p === 'G' ? 'Gas (G)' : 'Mixed (M)'}
                  </button>
                ))}
              </div>
            </InputRow>

            <InputRow label="Pressure" unit="barg">
              <input
                type="number"
                value={inputs.pressure}
                onChange={e => updateInput('pressure', parseFloat(e.target.value) || 0)}
              />
            </InputRow>

            <InputRow label="Temperature" unit="°C">
              <input
                type="number"
                value={inputs.temperature}
                onChange={e => updateInput('temperature', parseFloat(e.target.value) || 0)}
              />
            </InputRow>

          </Section>

        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            RIGHT COLUMN — fluid properties + results
        ══════════════════════════════════════════════════════════════════════ */}
        <div>

          {/* Liquid Properties */}
          {(inputs.phase === 'L' || inputs.phase === 'M') && (
            <Section title="LIQUID PROPERTIES" icon={<Droplet size={22} />}>

              <InputRow label="Liquid Flowrate" unit="kg/h">
                <input
                  type="number"
                  value={inputs.liquidFlowrate}
                  onChange={e => updateInput('liquidFlowrate', parseFloat(e.target.value) || 0)}
                />
              </InputRow>

              <InputRow label="Liquid Density" unit="kg/m³">
                <input
                  type="number"
                  value={inputs.liquidDensity}
                  onChange={e => updateInput('liquidDensity', parseFloat(e.target.value) || 0)}
                />
              </InputRow>

              <InputRow label="Liquid / Mixed Phase Viscosity" unit="cP">
                <input
                  type="number"
                  value={inputs.liquidViscosity}
                  onChange={e => updateInput('liquidViscosity', parseFloat(e.target.value) || 0)}
                />
              </InputRow>

              {inputs.phase === 'M' && (
                <InputRow label="Liquid Surface Tension" unit="dyne/cm">
                  <input
                    type="number"
                    value={inputs.liquidSurfaceTension}
                    onChange={e => updateInput('liquidSurfaceTension', parseFloat(e.target.value) || 0)}
                  />
                </InputRow>
              )}

            </Section>
          )}

          {/* Gas Properties */}
          {(inputs.phase === 'G' || inputs.phase === 'M') && (
            <Section title="GAS PROPERTIES" icon={<Activity size={22} />}>

              <InputRow label="Gas Flowrate" unit="kg/h">
                <input
                  type="number"
                  value={inputs.gasFlowrate}
                  onChange={e => updateInput('gasFlowrate', parseFloat(e.target.value) || 0)}
                />
              </InputRow>

              <InputRow label="Gas Density (override)" unit="kg/m³">
                <input
                  type="number"
                  value={inputs.gasDensity}
                  onChange={e => updateInput('gasDensity', parseFloat(e.target.value) || 0)}
                  placeholder="Auto-calc if MW given"
                />
              </InputRow>

              <InputRow label="Compressibility Factor, Z">
                <input
                  type="number"
                  value={inputs.gasCompressibility}
                  onChange={e => updateInput('gasCompressibility', parseFloat(e.target.value) || 1)}
                  step="0.01"
                />
              </InputRow>

              <InputRow label="Gas Viscosity (override)" unit="cP">
                <input
                  type="number"
                  value={inputs.gasViscosity}
                  onChange={e => updateInput('gasViscosity', parseFloat(e.target.value) || 0)}
                  placeholder="Auto-calc if MW given"
                />
              </InputRow>

              <InputRow label="Cp/Cv (k)">
                <input
                  type="number"
                  value={inputs.cpCv}
                  onChange={e => updateInput('cpCv', parseFloat(e.target.value) || 0)}
                  step="0.01"
                />
              </InputRow>

              <InputRow label="Molecular Weight">
                <input
                  type="number"
                  value={inputs.molecularWeight}
                  onChange={e => updateInput('molecularWeight', parseFloat(e.target.value) || 0)}
                />
              </InputRow>

            </Section>
          )}

          {/* Calculate Button */}
          <button onClick={handleCalculate} className="calculate-button">
            ⚡ Calculate Hydraulics
          </button>

          {/* Results */}
          {results && (
            <Section
              title="LINE HYDRAULIC RESULTS"
              icon={<TrendingUp size={22} />}
              className="results-section"
            >

              <ResultRow
                label="INTERNAL DIAMETER"
                value={results.internalDiameter.toFixed(3)}
                unit="in"
                highlight
              />
              <ResultRow
                label="Flow Characteristic"
                value={results.flowCharacteristic}
              />
              <ResultRow
                label="Volumetric Flow Rate"
                value={results.volumetricFlowrate.toFixed(3)}
                unit="m³/hr"
              />
              <ResultRow
                label="Mass Flow Rate"
                value={results.massFlowrate.toFixed(2)}
                unit="kg/hr"
              />
              <ResultRow
                label="Equivalent Length"
                value={results.equivalentLengthM.toFixed(2)}
                unit="m"
              />
              <ResultRow
                label="Equivalent Length"
                value={results.equivalentLengthFt.toFixed(2)}
                unit="ft"
              />
              <ResultRow
                label="Total K"
                value={results.totalK.toFixed(4)}
              />

              {inputs.phase === 'M' && (
                <ResultRow
                  label="Mixed Phase Density"
                  value={results.density.toFixed(3)}
                  unit="kg/m³"
                />
              )}

              {inputs.phase !== 'L' && (
                <>
                  <ResultRow
                    label="Gas Density"
                    value={results.gasDensity.toFixed(4)}
                    unit="kg/m³"
                  />
                  <ResultRow
                    label="Gas Viscosity"
                    value={results.gasViscosity.toFixed(6)}
                    unit="cP"
                  />
                  <ResultRow label="k (= Cp/Cv)" value={inputs.cpCv.toFixed(2)} />
                  <ResultRow label="Z"            value={inputs.gasCompressibility.toFixed(2)} />
                </>
              )}

              <ResultRow
                label="Pipe Roughness"
                value={inputs.pipeRoughness.toFixed(4)}
                unit="in"
              />
              <ResultRow
                label="Reynolds Number"
                value={Math.round(results.reynoldsNumber).toLocaleString()}
                highlight
              />
              <ResultRow
                label="Darcy Friction Factor (fD)"
                value={results.darcyFrictionFactor.toFixed(6)}
              />

              <div className="divider" />

              <ResultRow
                label="Frictional ΔP, per 100m"
                value={results.pressureDropPerLength.toFixed(6)}
                unit="bar/100m"
                highlight
              />
              <ResultRow
                label="Press Drop — Frictional + K"
                value={results.frictionPressureDrop.toFixed(4)}
                unit="bar"
                highlight
              />
              <ResultRow
                label="Static Pressure Drop"
                value={results.staticPressureDrop.toFixed(4)}
                unit="bar"
              />
              <ResultRow
                label="Press Drop Frictional + Static"
                value={results.totalPressureDrop.toFixed(4)}
                unit="bar"
                important
              />

              <div className="divider" />

              <ResultRow
                label="Velocity"
                value={results.velocity.toFixed(3)}
                unit="m/s"
                highlight
              />
              <ResultRow
                label="ρV²"
                value={results.rhoV2.toFixed(3)}
                unit="kg/m/s²"
              />

              {inputs.phase !== 'L' && (
                <>
                  <ResultRow
                    label="Sonic Velocity"
                    value={results.sonicVelocity.toFixed(3)}
                    unit="m/s"
                  />
                  <ResultRow
                    label="Mach Number"
                    value={results.machNumber.toFixed(5)}
                  />
                  <ResultRow
                    label="Maximum Allowable Velocity"
                    value={results.maxVelocity.toFixed(3)}
                    unit="m/s"
                  />
                </>
              )}

              {inputs.phase === 'M' && results.minVelocity > 0 && (
                <ResultRow
                  label="Minimum Velocity (two-phase)"
                  value={results.minVelocity.toFixed(3)}
                  unit="m/s"
                />
              )}

            </Section>
          )}

        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="app-footer">
        <div className="footer-credits">
          Developed by <span>GOLLAPALLI RAVI VARMA</span> &mdash; GAT 2026&ndash;2027
        </div>
        
      </footer>

    </div>
  );
}

export default App;