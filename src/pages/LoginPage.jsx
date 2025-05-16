//import VkIcon from '../assets/images/vk_auth.svg';
//import GoogleIcon from '../assets/images/google_auth.svg';



//auth.py
const LoginPage = () => {
  // Функция для авторизации через Keycloak
  const handleLogin = () => {
    window.location.href = 'http://localhost:8000/login';
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 sm:px-6">
      {/* Заголовок */}
      <h1 className="text-2xl sm:text-4xl font-bold text-center mb-6">
      </h1>
      <button
        onClick={handleLogin}
        className="w-2/3 sm:w-[280px] bg-[#e0e0e0] text-[#1976D2] rounded-full py-3 flex items-center text-xl sm:text-2xl font-medium pl-6"
      >
        <span className="ml-2">Войти</span>
      </button>
    </div>
  );
};

export default LoginPage;
