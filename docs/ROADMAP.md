# Roadmap

## Phase 1: Planning Files

Goal:

- Define repository structure.
- Define backend structure.
- Define SQL structure.
- Define first workflow.
- Keep frontend and mobile as placeholders.

Status:

- Planned in branch `docs/v1.2-planning`.

## Phase 2: Backend Skeleton

Goal:

- Create ASP.NET Core Web API project.
- Add folder structure.
- Add entities, enums, DTOs.
- Add DbContext and EF configurations.
- Add service and repository interfaces.
- Add basic dependency injection.

Modules:

- Devices
- Users
- DeviceAssignments

## Phase 3: SQL Initial Design

Goal:

- Create initial schema script.
- Create development seed data.
- Align SQL table names with EF Core entities.

Tables:

- Departments
- Users
- Devices
- DeviceAssignments
- DeviceHistories

## Phase 4: Assignment Workflow

Goal:

- Implement assign device.
- Implement accept assignment.
- Implement reject assignment.
- Implement return device.
- Implement revoke assignment.
- Implement device status recalculation.
- Write device history.

## Phase 5: API Hardening

Goal:

- Add validation.
- Add exception middleware.
- Standardize API response.
- Add pagination and filtering.
- Add basic authorization rules.

## Phase 6: Frontend

Goal:

- Build React UI after backend workflow is stable.
- Start with Devices, Users, and DeviceAssignments screens.

## Phase 7: Mobile

Goal:

- Build mobile flow after backend and frontend are stable.
- Focus on user assignment accept/reject flow first.
