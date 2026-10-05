// ===== RESPONSE DTOs (dữ liệu nhận từ BE) =====

/** Một phòng trọ trả về từ danh sách */
export interface RoomDto {
  id: string | number;
  title: string;
  price?: number;
  area?: number;
  addressDetail?: string;
  ward?: string;
  district?: string;
  status?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
}

export interface UpdateRoomRequestDto {
  categoryId: number;
  title: string;
  description: string;
  price: string | number;
  area: string | number;
  district: string;
  ward: string;
  addressDetail: string;
  amenityIds: number[];
  
  // TUYỆT ĐỐI KHÔNG CÓ trường Status hay Images ở đây
}

/** Response wrapper từ BE: { rooms, totalCount, page, pageSize, totalPages } */
export interface RoomListResponseDto {
  rooms: RoomDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ===== REQUEST DTOs (dữ liệu gửi lên BE) =====

/** Payload tạo phòng mới (JSON fields — không gồm ảnh) */
export interface CreateRoomRequestDto {
  categoryId: number;
  title: string;
  description: string;
  price: string;
  area: string;
  district: string;
  ward: string;
  addressDetail: string;
  amenityIds: number[];
}

/** Response khi tạo phòng thành công */
export interface CreateRoomResponseDto {
  id?: string | number;
  message?: string;
  roomId: number;
  status: string;
  imageUrls: string[];
}

export interface RoomSearchFilter {
  keyword?: string;
  categoryId?: number;
  district?: string;
  ward?: string;
  minPrice?: number;
  maxPrice?: number;
  page: number;
  pageSize: number;
}
// Bạn có thể tạo thêm một hằng số chứa giá trị mặc định giống như C# 
// để dễ dàng gán state ban đầu trong React/Vue/Angular
export const defaultRoomSearchFilter: RoomSearchFilter = {
  page: 1,
  pageSize: 10
};