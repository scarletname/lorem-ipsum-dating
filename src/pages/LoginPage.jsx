import VkIcon from '../assets/images/vk_auth.svg';
import GoogleIcon from '../assets/images/google_auth.svg';

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 sm:px-6">
      {/* Заголовок */}
      <h1 className="text-2xl sm:text-4xl font-bold text-center mb-6">
        Войти с помощью
      </h1>

      {/* Кнопка ВКонтакте */}
      <button
        className="w-2/3 sm:w-[280px] bg-[#1976D2] text-white rounded-full py-1 mb-4 flex items-center text-xl sm:text-2xl font-medium pl-4"
      >
        <img
          src={VkIcon}
          alt="VK"
          className="w-[59px] h-[59px] mr-0"
        />
        <span className="ml-4">ВКонтакте</span>
      </button>

      {/* Кнопка Google */}
      <button
        className="w-2/3 sm:w-[280px] bg-[#e0e0e0] text-[#1976D2] rounded-full py-3 flex items-center text-xl sm:text-2xl font-medium pl-6"
      >
        <img
          src={GoogleIcon}
          alt="Google"
          className="w-[39px] h-[39px] mr-2.5"
        />
        <span className="ml-2">Google</span>
      </button>
    </div>
  );
};

export default LoginPage;
