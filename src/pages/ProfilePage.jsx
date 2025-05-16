import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

let mockUsers = [];
let base_id = `ef8118af-1c5f-4c82-8a82-cd4f65986e15`;

// Жестко закодированный токен как fallback
const FALLBACK_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJPcDJhNXZlcUdJSk9lQlFDeHZvVU9HNFFNaXlISTVDdVBxbk9EN3pEZjVVIn0.eyJleHAiOjE3NDczOTA2MzQsImlhdCI6MTc0NzM4ODgzNCwiYXV0aF90aW1lIjoxNzQ3MzQxOTAzLCJqdGkiOiJjMDJjZDZlNy05OWJmLTQzNTYtOGMzNy05MTI4MWJmY2U0MWUiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjE4MDgwL3JlYWxtcy9sb3JlbSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiJlZjgxMThhZi0xYzVmLTRjODItOGE4Mi1jZDRmNjU5ODZlMTUiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJvYXV0aF9wcm94eSIsInNpZCI6IjQ4ZDM0YzQ4LTQ3MjAtNDU4Ni1hODYyLTY0MzkxYzkxNGFlOSIsImFjciI6IjAiLCJhbGxvd2VkLW9yaWdpbnMiOlsiKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJkZWZhdWx0LXJvbGVzLWxvcmVtIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6InByb2ZpbGUgZW1haWwiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInByZWZlcnJlZF91c2VybmFtZSI6InRlc3QiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ.XP6MXvF1s8SF5S45B72e6B0_Ocl9FR8M3A9ti6YUipStluvUUyEZ31T347LT5NWM995sPHmIepXp_1PKuSpqt179zT2fhIDmepwPw57R7miJIbxUj_oS4Pac4MxBktYl2FEgAXSeeDjP4QI9yggHDI2hpv7Of9eyz3Ts2RvEQaH3mLGu9JRWBJ026c961yN9LU93DE3p671X77zyr7pM45gY_NNsocxsATgfPKrxuMH7jICMSP4fXnGYLnd1dBI8OAUDvTp4Sw_N_u7iKLKepjaggcXgASaLu5sM4CbZbsCcd3-UXfyWrHdsuC9pSzrStcfPIcvVJnmzr3aRklcxQQ';

async function fetchData() {
  const token = localStorage.getItem('authToken') || FALLBACK_TOKEN;
  
  try {
    // Запрос данных пользователя
    const userResponse = await axios.get(`${process.env.REACT_APP_API_URL}/users/${base_id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = userResponse.data;

    // Запрос фотографий
    let photosData = [];
    try {
      const photosResponse = await axios.get(`${process.env.REACT_APP_API_URL}/users/${base_id}/photos`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      photosData = photosResponse.data;
    } catch (photoError) {
      console.warn('Не удалось загрузить фотографии:', photoError.message);
    }

    // Запрос тегов
    let tagsData = [];
    try {
      const tagsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/users/${base_id}/tags`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      tagsData = tagsResponse.data;
    } catch (tagError) {
      console.warn('Не удалось загрузить теги:', tagError.message);
    }

    data.photos = photosData;
    data.tags = tagsData.map(tag => ({
      id: tag.id,
      user_id: tag.user_id,
      name: tag.value, // Маппинг value в name
    })) || [];

    const primaryPhoto = photosData.length > 0 ? photosData[0] : null;
    data.photo = primaryPhoto?.id || null;

    mockUsers = [data];
    return data;
  } catch (error) {
    console.error('Ошибка запроса:', error.message);
    if (error.response) {
      console.error('Ответ сервера:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Возможная причина: CORS ошибка или сервер недоступен. Проверьте конфигурацию CORS на бэкенде.');
    }
    return null;
  }
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchData();
      
      if (data) {
        setUser(data);
      } else {
        const savedData = localStorage.getItem('updatedUser');
        setUser(savedData ? JSON.parse(savedData) : {
          id: 1,
          name: 'Имя',
          gender: 'М',
          age: 18,
          personality: 'INTP',
          description: 'Обожаю весёлые компании...',
          tags: [],
        });
        setError('Не удалось загрузить данные с сервера. Используются локальные данные.');
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

      {error && (
        <div className="w-[90%] max-w-[500px] mx-auto text-red-500 text-sm mb-2">
          {error}
        </div>
      )}

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
          {user.tags && user.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {user.tags.map(tag => (
                <span
                  key={tag.id}
                  className="bg-gray-200 rounded-[15px] px-3 py-1 text-gray-600 text-sm"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;