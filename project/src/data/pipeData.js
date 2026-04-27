// Pipe Schedule Data - Exact values from Excel Reference Table (P4:AF56)
// Schedules: 5S, 10S, 10, 20, 30, 40, STD, 60, 80, XS, 100, 120, 140, 160, XXS
export const PIPE_SCHEDULE_DATA = {
  schedules: ['5S', '10S', '10', '20', '30', '40', 'STD', '60', '80', 'XS', '100', '120', '140', '160', 'XXS'],
  scheduleNumbers: [5, 9, 10, 20, 30, 40, 41, 60, 80, 81, 100, 120, 140, 160, 200],
  nominalDiameters: [
    0.125, 0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4, 6, 8, 10, 12,
    14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48
  ],

  // Internal diameter data indexed by nominal diameter and schedule
  // Array order: [5S, 10S, 10, 20, 30, 40, STD, 60, 80, XS, 100, 120, 140, 160, XXS]
  internalDiameters: {
    0.125: [0,     0.307, 0,      0,      0,      0.269,  0.269,  0,      0.215,  0.215,  0,      0,      0,      0,      0],
    0.25:  [0,     0.41,  0,      0,      0,      0.364,  0.364,  0,      0.302,  0.302,  0,      0,      0,      0,      0],
    0.5:   [0.71,  0.674, 0,      0,      0,      0.622,  0.622,  0,      0.546,  0.546,  0,      0,      0,      0.466,  0.252],
    0.75:  [0.92,  0.884, 0,      0,      0,      0.824,  0.824,  0,      0.742,  0.742,  0,      0,      0,      0.612,  0.434],
    1:     [1.185, 1.097, 0,      0,      0,      1.049,  1.049,  0,      0.957,  0.957,  0,      0,      0,      0.815,  0.599],
    1.5:   [1.77,  1.682, 0,      0,      0,      1.61,   1.61,   0,      1.5,    1.5,    0,      0,      0,      1.338,  1.1],
    2:     [2.245, 2.157, 0,      0,      0,      2.067,  2.067,  0,      1.939,  1.939,  0,      0,      0,      1.687,  1.503],
    2.5:   [2.709, 2.635, 0,      0,      0,      2.469,  2.469,  0,      2.323,  2.323,  0,      0,      0,      2.125,  1.771],
    3:     [3.334, 3.26,  0,      0,      0,      3.068,  3.068,  0,      2.9,    2.9,    0,      0,      0,      2.624,  2.3],
    4:     [4.334, 4.26,  0,      0,      0,      4.026,  4.026,  0,      3.826,  3.826,  0,      3.624,  0,      3.438,  3.152],
    6:     [6.407, 6.357, 0,      0,      0,      6.065,  6.065,  0,      5.761,  5.761,  0,      5.501,  0,      5.187,  4.897],
    8:     [8.407, 8.329, 0,      8.125,  8.071,  7.981,  7.981,  7.813,  7.625,  7.625,  7.437,  7.187,  7.001,  6.813,  6.875],
    10:    [10.482,10.42, 0,      10.25,  10.136, 10.02,  10.02,  9.75,   9.562,  9.75,   9.312,  9.062,  8.75,   8.5,    8.75],
    12:    [12.438,12.39, 0,      12.25,  12.09,  11.938, 12,     11.626, 11.374, 11.75,  11.062, 10.75,  10.5,   10.126, 10.75],
    14:    [13.688,13.624,13.5,   13.376, 13.25,  13.124, 13.25,  12.812, 12.5,   13,     12.124, 11.812, 11.5,   11.188, 0],
    16:    [15.67, 15.624,15.5,   15.376, 15.25,  15.0,   15.25,  14.688, 14.312, 15,     13.938, 13.562, 13.124, 12.812, 0],
    18:    [17.67, 17.624,17.5,   17.376, 17.124, 16.876, 17.25,  16.5,   16.124, 17,     15.688, 15.25,  14.876, 14.438, 0],
    20:    [19.624,19.564,19.5,   19.25,  19.0,   18.812, 19.25,  18.376, 17.938, 19,     17.438, 17.0,   16.5,   16.062, 0],
    22:    [21.812,21.782,21.75,  21.625, 21.5,   0,      21.625, 21.125, 20.875, 21.5,   20.625, 20.375, 20.125, 19.875, 0],
    24:    [23.564,23.5,  23.5,   23.25,  22.876, 22.624, 23.25,  22.062, 21.562, 23,     20.938, 20.376, 19.876, 19.312, 0],
    26:    [0,     0,     25.376, 25.0,   0,      0,      25.25,  0,      0,      25,     0,      0,      0,      0,      0],
    28:    [0,     0,     27.376, 27.0,   26.75,  0,      27.25,  0,      0,      27,     0,      0,      0,      0,      0],
    30:    [29.5,  29.376,29.376, 29.0,   28.75,  0,      29.25,  0,      0,      29,     0,      0,      0,      0,      0],
    32:    [0,     0,     31.376, 31.0,   30.75,  30.624, 31.25,  0,      0,      31,     0,      0,      0,      0,      0],
    34:    [0,     0,     33.312, 33.0,   32.75,  32.624, 33.25,  0,      0,      33,     0,      0,      0,      0,      0],
    36:    [0,     0,     35.376, 35.0,   34.75,  34.5,   35.25,  0,      0,      35,     0,      0,      0,      0,      0],
    38:    [0,     0,     0,      0,      0,      0,      37.625, 0,      0,      37.5,   0,      0,      0,      0,      0],
    40:    [0,     0,     0,      0,      0,      0,      39.625, 0,      0,      39.5,   0,      0,      0,      0,      0],
    42:    [0,     0,     0,      0,      0,      0,      41.625, 0,      0,      41.5,   0,      0,      0,      0,      0],
    44:    [0,     0,     0,      0,      0,      0,      43.625, 0,      0,      43.5,   0,      0,      0,      0,      0],
    46:    [0,     0,     0,      0,      0,      0,      45.625, 0,      0,      45.5,   0,      0,      0,      0,      0],
    48:    [0,     0,     0,      0,      0,      0,      47.625, 0,      0,      47.5,   0,      0,      0,      0,      0],
  }
};

