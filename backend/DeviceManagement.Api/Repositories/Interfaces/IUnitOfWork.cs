namespace DeviceManagement.Api.Repositories.Interfaces;

public interface IUnitOfWork
{
    Task<ITransactionScope> BeginTransactionAsync();
    Task SaveChangesAsync();
}

public interface ITransactionScope : IAsyncDisposable
{
    Task CommitAsync();
    Task RollbackAsync();
}
