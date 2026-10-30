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

Status:

- Deferred until the web workflow and its access rules are verified end to end.

## Phase 8: Complete Core Workflow

Goal:

- Close correctness and access-control gaps in the existing Dashboard, Users, Devices, and DeviceAssignments modules.
- Keep this phase limited to the existing core modules.

Scope:

- Enforce assignment-list visibility in the backend:
  - Admin can view all assignments.
  - Employee can view only assignments belonging to the authenticated user.
  - Query parameters must not allow an Employee to view another user's assignments.
- Ensure Dashboard statistics represent all matching records, not only the first page returned by list APIs.
- Review assignment actions and confirm that role and ownership checks are enforced by the backend.

Acceptance criteria:

- Verify Admin and Employee behavior through API requests using separate local test accounts.
- Confirm that changing or omitting `userId` in an Employee request does not expose other users' assignments.
- Confirm Dashboard totals remain correct when records exceed one page.
- Backend and frontend builds succeed.
- Browser checks cover the affected flows; record console and network errors.
- Update this roadmap with verified results. Do not mark the phase complete if a required check is blocked.

Out of scope:

- New business modules.
- Replacing the existing authentication or role model.
- Database reset or destructive migrations.

## Phase 9: Device History

Goal:

- Provide a reliable history view for each device using the existing DeviceHistories data.

Scope:

- Review which device operations currently write history and identify missing events.
- Ensure create/update, assignment, accept/reject, return/revoke, and relevant status changes are recorded consistently.
- Add a read API and a device history screen with pagination and stable chronological ordering.
- Apply authorization so users can view history only for devices they are allowed to access.

Acceptance criteria:

- Each supported operation creates the expected history entry with actor, timestamp, action, and relevant status change.
- The history screen displays entries for one device in a stable order and handles empty results.
- API and browser checks cover Admin and Employee access.
- Existing device and assignment workflows continue to work.
- Update this roadmap with verified results. Do not mark the phase complete if a required check is blocked.

## Later Module Candidates

Keep these as future candidates. Do not include them in Phases 8 or 9:

- Device categories and models.
- Department management.
- Incident reporting.
- Repair and maintenance workflow.
- Notifications and reporting.
- Replacement, liquidation, and mobile QR flows.

Before starting a candidate, define its business workflow, roles and permissions, data changes, and acceptance criteria in its own milestone plan.
