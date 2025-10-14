# FIRE Calculator

A comprehensive financial independence calculator for exploring retirement scenarios, including children, part-time work, and various life paths.

## Project Context

### The Problem
We wanted to answer questions like:
- "How long until I can retire?"
- "What if I have a kid - how does that change the timeline?"
- "Can I do 'Barista FIRE' - retire early but work part-time?"
- "What's the tradeoff between having kids earlier vs. later and retirement timing?"

These questions quickly become mathematically complex due to:
1. **Piecewise tax functions** - progressive tax brackets, FICA caps, state/local taxes
2. **Variable spending over time** - child costs change by age (childcare → school → college)
3. **Multiple decision variables** - retirement timing, kid timing, post-retirement income
4. **Compound growth** - portfolio returns during accumulation phase

**Key insight:** This is not analytically solvable. We need numerical simulation.

### The Solution
Build a simulator that:
1. **MVP (current):** Single scenario, year-by-year table showing all calculations
2. **Phase 2:** Interactive 2D visualization of retirement timing vs. kid timing
3. **Phase 3:** Optimization and comparison tools

## What We've Built (MVP)

### Features
- Year-by-year financial simulation
- Tax calculations (Federal, FICA, State, City)
- Retirement contributions (401k, HSA, IRA)
- Child cost modeling (age-dependent)
- Portfolio growth simulation
- Visual portfolio growth chart
- Clear indication of when retirement is feasible

### Inputs
- **Working income** - Annual gross income while working
- **Retired income** - Annual income during retirement (for "Barista FIRE" scenarios)
- **Base spending** - Annual living expenses (before child costs)
- **Retirement year** - Target year to retire
- **Filing status** - Single or Married
- **Location** - State and city (for tax calculations)
- **Return rate** - Real investment returns (after inflation)
- **Withdrawal rate** - Safe withdrawal rate (typically 4%)
- **Child inclusion** - Whether to include a child and birth year

### Calculations

#### Pre-Tax Contributions (Working Years Only)
- 401(k): $23,500/year
- HSA: $4,300/year
- Total: $27,800/year reduces taxable income

#### After-Tax Contributions (Working Years Only)
- Roth IRA: $7,000/year (from after-tax income)

#### Child Costs by Age
- **Age 0-4:** $20,000/year (childcare + basic needs)
- **Age 5-17:** $15,000/year (school-age child)
- **Age 18-21:** $50,000/year (college)
- **Age 22+:** $0 (independent)

#### Tax Calculations
Simplified but reasonable approximations:
- **Federal:** Progressive brackets with standard deduction
- **FICA:** Social Security (6.2% up to $168,600) + Medicare (1.45% + 0.9% above threshold)
- **NY State:** Progressive brackets
- **NYC:** Progressive brackets

#### Portfolio Growth
```
Portfolio[year+1] = Portfolio[year] × (1 + return_rate) + Net_Savings[year]

where:
Net_Savings = Income - Pre_Tax_Contributions - Taxes - IRA - Spending
```

#### Required Nest Egg
```
Required_Nest_Egg = Annual_Spending / Withdrawal_Rate

Example: $90k spending / 4% = $2.25M nest egg needed
```

### The 4% Rule
Based on the Trinity Study - historically, withdrawing 4% annually (adjusted for inflation) has sustained portfolios for 30+ years in virtually all market conditions.

## What We Want to Build Next

### Phase 2: Interactive 2D Visualization
**Goal:** Explore the tradeoff space between retirement timing and kid timing

**Features:**
- 2D grid/heatmap showing feasibility
  - X-axis: Retirement year
  - Y-axis: Child birth year
  - Color: Green (feasible), Yellow (tight), Red (infeasible)
- Click any point → shows detailed year-by-year table for that scenario
- Contour lines showing "nest egg required"

**Why this is valuable:**
- Visualize the entire solution space
- See how delaying kids OR delaying retirement affects outcomes
- Understand tradeoffs intuitively

