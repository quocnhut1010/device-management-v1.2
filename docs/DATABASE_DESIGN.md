# Database Design

## SQL Folder Structure

```text
sql/
├── schema/
│   └── 001_initial_schema.sql
├── seed/
│   └── 001_dev_seed.sql
├── scripts/
│   ├── reset_database.sql
│   └── drop_database.sql
└── README.md
```

## Core Tables

The mini version should start with these tables:

- Departments
- Users
- Devices
- DeviceAssignments
- DeviceHistories

## Departments

Departments store organizational units.

Suggested fields:

- Id
- Code
- Name
- IsActive
- CreatedAt
- UpdatedAt

## Users

Users store employees or system users.

Suggested fields:

- Id
- DepartmentId
- Code
- FullName
- Email
- PhoneNumber
- Status
- CreatedAt
- UpdatedAt

## Devices

Devices store physical devices.

Suggested fields:

- Id
- Code
- Name
- SerialNumber
- Category
- Model
- Status
- PurchasedDate
- CreatedAt
- UpdatedAt

## DeviceAssignments

DeviceAssignments store the assignment lifecycle.

Suggested fields:

- Id
- DeviceId
- UserId
- AssignedByUserId
- AssignedAt
- AcceptedAt
- RejectedAt
- ReturnedAt
- RevokedAt
- Status
- Note
- CreatedAt
- UpdatedAt

## DeviceHistories

DeviceHistories store important device events.

Suggested fields:

- Id
- DeviceId
- Action
- OldStatus
- NewStatus
- Description
- CreatedByUserId
- CreatedAt

## Design Rules

Do not delete business records physically in normal workflows.

Do not store only current state without history.

Do not update Device.Status in many places.

Use DeviceAssignments and DeviceHistories to explain how a device reached its current state.

Use RecalculateDeviceStatus after workflows that can change the real state of a device.
