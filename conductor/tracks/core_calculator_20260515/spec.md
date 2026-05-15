# Specification - Build core maternity pay calculator functionality

## Overview
This track focuses on building the MVP of the Maternity Pay Calculator. It includes setting up the development environment, implementing the core calculation logic, creating an interactive dashboard with data visualization, and ensuring the app works as a PWA with local persistence.

## Objectives
- Initialize a React (TypeScript) PWA using Vite.
- Implement precise maternity pay calculation logic based on user-provided rules.
- Create a user-friendly, responsive dashboard with real-time updates.
- Provide visual feedback via interactive graphs (Victory/ApexCharts).
- Allow users to save their calculations locally.

## Scope
- **Scaffolding**: Vite, Tailwind CSS, Vitest.
- **State Management**: Zustand for global state.
- **Logic**: A pure TypeScript engine for maternity pay calculations.
- **UI**: Input forms for salary/policy, results dashboard, payment timeline chart.
- **Persistence**: LocalStorage for saving/loading calculations.
- **PWA**: Manifest, service worker, offline support.

## Constraints
- **Client-Side Only**: No backend required for MVP.
- **Security**: Salary data must not be sent to any external server.
- **Performance**: Instant calculation updates on input change.
- **Mobile First**: Optimized for mobile devices.

## Acceptance Criteria
- App is installable as a PWA.
- Users can enter a monthly pre-tax salary.
- Users can see a monthly breakdown of payments for 12 months.
- A graph correctly visualizes the payment timeline.
- Calculations match the provided ruleset (to be implemented).
- Data persists across browser refreshes.
- Test coverage for core logic exceeds 80%.
