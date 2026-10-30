using DeviceManagement.Api.Data;
using DeviceManagement.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore.Storage;

namespace DeviceManagement.Api.Repositories.Implementations;

public class UnitOfWork : IUnitOfWork
{
    private readonly DeviceManagementDbContext _context;

    public UnitOfWork(DeviceManagementDbContext context)
    {
        _context = context;
    }

    public async Task<ITransactionScope> BeginTransactionAsync()
    {
        var transaction = await _context.Database.BeginTransactionAsync();
        return new TransactionScope(transaction);
    }

    public Task SaveChangesAsync() => _context.SaveChangesAsync();
}

public class TransactionScope : ITransactionScope
{
    private readonly IDbContextTransaction _transaction;

    public TransactionScope(IDbContextTransaction transaction)
    {
        _transaction = transaction;
    }

    public Task CommitAsync() => _transaction.CommitAsync();

    public Task RollbackAsync() => _transaction.RollbackAsync();

    public ValueTask DisposeAsync() => _transaction.DisposeAsync();
}
