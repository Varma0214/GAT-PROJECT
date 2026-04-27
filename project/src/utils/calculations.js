import { PIPE_SCHEDULE_DATA, FITTING_LD_VALUES } from '../data/pipeData';

/**
 * Get schedule column index for lookup.
 * Maps schedule name/number to index in the scheduleNumbers array.
 */
export const getScheduleColumnIndex = (schedule) => {
  const scheduleMap = {
    '5S': 5, '10S': 9, '10': 10, '20': 20, '30': 30,
    '40': 40, 'STD': 41, '60': 60, '80': 80, 'XS': 81,
    '100': 100, '120': 120, '140': 140, '160': 160, 'XXS': 200
  };
  const schedNum = scheduleMap[String(schedule)] ?? parseInt(schedule);
  return PIPE_SCHEDULE_DATA.scheduleNumbers.indexOf(schedNum);
};

/**
 * Get internal diameter from pipe schedule table.
 * Uses VLOOKUP approximate match (largest nominal dia <= input).
 *
 * Cell refs: F67/G67 = IF(F15="I", F14, VLOOKUP(F14, $P$7:$AF$43, HLOOKUP(...)))
 */
export const getInternalDiameter = (nomDia, schedule, diaType) => {
  if (diaType === 'I') return nomDia;

  const schedIdx = getScheduleColumnIndex(schedule);
  if (schedIdx === -1) return 0;

  const availableSizes = PIPE_SCHEDULE_DATA.nominalDiameters;

  if (PIPE_SCHEDULE_DATA.internalDiameters[nomDia] !== undefined) {
    return PIPE_SCHEDULE_DATA.internalDiameters[nomDia][schedIdx] || 0;
  }

  // VLOOKUP approximate match: largest value <= nomDia
  let closestSize = null;
  for (let i = availableSizes.length - 1; i >= 0; i--) {
    if (availableSizes[i] <= nomDia) {
      closestSize = availableSizes[i];
      break;
    }
  }

  if (closestSize === null) return 0;
  return PIPE_SCHEDULE_DATA.internalDiameters[closestSize][schedIdx] || 0;
};

/**
 * Calculate gas density (kg/m³).
 *
 * Excel F117: ρ = (P_bara × MW) / (T_K × R × Z)
 *   P_bara  = P_barg + 1.01325   [bara]
 *   T_K     = T_°C  + 273.15    [K]
 *   R       = 0.083145           [bar·m³/(kmol·K)]
 */
export const calculateGasDensity = (pressure_barg, temp_C, MW, Z) => {
  if (!MW || MW === 0 || Z === 0) return 0;
  const P_bara = pressure_barg + 1.01325;
  const T_K    = temp_C + 273.15;
  return (P_bara * MW) / (T_K * 0.083145 * Z);
};

/**
 * Calculate gas viscosity using the Lee-Kesler correlation (cP).
 *
 * Excel F118 (auto-calc branch):
 *   A = 2.576 + 1914.45/T_R + 0.00953×MW
 *   B = 1.108 + 0.0404×A
 *   μ = [(7.77 + 0.006276×MW) × T_R^1.5 × exp(A × ρ_lbft3^B)] / [(122.44 + 12.95×MW + T_R) × 10000]
 *
 *   T_R       = 1.8 × T_K        [°R]
 *   ρ_lbft3   = ρ_kgm3 / 16.0185
 */
export const calculateGasViscosity = (temp_C, MW, density_kgm3) => {
  if (!MW || MW === 0) return 0;
  const T_R         = 1.8 * (temp_C + 273.15);
  const rho_lbft3   = density_kgm3 / 16.0185;
  const A = 2.576 + (1914.45 / T_R) + 0.00953 * MW;
  const B = 1.108 + 0.0404 * A;
  const numerator   = (7.77 + 0.006276 * MW) * Math.pow(T_R, 1.5) *
                      Math.exp(A * Math.pow(rho_lbft3, B));
  const denominator = 122.44 + 12.95 * MW + T_R;
  return numerator / denominator / 10000;
};

/**
 * Calculate working density based on phase (kg/m³).
 *
 * Excel F116:
 *   Gas  (G) → gas density
 *   Liq  (L) → liquid density
 *   Mix  (M) → 1 / (xG/ρG + xL/ρL)   [mass-fraction harmonic mean]
 */
