# Backend

Backend will be built with ASP.NET Core Web API.

The first version uses one project:

```text
backend/
└── DeviceManagement.Api/
```

## Layer Flow

```text
Controller
→ Service
→ Repository
→ DbContext
→ SQL Server
```

## First Modules

- Devices
- Users
- DeviceAssignments

## Backend Priority

Implement the assignment workflow first before expanding to incident, repair, replacement, or disposal modules.
