using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DeviceManagement.Api.DTOs.Auth;
using DeviceManagement.Api.Repositories.Interfaces;
using DeviceManagement.Api.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace DeviceManagement.Api.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;
    private readonly PasswordHasher<Models.Entities.User> _passwordHasher = new();

    public AuthService(IUserRepository userRepository, IConfiguration configuration)
    {
        _userRepository = userRepository;
        _configuration = configuration;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user is null || user.Status != Models.Enums.UserStatus.Active)
        {
            return null;
        }

        var passwordVerification = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (passwordVerification == PasswordVerificationResult.Failed)
        {
            return null;
        }

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT key is not configured."));
        var expireHours = int.TryParse(_configuration["Jwt:ExpireHours"], out var configuredHours) ? configuredHours : 6;

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var descriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(expireHours),
            Issuer = _configuration["Jwt:Issuer"],
            Audience = _configuration["Jwt:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(descriptor);

        return new LoginResponse(tokenHandler.WriteToken(token), user.Id, user.Email, user.Role, user.FullName);
    }
}
