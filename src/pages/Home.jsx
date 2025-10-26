import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRecommendations, performSwipe, formatGender, getAuthToken } from '../utils/api';

const Home = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRecommendations = useCallback(async (limit = 1) => {
    const authToken = getAuthToken();
    if (!authToken) {
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      const usersData = await fetchRecommendations(limit, authToken);
      setUsers(usersData);
      setCurrentUserIndex(0);
      setCurrentImageIndex(0);
      setError(null);
    } catch (error) {
      console.error('Ошибка загрузки рекомендаций:', error.message);
      setError(error.response?.data?.message || 'Не удалось загрузить рекомендации');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const handleSwipe = async (targetId, like) => {
    const authToken = getAuthToken();
    if (!authToken) {
      navigate('/login');
      return;
    }

    try {
      await performSwipe(targetId, like, authToken);

      // Переходим к следующему пользователю
      setCurrentUserIndex(prev => {
        const nextIndex = prev + 1;
        if (nextIndex >= users.length) {
          // Если пользователи закончились, загружаем новые рекомендации
          loadRecommendations();
          return 0;
        }
        return nextIndex;
      });
      setCurrentImageIndex(0);
    } catch (error) {
      console.error('Ошибка при свайпе:', error.message);
      alert(error.response?.data?.message || 'Не удалось выполнить свайп');
    }
  };

  const handleLike = () => {
    if (!getAuthToken()) {
      navigate('/login');
      return;
    }
    if (users[currentUserIndex]) {
      handleSwipe(users[currentUserIndex].id, true);
    }
  };

  const handleDislike = () => {
    if (!getAuthToken()) {
      navigate('/login');
      return;
    }
    if (users[currentUserIndex]) {
      handleSwipe(users[currentUserIndex].id, false);
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? (users[currentUserIndex]?.photos?.length - 1 || 0) : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === (users[currentUserIndex]?.photos?.length - 1 || 0) ? 0 : prev + 1
    );
  };

  if (isLoading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Загрузка...</div>;
  }

  if (error || users.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <p className="text-red-500">{error || 'Нет доступных пользователей для просмотра'}</p>
      </div>
    );
  }

  const user = users[currentUserIndex];
  const images = user.photos || [];

  return (
    <div className="min-h-screen bg-white flex flex-col pb-14">
      <header className="fixed top-0 left-0 right-0 bg-black z-10">
        <div className="flex justify-center px-0 py-2">
          <span className="text-white font-bold text-xl">Поиск</span>
        </div>
      </header>

      <div className="mt-14" />

      <div className="w-[90%] sm:w-[80%] md:w-[500px] max-w-[500px] mx-auto mt-4">
        <div className="rounded-lg bg-white border border-gray-200 relative overflow-hidden">
          {images.length > 0 ? (
            <div className="relative w-full pt-[100%]">
              <img
                src={images[currentImageIndex]?.url}
                alt={user.name}
                className="absolute top-0 left-0 w-full h-full object-cover bg-gray-300 rounded-t-lg"
              />
              {images.length > 1 && (
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
            </div>
          ) : (
            <div className="w-full pt-[100%] bg-gray-300 flex items-center justify-center rounded-t-lg">
              <span className="text-gray-600 text-sm">Нет фотографий</span>
            </div>
          )}

          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold">
              {user.name}, {formatGender(user.gender)}, {user.age ? `${user.age} лет` : 'возраст не указан'}, {user.jung_result || 'INTP'}
            </h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              {user.about_myself || 'Нет описания'}
            </p>
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

          <div className="flex justify-center gap-4 pb-4">
            <button
              onClick={handleDislike}
              className="border-2 border-red-400 text-red-400 rounded-full w-10 h-10 flex justify-center items-center bg-transparent hover:bg-red-400/10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <button
              onClick={handleLike}
              className="border-2 border-green-400 text-green-400 rounded-full w-10 h-10 flex justify-center items-center bg-transparent hover:bg-green-400/10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;