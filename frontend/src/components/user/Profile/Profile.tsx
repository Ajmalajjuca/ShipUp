import ModernProfilePage from './ProfileComponents/ModernProfilePage'
import NavBar from '../NavBar'
import Global_map from '../Landing/Global_map'
import Footer from '../Footer'

const Profile = () => {
    return (
        <div>
            <NavBar />
            
            <ModernProfilePage />
            {/* Global Map Section */}
            <Global_map />

            {/* Footer */}
            <Footer />
        </div>
    )
}

export default Profile
