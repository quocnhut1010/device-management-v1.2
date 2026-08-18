CREATE DATABASE DeviceManagementV12;
GO

USE DeviceManagementV12;
GO

CREATE TABLE Departments (
    Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    Code NVARCHAR(50) NOT NULL,
    Name NVARCHAR(200) NOT NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_Departments_IsActive DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL,
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT UQ_Departments_Code UNIQUE (Code)
);
GO

CREATE TABLE Users (
    Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    DepartmentId UNIQUEIDENTIFIER NULL,
    Code NVARCHAR(50) NOT NULL,
    FullName NVARCHAR(200) NOT NULL,
    Email NVARCHAR(200) NOT NULL,
    PhoneNumber NVARCHAR(30) NULL,
    Status INT NOT NULL,
    CreatedAt DATETIME2 NOT NULL,
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT UQ_Users_Code UNIQUE (Code),
    CONSTRAINT UQ_Users_Email UNIQUE (Email),
    CONSTRAINT FK_Users_Departments FOREIGN KEY (DepartmentId) REFERENCES Departments(Id)
);
GO

CREATE TABLE Devices (
    Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    Code NVARCHAR(50) NOT NULL,
    Name NVARCHAR(200) NOT NULL,
    SerialNumber NVARCHAR(100) NOT NULL,
    Category NVARCHAR(100) NULL,
    Model NVARCHAR(100) NULL,
    Status INT NOT NULL,
    PurchasedDate DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL,
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT UQ_Devices_Code UNIQUE (Code),
    CONSTRAINT UQ_Devices_SerialNumber UNIQUE (SerialNumber)
);
GO

CREATE TABLE DeviceAssignments (
    Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    DeviceId UNIQUEIDENTIFIER NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,
    AssignedByUserId UNIQUEIDENTIFIER NOT NULL,
    AssignedAt DATETIME2 NOT NULL,
    AcceptedAt DATETIME2 NULL,
    RejectedAt DATETIME2 NULL,
    ReturnedAt DATETIME2 NULL,
    RevokedAt DATETIME2 NULL,
    Status INT NOT NULL,
    Note NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL,
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT FK_DeviceAssignments_Devices FOREIGN KEY (DeviceId) REFERENCES Devices(Id),
    CONSTRAINT FK_DeviceAssignments_Users FOREIGN KEY (UserId) REFERENCES Users(Id),
    CONSTRAINT FK_DeviceAssignments_AssignedByUsers FOREIGN KEY (AssignedByUserId) REFERENCES Users(Id)
);
GO

CREATE TABLE DeviceHistories (
    Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    DeviceId UNIQUEIDENTIFIER NOT NULL,
    Action NVARCHAR(100) NOT NULL,
    OldStatus INT NULL,
    NewStatus INT NULL,
    Description NVARCHAR(1000) NULL,
    CreatedByUserId UNIQUEIDENTIFIER NULL,
    CreatedAt DATETIME2 NOT NULL,
    CONSTRAINT FK_DeviceHistories_Devices FOREIGN KEY (DeviceId) REFERENCES Devices(Id),
    CONSTRAINT FK_DeviceHistories_Users FOREIGN KEY (CreatedByUserId) REFERENCES Users(Id)
);
GO

CREATE INDEX IX_DeviceAssignments_DeviceId_Status ON DeviceAssignments(DeviceId, Status);
GO
