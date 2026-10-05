// ===== REQUEST DTOs =====

export interface RegisterRequestDto {
  username: string;
  email: string;
  password: string;
  phone: string;
  roleId: number;
  fullName: string;
}

export interface LoginRequestDto {
  usernameOrEmail: string;
  password: string;
}

// ===== RESPONSE DTOs =====

export interface LoginResponseDto {
  token?: string;
  userId?: string | number;
  username?: string;
  fullName?: string;
  roleCode?: string;
}
