import { callApi } from '../Utils/api/apiHelper';
import {
  RoomDto,
  RoomListResponseDto,
  CreateRoomRequestDto,
  CreateRoomResponseDto,
  UpdateRoomRequestDto,
  RoomSearchFilter, // [MỚI THÊM] Import filter
} from '../Dtos/Room/RoomDto';

const BASE_URL = 'https://localhost:7188';

// [MỚI THÊM] Interface cho Category trả về từ BE
export interface CategoryResponse {
  id: number;
  name: string;
}

/**
 * Lấy danh sách phòng trọ từ BE (Có hỗ trợ lọc + phân trang)
 * @param filter - Object chứa các điều kiện lọc và phân trang
 * @returns RoomListResponseDto (gồm rooms[], totalCount, page, pageSize, totalPages)
 */

// src/Services/roomService.ts
// Lấy token từ localStorage hoặc state management của bạn
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken'); 
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const updateRoom = async (
  id: string | number, 
  payload: UpdateRoomRequestDto, 
  images: File[], 
  isImageChanged: boolean
) => {
  const formData = new FormData();

  // Nạp các trường text/số
  formData.append('CategoryId', String(payload.categoryId));
  formData.append('Title', payload.title);
  formData.append('Description', payload.description);
  formData.append('Price', String(payload.price));
  formData.append('Area', String(payload.area));
  formData.append('District', payload.district);
  formData.append('Ward', payload.ward);
  formData.append('AddressDetail', payload.addressDetail);

  // Nạp mảng tiện ích
  payload.amenityIds.forEach((amenityId) => {
    formData.append('AmenityIds', String(amenityId));
  });

  // CHỈ nạp mảng ảnh nếu người dùng có thay đổi (thêm/xóa)
  if (isImageChanged) {
    images.forEach((file) => {
      formData.append('Images', file);
    });
  }

  const token = localStorage.getItem('accessToken');

  // KHÔNG set 'Content-Type' để browser tự tính toán boundary cho multipart/form-data
  const res = await fetch(`${BASE_URL}/api/rooms/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token ?? ''}`
    },
    body: formData
  });

  const data = await res.json().catch(() => ({}));
  
  if (!res.ok) {
    throw new Error(data.message || 'Lỗi khi cập nhật tin đăng');
  }
  return data;
};

export const getMyRooms = async () => {
  const res = await fetch(`${BASE_URL}/api/rooms/my`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Không thể tải danh sách tin của bạn');
  return res.json();
};

export const deleteRoom = async (id: string | number) => {
  const res = await fetch(`${BASE_URL}/api/rooms/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Lỗi khi xóa tin');
  return true; // Soft delete thành công
};

export const changeRoomStatus = async (id: string | number, status: string) => {
  const res = await fetch(`${BASE_URL}/api/rooms/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Lỗi khi cập nhật trạng thái');
  return true;
};

export async function getRooms(filter?: RoomSearchFilter): Promise<RoomListResponseDto> {
  // Chuyển đổi filter object thành chuỗi query URL (loại bỏ các giá trị undefined/rỗng)
  const queryParams = filter
    ? '?' +
      new URLSearchParams(
        Object.entries(filter)
          .filter(([_, v]) => v !== undefined && v !== '')
          .map(([k, v]) => [k, String(v)])
      ).toString()
    : '';

  const data = await callApi<RoomListResponseDto>(
    `${BASE_URL}/api/rooms${queryParams}`,
    'GET',
    null,
    false,
  );

  return data;
}

/**
 * [MỚI THÊM] Lấy danh sách Loại hình phòng trọ (Categories)
 * @returns Mảng CategoryResponse[]
 */
export async function getCategories(): Promise<CategoryResponse[]> {
  // Gọi API đúng với đường dẫn /api/rooms/categories trên Swagger
  return await callApi<CategoryResponse[]>(
    `${BASE_URL}/api/rooms/categories`,
    'GET',
    null,
    false
  );
}

/**
 * Tạo phòng mới — dùng multipart/form-data vì có đính kèm ảnh
 * KHÔNG dùng callApi (vì callApi set Content-Type: application/json)
 * Thay vào đó fetch trực tiếp để browser tự set boundary cho multipart
 *
 * @param payload - Thông tin phòng (JSON fields)
 * @param images  - Mảng File ảnh thực tế
 * @returns CreateRoomResponseDto từ BE
 * @throws Error nếu đăng tin thất bại hoặc mất kết nối
 */
export async function createRoom(
  payload: CreateRoomRequestDto,
  images: File[],
): Promise<CreateRoomResponseDto> {
  const formData = new FormData();

  // Nạp các trường text/số
  formData.append('CategoryId', String(payload.categoryId));
  formData.append('Title', payload.title);
  formData.append('Description', payload.description);
  formData.append('Price', payload.price);
  formData.append('Area', payload.area);
  formData.append('District', payload.district);
  formData.append('Ward', payload.ward);
  formData.append('AddressDetail', payload.addressDetail);

  // Nạp mảng amenityIds (append từng phần tử cùng key)
  payload.amenityIds.forEach((id) => {
    formData.append('AmenityIds', String(id));
  });

  // Nạp mảng ảnh
  images.forEach((file) => {
    formData.append('Images', file);
  });

  const token = localStorage.getItem('accessToken');

  // TUYỆT ĐỐI không set 'Content-Type' thủ công — browser tự xử lý boundary
  const response = await fetch(`${BASE_URL}/api/rooms`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token ?? ''}`,
    },
    body: formData,
  });

  const data: CreateRoomResponseDto = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? 'Đăng tin thất bại. Vui lòng thử lại.');
  }

  return data;
}