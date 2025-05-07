import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = location.state || {};
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    surname: user?.surname || '',
    gender: user?.gender || 'М',
    birthDate: user?.birthDate || '',
    description: user?.description || '',
    personality: user?.personality || 'INTP',
    createdAt: user?.createdAt || '04.04.25',
    updatedAt: user?.updatedAt || '04.04.25',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Save button clicked');
    console.log('Saving profile:', formData);
    localStorage.setItem('updatedUser', JSON.stringify(formData));
    navigate('/profile', { state: { updatedUser: formData } });
  };

  const personalityTypes = [
    'INTP', 'INTJ', 'ENTP', 'ENTJ',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ];

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
        {/* Аватар */}
        <div className="w-full aspect-square bg-gray-300 flex items-center justify-center">
          <span className="text-gray-600 text-sm">Нет фото</span>
        </div>

        {/* Простая линия */}
        <div className="absolute bottom-0 w-full border-b-2 border-black" />

        {/* Кнопка "Сохранить" */}
        <div className="absolute bottom-0 right-[35px] transform translate-y-1/2 z-10">
          <button
            onClick={handleSave}
            className="bg-green-500 rounded-full w-10 h-10 flex justify-center items-center border-2 border-black"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Контент редактирования */}
      <div className="w-[90%] max-w-[500px] mx-auto flex flex-col gap-2 mt-1">
        <div className="flex flex-col text-left">
          <p className="text-gray-600 text-sm">Создано: {formData.createdAt}</p>
        </div>

        {/* Поля ввода */}
        <div className="flex flex-col gap-2 mt-2">
          {/* Имя */}
          <div>
            <label className="block text-gray-600 text-sm mb-1">Имя</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border-2 border-black rounded-none p-2 text-black"
              placeholder="Имя"
            />
          </div>

          {/* Фамилия */}
          <div>
            <label className="block text-gray-600 text-sm mb-1">Фамилия</label>
            <input
              type="text"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              className="w-full border-2 border-black rounded-none p-2 text-black"
              placeholder="Фамилия"
            />
          </div>

          {/* Пол и Дата рождения */}
          <div className="flex gap-4">
            {/* Пол */}
            <div className="flex-1">
              <label className="block text-gray-600 text-sm mb-1">Пол:</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="М"
                    checked={formData.gender === 'М'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  М
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="Ж"
                    checked={formData.gender === 'Ж'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Ж
                </label>
              </div>
            </div>
            {/* Дата рождения */}
            <div className="flex-1">
              <label className="block text-gray-600 text-sm mb-1">Дата рождения:</label>
              <input
                type="text"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full border-2 border-black rounded-none p-2 text-black"
                placeholder="ДД.ММ.ГГГГ"
              />
            </div>
          </div>

          {/* О себе */}
          <div>
            <label className="block text-gray-600 text-sm mb-1">О себе</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border-2 border-black rounded-none p-2 text-black h-32 resize-none"
              placeholder="О себе"
            />
          </div>

          {/* Тип Юнга */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-gray-600 text-sm mb-1">Тип Юнга:</label>
              <select
                name="personality"
                value={formData.personality}
                onChange={handleChange}
                className="w-full border-2 border-black rounded-none p-2 text-black"
              >
                {personalityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <button className="bg-gray-200 text-gray-600 px-4 py-2 border-2 border-black">
              Тестирование
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