// L/D values for fittings (from Excel Reference Table)
export const FITTING_LD_VALUES = {
  elbow45Standard: 16,
  elbow90Standard: 30,
  elbow90LR: 20,
  elbow90Street: 50,
  elbow45Street: 26,
  elbowSquareCorner: 57,
  globeValveFullOpen: 450,
  teeThruFlow: 20,
  teeBranchFlow: 60,
  checkValveConventionalSwing: 135,
  checkValveClearwaySwing: 50,
  checkValveGlobeLift: 450,
  checkValveAngleLift: 200,
  ballValveInLine: 150,
  gateValveFullOpen: 13,
  valvePlugBall: 18,
  valveButterflyValve: 40,
  valveAngleValve: 200
};

// Fitting display names
export const FITTING_NAMES = {
  elbow45Standard: '# of 45° Standard Elbows (L/D=16)',
  elbow90Standard: '# of 90° Standard Elbows (L/D=30)',
  elbow90LR: '# of 90° LR Elbows (L/D=20)',
  elbow90Street: '# of 90° Street Elbows (L/D=50)',
  elbow45Street: '# of 45° Street Elbows (L/D=26)',
  elbowSquareCorner: '# of Square Corner Elbows (L/D=57)',
  globeValveFullOpen: '# of Globe Valve full open (L/D=450)',
  teeThruFlow: '# of Tees: thru flow (L/D=20)',
  teeBranchFlow: '# of Tees: branch flow (L/D=60)',
  checkValveConventionalSwing: '# of Conventional Swing Check Valves (L/D=135)',
  checkValveClearwaySwing: '# of Clearway Swing Check Valves (L/D=50)',
  checkValveGlobeLift: '# of Globe Lift Check Valves (L/D=450)',
  checkValveAngleLift: '# of Angle Lift Check Valves (L/D=200)',
  ballValveInLine: '# of In-Line Ball Valves (L/D=150)',
  gateValveFullOpen: '# of Gate Valve full open (L/D=13)',
  valvePlugBall: '# of Valves - Plug/Ball (L/D=18)',
  valveButterflyValve: '# of Valves - Butterfly Valve (L/D=40)',
  valveAngleValve: '# of Valves - Angle Valve (L/D=200)'
};