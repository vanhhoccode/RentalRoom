// src/Services/reportService.ts

const BASE_URL = 'https://localhost:7188';

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
};

export interface ReportDto {
  id: number;
  tenantId: number;
  tenantName: string;
  roomId: number;
  roomTitle: string;
  roomStatus: string;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
  resolvedBy: number | null;
  resolvedAt: string | null;
}

export const getPendingReports = async (): Promise<ReportDto[]> => {
  const response = await fetch(`${BASE_URL}/api/reports?status=Pending`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (response.status === 401) throw new Error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.');
  if (response.status === 403) throw new Error('Bạn không có quyền xem danh sách báo cáo.');
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as any).message || 'Lỗi tải danh sách báo cáo.');
  }
  return await response.json();
};

export const resolveReport = async (
  id: number,
  status: 'Resolved' | 'Rejected'
): Promise<void> => {
  const response = await fetch(`${BASE_URL}/api/reports/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  if (response.status === 401) throw new Error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.');
  if (response.status === 403) throw new Error('Bạn không có quyền xử lý báo cáo này.');
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as any).message || 'Lỗi khi xử lý báo cáo.');
  }
};
