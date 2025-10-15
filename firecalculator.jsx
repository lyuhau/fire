import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SVGHeatmap = ({ data, retirementYears, childBirthYears, getColor, selectedCell, onCellClick }) => {
  const [hoveredCell, setHoveredCell] = useState(null);
  const svgRef = React.useRef(null);

  const width = 600;
  const height = 400;
  const marginLeft = 60;
  const marginRight = 30;
  const marginTop = 30;
  const marginBottom = 50;

  const plotWidth = width - marginLeft - marginRight;
  const plotHeight = height - marginTop - marginBottom;

  const cellWidth = plotWidth / retirementYears.length;
  const cellHeight = plotHeight / childBirthYears.length;

  const xScale = (retYear) => marginLeft + retYear * cellWidth;
  // Reverse Y-axis: 0 at bottom, 25 at top, -1 (no child) above 25
  const yScale = (childYear) => {
    if (childYear === -1) {
      return marginTop; // No child at the top
    }
    return height - marginBottom - (childYear + 1) * cellHeight; // 0 at bottom, 25 near top
  };

  const handleKeyDown = (e) => {
    if (!selectedCell) return;

    const currentRetIndex = retirementYears.indexOf(selectedCell.retirementYear);
    const currentChildIndex = childBirthYears.indexOf(selectedCell.childBirthYear);

    let newRetIndex = currentRetIndex;
    let newChildIndex = currentChildIndex;

    switch(e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        newRetIndex = Math.max(0, currentRetIndex - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        newRetIndex = Math.min(retirementYears.length - 1, currentRetIndex + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        newChildIndex = Math.min(childBirthYears.length - 1, currentChildIndex + 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        newChildIndex = Math.max(0, currentChildIndex - 1);
        break;
      default:
        return;
    }

    if (newRetIndex !== currentRetIndex || newChildIndex !== currentChildIndex) {
      onCellClick(retirementYears[newRetIndex], childBirthYears[newChildIndex]);
    }
  };

  return (
    <div
      className="relative"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      ref={svgRef}
      style={{ outline: 'none' }}
    >
      <svg width={width} height={height} className="border border-gray-200">
        {/* Grid lines */}
        <g>
          {retirementYears.filter((_, i) => i % 5 === 0).map(year => (
            <line
              key={`vline-${year}`}
              x1={xScale(year)}
              y1={marginTop}
              x2={xScale(year)}
              y2={height - marginBottom}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
          ))}
          {childBirthYears.filter((_, i) => i % 5 === 0).map(year => (
            <line
              key={`hline-${year}`}
              x1={marginLeft}
              y1={yScale(year)}
              x2={width - marginRight}
              y2={yScale(year)}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
          ))}
        </g>

        {/* Heatmap cells */}
        <g>
          {data.map((cell) => {
            const x = xScale(cell.retirementYear);
            const y = yScale(cell.childBirthYear);
            const isSelected = selectedCell?.retirementYear === cell.retirementYear &&
                              selectedCell?.childBirthYear === cell.childBirthYear;
            const isHovered = hoveredCell?.retirementYear === cell.retirementYear &&
                             hoveredCell?.childBirthYear === cell.childBirthYear;

            return (
              <rect
                key={`${cell.retirementYear}-${cell.childBirthYear}`}
                x={x}
                y={y}
                width={cellWidth}
                height={cellHeight}
                fill={getColor(cell.metric)}
                stroke={isSelected ? '#2563eb' : isHovered ? '#6b7280' : 'none'}
                strokeWidth={isSelected ? 3 : isHovered ? 2 : 0}
                style={{ cursor: 'pointer' }}
                onClick={() => onCellClick(cell.retirementYear, cell.childBirthYear)}
                onMouseEnter={() => setHoveredCell(cell)}
                onMouseLeave={() => setHoveredCell(null)}
              />
            );
          })}
        </g>

        {/* X-axis */}
        <g>
          <line
            x1={marginLeft}
            y1={height - marginBottom}
            x2={width - marginRight}
            y2={height - marginBottom}
            stroke="black"
            strokeWidth={2}
          />
          {[0, 5, 10, 15, 20, 25, 30].map(year => (
            <g key={`xtick-${year}`}>
              <line
                x1={xScale(year)}
                y1={height - marginBottom}
                x2={xScale(year)}
                y2={height - marginBottom + 6}
                stroke="black"
                strokeWidth={2}
              />
              <text
                x={xScale(year) + cellWidth / 2}
                y={height - marginBottom + 20}
                textAnchor="middle"
                fontSize={12}
              >
                {year}
              </text>
            </g>
          ))}
          <text
            x={marginLeft + plotWidth / 2}
            y={height - 20}
            textAnchor="middle"
            fontSize={14}
            fontWeight="bold"
          >
            Retirement Year
          </text>
        </g>

        {/* Y-axis */}
        <g>
          <line
            x1={marginLeft}
            y1={marginTop}
            x2={marginLeft}
            y2={height - marginBottom}
            stroke="black"
            strokeWidth={2}
          />
          {[0, 5, 10, 15, 20, 25, -1].map(year => (
            <g key={`ytick-${year}`}>
              <line
                x1={marginLeft - 6}
                y1={yScale(year) + cellHeight / 2}
                x2={marginLeft}
                y2={yScale(year) + cellHeight / 2}
                stroke="black"
                strokeWidth={2}
              />
              <text
                x={marginLeft - 10}
                y={yScale(year) + cellHeight / 2 + 4}
                textAnchor="end"
                fontSize={12}
              >
                {year === -1 ? 'Never' : year}
              </text>
            </g>
          ))}
          <text
            x={20}
            y={marginTop + plotHeight / 2}
            textAnchor="middle"
            fontSize={14}
            fontWeight="bold"
            transform={`rotate(-90, 20, ${marginTop + plotHeight / 2})`}
          >
            Child Birth Year
          </text>
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredCell && (
        <div
          className="absolute bg-white p-3 border-2 border-gray-300 rounded shadow-lg pointer-events-none"
          style={{
            left: xScale(hoveredCell.retirementYear) + cellWidth + 10,
            top: yScale(hoveredCell.childBirthYear)
          }}
        >
          <p className="font-semibold text-sm">Retirement: Year {hoveredCell.retirementYear}</p>
          <p className="font-semibold text-sm">
            Child: {hoveredCell.childBirthYear === -1 ? 'Never' : `Year ${hoveredCell.childBirthYear}`}
          </p>
          <p className="mt-1 text-sm">
            {hoveredCell.metric < 100
              ? `Runs out: Year ${hoveredCell.metric.toFixed(0)}`
              : `Sustainable: ${hoveredCell.metric.toFixed(0)} years`}
          </p>
        </div>
      )}
    </div>
  );
};

const FIRECalculator = () => {
  const defaultInputs = {
    workingIncome: 200000,
    retiredIncome: 0,
    baseSpending: 65000,
    initialPortfolio: 0,
    retirementYear: 15,
    numberOfChildren: 0,
    childBirthYears: [],
    childSpacing: 3,
    childCostScale: 1.0,
    privateCollege: false,
    filingStatus: 'single',
    state: 'ny',
    city: 'nyc',
    returnRate: 7,
  };

  // Read from URL params on mount
  const getInitialState = () => {
    if (typeof window === 'undefined') return { mode: 'simple', inputs: defaultInputs };

    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode') || 'simple';

    const numberOfChildren = Number(params.get('nc')) || defaultInputs.numberOfChildren;
    const childBirthYearsParam = params.get('cb');
    const childBirthYears = childBirthYearsParam
      ? childBirthYearsParam.split(',').map(Number)
      : defaultInputs.childBirthYears;

    const inputs = {
      workingIncome: Number(params.get('wi')) || defaultInputs.workingIncome,
      retiredIncome: Number(params.get('ri')) || defaultInputs.retiredIncome,
      baseSpending: Number(params.get('bs')) || defaultInputs.baseSpending,
      initialPortfolio: Number(params.get('ip')) || defaultInputs.initialPortfolio,
      retirementYear: Number(params.get('ry')) || defaultInputs.retirementYear,
      numberOfChildren,
      childBirthYears,
      childSpacing: Number(params.get('sp')) || defaultInputs.childSpacing,
      childCostScale: Number(params.get('cs')) || defaultInputs.childCostScale,
      privateCollege: params.get('pc') === 'true' || defaultInputs.privateCollege,
      filingStatus: params.get('fs') || defaultInputs.filingStatus,
      state: params.get('st') || defaultInputs.state,
      city: params.get('ct') || defaultInputs.city,
      returnRate: Number(params.get('rr')) || defaultInputs.returnRate,
    };

    return { mode, inputs };
  };

  const initialState = getInitialState();
  const [mode, setMode] = useState(initialState.mode);
  const [inputs, setInputs] = useState(initialState.inputs);
  const [selectedCell, setSelectedCell] = useState(null);

  // Update URL when state changes
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams();
    params.set('mode', mode);
    params.set('wi', inputs.workingIncome);
    params.set('ri', inputs.retiredIncome);
    params.set('bs', inputs.baseSpending);
    params.set('ip', inputs.initialPortfolio);
    params.set('ry', inputs.retirementYear);
    params.set('nc', inputs.numberOfChildren);
    params.set('cb', inputs.childBirthYears.join(','));
    params.set('sp', inputs.childSpacing);
    params.set('cs', inputs.childCostScale);
    params.set('pc', inputs.privateCollege);
    params.set('fs', inputs.filingStatus);
    params.set('st', inputs.state);
    params.set('ct', inputs.city);
    params.set('rr', inputs.returnRate);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [mode, inputs]);

  const resetToDefaults = () => {
    setInputs(defaultInputs);
    setMode('simple');
    setSelectedCell(null);
  };

  // Helper to update number of children and adjust birth years array
  const updateNumberOfChildren = (newCount) => {
    const currentYears = inputs.childBirthYears;
    let newYears = [...currentYears];

    if (newCount > currentYears.length) {
      // Add new children - use last child's year + spacing or default to 0
      const lastYear = currentYears.length > 0 ? currentYears[currentYears.length - 1] : -inputs.childSpacing;
      for (let i = currentYears.length; i < newCount; i++) {
        newYears.push(lastYear + inputs.childSpacing * (i - currentYears.length + 1));
      }
    } else if (newCount < currentYears.length) {
      // Remove children from the end
      newYears = currentYears.slice(0, newCount);
    }

    setInputs({...inputs, numberOfChildren: newCount, childBirthYears: newYears});
  };

  // Helper to update a specific child's birth year
  const updateChildBirthYear = (index, year) => {
    const newYears = [...inputs.childBirthYears];
    newYears[index] = year;
    setInputs({...inputs, childBirthYears: newYears});
  };

  const calculateTaxes = (income, filingStatus, state, city) => {
    const standardDeduction = filingStatus === 'married' ? 29200 : 14600;
    const taxableIncome = Math.max(0, income - standardDeduction);

    let federalTax = 0;
    if (filingStatus === 'single') {
      if (taxableIncome <= 11600) federalTax = taxableIncome * 0.10;
      else if (taxableIncome <= 47150) federalTax = 1160 + (taxableIncome - 11600) * 0.12;
      else if (taxableIncome <= 100525) federalTax = 5426 + (taxableIncome - 47150) * 0.22;
      else if (taxableIncome <= 191950) federalTax = 17168.5 + (taxableIncome - 100525) * 0.24;
      else if (taxableIncome <= 243725) federalTax = 39110.5 + (taxableIncome - 191950) * 0.32;
      else if (taxableIncome <= 609350) federalTax = 55678.5 + (taxableIncome - 243725) * 0.35;
      else federalTax = 183647.25 + (taxableIncome - 609350) * 0.37;
    } else {
      if (taxableIncome <= 23200) federalTax = taxableIncome * 0.10;
      else if (taxableIncome <= 94300) federalTax = 2320 + (taxableIncome - 23200) * 0.12;
      else if (taxableIncome <= 201050) federalTax = 10852 + (taxableIncome - 94300) * 0.22;
      else if (taxableIncome <= 383900) federalTax = 34337 + (taxableIncome - 201050) * 0.24;
      else if (taxableIncome <= 487450) federalTax = 78221 + (taxableIncome - 383900) * 0.32;
      else if (taxableIncome <= 731200) federalTax = 111357 + (taxableIncome - 487450) * 0.35;
      else federalTax = 196669.5 + (taxableIncome - 731200) * 0.37;
    }

    const socialSecurityCap = 168600;
    const socialSecurityTax = Math.min(income, socialSecurityCap) * 0.062;
    const medicareTax = income * 0.0145;
    const additionalMedicareTax = income > (filingStatus === 'married' ? 250000 : 200000) 
      ? (income - (filingStatus === 'married' ? 250000 : 200000)) * 0.009 
      : 0;
    const ficaTax = socialSecurityTax + medicareTax + additionalMedicareTax;

    let stateTax = 0;
    if (state === 'ny') {
      const nyTaxableIncome = taxableIncome;
      if (filingStatus === 'single') {
        if (nyTaxableIncome <= 8500) stateTax = nyTaxableIncome * 0.04;
        else if (nyTaxableIncome <= 11700) stateTax = 340 + (nyTaxableIncome - 8500) * 0.045;
        else if (nyTaxableIncome <= 13900) stateTax = 484 + (nyTaxableIncome - 11700) * 0.0525;
        else if (nyTaxableIncome <= 80650) stateTax = 600 + (nyTaxableIncome - 13900) * 0.055;
        else if (nyTaxableIncome <= 215400) stateTax = 4271 + (nyTaxableIncome - 80650) * 0.06;
        else if (nyTaxableIncome <= 1077550) stateTax = 12356 + (nyTaxableIncome - 215400) * 0.0685;
        else stateTax = 71415 + (nyTaxableIncome - 1077550) * 0.0965;
      } else {
        if (nyTaxableIncome <= 17150) stateTax = nyTaxableIncome * 0.04;
        else if (nyTaxableIncome <= 23600) stateTax = 686 + (nyTaxableIncome - 17150) * 0.045;
        else if (nyTaxableIncome <= 27900) stateTax = 976 + (nyTaxableIncome - 23600) * 0.0525;
        else if (nyTaxableIncome <= 161550) stateTax = 1202 + (nyTaxableIncome - 27900) * 0.055;
        else if (nyTaxableIncome <= 323200) stateTax = 8553 + (nyTaxableIncome - 161550) * 0.06;
        else if (nyTaxableIncome <= 2155350) stateTax = 18252 + (nyTaxableIncome - 323200) * 0.0685;
        else stateTax = 143781 + (nyTaxableIncome - 2155350) * 0.0965;
      }
    }

    let cityTax = 0;
    if (city === 'nyc') {
      if (filingStatus === 'single') {
        if (income <= 12000) cityTax = income * 0.03078;
        else if (income <= 25000) cityTax = 369 + (income - 12000) * 0.03762;
        else if (income <= 50000) cityTax = 858 + (income - 25000) * 0.03819;
        else cityTax = 1813 + (income - 50000) * 0.03876;
      } else {
        if (income <= 21600) cityTax = income * 0.03078;
        else if (income <= 45000) cityTax = 665 + (income - 21600) * 0.03762;
        else if (income <= 90000) cityTax = 1545 + (income - 45000) * 0.03819;
        else cityTax = 3263 + (income - 90000) * 0.03876;
      }
    }

    return {
      federal: federalTax,
      fica: ficaTax,
      state: stateTax,
      city: cityTax,
      total: federalTax + ficaTax + stateTax + cityTax
    };
  };

  const getChildCost = (childAge, costScale, privateCollege) => {
    if (childAge < 0 || childAge > 22) return 0;

    let baseCost;
    if (childAge >= 18 && childAge <= 21) {
      // College years
      baseCost = privateCollege ? 80000 : 50000;
    } else if (childAge < 5) {
      baseCost = 20000;
    } else {
      baseCost = 15000;
    }

    return baseCost * costScale;
  };

  // Helper to generate child birth years for Scenario Explorer mode
  const generateChildYears = (firstChild, count, spacing) => {
    if (count === 0 || firstChild === -1) return [];
    return Array.from({length: count}, (_, i) => firstChild + i * spacing);
  };

  const calculateYearByYear = (retirementYear, childBirthYears) => {
    const results = [];
    let portfolio = inputs.initialPortfolio;
    const returnMultiplier = 1 + inputs.returnRate / 100;
    const max401k = 23500;
    const maxHSA = 4300;
    const maxIRA = 7000;

    for (let year = 1; year <= 100; year++) {
      const isRetired = year > retirementYear;
      const income = isRetired ? inputs.retiredIncome : inputs.workingIncome;
      const preTaxContributions = isRetired ? 0 : max401k + maxHSA;

      // Calculate total child costs from all children
      let totalChildCost = 0;
      const activeChildren = [];
      childBirthYears.forEach(birthYear => {
        const childAge = year - birthYear;
        const cost = getChildCost(childAge, inputs.childCostScale, inputs.privateCollege);
        if (cost > 0) {
          totalChildCost += cost;
          activeChildren.push(childAge);
        }
      });

      const totalSpending = inputs.baseSpending + totalChildCost;
      const taxableIncome = income - preTaxContributions;
      const taxes = calculateTaxes(taxableIncome, inputs.filingStatus, inputs.state, inputs.city);
      const iraContribution = isRetired ? 0 : maxIRA;
      const netSavings = income - preTaxContributions - taxes.total - iraContribution - totalSpending;
      portfolio = portfolio * returnMultiplier + netSavings + preTaxContributions + iraContribution;

      results.push({
        year,
        income,
        preTaxContributions,
        spending: totalSpending,
        childCost: totalChildCost,
        taxes: Math.round(taxes.total),
        iraContribution,
        netSavings: Math.round(netSavings),
        portfolio: Math.round(portfolio),
        isRetired,
        childAge: activeChildren.length > 0 ? activeChildren[0] : null, // Show first child for backward compat
        activeChildren, // Array of all active child ages
      });
    }

    return results;
  };

  // Determine which scenario to display based on mode and selection
  const displayRetirementYear = mode === 'advanced' && selectedCell
    ? selectedCell.retirementYear
    : inputs.retirementYear;

  // Determine child birth years based on mode
  let displayChildBirthYears;
  if (mode === 'advanced' && selectedCell) {
    // Scenario Explorer mode with grid selection: generate array from first child + spacing
    const firstChild = selectedCell.childBirthYear;
    displayChildBirthYears = generateChildYears(firstChild, inputs.numberOfChildren, inputs.childSpacing);
  } else {
    // Simple mode: use the stored array
    displayChildBirthYears = inputs.childBirthYears;
  }

  const allResults = calculateYearByYear(displayRetirementYear, displayChildBirthYears);
  const chartData = allResults.slice(0, 35);
  const retirementYear = allResults.find(r => r.year === displayRetirementYear);
  const portfolioRunsOut = allResults.some(r => r.isRetired && r.portfolio < 0);
  const yearRunsOut = portfolioRunsOut ? allResults.find(r => r.portfolio < 0)?.year : null;

  // Calculate sustainability metric for a scenario
  const getSustainabilityMetric = (results) => {
    const runsOut = results.find(r => r.portfolio < 0);
    if (runsOut) {
      return runsOut.year;
    }
    const year100 = results[99];
    const yearsWorth = year100.portfolio / year100.spending;
    return Math.min(100 + yearsWorth, 500);
  };

  // Calculate heatmap data - only store metrics, not full results
  const retirementYears = Array.from({length: 31}, (_, i) => i); // 0-30
  const childBirthYears = [...Array.from({length: 26}, (_, i) => i), -1]; // 0-25 then "Never"

  // Only store metrics for heatmap visualization
  const heatmapData = [];
  retirementYears.forEach(retYear => {
    childBirthYears.forEach(childYear => {
      // Generate child birth years array for this grid cell
      const cellChildBirthYears = generateChildYears(childYear, inputs.numberOfChildren, inputs.childSpacing);
      const results = calculateYearByYear(retYear, cellChildBirthYears);
      const metric = getSustainabilityMetric(results);
      heatmapData.push({
        retirementYear: retYear,
        childBirthYear: childYear,
        metric
      });
    });
  });

  // Continuous color scale function (red → yellow → green)
  const getColor = (metric) => {
    // Normalize metric to 0-1 scale
    const normalized = Math.min(Math.max((metric - 10) / 240, 0), 1); // 10-250 range

    if (normalized < 0.5) {
      // Red to Yellow (0-0.5)
      const t = normalized * 2;
      return `rgb(${Math.round(220 + (254 - 220) * t)}, ${Math.round(38 + (215 - 38) * t)}, 38)`;
    } else {
      // Yellow to Green (0.5-1.0)
      const t = (normalized - 0.5) * 2;
      return `rgb(${Math.round(254 - (254 - 34) * t)}, ${Math.round(215 + (197 - 215) * t)}, ${Math.round(38 + (94 - 38) * t)})`;
    }
  };

  // Format large numbers as "1M", "500k", etc.
  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value}`;
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border-2 border-gray-300 rounded shadow-lg">
          <p className="font-semibold text-sm mb-1">Year {label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">FIRE Calculator MVP</h1>
        <button
          onClick={resetToDefaults}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Reset to defaults
        </button>
      </div>

      {/* Mode Toggle */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setMode('simple')}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            mode === 'simple'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Simple Mode
        </button>
        <button
          onClick={() => setMode('advanced')}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            mode === 'advanced'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Scenario Explorer
        </button>
      </div>

      <div className="grid grid-cols-5 gap-3 mb-6 bg-gray-50 p-4 rounded-lg text-sm">
        {/* Income + Spending */}
        <div className="col-span-2 text-xs font-bold text-gray-800 uppercase tracking-wide mt-0 mb-1 pb-1 border-b-2 border-gray-500">
          Income
        </div>
        <div className="col-span-3 text-xs font-bold text-gray-800 uppercase tracking-wide mt-0 mb-1 pb-1 border-b-2 border-gray-500">
          Spending
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Working Income</label>
          <input
            type="number"
            step="1000"
            value={inputs.workingIncome}
            onChange={(e) => setInputs({...inputs, workingIncome: Number(e.target.value)})}
            className="w-full p-1.5 border rounded text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Retired Income</label>
          <input
            type="number"
            step="1000"
            value={inputs.retiredIncome}
            onChange={(e) => setInputs({...inputs, retiredIncome: Number(e.target.value)})}
            className="w-full p-1.5 border rounded text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Base Annual Spending</label>
          <input
            type="number"
            step="1000"
            value={inputs.baseSpending}
            onChange={(e) => setInputs({...inputs, baseSpending: Number(e.target.value)})}
            className="w-full p-1.5 border rounded text-sm"
          />
        </div>

        {/* Empty spacers to complete the row */}
        <div></div>
        <div></div>

        {/* Portfolio + Taxes */}
        <div className="col-span-2 text-xs font-bold text-gray-800 uppercase tracking-wide mt-2 mb-1 pb-1 border-b-2 border-gray-500">
          Portfolio
        </div>
        <div className="col-span-3 text-xs font-bold text-gray-800 uppercase tracking-wide mt-2 mb-1 pb-1 border-b-2 border-gray-500">
          Taxes
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Initial Portfolio</label>
          <input
            type="number"
            step="10000"
            value={inputs.initialPortfolio}
            onChange={(e) => setInputs({...inputs, initialPortfolio: Number(e.target.value)})}
            className="w-full p-1.5 border rounded text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Return Rate (% real)</label>
          <input
            type="number"
            value={inputs.returnRate}
            onChange={(e) => setInputs({...inputs, returnRate: Number(e.target.value)})}
            className="w-full p-1.5 border rounded text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Filing Status</label>
          <select
            value={inputs.filingStatus}
            onChange={(e) => setInputs({...inputs, filingStatus: e.target.value})}
            className="w-full p-1.5 border rounded text-sm"
          >
            <option value="single">Single</option>
            <option value="married">Married</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">State</label>
          <select
            value={inputs.state}
            onChange={(e) => setInputs({...inputs, state: e.target.value})}
            className="w-full p-1.5 border rounded text-sm"
          >
            <option value="ny">New York</option>
            <option value="none">No State Tax</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">City</label>
          <select
            value={inputs.city}
            onChange={(e) => setInputs({...inputs, city: e.target.value})}
            className="w-full p-1.5 border rounded text-sm"
          >
            <option value="nyc">NYC</option>
            <option value="none">No City Tax</option>
          </select>
        </div>

        {/* Timeline + Children */}
        <div className="col-span-1 text-xs font-bold text-gray-800 uppercase tracking-wide mt-2 mb-1 pb-1 border-b-2 border-gray-500">
          Timeline
        </div>
        <div className="col-span-4 text-xs font-bold text-gray-800 uppercase tracking-wide mt-2 mb-1 pb-1 border-b-2 border-gray-500">
          Children
        </div>
        {/* Timeline - Simple mode */}
        {mode === 'simple' && (
          <div>
            <label className="block text-xs font-medium mb-1">Retirement Year</label>
            <input
              type="number"
              value={inputs.retirementYear}
              onChange={(e) => setInputs({...inputs, retirementYear: Number(e.target.value)})}
              className="w-full p-1.5 border rounded text-sm"
            />
          </div>
        )}

        {/* Timeline - Scenario Explorer mode */}
        {mode === 'advanced' && (
          <div className="bg-gray-100 p-2 rounded">
            <div className="flex items-center justify-between mb-0.5">
              <label className="text-xs font-medium text-gray-600">Retirement Year</label>
              <span className="text-xs text-gray-500 italic">Grid controlled</span>
            </div>
            <div className="text-base font-semibold text-gray-700">
              {selectedCell ? selectedCell.retirementYear : inputs.retirementYear}
            </div>
          </div>
        )}

        {/* Children - Simple mode */}
        {mode === 'simple' && (
          <>
            <div>
              <label className="block text-xs font-medium mb-1">Number of Children</label>
              <select
                value={inputs.numberOfChildren}
                onChange={(e) => updateNumberOfChildren(Number(e.target.value))}
                className="w-full p-1.5 border rounded text-sm"
              >
                {[0, 1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {inputs.numberOfChildren > 0 && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1">Cost Level</label>
                  <select
                    value={inputs.childCostScale}
                    onChange={(e) => setInputs({...inputs, childCostScale: Number(e.target.value)})}
                    className="w-full p-1.5 border rounded text-sm"
                  >
                    <option value={0.5}>Minimal</option>
                    <option value={0.75}>Basic</option>
                    <option value={1.0}>Standard</option>
                    <option value={1.5}>Comfortable</option>
                    <option value={2.0}>Premium</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={inputs.privateCollege}
                    onChange={(e) => setInputs({...inputs, privateCollege: e.target.checked})}
                    className="mr-2"
                  />
                  <label className="text-xs font-medium">Private College</label>
                </div>

                {inputs.childBirthYears.map((year, index) => (
                  <div key={index}>
                    <label className="block text-xs font-medium mb-1">Child {index + 1} Birth Year</label>
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => updateChildBirthYear(index, Number(e.target.value))}
                      className="w-full p-1.5 border rounded text-sm"
                    />
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {mode === 'advanced' && (
          <>
            <div>
              <label className="block text-xs font-medium mb-1">Number of Children</label>
              <select
                value={inputs.numberOfChildren}
                onChange={(e) => updateNumberOfChildren(Number(e.target.value))}
                className="w-full p-1.5 border rounded text-sm"
              >
                {[0, 1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {inputs.numberOfChildren > 0 && (
              <>
                <div className="bg-gray-100 p-2 rounded">
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-xs font-medium text-gray-600">First Child Year</label>
                    <span className="text-xs text-gray-500 italic">Grid controlled</span>
                  </div>
                  <div className="text-base font-semibold text-gray-700">
                    {selectedCell
                      ? (selectedCell.childBirthYear === -1 ? 'Never' : selectedCell.childBirthYear)
                      : (inputs.childBirthYears.length > 0 ? inputs.childBirthYears[0] : 0)
                    }
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Child Spacing (years)</label>
                  <input
                    type="number"
                    value={inputs.childSpacing}
                    onChange={(e) => setInputs({...inputs, childSpacing: Number(e.target.value)})}
                    className="w-full p-1.5 border rounded text-sm"
                    min="1"
                    max="10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Cost Level</label>
                  <select
                    value={inputs.childCostScale}
                    onChange={(e) => setInputs({...inputs, childCostScale: Number(e.target.value)})}
                    className="w-full p-1.5 border rounded text-sm"
                  >
                    <option value={0.5}>Minimal</option>
                    <option value={0.75}>Basic</option>
                    <option value={1.0}>Standard</option>
                    <option value={1.5}>Comfortable</option>
                    <option value={2.0}>Premium</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={inputs.privateCollege}
                    onChange={(e) => setInputs({...inputs, privateCollege: e.target.checked})}
                    className="mr-2"
                  />
                  <label className="text-xs font-medium">Private College</label>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {mode === 'simple' ? (
        // Simple mode: stacked layout
        <>
          {retirementYear && (
            <div className="mb-6 p-3 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">At Retirement (Year {displayRetirementYear})</h2>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-xs text-gray-600">Portfolio Value</div>
                  <div className="text-base font-bold">${retirementYear.portfolio.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Annual Spending</div>
                  <div className="text-base font-bold">${retirementYear.spending.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Sustainability</div>
                  <div className={`text-base font-bold ${portfolioRunsOut ? 'text-red-600' : 'text-green-600'}`}>
                    {portfolioRunsOut ? `✗ Runs out year ${yearRunsOut}` : '✓ Sustainable'}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Portfolio Growth & Annual Spending</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData} margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis
                  yAxisId="left"
                  tickFormatter={formatCurrency}
                  tick={{ fill: '#2563eb' }}
                  label={{ value: 'Portfolio', angle: -90, position: 'left', style: { textAnchor: 'middle', fill: '#2563eb' } }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={formatCurrency}
                  tick={{ fill: '#16a34a' }}
                  label={{ value: 'Spending', angle: 90, position: 'right', style: { textAnchor: 'middle', fill: '#16a34a' } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="portfolio" stroke="#2563eb" strokeWidth={2} name="Portfolio" />
                <Line yAxisId="right" type="monotone" dataKey="spending" stroke="#16a34a" strokeWidth={2} name="Annual Spending" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        // Scenario Explorer mode: side-by-side layout with grid
        <div className="mb-6 flex gap-4">
          <div className="flex-shrink-0">
            <h2 className="text-base font-semibold mb-1">Scenario Explorer</h2>
            <div className="text-xs text-gray-600 mb-1">
              Click cells: <span className="text-red-600">■</span> Runs out → <span className="text-yellow-600">■</span> Marginal → <span className="text-green-600">■</span> Sustainable
            </div>
            <SVGHeatmap
              data={heatmapData}
              retirementYears={retirementYears}
              childBirthYears={childBirthYears}
              getColor={getColor}
              selectedCell={selectedCell}
              onCellClick={(retYear, childYear) => {
                setSelectedCell({ retirementYear: retYear, childBirthYear: childYear });
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            {retirementYear && (
              <div className="mb-2 p-2 bg-blue-50 rounded-lg">
                <h2 className="text-sm font-semibold mb-1">At Retirement (Year {displayRetirementYear})</h2>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-gray-600">Portfolio</div>
                    <div className="text-sm font-bold">${retirementYear.portfolio.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Spending</div>
                    <div className="text-sm font-bold">${retirementYear.spending.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Sustainability</div>
                    <div className={`text-sm font-bold ${portfolioRunsOut ? 'text-red-600' : 'text-green-600'}`}>
                      {portfolioRunsOut ? `✗ Year ${yearRunsOut}` : '✓ 100 yrs'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h2 className="text-base font-semibold mb-1">Portfolio Growth & Spending</h2>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData} margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" tick={{fontSize: 11}} />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: '#2563eb' }}
                    tickFormatter={formatCurrency}
                    animationDuration={500}
                    label={{ value: 'Portfolio', angle: -90, position: 'left', style: { textAnchor: 'middle', fontSize: 12, fill: '#2563eb' } }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: '#16a34a' }}
                    tickFormatter={formatCurrency}
                    animationDuration={500}
                    label={{ value: 'Spending', angle: 90, position: 'right', style: { textAnchor: 'middle', fontSize: 12, fill: '#16a34a' } }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{fontSize: 12}} />
                  <Line yAxisId="left" type="monotone" dataKey="portfolio" stroke="#2563eb" strokeWidth={2} name="Portfolio" animationDuration={500} />
                  <Line yAxisId="right" type="monotone" dataKey="spending" stroke="#16a34a" strokeWidth={2} name="Spending" animationDuration={500} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">
          Year-by-Year Details
          {mode === 'advanced' && selectedCell && (
            <span className="text-base font-normal text-gray-600 ml-2">
              (Showing: Retire Year {selectedCell.retirementYear},
              Child {selectedCell.childBirthYear === -1 ? 'Never' : `Year ${selectedCell.childBirthYear}`})
            </span>
          )}
        </h2>
        <div className="overflow-x-auto overflow-y-auto max-h-96 border border-gray-300 rounded">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr>
                <th className="border p-2">Year</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Income</th>
                <th className="border p-2">Pre-Tax</th>
                <th className="border p-2">Spending</th>
                <th className="border p-2">Child Cost</th>
                <th className="border p-2">Taxes</th>
                <th className="border p-2">IRA</th>
                <th className="border p-2">Net Savings</th>
                <th className="border p-2">Portfolio</th>
              </tr>
            </thead>
            <tbody>
              {allResults.map((row) => (
                <tr key={row.year} className={row.isRetired ? 'bg-blue-50' : row.portfolio < 0 ? 'bg-red-50' : ''}>
                  <td className="border p-2 text-center">{row.year}</td>
                  <td className="border p-2 text-center">
                    {row.isRetired ? '🏖️' : '💼'}
                    {row.childAge !== null && ` 👶${row.childAge}`}
                  </td>
                  <td className="border p-2 text-right">${row.income.toLocaleString()}</td>
                  <td className="border p-2 text-right">${row.preTaxContributions.toLocaleString()}</td>
                  <td className="border p-2 text-right">${row.spending.toLocaleString()}</td>
                  <td className="border p-2 text-right">${row.childCost.toLocaleString()}</td>
                  <td className="border p-2 text-right">${row.taxes.toLocaleString()}</td>
                  <td className="border p-2 text-right">${row.iraContribution.toLocaleString()}</td>
                  <td className={`border p-2 text-right ${row.netSavings < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${row.netSavings.toLocaleString()}
                  </td>
                  <td className={`border p-2 text-right font-semibold ${row.portfolio < 0 ? 'text-red-600' : ''}`}>
                    ${row.portfolio.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p><strong>Note:</strong> This is a pure simulation - no withdrawal rate assumptions.</p>
        <ul className="list-disc ml-6 mt-2">
          <li>401(k): $23,500/year, HSA: $4,300/year, IRA: $7,000/year (2025 limits)</li>
          <li>Child costs: $20k (age 0-4), $15k (age 5-17), $50k state/$80k private (college, age 18-21), scalable by lifestyle level</li>
          <li>Real returns (after inflation): {inputs.returnRate}%</li>
          <li>All values in "today's dollars" - inflation-adjusted throughout</li>
          <li>Portfolio continues to grow/shrink based on returns vs. spending</li>
          <li>Tax calculations are simplified approximations</li>
        </ul>
      </div>
    </div>
  );
};

export default FIRECalculator;