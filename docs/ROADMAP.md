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
- Keep this phase limited to departments, device types, and models. Supplier management is deferred to Phase 16.

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
- Defer incident and repair attachment implementation to Phase 14. Define storage, validation, access, and retention before implementation; do not store uploaded files in the database or repository by default.
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
- Include repair cost and completion notes. Defer SLA tracking, image attachments, and cost approval rules to Phase 14.

Acceptance criteria:

- Employee, Admin, and Technician permissions are enforced by the backend, including direct API requests.
- Only valid repair status transitions are accepted.
- Completing or closing a repair updates device availability according to active assignments and repair state.
- Repair events appear in device history with actor and timestamp.
- API and browser checks cover the incident-to-repair flow and each role.
- Backend and frontend builds succeed; update this roadmap with verified results.

## Phase 13: Manager Role and Account Lifecycle

Goal:

- Add the Manager role and account lifecycle features present in the original repository while preserving the v1.2 authorization model.

Scope:

- Define Manager permissions and department scope for device visibility, device history, incident workflows, and role-appropriate dashboard/report views.
- Enforce department scope in backend services and repositories; frontend filtering alone is not an authorization boundary.
- Add the missing account workflows from the reference project, including registration and forgot/reset password where they fit the product's account policy.
- Use a secure, expiring reset token flow and an email delivery abstraction. Keep secrets and provider settings out of tracked source files.
- Update role setup, authorization policies, seed examples, frontend routes, and agent guidance to include Manager.

Acceptance criteria:

- Admin, Manager, Employee, and Technician permissions are tested through direct API calls.
- Managers cannot read or modify data outside their authorized department.
- Registration and password reset reject invalid, expired, reused, and unauthorized tokens.
- Existing login, password change, and role workflows continue to work.
- Backend and frontend builds succeed; browser checks record console and network results.
- Update this roadmap with verified results. Do not mark the phase complete if a required check is blocked.

## Phase 14: Complete Incident and Repair Workflows

Goal:

- Add the incident and repair capabilities that were intentionally deferred from Phases 11–12 and exist in the reference project.

Scope:

- Define and implement secure image attachment handling for incidents and repairs, including file type/size validation, access checks, storage location, and retention.
- Add SLA tracking with explicit start, due, pause, and completion rules.
- Define repair completion review, feedback, and cost approval transitions before implementation.
- Preserve the existing v1.2 incident/repair state machines unless a reviewed requirement justifies a change.
- Record attachment, SLA, feedback, and approval events in the relevant history.

Acceptance criteria:

- Only authorized users can upload, view, or remove attachments for incidents and repair orders.
- Invalid, oversized, or unauthorized uploads are rejected without leaving orphaned files or records.
- SLA calculations behave correctly across overdue, paused, completed, and cancelled work.
- Repair feedback and cost review follow documented role and status rules.
- API and browser checks cover Admin, Manager, Employee, and Technician access.
- Backend and frontend builds succeed; update this roadmap with verified results.

## Phase 15: Device Lifecycle, QR, and Depreciation

Goal:

- Complete core asset lifecycle capabilities documented in the original repository.

Scope:

- Add soft deletion and restoration with clear rules for devices referenced by assignments, incidents, repairs, replacements, or liquidation history.
- Add device image management using the storage safeguards defined in Phase 14.
- Add QR generation and a protected device lookup/scan API for web use. Mobile QR scanning remains within the deferred Mobile phase.
- Define supported device lifecycle statuses and valid transitions before expanding the current status model.
- Add depreciation calculations using documented purchase price, useful life, and as-of-date rules; keep calculations testable and side-effect free.
- Preserve existing device and catalog values through any database migration.

Acceptance criteria:

- Soft-deleted devices are excluded from normal lists and cannot be assigned; authorized users can restore eligible devices.
- QR lookups enforce the same device access rules as the corresponding detail/history endpoints.
- Depreciation results are verified for boundary dates, zero/invalid inputs, and fully depreciated assets.
- Status changes and lifecycle operations produce actor-attributed history.
- API and browser checks cover Admin, Manager, and Employee access.
- Backend and frontend builds succeed; update this roadmap with verified results.

## Phase 16: Supplier Management

Goal:

- Manage suppliers as reference data for device procurement and lifecycle records.

Scope:

- Add Admin workflows to list, create, update, soft-delete, and restore suppliers.
- Define supplier fields and validation from the original project and current device data.
- Link devices to suppliers only through an explicit migration that preserves existing records.
- Prevent deletion or deactivation rules from breaking devices, replacements, or reports that reference a supplier.

Acceptance criteria:

