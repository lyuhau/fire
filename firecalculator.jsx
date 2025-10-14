import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SVGHeatmap = ({ data, retirementYears, childBirthYears, getColor, selectedCell, onCellClick }) => {
  const [hoveredCell, setHoveredCell] = useState(null);

  const width = 800;
  const height = 600;
  const marginLeft = 80;
  const marginRight = 40;
  const marginTop = 40;
  const marginBottom = 80;

  const plotWidth = width - marginLeft - marginRight;
  const plotHeight = height - marginTop - marginBottom;

  const cellWidth = plotWidth / retirementYears.length;
  const cellHeight = plotHeight / childBirthYears.length;

  const xScale = (retYear) => marginLeft + (retYear - 5) * cellWidth;
  // Reverse Y-axis: 0 at bottom, 25 at top, -1 (no child) above 25
  const yScale = (childYear) => {
    if (childYear === -1) {
      return marginTop; // No child at the top
    }
    return height - marginBottom - (childYear + 1) * cellHeight; // 0 at bottom, 25 near top
  };

  return (
    <div className="relative">
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
          {[5, 10, 15, 20, 25, 30].map(year => (
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
                {year === -1 ? 'None' : year}
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
            Child: {hoveredCell.childBirthYear === -1 ? 'None' : `Year ${hoveredCell.childBirthYear}`}
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
  const [inputs, setInputs] = useState({
    workingIncome: 200000,
    retiredIncome: 0,
    baseSpending: 65000,
    retirementYear: 15,
    childBirthYear: 0,
    filingStatus: 'single',
    state: 'ny',
    city: 'nyc',
    returnRate: 7,
    includeChild: false,
  });

  const [selectedCell, setSelectedCell] = useState(null);

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

  const getChildCost = (childAge) => {
    if (childAge < 0 || childAge > 22) return 0;
    if (childAge >= 18 && childAge <= 21) return 50000;
    if (childAge < 5) return 20000;
    return 15000;
  };

  const calculateYearByYear = (retirementYear, childBirthYear, includeChild) => {
    const results = [];
    let portfolio = 0;
    const returnMultiplier = 1 + inputs.returnRate / 100;
    const max401k = 23500;
    const maxHSA = 4300;
    const maxIRA = 7000;
    
    for (let year = 1; year <= 100; year++) {
      const isRetired = year > retirementYear;
      const income = isRetired ? inputs.retiredIncome : inputs.workingIncome;
      const preTaxContributions = isRetired ? 0 : max401k + maxHSA;
      const childAge = includeChild ? year - childBirthYear : -1;
      const childCost = getChildCost(childAge);
      const totalSpending = inputs.baseSpending + childCost;
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
        childCost,
        taxes: Math.round(taxes.total),
        iraContribution,
        netSavings: Math.round(netSavings),
        portfolio: Math.round(portfolio),
        isRetired,
        childAge: childAge >= 0 ? childAge : null,
      });
    }
    
    return results;
  };

  const allResults = calculateYearByYear(inputs.retirementYear, inputs.childBirthYear, inputs.includeChild);
  const chartData = allResults.slice(0, 35);
  const retirementYear = allResults.find(r => r.year === inputs.retirementYear);
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
  const retirementYears = Array.from({length: 26}, (_, i) => i + 5); // 5-30
  const childBirthYears = [...Array.from({length: 26}, (_, i) => i), -1]; // 0-25 then "none"

  // Only store metrics for heatmap visualization
  const heatmapData = [];
  retirementYears.forEach(retYear => {
    childBirthYears.forEach(childYear => {
      const results = calculateYearByYear(retYear, childYear, childYear >= 0);
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

  // Calculate selected cell data on-demand
  const selectedCellData = selectedCell ? {
    ...selectedCell,
    results: calculateYearByYear(selectedCell.retirementYear, selectedCell.childBirthYear, selectedCell.childBirthYear >= 0),
    metric: heatmapData.find(d =>
      d.retirementYear === selectedCell.retirementYear &&
      d.childBirthYear === selectedCell.childBirthYear
    )?.metric
  } : null;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">FIRE Calculator MVP</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 bg-gray-50 p-6 rounded-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Working Income</label>
          <input
            type="number"
            value={inputs.workingIncome}
            onChange={(e) => setInputs({...inputs, workingIncome: Number(e.target.value)})}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Retired Income</label>
          <input
            type="number"
            value={inputs.retiredIncome}
            onChange={(e) => setInputs({...inputs, retiredIncome: Number(e.target.value)})}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Base Annual Spending</label>
          <input
            type="number"
            value={inputs.baseSpending}
            onChange={(e) => setInputs({...inputs, baseSpending: Number(e.target.value)})}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Retirement Year</label>
          <input
            type="number"
            value={inputs.retirementYear}
            onChange={(e) => setInputs({...inputs, retirementYear: Number(e.target.value)})}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Filing Status</label>
          <select
            value={inputs.filingStatus}
            onChange={(e) => setInputs({...inputs, filingStatus: e.target.value})}
            className="w-full p-2 border rounded"
          >
            <option value="single">Single</option>
            <option value="married">Married</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">State</label>
          <select
            value={inputs.state}
            onChange={(e) => setInputs({...inputs, state: e.target.value})}
            className="w-full p-2 border rounded"
          >
            <option value="ny">New York</option>
            <option value="none">No State Tax</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <select
            value={inputs.city}
            onChange={(e) => setInputs({...inputs, city: e.target.value})}
            className="w-full p-2 border rounded"
          >
            <option value="nyc">NYC</option>
            <option value="none">No City Tax</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Return Rate (% real)</label>
          <input
            type="number"
            value={inputs.returnRate}
            onChange={(e) => setInputs({...inputs, returnRate: Number(e.target.value)})}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={inputs.includeChild}
            onChange={(e) => setInputs({...inputs, includeChild: e.target.checked})}
            className="mr-2"
          />
          <label className="text-sm font-medium">Include Child</label>
        </div>
        
        {inputs.includeChild && (
          <div>
            <label className="block text-sm font-medium mb-1">Child Birth Year</label>
            <input
              type="number"
              value={inputs.childBirthYear}
              onChange={(e) => setInputs({...inputs, childBirthYear: Number(e.target.value)})}
              className="w-full p-2 border rounded"
            />
          </div>
        )}
      </div>

      {retirementYear && (
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">At Retirement (Year {inputs.retirementYear})</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600">Portfolio Value</div>
              <div className="text-lg font-bold">${retirementYear.portfolio.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Annual Spending</div>
              <div className="text-lg font-bold">${retirementYear.spending.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Sustainability</div>
              <div className={`text-lg font-bold ${portfolioRunsOut ? 'text-red-600' : 'text-green-600'}`}>
                {portfolioRunsOut ? `✗ Runs out year ${yearRunsOut}` : '✓ Sustainable (100 yrs)'}
              </div>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            Simulation shows portfolio trajectory for 100 years. All values in today's dollars (inflation-adjusted).
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Portfolio Growth & Annual Spending</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="portfolio" stroke="#2563eb" strokeWidth={2} name="Portfolio" />
            <Line yAxisId="right" type="monotone" dataKey="spending" stroke="#16a34a" strokeWidth={2} name="Annual Spending" />
          </LineChart>
        </ResponsiveContainer>
        <div className="text-xs text-gray-500 mt-1">
          Chart shows first 35 years. Full 100-year simulation runs in background for sustainability check.
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Scenario Explorer: Retirement Year vs Child Birth Year</h2>
        <div className="text-sm text-gray-600 mb-4">
          Click any cell to see detailed year-by-year breakdown. Colors show sustainability (continuous gradient):
          <span className="ml-2">🔴 Runs out quickly</span>
          <span className="ml-2">→ 🟡 Marginal →</span>
          <span className="ml-2">🟢 Sustainable</span>
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

      {selectedCellData && (
        <div className="mb-8 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-400">
          <h3 className="text-lg font-semibold mb-2">
            Selected Scenario: Retire Year {selectedCellData.retirementYear}, 
            Child {selectedCellData.childBirthYear === -1 ? 'None' : `Year ${selectedCellData.childBirthYear}`}
          </h3>
          <div className="text-sm">
            <strong>Sustainability:</strong> {
              selectedCellData.metric < 100 
                ? `❌ Runs out at year ${selectedCellData.metric.toFixed(0)}`
                : `✅ Sustainable (${selectedCellData.metric.toFixed(0)} years worth at year 100)`
            }
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">
          Year-by-Year Details 
          {selectedCellData && (
            <span className="text-base font-normal text-gray-600 ml-2">
              (Showing selected scenario: Retire {selectedCellData.retirementYear}, 
              Child {selectedCellData.childBirthYear === -1 ? 'None' : selectedCellData.childBirthYear})
            </span>
          )}
        </h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
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
            {(selectedCellData?.results || allResults).map((row) => (
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

      <div className="mt-6 text-sm text-gray-600">
        <p><strong>Note:</strong> This is a pure simulation - no withdrawal rate assumptions.</p>
        <ul className="list-disc ml-6 mt-2">
          <li>401(k): $23,500/year, HSA: $4,300/year, IRA: $7,000/year (2025 limits)</li>
          <li>Child costs: $20k (age 0-4), $15k (age 5-17), $50k (college, age 18-21)</li>
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