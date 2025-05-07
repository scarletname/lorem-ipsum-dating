import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const mockUsers = [
  {
    id: 1,
    name: 'Имя Фамилия',
    gender: 'М',
    age: 18,
    personality: 'INTP',
    description: 'Обожаю весёлые компании, спонтанные поездки и долгие разговоры обо всём на свете. Всегда готов к новым знакомствам, шуткам и приколюхам. Если ты любишь смеяться — нам по пути!',
  },
];

const ProfilePage = () => {
  const navigate = useNavigate();

  // Загружаем данные из localStorage или используем mockUser как резерв
  const [user, setUser] = useState(() => {
    const savedData = localStorage.getItem('updatedUser');
    return savedData ? JSON.parse(savedData) : mockUsers[0];
  });

  // Обновляем user при изменении localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const savedData = localStorage.getItem('updatedUser');
      if (savedData) {
        setUser(JSON.parse(savedData));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleEditToggle = () => {
    console.log('Navigating to edit-profile with user:', user);
    navigate('/edit-profile', { state: { user } });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pb-14">
      {/* Шапка */}
      <header className="fixed top-0 left-0 right-0 bg-black z-10">
        <div className="flex justify-center px-4 py-2">
          <span className="text-white font-bold text-xl">Мой профиль</span>
        </div>
      </header>

      {/* Отступ сверху под шапку */}
      <div className="mt-10" />

      {/* Контейнер для фото и линии */}
      <div className="relative w-full max-w-[500px] mx-auto">
        {/* Аватар с отображением фото */}
        <div className="w-full aspect-square bg-gray-300 flex items-center justify-center rounded-[15px]">
          {user.photo ? (
            <img src={user.photo} alt="Profile" className="w-full h-full object-cover rounded-[15px]" />
          ) : (
            <span className="text-gray-600 text-sm">Нет фото</span>
          )}
        </div>

        {/* Простая линия */}
        <div className="absolute bottom-0 w-full border-b-2 border-black" />

        {/* Кнопка "Редактировать" */}
        <button
          onClick={handleEditToggle}
          className="absolute bottom-0 right-[35px] transform translate-y-1/2 bg-green-500 rounded-full w-10 h-10 flex justify-center items-center z-10 border-2 border-black"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>
      </div>

      {/* Контент профиля */}
      <div className="w-[90%] max-w-[500px] mx-auto flex flex-col gap-2 mt-1">
        {/* Информация о пользователе */}
        <div className="flex flex-col text-left">
          <h2 className="text-[32px] font-bold">{user.name}</h2>
          <p className="text-[20px] text-gray-600 mt-2">
            {user.gender}, {user.age || ''} лет, {user.personality}
          </p>
          <p className="text-gray-600 text-sm mt-1">{user.description}</p>
          <p className="text-gray-600 text-sm">Создано: {user.createdAt}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
