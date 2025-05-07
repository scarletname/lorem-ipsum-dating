import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const mockUsers = [
  {
    id: 1,
    name: 'Имя Фамилия',
    gender: 'Ж',
    age: 18,
    personality: 'INTP',
    description: 'Обожаю весёлые компании, спонтанные поездки и долгие разговоры обо всём на свете. Всегда готова к новым знакомствам, шуткам и приколюхам. Если ты любишь смеяться — нам по пути!',
    images: [
      '/assets/images/photo1.jpg',
      '/assets/images/photo2.jpg',
    ],
  },
];

const Home = ({ token }) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const user = mockUsers[0];
  const images = user.images;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const handleLike = () => {
    if (token) {
      console.log('Лайк добавлен');
    } else {
      navigate('/login');
    }
  };

  const handleDislike = () => {
    if (token) {
      console.log('Дизлайк добавлен');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pb-14">
      {/* Шапка */}
      <header className="fixed top-0 left-0 right-0 bg-black z-10">
        <div className="flex justify-center px-0 py-2">
          <span className="text-white font-bold text-xl">Поиск</span>
        </div>
      </header>

      {/* Отступ сверху под шапку */}
      <div className="mt-14" />

      {/* Карточка свайпа */}
      <div className="w-[90%] sm:w-[80%] md:w-[500px] max-w-[500px] mx-auto mt-4">
        <div className="rounded-lg bg-white border border-gray-200 relative">
          {/* Фотография с листанием */}
          {images.length > 0 ? (
            <div className="relative w-full pt-[100%]">
              <img
                src={images[currentImageIndex]}
                alt={user.name}
                className="absolute top-0 left-0 w-full h-full object-cover bg-gray-300"
                onError={(e) => {
                  e.target.src = '/assets/images/placeholder.jpg';
                }}
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
            <div className="w-full pt-[100%] bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 text-sm">Нет фотографий</span>
            </div>
          )}

          {/* Контент карточки */}
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold">
              {user.name}, {user.gender}, {user.age} лет, {user.personality}
            </h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              {user.description}
            </p>
          </div>

          {/* Кнопки лайк/дизлайк */}
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