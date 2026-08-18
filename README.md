# Device Management v1.2

Device Management v1.2 is a rebuild plan based on the existing Device Management 1.0 project.

The goal is not to rewrite the whole system at once. The goal is to build a small, clear production-style core first, then expand module by module.

## Repository Structure

```text
device-management-v1.2/
├── backend/
├── frontend/
├── mobile/
├── sql/
└── docs/
```

## Mini Scope

Version 1.2 starts with the device assignment workflow:

1. Admin creates and manages devices.
2. Admin creates and manages users.
3. Admin assigns a device to a user.
4. User accepts or rejects the assignment.
5. Admin returns or revokes the assignment.
6. System recalculates device status.
7. System writes device history.

## Architecture Direction

Backend uses one ASP.NET Core Web API project with clear internal layers:

```text
Controller
→ Service
→ Repository
→ DbContext
→ SQL Server
```

This structure keeps the project easy to read while still separating responsibilities.

## Priority

Phase 1 focuses on backend and SQL first.

Frontend and mobile are placeholders at the beginning. They will be implemented after backend APIs and workflow rules are stable.
