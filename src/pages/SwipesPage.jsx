import { useState, useEffect } from 'react';
import { fetchMatches, fetchSwipes, performSwipe, formatGender, getAuthToken } from '../utils/api';

const SwipesPage = () => {
  const [matches, setMatches] = useState([]);
  const [swipes, setSwipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('matches');

  // Обработка свайпа (оценка)
  const handleSwipe = async (targetId, like) => {
    const authToken = getAuthToken();
    if (!authToken) {
      setError('Токен отсутствует');
      return;
    }

    try {
      await performSwipe(targetId, like, authToken);
      // Удаляем пользователя из списка свайпов после оценки
      setSwipes(prevSwipes => prevSwipes.filter(user => user.id !== targetId));
    } catch (error) {
      console.error('Ошибка при свайпе:', error.message);
      setError(error.response?.data?.message || 'Не удалось выполнить свайп');
    }
  };

  const handleLike = (userId) => {
    handleSwipe(userId, true);
  };

  const handleDislike = (userId) => {
    handleSwipe(userId, false);
  };

  // Загрузка данных при монтировании
  useEffect(() => {
    const loadData = async () => {
      const authToken = getAuthToken();
      if (!authToken) {
        setError('Токен отсутствует');
        setIsLoading(false);
        return;
      }

      try {
        const [matchesData, swipesData] = await Promise.all([
          fetchMatches(0, 4, authToken),
          fetchSwipes(0, 4, authToken)
        ]);
        setMatches(matchesData);
        setSwipes(swipesData);
        setError(null);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error.message);
        setError(error.response?.data?.message || 'Не удалось загрузить данные');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Загрузка...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pb-14">
      <header className="fixed top-0 left-0 right-0 bg-black z-10">
        <div className="flex justify-center px-0 py-2">
          <span className="text-white font-bold text-xl">Мои связи</span>
        </div>
        <div className="flex justify-center gap-4 py-2 bg-black">
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-1 rounded-full text-sm font-semibold ${
              activeTab === 'matches' ? 'bg-white text-black' : 'bg-black text-white border border-white'
            }`}
          >
            Мэтчи
          </button>
          <button
            onClick={() => setActiveTab('swipes')}
            className={`px-4 py-1 rounded-full text-sm font-semibold ${
              activeTab === 'swipes' ? 'bg-white text-black' : 'bg-black text-white border border-white'
            }`}
          >
            Кому я нравлюсь
          </button>
        </div>
      </header>

      <div className="mt-20" />

      <div className="w-[90%] sm:w-[80%] md:w-[500px] max-w-[500px] mx-auto mt-4 space-y-6">
        {activeTab === 'matches' && (
          matches.length === 0 ? (
            <p className="text-gray-500 text-center">У вас пока нет мэтчей</p>
          ) : (
            matches.map((user) => (
              <div key={user.id} className="rounded-lg bg-white border border-gray-200 overflow-hidden">
                {user.photos && user.photos.length > 0 ? (
                  <div className="relative w-full pt-[100%]">
                    <img
                      src={user.photos[0].url}
                      alt={user.name}
                      className="absolute top-0 left-0 w-full h-full object-cover bg-gray-300 rounded-t-lg"
                      
                    />
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
                      {user.tags.map((tag) => (
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
            ))
          )
        )}

        {activeTab === 'swipes' && (
          swipes.length === 0 ? (
            <p className="text-gray-500 text-center">Пока никто не сделал свайп</p>
          ) : (
            swipes.map((user) => (
              <div key={user.id} className="rounded-lg bg-white border border-gray-200 overflow-hidden">
                {user.photos && user.photos.length > 0 ? (
                  <div className="relative w-full pt-[100%]">
                    <img
                      src={user.photos[0].url}
                      alt={user.name}
                      className="absolute top-0 left-0 w-full h-full object-cover bg-gray-300 rounded-t-lg"
                    />
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
                      {user.tags.map((tag) => (
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
                    onClick={() => handleDislike(user.id)}
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
                    onClick={() => handleLike(user.id)}
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
            ))
          )
        )}
      </div>
    </div>
  );
};

export default SwipesPage;