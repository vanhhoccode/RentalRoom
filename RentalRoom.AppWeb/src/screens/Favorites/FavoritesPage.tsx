// src/screens/Favorites/FavoritesPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import PropertyCard from '../../Components/PropertyCard/PropertyCard';
import { getFavorites, removeFavorite } from '../../Services/favoriteService';

const BASE_URL = 'https://localhost:7188';

export default function FavoritesPage() {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Kiểm tra quyền và tải dữ liệu
    useEffect(() => {
        const token = localStorage.getItem('accessToken'); // Sửa ở đây
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        if (!token) {
            alert("Vui lòng đăng nhập để xem phòng đã lưu.");
            navigate('/login'); // Gọi hàm chuyển trang
            return;             // Trả về rỗng để thoát khỏi useEffect
        }

        if (user?.roleCode !== 'TENANT') {
            alert("Chức năng này chỉ dành cho người đi thuê phòng.");
            navigate('/');      // Gọi hàm chuyển trang
            return;             // Trả về rỗng để thoát khỏi useEffect
        }

        const fetchFavs = async () => {
            try {
                const data = await getFavorites();
                setFavorites(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchFavs();
    }, [navigate]);

    // Xóa trực tiếp trên trang Yêu thích
    const handleDelete = async (roomId: number) => {
        try {
            await removeFavorite(roomId);
            // Xóa item khỏi state mà không cần reload trang
            setFavorites(prev => prev.filter(f => f.roomId !== roomId));
        } catch (error) {
            alert("Không thể xóa phòng khỏi danh sách lưu.");
        }
    };

    return (
        <div className="bg-[#f8f9ff] font-sans antialiased min-h-screen pt-20 flex flex-col">
            <Header />
            <main className="max-w-[1280px] mx-auto px-4 lg:px-6 py-12 w-full flex-grow">
                <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-[#ba1a1a] text-[32px]">favorite</span>
                    <h2 className="text-[28px] font-bold text-[#0b1c30]">Phòng đã lưu của bạn</h2>
                </div>

                {loading ? (
                    <p className="text-[#6d7a77] italic">Đang tải danh sách phòng...</p>
                ) : favorites.length === 0 ? (
                    <div className="bg-white p-8 rounded-xl text-center shadow-sm border border-[#bcc9c6]">
                        <span className="material-symbols-outlined text-[48px] text-[#bcc9c6] mb-2">heart_broken</span>
                        <p className="text-[16px] font-semibold text-[#0b1c30]">Bạn chưa lưu phòng nào.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favorites.map((fav) => {
                            const formattedPrice = fav.price ? `${(fav.price / 1_000_000).toFixed(1)} Triệu` : 'Thỏa thuận';
                            const statusStr = fav.status === 'Available' ? 'available' : 'rented';
                            const imageUrl = fav.imageUrl ? `${BASE_URL}${fav.imageUrl}` : 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKe9QZcDH0lzkTSl-nLSODpVJ8EdJxTrsAa7POpFxGCS2MFIBy7XkWLmaXTVm0N0936jWfvPGXZyUmhh1F40_c5rws4O1tBSZAx8rVewiODyByjDGm5MLjuADhkR5kxWNox82BYtGkcCEfI7y37qVtRIlt4P91YNvjTAtxB8v_e_mBS475x-9fa3QgEn0JB1auTj0BpK6h-3D6NHjUMLo5nlhnT09xouI2FujXPZVSqNPrC7DMoeqf';

                            return (
                                <PropertyCard
                                    key={fav.favoriteId}
                                    id={fav.roomId}
                                    imageUrl={imageUrl}
                                    title={fav.title}
                                    priceFormatted={formattedPrice}
                                    area={fav.area}
                                    address={`${fav.addressDetail ?? ''}, ${fav.ward ?? ''}, ${fav.district ?? ''}`}
                                    status={statusStr}
                                    variant="favorite"
                                    isFavorite={true}
                                    onDelete={() => handleDelete(fav.roomId)}
                                    onActionClick={() => navigate('/')}
                                />
                            );
                        })}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}