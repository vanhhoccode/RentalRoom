// src/Services/favoriteService.ts

const BASE_URL = 'https://localhost:7188/api/favorites';

// Hàm lấy token chuẩn hóa
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken'); // Sửa ở đây
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// 1. Lấy danh sách yêu thích
export const getFavorites = async () => {
  const response = await fetch(BASE_URL, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  if (response.status === 401 || response.status === 403) return [];
  if (!response.ok) throw new Error('Lỗi tải danh sách yêu thích');
  return await response.json();
};

// 2. Thêm yêu thích
export const addFavorite = async (roomId: number | string) => {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ roomId: Number(roomId) })
  });
  
  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (response.status === 403) throw new Error('FORBIDDEN');
  if (response.status === 409) return true; // Đã yêu thích rồi
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Lỗi thêm yêu thích');
  }
  return true;
};

// 3. Xóa yêu thích
export const removeFavorite = async (roomId: number | string) => {
  const response = await fetch(`${BASE_URL}/${roomId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (response.status === 403) throw new Error('FORBIDDEN');
  if (response.status === 404) return true; // Đã xóa rồi

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Lỗi xóa yêu thích');
  }
  return true;
};