using RentalRoom.Api.Common.Auth;
using RentalRoom.Api.Common.Exceptions;
using RentalRoom.Api.DAO;
using RentalRoom.Api.DTOs.Auth;
using RentalRoom.Api.Entities;
using System.Text.RegularExpressions;

namespace RentalRoom.Api.Biz;

public class AuthBiz
{
    private readonly UserDAO _userDAO;
    private readonly ITokenService _tokenService;

    public AuthBiz(
        UserDAO userDAO,
        ITokenService tokenService)
    {
        _userDAO = userDAO;
        _tokenService = tokenService;
    }

    public async Task<RegisterResponse> RegisterAsync(
        RegisterRequest request)
    {
        // =====================================================
        // 1. VALIDATE REQUEST
        // =====================================================

        if (request == null)
        {
            throw new AppException(
                "INVALID_REQUEST",
                "Dữ liệu đăng ký không hợp lệ.",
                400);
        }

        if (string.IsNullOrWhiteSpace(request.Username))
        {
            throw new AppException(
                "USERNAME_REQUIRED",
                "Tên đăng nhập không được để trống.",
                400);
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            throw new AppException(
                "EMAIL_REQUIRED",
                "Email không được để trống.",
                400);
        }

        // Validate mật khẩu trống hoặc dưới 6 ký tự
        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
        {
            throw new AppException(
                "PASSWORD_INVALID",
                "Mật khẩu không được để trống và phải có ít nhất 6 ký tự.",
                400);
        }

        if (string.IsNullOrWhiteSpace(request.FullName))
        {
            throw new AppException(
                "FULL_NAME_REQUIRED",
                "Họ và tên không được để trống.",
                400);
        }

        // Validate định dạng số điện thoại (nếu có nhập)
        if (!string.IsNullOrWhiteSpace(request.Phone))
        {
            var phoneRegex = new Regex(@"^0\d{9}$"); // Bắt đầu bằng 0, theo sau là 9 chữ số
            if (!phoneRegex.IsMatch(request.Phone.Trim()))
            {
                throw new AppException(
                    "INVALID_PHONE_FORMAT",
                    "Số điện thoại không đúng định dạng.",
                    400);
            }
        }

        if (request.RoleId != 1 && request.RoleId != 2)
        {
            throw new AppException(
                "INVALID_ROLE",
                "Vai trò đăng ký không hợp lệ.",
                400);
        }


        // =====================================================
        // 2. CHUẨN HÓA DỮ LIỆU
        // =====================================================

        var username = request.Username.Trim();
        var email = request.Email.Trim();
        var fullName = request.FullName.Trim();
        var roleId = request.RoleId;
        var phone = string.IsNullOrWhiteSpace(request.Phone)
            ? null
            : request.Phone.Trim();


        // =====================================================
        // 3. CHECK USERNAME TRÙNG (Đã có sẵn)
        // =====================================================

        var usernameExists = await _userDAO.ExistsByUsernameAsync(username);

        if (usernameExists)
        {
            throw new AppException(
                "USERNAME_EXISTS",
                "Tên đăng nhập đã tồn tại.",
                409);
        }


        // =====================================================
        // 4. CHECK EMAIL TRÙNG
        // =====================================================

        var emailExists = await _userDAO.ExistsByEmailAsync(email);

        if (emailExists)
        {
            throw new AppException(
                "EMAIL_EXISTS",
                "Email đã được sử dụng.",
                409);
        }


        // =====================================================
        // 4.5. CHECK PHONE TRÙNG
        // =====================================================

        if (!string.IsNullOrWhiteSpace(phone))
        {
            var phoneExists = await _userDAO.ExistsByPhoneAsync(phone);

            if (phoneExists)
            {
                throw new AppException(
                    "PHONE_EXISTS",
                    "Số điện thoại đã được sử dụng.",
                    409);
            }
        }


        // =====================================================
        // 5. HASH PASSWORD
        // =====================================================

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);


        // =====================================================
        // 6. GÁN ROLE MẶC ĐỊNH
        // =====================================================



        // =====================================================
        // 7. TẠO USER ENTITY
        // =====================================================

        var user = new User
        {
            Username = username,
            Email = email,
            PasswordHash = passwordHash,
            RoleId = roleId,
            IsActive = true,
            Phone = phone,
            FullName = fullName,
            CreatedAt = DateTime.Now
        };


        // =====================================================
        // 8. INSERT USER
        // =====================================================

        var userId = await _userDAO.CreateAsync(user);


        // =====================================================
        // 9. RESPONSE
        // =====================================================

        return new RegisterResponse
        {
            UserId = userId,
            Username = user.Username,
            Email = user.Email,
            FullName = user.FullName
        };
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        // Các logic Login giữ nguyên không đổi
        // ... (để tiết kiệm không gian, phần Login giữ nguyên như code cũ của bạn)
        // ...

        // =====================================================
        // 1. VALIDATE REQUEST
        // =====================================================

        if (request == null)
        {
            throw new AppException(
                "INVALID_REQUEST",
                "Dữ liệu đăng nhập không hợp lệ.",
                400);
        }

        if (string.IsNullOrWhiteSpace(request.UsernameOrEmail))
        {
            throw new AppException(
                "LOGIN_REQUIRED",
                "Vui lòng nhập tên đăng nhập hoặc email.",
                400);
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            throw new AppException(
                "PASSWORD_REQUIRED",
                "Mật khẩu không được để trống.",
                400);
        }


        // =====================================================
        // 2. CHUẨN HÓA INPUT
        // =====================================================

        var login = request.UsernameOrEmail.Trim();


        // =====================================================
        // 3. TÌM USER
        // =====================================================

        var user = await _userDAO.GetForLoginAsync(login);

        if (user == null)
        {
            throw new AppException(
                "INVALID_CREDENTIALS",
                "Tên đăng nhập hoặc mật khẩu không đúng.",
                401);
        }


        // =====================================================
        // 4. CHECK ACCOUNT ACTIVE
        // =====================================================

        if (!user.IsActive)
        {
            throw new AppException(
                "ACCOUNT_DISABLED",
                "Tài khoản đã bị khóa.",
                403);
        }


        // =====================================================
        // 5. VERIFY PASSWORD
        // =====================================================

        var passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

        if (!passwordValid)
        {
            throw new AppException(
                "INVALID_CREDENTIALS",
                "Tên đăng nhập hoặc mật khẩu không đúng.",
                401);
        }


        // =====================================================
        // 6. GENERATE JWT
        // =====================================================

        var token = _tokenService.GenerateToken(
                user.Id,
                user.Username,
                user.RoleCode,
                user.FullName);


        // =====================================================
        // 7. RESPONSE
        // =====================================================

        return new LoginResponse
        {
            UserId = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            RoleCode = user.RoleCode,
            Token = token
        };
    }
}