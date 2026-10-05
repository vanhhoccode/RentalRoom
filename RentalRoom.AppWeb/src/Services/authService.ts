import { callApi } from '../Utils/api/apiHelper';
import {
  RegisterRequestDto,
  LoginRequestDto,
  LoginResponseDto,
} from '../Dtos/Auth/AuthDto';

const BASE_URL = 'https://localhost:7188';

/**
 * Đăng ký tài khoản mới
 * @throws Error nếu BE trả về lỗi hoặc mất kết nối
 */
export async function register(payload: RegisterRequestDto): Promise<void> {
  await callApi<void>(`${BASE_URL}/api/auth/register`, 'POST', payload, false);
}

/**
 * Đăng nhập và lấy JWT Token
 * @returns LoginResponseDto chứa token, userId, roleCode...
 * @throws Error nếu sai thông tin hoặc mất kết nối
 */
export async function login(payload: LoginRequestDto): Promise<LoginResponseDto> {
  return callApi<LoginResponseDto>(`${BASE_URL}/api/auth/login`, 'POST', payload, false);
}

/**
 * Lưu thông tin đăng nhập vào localStorage sau khi login thành công
 */
export function saveAuthToStorage(data: LoginResponseDto): void {
  if (data.token) {
    localStorage.setItem('accessToken', data.token);
  }
  localStorage.setItem(
    'user',
    JSON.stringify({
      userId: data.userId,
      username: data.username,
      fullName: data.fullName,
      roleCode: data.roleCode,
    }),
  );
}

/**
 * Xóa thông tin đăng nhập khỏi localStorage (logout)
 */
export function clearAuth(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
}
