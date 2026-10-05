/**
 * Hàm gọi API tổng quát dùng chung cho toàn bộ dự án TroTot.vn
 * @param endpoint - Đường dẫn API đầy đủ (Ví dụ: 'https://localhost:7188/api/auth/register')
 * @param method   - Phương thức HTTP ('GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE')
 * @param payload  - Dữ liệu JSON gửi đi (chỉ dùng cho POST, PUT, PATCH)
 * @param requiresAuth - Có cần đính kèm Bearer Token từ localStorage hay không
 * @returns Promise kiểu T — dữ liệu trả về từ Backend
 */
export async function callApi<T = unknown>(
  endpoint: string,
  method: string = 'GET',
  payload: unknown = null,
  requiresAuth: boolean = false,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Tự động đính kèm Token nếu nghiệp vụ yêu cầu
  if (requiresAuth) {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const options: RequestInit = {
    method: method.toUpperCase(),
    headers,
  };

  if (
    payload &&
    (method === 'POST' || method === 'PUT' || method === 'PATCH')
  ) {
    options.body = JSON.stringify(payload);
  }

  try {
    const response = await fetch(endpoint, options);

    // Xử lý khi phản hồi trả về rỗng (204 No Content)
    if (response.status === 204) {
      return { success: true } as T;
    }

    // NẾU BACKEND TRẢ VỀ LỖI (4xx, 5xx)
    if (!response.ok) {
      let errorData: Record<string, string>;
      try {
        errorData = await response.json();
      } catch {
        throw new Error(`Đã xảy ra lỗi hệ thống (Mã lỗi: ${response.status}).`);
      }

      // Hỗ trợ cả camelCase và PascalCase từ ASP.NET Core
      const backendMessage =
        errorData.message ||
        errorData.Message ||
        errorData.title ||
        errorData.Title ||
        errorData.detail ||
        'Đã có lỗi xảy ra từ hệ thống.';

      throw new Error(backendMessage);
    }

    // NẾU THÀNH CÔNG (2xx)
    return (await response.json()) as T;
  } catch (error) {
    const err = error as Error;
    if (
      err.message !== 'Failed to fetch' &&
      err.message !== 'NetworkError when attempting to fetch resource.'
    ) {
      throw error;
    }
    throw new Error(
      'Không thể kết nối đến máy chủ Backend. Vui lòng kiểm tra lại mạng.',
    );
  }
}
