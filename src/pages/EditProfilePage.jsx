import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = location.state || {};

  // Функция для вычисления возраста на основе даты рождения
  const calculateAge = (birthDate) => {
    if (!birthDate || !/^\d{2}\.\d{2}\.\d{4}$/.test(birthDate)) return '';
    const [day, month, year] = birthDate.split('.').map(Number);
    const birth = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem('updatedUser');
    const parsedData = savedData ? JSON.parse(savedData) : {
      name: user?.name || '',
      gender: user?.gender || 'М',
      birthDate: user?.birthDate || '',
      description: user?.description || '',
      personality: user?.personality || 'INTP',
      createdAt: user?.createdAt || '04.04.25',
      age: user?.age || '',
      photo: user?.photo || null,
    };
    return parsedData;
  });

  const [age, setAge] = useState(() => calculateAge(formData.birthDate));
  const [photoPreview, setPhotoPreview] = useState(formData.photo || null);

  useEffect(() => {
    setAge(calculateAge(formData.birthDate));
  }, [formData.birthDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData((prev) => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const updatedAge = calculateAge(formData.birthDate);
    const updatedData = {
      ...formData,
      age: updatedAge !== '' ? updatedAge : formData.age,
    };
    localStorage.setItem('updatedUser', JSON.stringify(updatedData));
    navigate('/profile', { state: { updatedUser: updatedData } });
  };

  const handleTestRedirect = () => {
    window.location.href = 'https://www.16personalities.com/ru/test-lichnosti';
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
        {/* Аватар с возможностью загрузки */}
        <div
          className="w-full aspect-square bg-gray-300 flex items-center justify-center rounded-[15px] cursor-pointer"
          onClick={() => document.getElementById('photoInput').click()}
        >
          {photoPreview ? (
            <img src={photoPreview} alt="Profile" className="w-full h-full object-cover rounded-[15px]" />
          ) : (
            <span className="text-gray-600 text-sm">Нет фото</span>
          )}
          <input
            id="photoInput"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
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
              className="w-full border-2 border-black rounded-[15px] p-2 text-black"
              placeholder="Имя"
            />
          </div>

          {/* Пол и Дата рождения с возрастом */}
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
            {/* Дата рождения и возраст */}
            <div className="flex-1">
              <label className="block text-gray-600 text-sm mb-1">Дата рождения:</label>
              <input
                type="text"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full border-2 border-black rounded-[15px] p-2 text-black"
                placeholder="ДД.ММ.ГГГГ"
              />
              {age !== '' && (
                <p className="text-gray-600 text-sm mt-1">Возраст: {age} лет</p>
              )}
            </div>
          </div>

          {/* О себе */}
          <div>
            <label className="block text-gray-600 text-sm mb-1">О себе</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border-2 border-black rounded-[15px] p-2 text-black h-32 resize-none"
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
                className="w-full border-2 border-black rounded-[15px] p-2 text-black"
              >
                {personalityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleTestRedirect}
              className="bg-gray-200 text-gray-600 px-4 py-2 border-2 border-black rounded-[15px]"
            >
              Тестирование
            </button>
          </div>
        </div>
      </div>

      {/* Нижний отступ (footer placeholder) */}
      <div className="h-20" />
    </div>
  );
};

export default EditProfilePage;