export const calculateWorkingDensity = (
  phase, liquidDensity, gasDensity, liquidFlowrate, gasFlowrate
) => {
  if (phase === 'G') return gasDensity;
  if (phase === 'L') return liquidDensity;
  if (phase === 'M') {
    const totalFlow = liquidFlowrate + gasFlowrate;
    if (totalFlow === 0) return 0;
    if (gasDensity === 0 || liquidDensity === 0) return 0;
    const xG = gasFlowrate  / totalFlow;
    const xL = liquidFlowrate / totalFlow;
    return 1 / (xG / gasDensity + xL / liquidDensity);
  }
  return 0;
};

/**
 * Calculate Reynolds number (dimensionless).
 *
 * Excel F121: Re = 6.31 × W[lb/h] / D[in] / μ[cP]
 *   W[lb/h] = W[kg/h] × 2.2046
 */
export const calculateReynolds = (massFlowrate_kgh, internalDia_in, viscosity_cP) => {
  if (viscosity_cP === 0 || internalDia_in === 0) return 0;
  const W_lbh = massFlowrate_kgh * 2.2046;
  return 6.31 * W_lbh / internalDia_in / viscosity_cP;
};

/**
 * Calculate Darcy friction factor — Colebrook-White iterative (10 passes).
 *
 * Excel F122: f = [1 / (-2 log10(ε/3.7D + 2.51/(Re√f)))]²  (7-deep nested)
 */
export const calculateDarcyFrictionFactor = (reynolds, roughness_in, diameter_in) => {
  if (reynolds === 0 || diameter_in === 0) return 0;
  const e_D = roughness_in / diameter_in;
  let f = 0.02;
  for (let i = 0; i < 10; i++) {
    f = Math.pow(1 / (-2 * Math.log10(e_D / 3.7 + 2.51 / (reynolds * Math.sqrt(f)))), 2);
  }
  return f;
};

/**
 * Select friction factor based on flow regime.
 *
 * Excel F132 (embedded):
 *   Re < 2 000                         → 64/Re          (Laminar)
 *   Re > 400 × D/ε                     → 0.25/[log10(3.7D/ε)]²  (Fully Turbulent)
 *   Otherwise                          → Colebrook-White (Turbulent)
 */
export const calculateFrictionFactor = (reynolds, roughness_in, internalDia_in) => {
  if (reynolds <= 0) return 0;
  if (reynolds < 2000) {
    return 64 / reynolds;
  } else if (reynolds > 400 * internalDia_in / roughness_in) {
    return 0.25 / Math.pow(Math.log10(3.7 * internalDia_in / roughness_in), 2);
  } else {
    return calculateDarcyFrictionFactor(reynolds, roughness_in, internalDia_in);
  }
};

/**
 * Calculate equivalent length (ft).
 *
 * Excel F129:
 *   Le[ft] = (L[m] / 0.3048) + (D_nom[in] × SUMPRODUCT(L/D, counts) / 12)
 *
 *   The "/12" converts  (inches × dimensionless L/D)  →  feet.
 *   otherLeD is an additional user-entered ΣL/D (cell F43).
 */
export const calculateEquivalentLength = (physicalLength_m, nominalDia_in, fittings, otherLeD) => {
  let totalLeD = otherLeD || 0;
  Object.keys(fittings).forEach(key => {
    if (FITTING_LD_VALUES[key]) {
      totalLeD += (fittings[key] || 0) * FITTING_LD_VALUES[key];
    }
  });
  const physicalLengthFt  = physicalLength_m / 0.3048;
  const fittingLengthFt   = nominalDia_in * totalLeD / 12;
  return physicalLengthFt + fittingLengthFt;
};

/**
 * Calculate K values for enlargement and contraction.
 *
 * Excel F130:
 *   Expander K = (1 - (D/D_exp)²)²          if D_exp > D
 *   Reducer  K = -0.36653(r²) - 0.151245(r) + 0.5   where r = D_red/D
 *                                            if D_red < D
 */
export const calculateEnlargeContractK = (nominalDia_in, expanderDia_in, reducerDia_in) => {
  let K = 0;
  if (expanderDia_in > 0 && expanderDia_in > nominalDia_in) {
    K += Math.pow(1 - Math.pow(nominalDia_in / expanderDia_in, 2), 2);
  }
  if (reducerDia_in > 0 && reducerDia_in < nominalDia_in) {
    const r = reducerDia_in / nominalDia_in;
    K += -0.36653 * r * r + (-0.151245) * r + 0.5;
  }
  return K;
};

/**
 * Calculate total K.
 *
 * Excel F131:
 *   K_total = K_enlarge_contract + 0.5×N_sharp_entry + N_exits + K_other
 */
