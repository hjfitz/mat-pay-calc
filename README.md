# IBM UK Maternity Pay Planner

A small client-side calculator for estimating maternity leave pay under an IBM UK-style enhanced maternity policy.

The app is designed for planning from take-home pay rather than modelling PAYE directly. Enter your average monthly pay after deductions, your regular monthly commitments, and your leave start date. The calculator estimates monthly leave income, money left over, and total shortfall across 12 months.

## Policy Assumptions

The current calculator encodes this enhanced maternity pay profile:

| Leave period | Rate |
| --- | ---: |
| Weeks 1-6 | 100% |
| Weeks 7-26 | 60% |
| Weeks 27-39 | 50% |
| Weeks 40-52 | 40% |

Monthly pay is calculated like salaried pay, not by counting 4-week or 5-week months. Full months at one rate use `monthly take-home * rate`; crossover months are prorated by calendar day across the relevant rates.

## Important Caveats

This is a planning estimate, not payroll advice.

- The app uses your supplied take-home pay and does not calculate UK tax, NI, pension, student loan, or salary sacrifice.
- The SMP floor is approximated in displayed take-home terms. In real payroll, SMP is statutory gross pay and PAYE can vary.
- Tax bands, NI rates, statutory maternity rates, pension deductions, student loan thresholds, and employer policy can change.
- Monthly commitments are assumed to remain flat throughout leave.
- Data is stored only in your browser localStorage and is not sent to a server.

## Features

- 12-month maternity pay timeline
- Monthly crossover handling for policy rate changes
- Monthly commitments and money-left-over calculation
- Total shortfall summary
- Copy CSV and Save CSV export
- Mobile-friendly chart layout
- PWA build via Vite
- Netlify deploy config

## Development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Run tests:

```bash
npm run test:run
```

Build for production:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Netlify

This repo includes `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

Netlify can deploy directly from GitHub using the default build settings from that file.
