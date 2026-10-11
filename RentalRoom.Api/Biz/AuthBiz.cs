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

    public async Task<UserProfileResponse> GetMyProfileAsync(int userId)
    {
        if (userId <= 0)
        {
            throw new AppException("UNAUTHORIZED", "Không xác định được tài khoản đăng nhập.", 401);
        }

        var profile = await _userDAO.GetProfileByIdAsync(userId);

        if (profile == null)
        {
            throw new AppException("USER_NOT_FOUND", "Không tìm thấy tài khoản.", 404);
        }

        if (!profile.IsActive)
        {
            throw new AppException("ACCOUNT_DISABLED", "Tài khoản đã bị khóa.", 403);
        }

        return new UserProfileResponse
        {
            UserId = profile.Id,
            Username = profile.Username,
            Email = profile.Email,
            FullName = profile.FullName,
            Phone = profile.Phone,
            RoleCode = profile.RoleCode
        };
    }

    public async Task<string> UpdateMyPhoneAsync(int userId, UpdatePhoneRequest request)
    {
        if (userId <= 0)
        {
            throw new AppException("UNAUTHORIZED", "Không xác định được tài khoản đăng nhập.", 401);
        }

        if (request == null || string.IsNullOrWhiteSpace(request.Phone))
        {
            throw new AppException("PHONE_REQUIRED", "Số điện thoại không được để trống.", 400);
        }

        var phone = request.Phone.Trim();
        if (!Regex.IsMatch(phone, @"^0\d{9}$"))
        {
            throw new AppException("INVALID_PHONE_FORMAT", "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.", 400);
        }

        if (await _userDAO.ExistsByPhoneForOtherUserAsync(phone, userId))
        {
            throw new AppException("PHONE_EXISTS", "Số điện thoại đã được tài khoản khác sử dụng.", 409);
        }

        var updated = await _userDAO.UpdatePhoneAsync(userId, phone);
        if (!updated)
        {
            throw new AppException("ACCOUNT_NOT_FOUND_OR_DISABLED", "Không tìm thấy tài khoản hoặc tài khoản đã bị khóa.", 403);
        }

        return phone;
    }

    public async Task ChangeMyPasswordAsync(int userId, ChangePasswordRequest request)
    {
        if (userId <= 0)
        {
            throw new AppException("UNAUTHORIZED", "Không xác định được tài khoản đăng nhập.", 401);
        }

        if (request == null)
        {
            throw new AppException("INVALID_REQUEST", "Dữ liệu đổi mật khẩu không hợp lệ.", 400);
        }

        if (string.IsNullOrWhiteSpace(request.CurrentPassword))
        {
            throw new AppException("CURRENT_PASSWORD_REQUIRED", "Vui lòng nhập mật khẩu hiện tại.", 400);
        }

        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
        {
            throw new AppException("NEW_PASSWORD_INVALID", "Mật khẩu mới phải có ít nhất 6 ký tự.", 400);
        }

        if (string.IsNullOrWhiteSpace(request.ConfirmNewPassword))
        {
            throw new AppException("PASSWORD_CONFIRM_REQUIRED", "Vui lòng xác nhận mật khẩu mới.", 400);
        }

        if (!string.Equals(request.NewPassword, request.ConfirmNewPassword, StringComparison.Ordinal))
        {
            throw new AppException("PASSWORD_CONFIRM_MISMATCH", "Mật khẩu mới và phần xác nhận không khớp.", 400);
        }

        if (string.Equals(request.CurrentPassword, request.NewPassword, StringComparison.Ordinal))
        {
            throw new AppException("PASSWORD_UNCHANGED", "Mật khẩu mới phải khác mật khẩu hiện tại.", 400);
        }

        var passwordInfo = await _userDAO.GetPasswordInfoByIdAsync(userId);
        if (passwordInfo == null)
        {
            throw new AppException("USER_NOT_FOUND", "Không tìm thấy tài khoản.", 404);
        }

        if (!passwordInfo.Value.IsActive)
        {
            throw new AppException("ACCOUNT_DISABLED", "Tài khoản đã bị khóa.", 403);
        }

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, passwordInfo.Value.PasswordHash))
        {
            throw new AppException("CURRENT_PASSWORD_INVALID", "Mật khẩu hiện tại không đúng.", 400);
        }

        var newPasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        var updated = await _userDAO.UpdatePasswordHashAsync(userId, newPasswordHash);

        if (!updated)
        {
            throw new AppException("PASSWORD_CHANGE_FAILED", "Không thể cập nhật mật khẩu. Vui lòng thử lại.", 500);
        }
    }

}