export const calculateTotalK = (enlargeContractK, sharpEdgedEntrances, pipeExits, otherK) => {
  return enlargeContractK + 0.5 * sharpEdgedEntrances + pipeExits + otherK;
};

/**
 * Calculate velocity (m/s).
 *
 * Excel F125 (ft/s):
 *   V[ft/s] = 0.16 × W[lb/h] / (ρ[lb/ft³] × π × D²[in²])
 *   V[m/s]  = V[ft/s] × 0.3048
 *
 *   ρ[lb/ft³] = ρ[kg/m³] × 0.062428
 */
export const calculateVelocity = (massFlowrate_kgh, density_kgm3, internalDia_in) => {
  if (density_kgm3 === 0 || internalDia_in === 0) return 0;
  const W_lbh      = massFlowrate_kgh * 2.2046;
  const rho_lbft3  = density_kgm3 * 0.062428;
  const V_fts      = 0.16 * W_lbh / (rho_lbft3 * Math.PI * Math.pow(internalDia_in, 2));
  return V_fts * 0.3048;
};

/**
 * Calculate sonic velocity for gas (m/s).
 *
 * Excel F128 (ft/s):
 *   a[ft/s] = 223 × √(Z × k × T_R / MW)
 *   T_R = T[°C] × 1.8 + 32 + 460  [°R]
 *   a[m/s] = a[ft/s] × 0.3048
 */
export const calculateSonicVelocity = (Z, k, temp_C, MW) => {
  if (MW === 0) return 0;
  const T_R   = temp_C * 1.8 + 32 + 460;
  const a_fts = 223 * Math.sqrt((Z * k * T_R) / MW);
  return a_fts * 0.3048;
};

/**
 * Calculate maximum allowable velocity for gas (m/s).
 *
 * Excel F126 (ft/s):
 *   V_max[ft/s] = 100 / √(ρ[kg/m³] × 0.0626)    ← NOTE: 0.0626, not 0.062428
 *   V_max[m/s]  = V_max[ft/s] × 0.3048
 *
 * FIX: Previous code used 0.062428 — Excel uses 0.0626.
 */
export const calculateMaxVelocity = (density_kgm3) => {
  if (density_kgm3 === 0) return 0;
  const V_fts = 100 / Math.sqrt(density_kgm3 * 0.0626);   // 0.0626 matches Excel F126
  return V_fts * 0.3048;
};

/**
 * Calculate minimum velocity for two-phase flow (m/s).
 *
 * Excel F127 (ft/s):
 *   V_min[ft/s] = 60 / √(ρ[kg/m³] × 0.0626)     ← NOTE: 0.0626, not 0.062428
 *   V_min[m/s]  = V_min[ft/s] × 0.3048
 *
 * FIX: Previous code used 0.062428 — Excel uses 0.0626.
 */
export const calculateMinVelocity = (density_kgm3) => {
  if (density_kgm3 === 0) return 0;
  const V_fts = 60 / Math.sqrt(density_kgm3 * 0.0626);    // 0.0626 matches Excel F127
  return V_fts * 0.3048;
};

/**
 * Calculate pressure drop per 100 m (bar/100m).
 *
 * Excel F132 (psi/100ft):
 *   ΔP/100ft = 0.000336 × f × W[lb/h]² / ρ[lb/ft³] / D[in]⁵
 *
 * Excel F88 conversion to bar/100m:
 *   ΔP[bar/100m] = ΔP[psi/100ft] / 14.5038 / 0.3048
 *
 *   ρ[lb/ft³] = ρ[kg/m³] × 0.062428
 */
export const calculatePressureDropPerLength = (
  frictionFactor, massFlowrate_kgh, density_kgm3, internalDia_in
) => {
  if (density_kgm3 === 0 || internalDia_in === 0) return 0;
  const W_lbh         = massFlowrate_kgh * 2.2046;
  const rho_lbft3     = density_kgm3 * 0.062428;
  const dP_psi100ft   = 0.000336 * frictionFactor *
                        Math.pow(W_lbh, 2) / rho_lbft3 / Math.pow(internalDia_in, 5);
  return dP_psi100ft / 14.5038 / 0.3048;   // → bar/100m
};

/**
 * Calculate friction pressure drop (bar) from equivalent length.
 *
 * Excel F89:
 *   ΔP_friction[bar] = ΔP[bar/100m] × Le[m] / 100
 */
