-- Migration: Phase 10 - Department and Device Catalog Management
-- Database: DeviceManagement_V1_2

USE DeviceManagement_V1_2;
GO

-- 1. Create DeviceTypes Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DeviceTypes')
BEGIN
    CREATE TABLE DeviceTypes (
        Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
        Code NVARCHAR(50) NOT NULL,
        Name NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500) NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_DeviceTypes_IsActive DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_DeviceTypes_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT UQ_DeviceTypes_Code UNIQUE (Code)
    );
END
GO

-- 2. Create DeviceModels Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DeviceModels')
BEGIN
    CREATE TABLE DeviceModels (
        Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
        DeviceTypeId UNIQUEIDENTIFIER NOT NULL,
        Code NVARCHAR(50) NOT NULL,
        Name NVARCHAR(100) NOT NULL,
        Manufacturer NVARCHAR(100) NULL,
        Specifications NVARCHAR(MAX) NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_DeviceModels_IsActive DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_DeviceModels_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT UQ_DeviceModels_Code UNIQUE (Code),
        CONSTRAINT FK_DeviceModels_DeviceTypes FOREIGN KEY (DeviceTypeId) REFERENCES DeviceTypes(Id)
    );
END
GO

-- 3. Update Devices Table with foreign keys
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Devices') AND name = 'DeviceTypeId')
BEGIN
    ALTER TABLE Devices ADD DeviceTypeId UNIQUEIDENTIFIER NULL;
    ALTER TABLE Devices ADD CONSTRAINT FK_Devices_DeviceTypes FOREIGN KEY (DeviceTypeId) REFERENCES DeviceTypes(Id);
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Devices') AND name = 'DeviceModelId')
BEGIN
    ALTER TABLE Devices ADD DeviceModelId UNIQUEIDENTIFIER NULL;
    ALTER TABLE Devices ADD CONSTRAINT FK_Devices_DeviceModels FOREIGN KEY (DeviceModelId) REFERENCES DeviceModels(Id);
END
GO

-- 4. Seed Standard Departments if missing
IF NOT EXISTS (SELECT 1 FROM Departments WHERE Code = N'HR')
    INSERT INTO Departments (Id, Code, Name, IsActive, CreatedAt)
    VALUES (NEWID(), N'HR', N'Phòng Nhân sự', 1, SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM Departments WHERE Code = N'ACC')
    INSERT INTO Departments (Id, Code, Name, IsActive, CreatedAt)
    VALUES (NEWID(), N'ACC', N'Phòng Tài chính - Kế toán', 1, SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM Departments WHERE Code = N'SALES')
    INSERT INTO Departments (Id, Code, Name, IsActive, CreatedAt)
    VALUES (NEWID(), N'SALES', N'Phòng Kinh doanh', 1, SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM Departments WHERE Code = N'MKT')
    INSERT INTO Departments (Id, Code, Name, IsActive, CreatedAt)
    VALUES (NEWID(), N'MKT', N'Phòng Truyền thông & Marketing', 1, SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM Departments WHERE Code = N'OPS')
    INSERT INTO Departments (Id, Code, Name, IsActive, CreatedAt)
    VALUES (NEWID(), N'OPS', N'Phòng Vận hành & Quản trị', 1, SYSUTCDATETIME());
GO

-- 5. Seed DeviceTypes based on existing Category values and standard types
IF NOT EXISTS (SELECT 1 FROM DeviceTypes WHERE Code = N'DT-LAPTOP')
    INSERT INTO DeviceTypes (Id, Code, Name, Description, IsActive, CreatedAt)
    VALUES ('55555555-1111-1111-1111-111111111111', N'DT-LAPTOP', N'Laptop', N'Máy tính xách tay làm việc văn phòng và di động', 1, SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM DeviceTypes WHERE Code = N'DT-WORKSTATION')
    INSERT INTO DeviceTypes (Id, Code, Name, Description, IsActive, CreatedAt)
    VALUES ('55555555-2222-2222-2222-222222222222', N'DT-WORKSTATION', N'Workstation Pro', N'Máy trạm đồ họa và kỹ thuật hiệu năng cao', 1, SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM DeviceTypes WHERE Code = N'DT-DESKTOP')
    INSERT INTO DeviceTypes (Id, Code, Name, Description, IsActive, CreatedAt)
    VALUES (NEWID(), N'DT-DESKTOP', N'Desktop', N'Máy tính để bàn cố định', 1, SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM DeviceTypes WHERE Code = N'DT-MONITOR')
    INSERT INTO DeviceTypes (Id, Code, Name, Description, IsActive, CreatedAt)
    VALUES (NEWID(), N'DT-MONITOR', N'Monitor', N'Màn hình hiển thị chuyên dụng', 1, SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM DeviceTypes WHERE Code = N'DT-PRINTER')
    INSERT INTO DeviceTypes (Id, Code, Name, Description, IsActive, CreatedAt)
    VALUES (NEWID(), N'DT-PRINTER', N'Printer', N'Máy in, máy scan và photocopy văn phòng', 1, SYSUTCDATETIME());
