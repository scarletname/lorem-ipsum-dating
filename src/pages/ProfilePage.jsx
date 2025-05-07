import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Изначально пустой массив, который будет заполнен данными с сервера
let mockUsers = [];

async function fetchData() {
  try {
    //const response = await fetch(`${process.env.REACT_APP_API_URL}/users/18781f64-aa34-447e-abef-4dc1b6674c48`);
    const response = await fetch(`${process.env.REACT_APP_API_URL}/users/18781f64-aa34-447e-abef-4dc1b6674c48`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    // Заполняем mockUsers полученными данными
    mockUsers = [data];
    return data;
  } catch (error) {
    console.error("Ошибка запроса:", error);
    // Возвращаем null или можно вернуть заглушку
    return null;
  }
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      // Пытаемся загрузить данные с сервера
      await fetchData();
      
      // Проверяем, есть ли данные в mockUsers (заполненные fetchData)
      if (mockUsers.length > 0) {
        // Используем данные с сервера как приоритетные
        setUser(mockUsers[0]);
      } else {
        // Если данных с сервера нет, используем localStorage или заглушку
        const savedData = localStorage.getItem('updatedUser');
        setUser(savedData ? JSON.parse(savedData) : {
          id: 1,
          name: 'Имя Фамилия',
          gender: 'М',
          age: 18,
          personality: 'INTP',
          description: 'Обожаю весёлые компании...',
          // другие поля по умолчанию
        });
      }
      setIsLoading(false);
    };

    loadData();

    // Обработчик изменений в localStorage
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

  if (isLoading || !user) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pb-14">
      {/* Остальной JSX остается таким же, но используем user из состояния */}
      <header className="fixed top-0 left-0 right-0 bg-black z-10">
        <div className="flex justify-center px-4 py-2">
          <span className="text-white font-bold text-xl">Мой профиль</span>
        </div>
      </header>

      <div className="mt-10" />
      

      <div className="relative w-full max-w-[500px] mx-auto">
        <div className="w-full aspect-square bg-gray-300 flex items-center justify-center rounded-[15px]">
          {user.photo ? (
            <img src={user.photo} alt="Profile" className="w-full h-full object-cover rounded-[15px]" />
          ) : (
            <span className="text-gray-600 text-sm">Нет фото</span>
          )}
        </div>

        <div className="absolute bottom-0 w-full border-b-2 border-black" />

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

      <div className="w-[90%] max-w-[500px] mx-auto flex flex-col gap-2 mt-1">
        <div className="flex flex-col text-left">
          <h2 className="text-[32px] font-bold">{user.name}</h2>
          <p className="text-[20px] text-gray-600 mt-2">
            {user.gender}, {user.age || '20'} лет, {user.jung_result || 'INTP'}
          </p>
          <p className="text-gray-600 text-sm mt-1">{user.about_myself}</p>
          {/* <p className="text-gray-600 text-sm">Создано: {user.created_at}</p> */}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;