export const calculateFrictionPressureDrop = (pressureDropPerLength_bar100m, equivalentLength_m) => {
  return pressureDropPerLength_bar100m * equivalentLength_m / 100;
};

/**
 * Calculate K-based (minor losses) pressure drop (bar).
 *
 * Excel F133 (second term):
 *   ΔP_K[psi] = 0.000021727 × K × W[lb/h]² / ρ[kg/m³] / D[in]⁴
 *   ΔP_K[bar] = ΔP_K[psi] / 14.5038
 *
 * NOTE: ρ stays in kg/m³ here — this is how the Excel formula is written.
 */
export const calculateKPressureDrop = (
  totalK, massFlowrate_kgh, density_kgm3, internalDia_in
) => {
  if (density_kgm3 === 0 || internalDia_in === 0 || totalK === 0) return 0;
  const W_lbh   = massFlowrate_kgh * 2.2046;
  const dP_psi  = 0.000021727 * totalK *
                  Math.pow(W_lbh, 2) / density_kgm3 / Math.pow(internalDia_in, 4);
  return dP_psi / 14.5038;
};

/**
 * Calculate static pressure drop (bar).
 *
 * Excel F90 (second term):
 *   ΔP_static[bar] = Δh[m] × (ρ[kg/m³] / 1000) × 0.098
 *
 * FIX: Previous code used 0.098066 — Excel uses exactly 0.098 (g ≈ 9.8 m/s²).
 */
export const calculateStaticPressureDrop = (deltaElevation_m, density_kgm3) => {
  return deltaElevation_m * (density_kgm3 / 1000) * 0.098;   // 0.098 matches Excel F90
};

/**
 * Determine flow characteristic label.
 *
 * Excel F68:
 *   Re < 2 000                    → Laminar
 *   Re < 4 000                    → Critical
 *   Re > 400 × D_int/roughness    → Fully Turbulent
 *   Otherwise                     → Turbulent
 */
export const getFlowCharacteristic = (reynolds, roughness_in, internalDia_in) => {
  if (reynolds < 2000) return 'Laminar';
  if (reynolds < 4000) return 'Critical';
  if (reynolds > 400 * internalDia_in / roughness_in) return 'Fully Turbulent';
  return 'Turbulent';
};

/**
 * Main calculation entry point.
 * Orchestrates all sub-calculations and returns a results object.
 */
