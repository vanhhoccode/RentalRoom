const BASE_URL = 'https://localhost:7188';

// Hàm lấy token và xử lý lỗi ngoặc kép (nếu có)
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token.replace(/['"]+/g, '')}` : ''
  };
};

// ==========================================
// 1. API DUYỆT TIN (ROOMS)
// ==========================================

// Lấy danh sách phòng chờ duyệt
export const getPendingRooms = async () => {
  const response = await fetch(`${BASE_URL}/api/rooms/pending`, { 
    method: 'GET',
    headers: getAuthHeaders() 
  });
  
  if (response.status === 401) throw new Error('Phiên đăng nhập hết hạn (401)');
  if (response.status === 403) throw new Error('Không có quyền truy cập (403)');
  if (!response.ok) throw new Error('Lỗi lấy danh sách phòng chờ duyệt');
  
  return await response.json();
};

// Phê duyệt phòng
export const approveRoom = async (id: number | string) => {
  const response = await fetch(`${BASE_URL}/api/rooms/${id}/approve`, { 
    method: 'PATCH', 
    headers: getAuthHeaders() 
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Lỗi hệ thống khi duyệt phòng');
  }
  return true;
};

// Tìm hàm rejectRoom cũ và thay bằng đoạn này:
export const rejectRoom = async (id: number | string, reason: string) => {
  const response = await fetch(`${BASE_URL}/api/rooms/${id}/reject`, { 
    method: 'PATCH', 
    headers: getAuthHeaders(),
   body: JSON.stringify({ rejectReason: reason }) // Gửi body chứa lý do xuống BE
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Lỗi hệ thống khi từ chối phòng');
  }
  return true;
};


// ==========================================
// 2. API XỬ LÝ BÁO CÁO (REPORTS)
// ==========================================

// Lấy danh sách báo cáo vi phạm
// LƯU Ý: Backend C# của bạn phải có API GET này. Nếu chưa có, bạn cần tạo thêm ở BE.
export const getPendingReports = async () => {
  const response = await fetch(`${BASE_URL}/api/reports?status=Pending`, { 
    method: 'GET',
    headers: getAuthHeaders() 
  });
  
  if (!response.ok) throw new Error('Lỗi lấy danh sách báo cáo');
  
  return await response.json();
};

// Xử lý báo cáo (Đổi status thành Resolved hoặc Rejected)
export const processReport = async (id: number | string, status: 'Resolved' | 'Rejected') => {
  const response = await fetch(`${BASE_URL}/api/reports/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }) // Gửi status mới xuống Backend
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Lỗi hệ thống khi xử lý báo cáo');
  }
  
  return true;
};