GO

-- 6. Seed DeviceModels based on existing Model values and standard models
IF NOT EXISTS (SELECT 1 FROM DeviceModels WHERE Code = N'DM-LATITUDE-5420')
BEGIN
    DECLARE @LaptopTypeId UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM DeviceTypes WHERE Code = N'DT-LAPTOP');
    INSERT INTO DeviceModels (Id, DeviceTypeId, Code, Name, Manufacturer, Specifications, IsActive, CreatedAt)
    VALUES ('66666666-1111-1111-1111-111111111111', @LaptopTypeId, N'DM-LATITUDE-5420', N'Latitude 5420', N'Dell', N'Intel Core i5-1145G7, 16GB DDR4, 512GB NVMe SSD, 14 inch FHD IPS', 1, SYSUTCDATETIME());
END

IF NOT EXISTS (SELECT 1 FROM DeviceModels WHERE Code = N'DM-PRECISION-5570')
BEGIN
    DECLARE @WorkstationTypeId UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM DeviceTypes WHERE Code = N'DT-WORKSTATION');
    INSERT INTO DeviceModels (Id, DeviceTypeId, Code, Name, Manufacturer, Specifications, IsActive, CreatedAt)
    VALUES ('66666666-2222-2222-2222-222222222222', @WorkstationTypeId, N'DM-PRECISION-5570', N'Precision 5570-v2', N'Dell', N'Intel Core i7-12800H, 32GB DDR5, 1TB NVMe Gen4, RTX A2000 8GB, 15.6 inch 4K UHD+', 1, SYSUTCDATETIME());
END

IF NOT EXISTS (SELECT 1 FROM DeviceModels WHERE Code = N'DM-THINKPAD-T14')
BEGIN
    DECLARE @LaptopType2Id UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM DeviceTypes WHERE Code = N'DT-LAPTOP');
    INSERT INTO DeviceModels (Id, DeviceTypeId, Code, Name, Manufacturer, Specifications, IsActive, CreatedAt)
    VALUES (NEWID(), @LaptopType2Id, N'DM-THINKPAD-T14', N'ThinkPad T14 Gen 3', N'Lenovo', N'AMD Ryzen 7 PRO 6850U, 16GB LPDDR5, 512GB SSD, 14 inch WUXGA IPS', 1, SYSUTCDATETIME());
END

IF NOT EXISTS (SELECT 1 FROM DeviceModels WHERE Code = N'DM-DELL-U2422H')
BEGIN
    DECLARE @MonitorTypeId UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM DeviceTypes WHERE Code = N'DT-MONITOR');
    INSERT INTO DeviceModels (Id, DeviceTypeId, Code, Name, Manufacturer, Specifications, IsActive, CreatedAt)
    VALUES (NEWID(), @MonitorTypeId, N'DM-DELL-U2422H', N'UltraSharp U2422H', N'Dell', N'23.8 inch IPS 60Hz, 100% sRGB, 85% DCI-P3, USB-C, DP, HDMI', 1, SYSUTCDATETIME());
END
GO

-- 7. Migrate Existing Devices: Map Category -> DeviceTypeId and Model -> DeviceModelId
UPDATE d
SET d.DeviceTypeId = dt.Id
FROM Devices d
INNER JOIN DeviceTypes dt ON d.Category = dt.Name
WHERE d.DeviceTypeId IS NULL;

UPDATE d
SET d.DeviceModelId = dm.Id
FROM Devices d
INNER JOIN DeviceModels dm ON d.Model = dm.Name
WHERE d.DeviceModelId IS NULL;
GO
