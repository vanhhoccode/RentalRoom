const BASE_URL = 'https://localhost:7188';

export interface MeResponse {
  userId: string;
  username: string;
  fullName: string;
  role: string;
  phone: string;
  email: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token ?? ''}`,
  };
};

/** Lấy thông tin tài khoản đang đăng nhập */
export async function getMe(): Promise<MeResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Không thể lấy thông tin tài khoản.');
  return res.json();
}
