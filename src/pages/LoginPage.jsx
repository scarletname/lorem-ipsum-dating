import { useState } from 'react';

const LoginPage = () => {
  const [error, setError] = useState(null);

  const handleLogin = () => {
    try {
      const authUrl = `${process.env.REACT_APP_AUTHORIZATION_URL}`;
      window.location.href = authUrl;
    } catch (error) {
      console.error('Ошибка перенаправления:', error.message);
      setError('Не удалось начать авторизацию: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold text-center text-gray-900">Lorem</h1>
      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      <button
        onClick={handleLogin}
        className="w-2/3 sm:w-[180px] bg-white border-2 border-[#47a952] rounded-full py-3 flex justify-center items-center text-xl sm:text-2xl font-medium mt-9"
      >
        <span className="text-[#47a952]">Войти</span>
      </button>
    </div>
  );
};

export default LoginPage;