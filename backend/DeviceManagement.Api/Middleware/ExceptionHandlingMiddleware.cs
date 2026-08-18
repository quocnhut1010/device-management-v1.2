using System.Net;
using DeviceManagement.Api.Common.Exceptions;
using DeviceManagement.Api.Common.Models;

namespace DeviceManagement.Api.Middleware;

public class ExceptionHandlingMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = ex switch
            {
                NotFoundException => (int)HttpStatusCode.NotFound,
                BusinessException => (int)HttpStatusCode.BadRequest,
                _ => (int)HttpStatusCode.InternalServerError
            };

            await context.Response.WriteAsJsonAsync(ApiResponse<object>.Fail(ex.Message));
        }
    }
}
