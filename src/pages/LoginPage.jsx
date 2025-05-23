import { useState } from 'react';

const LoginPage = () => {
  const [error, setError] = useState(null);

  const handleLogin = () => {
    try {
      const authUrl = `${process.env.REACT_APP_AUTHORIZATION_URL}`;
      console.log('Сформированный authUrl:', authUrl); // Отладка
      console.log('REACT_APP_AUTHORIZATION_URL:', process.env.REACT_APP_AUTHORIZATION_URL); // Отладка
      window.location.href = authUrl;
    } catch (error) {
      console.error('Ошибка перенаправления:', error.message);
      setError('Не удалось начать авторизацию: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <h1 className="text-2xl sm:text-4xl font-bold text-center">Вход в приложение</h1>
      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      <button
        onClick={handleLogin}
        className="w-2/3 sm:w-[280px] bg-[#e0e0e0] text-[#1976D2] rounded-full py-3 justify-center flex items-center text-xl sm:text-2xl font-medium mt-6"
      >
        <span className="justify-center">Войти</span>
      </button>
    </div>
  );
};

export default LoginPage;