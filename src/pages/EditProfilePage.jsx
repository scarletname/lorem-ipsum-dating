import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

let mockUsers = [];
let base_id = `9e87d89d-8113-4728-aeca-d774842dfd52`;

async function fetchData() {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${base_id}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();

    const photosRes = await fetch(`${process.env.REACT_APP_API_URL}/users/${base_id}/photos`);
    const photosData = photosRes.ok ? await photosRes.json() : [];

    data.photos = photosData;
    mockUsers = [data];
    return data;
  } catch (error) {
    console.error("Ошибка запроса:", error);
    return null;
  }
}

const EditProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: locationUser } = location.state || {};
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const formatDateToISO = (dateString) => {
    if (!dateString || !/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) return null;
    const [day, month, year] = dateString.split('.');
    return `${year}-${month}-${day}T00:00:00Z`;
  };

  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    gender: 'М',
    birthDate: '',
    description: '',
    personality: 'INTP',
    createdAt: '',
    age: '',
    photos: [],
    about_myself: '',
    surname: ''
  });
  const [age, setAge] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const uploadPhoto = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${base_id}/addphoto`, {
        method: 'POST',
        body: formData
      });
  
      if (!response.ok) throw new Error('Ошибка загрузки фото');
      return await response.json();
    } catch (error) {
      console.error('Ошибка при загрузке фото:', error);
      alert('Не удалось загрузить фото');
      return null;
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => (prev === 0 ? formData.photos.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev === formData.photos.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const loadData = async () => {
      const serverData = await fetchData();
      const userData = serverData || mockUsers[0] || locationUser;
      
      if (userData) {
        const formattedData = {
          name: userData.name || '',
          surname: userData.surname || '',
          gender: userData.gender === 'MALE' ? 'М' : 'Ж',
          birthDate: userData.birth_date ? 
            new Date(userData.birth_date).toLocaleDateString('ru-RU') : '',
          description: userData.about_myself || '',
          personality: userData.jung_result || 'INTP',
          createdAt: userData.created_at ? 
            new Date(userData.created_at).toLocaleDateString('ru-RU') : '04.04.25',
          age: userData.birth_date ? 
            calculateAge(new Date(userData.birth_date).toLocaleDateString('ru-RU')) : '',
          photos: userData.photos || [],
          about_myself: userData.about_myself || ''
        };
        
        setFormData(formattedData);
        setAge(formattedData.age);
      } else {
        const savedData = localStorage.getItem('updatedUser');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setFormData(parsedData);
          setAge(calculateAge(parsedData.birthDate));
        }
      }
      setIsLoading(false);
    };

    loadData();
  }, [locationUser]);

  useEffect(() => {
    setAge(calculateAge(formData.birthDate));
  }, [formData.birthDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const uploadedPhoto = await uploadPhoto(file);
    if (uploadedPhoto) {
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, uploadedPhoto]
      }));
      setCurrentImageIndex(formData.photos.length);
    }
  };

  const handleRemovePhoto = async () => {
    if (formData.photos.length === 0) return;
    
    const photoId = formData.photos[currentImageIndex].id;
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users/${base_id}/photos/${photoId}`,
        { method: 'DELETE' }
      );
      
      if (!response.ok) throw new Error('Ошибка удаления фото');
      
      setFormData(prev => {
        const newPhotos = prev.photos.filter((_, i) => i !== currentImageIndex);
        return { ...prev, photos: newPhotos };
      });
      
      setCurrentImageIndex(prev => 
        prev >= formData.photos.length - 1 && prev > 0 ? prev - 1 : 0
      );
    } catch (error) {
      console.error('Ошибка при удалении фото:', error);
      alert('Не удалось удалить фото');
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsSaving(true);

    try {
      const updatedAge = calculateAge(formData.birthDate);
      const updatedData = {
        ...formData,
        age: updatedAge !== '' ? updatedAge : formData.age,
        about_myself: formData.description,
        gender: formData.gender === 'М' ? 'MALE' : 'FEMALE'
      };

      const apiData = {
        name: updatedData.name,
        surname: updatedData.surname,
        gender: updatedData.gender,
        birth_date: formatDateToISO(updatedData.birthDate),
        about_myself: updatedData.description,
        jung_result: updatedData.personality,
        jung_last_attempt: new Date().toISOString()
      };

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users/${base_id}/profile`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiData)
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка при сохранении данных');
      }

      localStorage.setItem('updatedUser', JSON.stringify(updatedData));
      navigate('/profile', { state: { updatedUser: updatedData } });
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      alert('Не удалось сохранить изменения. Пожалуйста, попробуйте снова.');
    } finally {
      setIsSaving(false);
    }
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

  if (isLoading) {
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
          {/* Кнопки добавления и удаления в верхней части */}
          <div className="absolute top-2 right-2 z-20 flex gap-2">
            <button
              onClick={() => document.getElementById('photoInput').click()}
              className="bg-black/50 hover:bg-black/70 rounded-full w-10 h-10 flex justify-center items-center"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
            
            {formData.photos.length > 0 && (
              <button
                onClick={handleRemovePhoto}
                className="bg-black/50 hover:bg-black/70 rounded-full w-10 h-10 flex justify-center items-center"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Карусель фотографий */}
          {formData.photos.length > 0 ? (
            <>
              <img 
                src={formData.photos[currentImageIndex].url} 
                alt="Profile" 
                className="absolute top-0 left-0 w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/assets/images/placeholder.jpg';
                }}
              />
              {formData.photos.length > 1 && (
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

          <input
            id="photoInput"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>

        <div className="absolute bottom-0 w-full border-b-2 border-black" />

        <div className="absolute bottom-0 right-[35px] transform translate-y-1/2 z-10">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`rounded-full w-10 h-10 flex justify-center items-center border-2 border-black ${
              isSaving ? 'bg-gray-400' : 'bg-green-500'
            }`}
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
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
            )}
          </button>
        </div>
      </div>

      <div className="w-[90%] max-w-[500px] mx-auto flex flex-col gap-2 mt-1">
        <div className="flex flex-col text-left">
          <p className="text-gray-600 text-sm">Создано: {formData.createdAt}</p>
        </div>

        <div className="flex flex-col gap-2 mt-2">
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

          <div>
            <label className="block text-gray-600 text-sm mb-1">Фамилия</label>
            <input
              type="text"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              className="w-full border-2 border-black rounded-[15px] p-2 text-black"
              placeholder="Фамилия"
            />
          </div>

          <div className="flex gap-4">
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

      <div className="h-20" />
    </div>
  );
};

export default EditProfilePage;