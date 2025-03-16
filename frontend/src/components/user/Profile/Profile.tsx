import { useNavigate } from 'react-router-dom';
import ModernProfilePage from './ProfileComponents/ModernProfilePage'
import NavBar from '../NavBar'
import Global_map from '../Landing/Global_map'
import Footer from '../Footer'
import { sessionManager } from '../../../utils/sessionManager';
import { toast } from 'react-hot-toast';

const Profile = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        try {
            sessionManager.clearSession();
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to logout');
        }
    };

    return (
        <div>
            <NavBar />
            
            <ModernProfilePage onLogout={handleLogout} />
            {/* Global Map Section */}
            <Global_map />

            {/* Footer */}
            <Footer />
        </div>
    )
}

export default Profile
