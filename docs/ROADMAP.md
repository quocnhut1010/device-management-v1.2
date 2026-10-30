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

## Phase 10: Department and Device Catalog Management

Goal:

- Replace free-text department and device type/model values with manageable reference data where appropriate.

Scope:

- Add department management for Admin.
- Add device type and model management for Admin.
- Use catalog references when creating or updating a device.
- Before changing the current `Device.Category` and `Device.Model` fields, inspect existing data and define a migration that preserves existing values. Do not drop or overwrite existing values without an explicit mapping.
- Keep this phase limited to departments, device types, and models. Supplier management is a later candidate.

Acceptance criteria:

- Admin can create, view, update, and deactivate catalog entries.
- Existing devices remain readable after migration; mapped type/model values display correctly.
- Invalid or inactive catalog references are rejected by the backend.
- Referenced catalog entries cannot be deleted in a way that breaks existing devices or users.
- API and browser checks cover Admin management and normal user read/use flows.
- Backend and frontend builds succeed; update this roadmap with verified results.

## Phase 11: Incident Reporting

Goal:

- Let Employees report and track incidents associated with devices.

Scope:

- Employees can create incidents for devices they are allowed to access and view only their own incidents.
- Admin can view all incidents, set severity, and update the incident status.
- Define and enforce the incident status transitions in the backend.
- Record incident creation and status changes in device history.
- Decide the attachment storage and validation approach before implementing image uploads. Do not store uploaded files in the database or repository by default.
- Keep repair-order creation in Phase 12.

Acceptance criteria:

- Employee cannot create an incident for an unrelated device or read another Employee's incident.
- Admin can review incidents and perform only valid status transitions.
- Incident list filters and pagination return consistent results.
- Relevant events appear in the device history.
- API and browser checks cover Admin and Employee permissions, validation failures, and status transitions.
- Backend and frontend builds succeed; update this roadmap with verified results.

## Phase 12: Repair and Maintenance Workflow

Goal:

- Manage repair work from an approved incident through assignment, progress, and completion.

Scope:

- Define a Technician role and its backend authorization rules before adding repair screens.
- Admin can create or approve a repair order from an incident and assign it to a Technician.
- Technician can view only assigned repair orders and update allowed progress/status fields.
- Admin can review completion and close the repair order.
- Record repair assignment, status changes, and completion in device history; recalculate device status consistently.
- Include repair cost and completion notes. Define SLA tracking, image attachments, and cost approval rules separately before implementation if required.

Acceptance criteria:

- Employee, Admin, and Technician permissions are enforced by the backend, including direct API requests.
- Only valid repair status transitions are accepted.
- Completing or closing a repair updates device availability according to active assignments and repair state.
- Repair events appear in device history with actor and timestamp.
- API and browser checks cover the incident-to-repair flow and each role.
- Backend and frontend builds succeed; update this roadmap with verified results.

## Later Module Candidates

Do not include these in Phases 10–12:

- Device replacement and liquidation.
- Supplier management.
- Notifications and report export.
- AI Chat and AI-generated reports.
- Mobile app and QR scanning.

Before starting a candidate, define its business workflow, roles and permissions, data changes, and acceptance criteria in its own milestone plan.