### Phase 3: Multi-Scenario Comparison
- Compare 2-3 scenarios side-by-side
- Show cumulative differences
- Highlight key tradeoffs

### Phase 4: Optimization
- "What's the earliest I can retire given...?"
- "What's the optimal kid timing for retirement by year X?"
- Multiple objectives (minimize work years, maximize kid budget, etc.)

## Technical Details

### Current Tech Stack
- React (functional components with hooks)
- Recharts for visualization
- Tailwind CSS for styling
- Pure JavaScript calculations (no external finance libraries)

### Key Assumptions
1. **Real returns:** Default 7% (after inflation)
   - Historical S&P 500: ~10% nominal, ~7% real
2. **Withdrawal rate:** Default 4%
   - Based on Trinity Study
3. **Tax rates:** 2025 brackets
4. **Contribution limits:** 2025 limits
5. **No inflation in spending:** Using "real" dollars throughout
6. **Constant income:** Same salary every year while working
7. **No inheritance, windfalls, or major unexpected expenses**

### Known Simplifications
- Tax calculations are approximations (don't account for all deductions, credits)
- Child costs are averages (actual costs vary widely)
- No modeling of healthcare costs (significant for early retirees!)
- No social security projections
- No pension or other income sources
- Portfolio returns are smooth (no sequence of returns risk)
- No consideration of housing (rent vs buy, housing appreciation)

## Example Scenarios

### Single Person, NYC, $200k Income
- Base spending: $65k
- Saves ~$64k/year
- Reaches $1.7M (full retirement) in ~15 years

### Couple, NYC, $200k Each
- Combined spending: $90k (economies of scale)
- Saves ~$159k/year
- Reaches $2.25M (full retirement) in ~11 years

### Couple, NYC, $200k Each, 1 Kid at Year 5
- Spending: $90k base + $18k child (ages 0-17) + $50k college (ages 18-21)
- Reaches $2.625M in ~12 years (planning for average spending)

### Barista FIRE: Couple, $25k Each Part-Time
- Can retire with $1.16M (covers $46.5k from nest egg)
- Reachable in ~6 years at high savings rate

## How to Use This README with Claude Code

When starting Claude Code, share this README and say something like:

> "I have a FIRE calculator MVP in a React component. The README explains the full context. I'd like to:
> 1. [Specific improvement or feature]
> 2. [Next thing you want to build]
>
> The current code is in [filename]. Let's start by [specific first step]."

## Files Structure
```
fire-calculator/
├── README.md (this file)
├── src/
│   ├── FIRECalculator.jsx (main MVP component)
│   └── [future components]
```

## Questions to Explore with Claude Code

1. **Better tax modeling** - Can we make taxes more accurate without overcomplicating?
2. **Healthcare costs** - How do we model pre-Medicare healthcare for early retirees?
3. **Multiple children** - How to handle variable number of kids with different birth years?
4. **2D visualization** - What's the best way to show the feasibility space?
5. **Performance** - Can we efficiently compute 100+ scenarios for the 2D heatmap?
6. **Export/save scenarios** - How do users save and share their plans?

## Key Insights from Our Exploration

1. **Taxes are the biggest variable** - NYC vs. no-tax state is $40-50k difference
2. **Kids add ~$1M to nest egg** - But costs are spread over time, not lump sum
3. **Barista FIRE is powerful** - Small income drastically reduces nest egg needed
4. **Couples benefit hugely** - Economies of scale reduce per-person costs by ~30%
5. **Timing matters** - Having kids while working (childcare costs) vs. retired (opportunity cost) creates different paths

## Contributing

This is a personal project, but if you're building on it:
- Keep calculations transparent and verifiable
- Add sources for any financial rules/limits
- Test edge cases (very high/low income, multiple kids, etc.)
- Document assumptions clearly

## License

MIT or whatever makes sense for a personal calculator project.

---

**Bottom line:** We want to help people answer "when can I retire?" while accounting for real-world complexity (taxes, kids, life choices). Start simple, add sophistication where it matters, keep it transparent.