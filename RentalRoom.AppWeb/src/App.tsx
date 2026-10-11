import { Routes, Route } from 'react-router-dom';
import AuthPage from "./screens/Auth/AuthPage";
import CreateRoomPage from "./screens/Room/CreateRoomPage";
import HomePage from './screens/HomePage/HomePage';
import RoomDetailPage from "./screens/RoomDetailPage/RoomDetailPage";
import FavoritesPage from "./screens/Favorites/FavoritesPage";
import AdminApprovePage from "./screens/Admin/AdminApprovePage";
import AdminReportsPage from "./screens/Admin/AdminReportsPage";
import LandlordDashboardPage from './screens/Landlord/Dardboard/LandlordDashboardPage';
import MyListingsPage from './screens/Landlord/MyListings/MyListingsPage';
import LandlordRoomDetailPage from './screens/Landlord/RoomDetail/LandlordRoomDetailPage';
import EditRoomPage from './screens/Landlord/EditRoom/EditRoomPage';
import LandlordProfilePage from './screens/Landlord/Profile/LandlordProfilePage';
import AdminApprovePage2 from './screens/Admin/AdminApprovePage2';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/create-room" element={<CreateRoomPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/rooms/:id" element={<RoomDetailPage />} />
      <Route path="/landlord/dashboard" element={<LandlordDashboardPage />} />
      <Route path="/landlord/listings/:id" element={<LandlordRoomDetailPage />} />
      <Route path="/landlord/listings" element={<MyListingsPage />} />
      <Route path="/landlord/edit/:id" element={<EditRoomPage />} />
      <Route path="/landlord/profile" element={<LandlordProfilePage />} />
      <Route path="/admin/dashboard" element={<AdminApprovePage />} />
      <Route path="/admin/rooms" element={<AdminApprovePage2 />} />
      <Route path="/admin/reports" element={<AdminReportsPage />} />
    </Routes>
  );
}

export default App;