export const performCalculations = (inputs) => {
  try {
    // ── 1. Internal diameter ──────────────────────────────────────────────────
    const internalDia = getInternalDiameter(
      inputs.nominalDiameter,
      inputs.pipeSchedule,
      inputs.diameterType
    );
    if (internalDia === 0) {
      throw new Error(
        'Invalid pipe schedule / nominal diameter combination. Please select a valid combination.'
      );
    }

    // ── 2. Gas properties ─────────────────────────────────────────────────────
    let gasDensity   = 0;
    let gasViscosity = 0;

    if (inputs.phase === 'G' || inputs.phase === 'M') {
      gasDensity = inputs.gasDensity > 0
        ? inputs.gasDensity
        : calculateGasDensity(
            inputs.pressure, inputs.temperature,
            inputs.molecularWeight, inputs.gasCompressibility
          );

      gasViscosity = inputs.gasViscosity > 0
        ? inputs.gasViscosity
        : calculateGasViscosity(inputs.temperature, inputs.molecularWeight, gasDensity);
    }

    // ── 3. Working density ────────────────────────────────────────────────────
    const workingDensity = calculateWorkingDensity(
      inputs.phase, inputs.liquidDensity, gasDensity,
      inputs.liquidFlowrate, inputs.gasFlowrate
    );
    if (workingDensity === 0) {
      throw new Error('Working density is zero. Please check fluid properties.');
    }

    // ── 4. Mass & volumetric flow rates ───────────────────────────────────────
    let massFlowrate;
    if      (inputs.phase === 'L') massFlowrate = inputs.liquidFlowrate;
    else if (inputs.phase === 'G') massFlowrate = inputs.gasFlowrate;
    else                           massFlowrate = inputs.liquidFlowrate + inputs.gasFlowrate;

    const volumetricFlowrate = massFlowrate / workingDensity;   // m³/hr

    // ── 5. Viscosity for Reynolds ─────────────────────────────────────────────
    // Gas → gas viscosity; Liquid or Mixed → liquid/mixed-phase viscosity
    const viscosity = (inputs.phase === 'G') ? gasViscosity : inputs.liquidViscosity;

    // ── 6. Reynolds number ────────────────────────────────────────────────────
    const reynolds = calculateReynolds(massFlowrate, internalDia, viscosity);

    // ── 7. Flow characteristic ────────────────────────────────────────────────
    const flowCharacteristic = getFlowCharacteristic(reynolds, inputs.pipeRoughness, internalDia);

    // ── 8. Friction factor ────────────────────────────────────────────────────
    const frictionFactor = calculateFrictionFactor(reynolds, inputs.pipeRoughness, internalDia);

    // ── 9. Equivalent length ──────────────────────────────────────────────────
    const equivalentLengthFt = calculateEquivalentLength(
      inputs.physicalLength, inputs.nominalDiameter, inputs.fittings, inputs.otherLeD
    );
    const equivalentLengthM = equivalentLengthFt * 0.3048;

    // ── 10. K values ──────────────────────────────────────────────────────────
    const enlargeContractK = calculateEnlargeContractK(
      inputs.nominalDiameter, inputs.expanderDia, inputs.reducerDia
    );
    const totalK = calculateTotalK(
      enlargeContractK, inputs.sharpEdgedEntrances, inputs.pipeExits, inputs.otherK
    );

    // ── 11. Pressure drop per unit length (bar/100m) ──────────────────────────
    const pressureDropPerLength = calculatePressureDropPerLength(
      frictionFactor, massFlowrate, workingDensity, internalDia
    );

    // ── 12. Friction pressure drop (bar) ──────────────────────────────────────
    const frictionPressureDrop = calculateFrictionPressureDrop(
      pressureDropPerLength, equivalentLengthM
    );

    // ── 13. K-based pressure drop (bar) ───────────────────────────────────────
    const kPressureDrop = calculateKPressureDrop(
      totalK, massFlowrate, workingDensity, internalDia
    );

    // ── 14. Other user-defined pressure drops (bar) ───────────────────────────
    const otherPressureDropBar = inputs.otherPressureDrops || 0;

    // ── 15. Total frictional + K + other (bar) ────────────────────────────────
    // Matches Excel F89: dP_friction + dP_K + other_bar
    const frictionPlusKDrop = frictionPressureDrop + kPressureDrop + otherPressureDropBar;

    // ── 16. Static pressure drop (bar) ────────────────────────────────────────
    const staticPressureDrop = calculateStaticPressureDrop(
      inputs.deltaElevation, workingDensity
    );

    // ── 17. Total pressure drop (bar) ─────────────────────────────────────────
    const totalPressureDrop = frictionPlusKDrop + staticPressureDrop;

    // ── 18. Velocity (m/s) ────────────────────────────────────────────────────
    const velocityMS = calculateVelocity(massFlowrate, workingDensity, internalDia);

    // ── 19. ρV² (kg/m/s²) ─────────────────────────────────────────────────────
    const rhoV2 = workingDensity * Math.pow(velocityMS, 2);

    // ── 20. Gas-specific results ──────────────────────────────────────────────
    let sonicVelocityMS = 0;
    let machNumber      = 0;
    let maxVelocityMS   = 0;

    if (inputs.phase !== 'L') {
      sonicVelocityMS = calculateSonicVelocity(
        inputs.gasCompressibility, inputs.cpCv,
        inputs.temperature, inputs.molecularWeight
      );
      machNumber    = sonicVelocityMS > 0 ? velocityMS / sonicVelocityMS : 0;
      maxVelocityMS = calculateMaxVelocity(workingDensity);
    }

    // ── 21. Two-phase minimum velocity ────────────────────────────────────────
    let minVelocityMS = 0;
    if (inputs.phase === 'M') {
      minVelocityMS = calculateMinVelocity(workingDensity);
    }

    return {
      internalDiameter:     internalDia,
      flowCharacteristic,
      volumetricFlowrate,
      massFlowrate,
      equivalentLengthM,
      equivalentLengthFt,
      totalK,
      density:              workingDensity,
      gasDensity,
      gasViscosity,
      reynoldsNumber:       reynolds,
      darcyFrictionFactor:  frictionFactor,
      velocity:             velocityMS,
      pressureDropPerLength,
      frictionPressureDrop: frictionPlusKDrop,
      staticPressureDrop,
      totalPressureDrop,
      sonicVelocity:        sonicVelocityMS,
      machNumber,
      maxVelocity:          maxVelocityMS,
      minVelocity:          minVelocityMS,
      rhoV2
    };

  } catch (error) {
    console.error('Calculation error:', error);
    throw error;
  }
};