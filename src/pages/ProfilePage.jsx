import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Изначально пустой массив, который будет заполнен данными с сервера
let mockUsers = [];
let base_id = `9e87d89d-8113-4728-aeca-d774842dfd52`;

async function fetchData() {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${base_id}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();

    // Загружаем фото пользователя
    const photosRes = await fetch(`${process.env.REACT_APP_API_URL}/users/${base_id}/photos`);
    const photosData = photosRes.ok ? await photosRes.json() : [];

    // Добавим фото в userData
    data.photos = photosData;

    // Можно также найти primary фото
    const primaryPhoto = photosData.length > 0 ? photosData[0] : null;
    data.photo = primaryPhoto?.id || null;

    // Заполняем mockUsers полученными данными
    mockUsers = [data];
    return data;
  } catch (error) {
    console.error("Ошибка запроса:", error);
    return null;
  }
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      await fetchData();
      
      if (mockUsers.length > 0) {
        setUser(mockUsers[0]);
      } else {
        const savedData = localStorage.getItem('updatedUser');
        setUser(savedData ? JSON.parse(savedData) : {
          id: 1,
          name: 'Имя',
          gender: 'М',
          age: 18,
          personality: 'INTP',
          description: 'Обожаю весёлые компании...',
        });
      }
      setIsLoading(false);
    };

    loadData();

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

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? user.photos.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === user.photos.length - 1 ? 0 : prev + 1
    );
  };

  if (isLoading || !user) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pb-14">
      <header className="fixed top-0 left-0 right-0 bg-black z-10">
        <div className="flex justify-center px-4 py-2">
          <span className="text-white font-bold text-xl">Мой профиль</span>
        </div>
      </header>

      <div className="mt-10" />

      <div className="relative w-full max-w-[500px] mx-auto">
        <div className="relative w-full pt-[100%] bg-gray-300">
          {user.photos && user.photos.length > 0 ? (
            <>
              <img 
                src={user.photos[currentImageIndex].url} 
                alt="Profile" 
                className="absolute top-0 left-0 w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/assets/images/placeholder.jpg';
                }}
              />
              {user.photos.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full w-10 h-10 flex justify-center items-center"
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
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full w-10 h-10 flex justify-center items-center"
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <span className="text-gray-600 text-sm">Нет фото</span>
            </div>
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
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;