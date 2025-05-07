import { useNavigate, useLocation } from 'react-router-dom';
import SearchIcon from '../assets/images/search-icon.svg';
import ProfileIcon from '../assets/images/profile-icon.svg';
import SettingsIcon from '../assets/images/settings-icon.svg';

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    if (location.pathname === '/' || location.pathname === '/home') return 'search';
    if (location.pathname === '/profile') return 'profile'; // Активно только на /profile
    if (location.pathname === '/settings') return 'settings';
    return 'search';
  };

  const activeTab = getActiveTab();

  const handleNavigation = (path, e) => {
    e.stopPropagation();
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_4px_rgba(0,0,0,0.1)] flex justify-around py-2 z-5 border-t border-gray-200">
      <button
        onClick={(e) => handleNavigation('/', e)}
        className={`flex flex-col items-center p-2 rounded-full ${activeTab === 'search' ? 'bg-[#66CC99] text-white' : 'text-gray-500'}`}
      >
        <img src={SearchIcon} alt="Search" className="w-6 h-6" />
      </button>
      <button
        onClick={(e) => handleNavigation('/profile', e)}
        className={`flex flex-col items-center p-2 rounded-full ${activeTab === 'profile' ? 'bg-[#66CC99] text-white' : 'text-gray-500'}`}
      >
        <img src={ProfileIcon} alt="Profile" className="w-6 h-6" />
      </button>
      <button
        onClick={(e) => handleNavigation('/settings', e)}
        className={`flex flex-col items-center p-2 rounded-full ${activeTab === 'settings' ? 'bg-[#66CC99] text-white' : 'text-gray-500'}`}
      >
        <img src={SettingsIcon} alt="Settings" className="w-6 h-6" />
      </button>
    </nav>
  );
};

export default NavigationBar;
