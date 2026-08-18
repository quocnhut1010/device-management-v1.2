# Device Assignment Workflow

## Main Workflow

The first production-style workflow in v1.2 is device assignment.

```text
Admin assigns device
→ Assignment is pending
→ User accepts or rejects
→ Device status is recalculated
→ Device history is written
```

## Assignment Status

DeviceAssignmentStatus should include:

- Pending
- Accepted
- Rejected
- Returned
- Revoked

## Device Status

DeviceStatus should include:

- Available
- PendingAssignment
- InUse
- UnderRepair
- Disposed

## Guard Rules

Before assigning a device:

- Device must exist.
- User must exist.
- Device must not be disposed.
- Device must not be under repair.
- Device must not have an active accepted assignment.
- Device must not have a pending assignment for another user.

Before accepting an assignment:

- Assignment must exist.
- Assignment must be pending.
- Current user must be the assigned user.
- Device must still be assignable.

Before rejecting an assignment:

- Assignment must exist.
- Assignment must be pending.
- Current user must be the assigned user.

Before returning a device:

- Assignment must exist.
- Assignment must be accepted.
- Device must currently be in use by that assignment.

## Recalculation Rule

Device status should not be changed blindly.

Instead of doing this:

```text
device.Status = Available
```

Use a recalculation method:

```text
RecalculateDeviceStatus(deviceId)
```

Suggested priority:

1. If device is disposed, status is Disposed.
2. If device has active repair, status is UnderRepair.
3. If device has accepted assignment, status is InUse.
4. If device has pending assignment, status is PendingAssignment.
5. Otherwise, status is Available.

## Service Methods

DeviceAssignmentService should contain:

- CreateAsync
- AcceptAsync
- RejectAsync
- ReturnAsync
- RevokeAsync

DeviceService should contain:

- GetAsync
- GetByIdAsync
- CreateAsync
- UpdateAsync
- DeleteAsync
- RecalculateStatusAsync