- Admin can perform the supported supplier lifecycle operations.
- Inactive or deleted suppliers cannot be selected for new device records.
- Existing devices remain readable after migration and retain their current supplier mapping where known.
- Referenced supplier history remains available.
- API and browser checks cover Admin management and normal-user read behavior.
- Backend and frontend builds succeed; update this roadmap with verified results.

## Phase 17: Device Replacement

Goal:

- Support the replacement request, review, and fulfillment workflow from the original repository.

Scope:

- Define which roles may request, review, approve, reject, and fulfill a replacement.
- Allow authorized employees to request replacement for eligible devices.
- Let Admin review requests and select or recommend an available replacement device.
- Define how the old and replacement devices, assignments, statuses, and history change atomically.
- Preserve replacement history and prevent concurrent fulfillment from assigning the same replacement device twice.

Acceptance criteria:

- Users cannot request replacement for devices they are not authorized to access.
- Only eligible replacement devices can be selected; unavailable, deleted, under-repair, or liquidated devices are rejected.
- Approval, rejection, and fulfillment transitions are enforced by the backend.
- Device and assignment state changes plus history are atomic.
- API and browser checks cover each role and the full replacement lifecycle.
- Backend and frontend builds succeed; update this roadmap with verified results.

## Phase 18: Device Liquidation

Goal:

- Add controlled liquidation workflows and history for eligible devices.

Scope:

- Define liquidation eligibility using lifecycle status, assignments, repair state, and depreciation rules from Phase 15.
- Support individual and batch liquidation where the business rules allow it.
- Define approval, rejection, completion, and related-incident handling.
- Preserve device and liquidation history; do not hard-delete assets that have operational or financial records.
- Ensure status and history updates are atomic.

Acceptance criteria:

- Devices with active assignments or repair orders cannot be liquidated unless an explicit transition resolves those workflows.
- Only authorized roles can approve or complete liquidation.
- Batch processing reports per-device outcomes and does not partially corrupt device/history state.
- Liquidation records remain available in device details, history, and reports.
- API and browser checks cover eligibility, approval, rejection, and batch scenarios.
- Backend and frontend builds succeed; update this roadmap with verified results.

## Phase 19: Notifications

Goal:

- Notify users about relevant assignment, incident, replacement, and repair events.

Scope:

- Add persisted user notifications, unread counts, mark-one-read, and mark-all-read operations.
- Define event-to-recipient rules for Admin, Manager, Employee, and Technician.
- Integrate notification creation with business transactions so failed operations do not emit notifications for changes that were rolled back.
- Verify the reference project's delivery behavior before choosing polling or a real-time transport; do not assume that a UI badge alone satisfies delivery.
- Keep email delivery configuration separate from notification records and protect provider credentials.

Acceptance criteria:

- Each supported business event creates the expected notification for the correct recipients exactly once.
- Users cannot read or mark another user's notifications.
- Unread counts and read operations remain correct after pagination and concurrent updates.
- Notification failures do not leave business operations in an inconsistent state.
- API and browser checks cover each role and event family.
- Backend and frontend builds succeed; update this roadmap with verified results.

## Phase 20: Reports, Analytics, and Export

Goal:

- Provide role-scoped dashboards and filtered report exports for the business modules.

Scope:

- Add or complete dashboard views for Admin, Manager, Employee, and Technician according to their data scope.
- Include device, incident, repair, and liquidation summaries, department-level analysis, and relevant trend visualizations.
- Add filtered Excel and PDF exports for devices, incidents, repairs, and liquidations.
- Record export history and provide authorized access to generated files.
- Ensure counts and charts use the complete filtered dataset rather than only the current page.
- Define file retention and access controls for generated exports.

Acceptance criteria:

- Dashboard metrics match independently calculated results for large, filtered datasets.
- Manager analytics never include data from unauthorized departments.
- Exported rows and totals match the active filters and include only authorized data.
- Generated files are retrievable only by authorized users and follow the documented retention policy.
- API and browser checks cover role scopes, filters, pagination, and both export formats.
- Backend and frontend builds succeed; update this roadmap with verified results.

## Deferred Work and Later Module Candidates

- **Phase 7 Mobile remains deferred** until the web workflow and its access rules are verified end to end. When resumed, use the reference project's role-specific flows: Admin dashboard and QR scan; Employee devices, incidents, and QR scan; Technician repair work and QR scan.
- **AI Chat and AI-generated reports** remain a later candidate. Define data access, provider configuration, cost limits, and privacy requirements in a separate milestone before implementation.

Before starting any later candidate, define its business workflow, roles and permissions, data changes, dependencies, and acceptance criteria. Preserve the v1.2 Controller → Service → Repository → DbContext architecture, and do not copy legacy implementation details from the reference repository without reviewing them.
