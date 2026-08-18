USE DeviceManagementV12;
GO

DECLARE @IT UNIQUEIDENTIFIER = '11111111-1111-1111-1111-111111111111';
DECLARE @Admin UNIQUEIDENTIFIER = '22222222-2222-2222-2222-222222222222';
DECLARE @User UNIQUEIDENTIFIER = '33333333-3333-3333-3333-333333333333';
DECLARE @Laptop UNIQUEIDENTIFIER = '44444444-4444-4444-4444-444444444444';

INSERT INTO Departments(Id, Code, Name, IsActive, CreatedAt)
VALUES (@IT, N'IT', N'Information Technology', 1, SYSUTCDATETIME());

INSERT INTO Users(Id, DepartmentId, Code, FullName, Email, PhoneNumber, Status, CreatedAt)
VALUES
(@Admin, @IT, N'ADMIN01', N'Admin User', N'admin@example.com', NULL, 1, SYSUTCDATETIME()),
(@User, @IT, N'USER01', N'Normal User', N'user@example.com', NULL, 1, SYSUTCDATETIME());

INSERT INTO Devices(Id, Code, Name, SerialNumber, Category, Model, Status, PurchasedDate, CreatedAt)
VALUES
(@Laptop, N'DEV001', N'Dell Latitude 5420', N'SN-DEV001', N'Laptop', N'Latitude 5420', 1, '2026-01-01', SYSUTCDATETIME());
GO
