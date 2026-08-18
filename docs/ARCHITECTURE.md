# Architecture

## Goal

Device Management v1.2 uses a simple layered architecture inside one ASP.NET Core Web API project.

This is suitable for the mini version because it is easier to read than a full multi-project Clean Architecture setup, while still keeping business logic, data access, DTOs, validation, and database configuration separated.

## Final Backend Structure

```text
backend/
└── DeviceManagement.Api/
    ├── Controllers/
    ├── Services/
    │   ├── Interfaces/
    │   └── Implementations/
    ├── Repositories/
    │   ├── Interfaces/
    │   └── Implementations/
    ├── Data/
    │   ├── Configurations/
    │   ├── Seed/
    │   └── DeviceManagementDbContext.cs
    ├── Models/
    │   ├── Entities/
    │   └── Enums/
    ├── DTOs/
    │   ├── Devices/
    │   ├── Users/
    │   └── DeviceAssignments/
    ├── Validators/
    │   ├── Devices/
    │   ├── Users/
    │   └── DeviceAssignments/
    ├── Mappings/
    ├── Middleware/
    ├── Common/
    │   ├── Models/
    │   ├── Exceptions/
    │   └── Constants/
    ├── Extensions/
    ├── Migrations/
    ├── Properties/
    ├── Program.cs
    ├── appsettings.json
    ├── appsettings.Development.json
    └── DeviceManagement.Api.csproj
```

## Request Flow

```text
Controller
→ Service
→ Repository
→ DbContext
→ SQL Server
```

## Responsibility Rules

Controllers only receive requests and return responses.

Services contain business logic and workflow rules.

Repositories only handle data access.

DbContext maps entities to SQL Server.

DTOs define API input and output contracts.

Validators validate request shape and basic input rules.

Common contains shared response models, exceptions, and constants.

## Naming Rules

Entities use singular names:

- Device
- User
- DeviceAssignment

Controllers use plural names:

- DevicesController
- UsersController
- DeviceAssignmentsController

Interfaces use the `I` prefix:

- IDeviceService
- IUserRepository

Request DTOs describe the action:

- CreateDeviceRequest
- UpdateDeviceRequest
- DeviceFilterRequest

Response DTOs use `Dto`:

- DeviceDto
- DeviceDetailDto
