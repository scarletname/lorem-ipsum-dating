import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

const EditProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: locationUser } = location.state || {};
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [newTag, setNewTag] = useState('');
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
    surname: '',
    tags: [],
  });
  const [age, setAge] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

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

  const uploadPhoto = async (file) => {
  const token = localStorage.getItem('authToken') || FALLBACK_TOKEN;
  const formData = new FormData();
  formData.append('photo', file); // Используем 'photo' вместо 'file'

  try {
    // Логируем информацию о файле для отладки
    console.log('Загружаемый файл:', {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    const response = await axios.post(`${process.env.REACT_APP_API_URL}/users/${base_id}/addphoto`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        // Content-Type не указываем, axios автоматически установит multipart/form-data
      },
    });
    console.log('Фото успешно загружено:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ошибка при загрузке фото:', error.message);
    if (error.response) {
      console.error('Ответ сервера:', error.response.status, error.response.data);
      alert(`Не удалось загрузить фото: ${error.response.data.message || `Ошибка ${error.response.status}`}`);
    } else if (error.request) {
      console.error('Запрос не отправлен. Возможная причина: CORS или сервер недоступен.', error.request);
      alert('Не удалось загрузить фото: проблема с подключением к серверу');
    } else {
      console.error('Ошибка настройки запроса:', error.message);
      alert(`Не удалось загрузить фото: ${error.message}`);
    }
    return null;
  }
};

  const handleAddTag = async () => {
  const trimmedTag = newTag.trim();
  if (!trimmedTag) {
    alert('Тег не может быть пустым');
    return;
  }
  if (trimmedTag.length > 50) {
    alert('Тег не может быть длиннее 50 символов');
    return;
  }
  if (!/^[a-zA-Zа-яА-Я0-9\s]+$/.test(trimmedTag)) {
    alert('Тег может содержать только буквы, цифры и пробелы');
    return;
  }

  const token = localStorage.getItem('authToken') || FALLBACK_TOKEN;
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/users/${base_id}/tag`,
      { tag: trimmedTag }, // Изменено с { value: trimmedTag } на { tag: trimmedTag }
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const addedTag = response.data;
    setFormData(prev => ({
      ...prev,
      tags: [...(prev.tags || []), { ...addedTag, name: addedTag.value }],
    }));
    setNewTag('');
  } catch (error) {
    console.error('Ошибка при добавлении тега:', error.message);
    let errorMessage = 'Не удалось добавить тег';
    if (error.response) {
      console.error('Ответ сервера:', error.response.status, error.response.data);
      errorMessage = error.response.data.message || `Ошибка сервера: ${error.response.status}`;
    } else if (error.request) {
      console.error('Возможная причина: CORS ошибка или сервер недоступен.');
      errorMessage = 'Проблема с подключением к серверу';
    }
    alert(errorMessage);
  }
};

  

  const handleRemoveTag = async (tagId) => {
    const token = localStorage.getItem('authToken') || FALLBACK_TOKEN;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/users/${base_id}/tags/${tagId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setFormData(prev => ({
        ...prev,
        tags: prev.tags.filter(tag => tag.id !== tagId),
      }));
    } catch (error) {
      console.error('Ошибка при удалении тега:', error.message);
      if (error.response) {
        console.error('Ответ сервера:', error.response.status, error.response.data);
        alert(`Не удалось удалить тег: ${error.response.data.message || error.message}`);
      } else if (error.request) {
        console.error('Возможная причина: CORS ошибка или сервер недоступен.');
        alert('Не удалось удалить тег: проблема с подключением к серверу');
      } else {
        alert(`Не удалось удалить тег: ${error.message}`);
      }
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
          birthDate: userData.birth_date
            ? new Date(userData.birth_date).toLocaleDateString('ru-RU')
            : '',
          description: userData.about_myself || '',
          personality: userData.jung_result || 'INTP',
          createdAt: userData.created_at
            ? new Date(userData.created_at).toLocaleDateString('ru-RU')
            : '04.04.25',
          age: userData.birth_date
            ? calculateAge(new Date(userData.birth_date).toLocaleDateString('ru-RU'))
            : '',
          photos: userData.photos || [],
          about_myself: userData.about_myself || '',
          tags: userData.tags || [],
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
        setError('Не удалось загрузить данные с сервера. Используются локальные данные.');
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
        photos: [...prev.photos, uploadedPhoto],
      }));
      setCurrentImageIndex(formData.photos.length);
    }
  };

  const handleRemovePhoto = async () => {
    if (formData.photos.length === 0) return;

    const token = localStorage.getItem('authToken') || FALLBACK_TOKEN;
    const photoId = formData.photos[currentImageIndex].id;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/users/${base_id}/photos/${photoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setFormData(prev => {
        const newPhotos = prev.photos.filter((_, i) => i !== currentImageIndex);
        return { ...prev, photos: newPhotos };
      });

      setCurrentImageIndex(prev =>
        prev >= formData.photos.length - 1 && prev > 0 ? prev - 1 : 0
      );
    } catch (error) {
      console.error('Ошибка при удалении фото:', error.message);
      if (error.response) {
        console.error('Ответ сервера:', error.response.status, error.response.data);
        alert(`Не удалось удалить фото: ${error.response.data.message || error.message}`);
      } else if (error.request) {
        console.error('Возможная причина: CORS ошибка или сервер недоступен.');
        alert('Не удалось удалить фото: проблема с подключением к серверу');
      } else {
        alert(`Не удалось удалить фото: ${error.message}`);
      }
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsSaving(true);

    const token = localStorage.getItem('authToken') || FALLBACK_TOKEN;
    try {
      const updatedAge = calculateAge(formData.birthDate);
      const updatedData = {
        ...formData,
        age: updatedAge !== '' ? updatedAge : formData.age,
        about_myself: formData.description,
        gender: formData.gender === 'М' ? 'MALE' : 'FEMALE',
      };

      const apiData = {
        name: updatedData.name,
        surname: updatedData.surname,
        gender: updatedData.gender,
        birth_date: formatDateToISO(updatedData.birthDate),
        about_myself: updatedData.description,
        jung_result: updatedData.personality,
        jung_last_attempt: new Date().toISOString(),
      };

      await axios.patch(
        `${process.env.REACT_APP_API_URL}/users/${base_id}/profile`,
        apiData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      localStorage.setItem('updatedUser', JSON.stringify(updatedData));
      navigate('/profile', { state: { updatedUser: updatedData } });
    } catch (error) {
      console.error('Ошибка при сохранении:', error.message);
      if (error.response) {
        console.error('Ответ сервера:', error.response.status, error.response.data);
        alert(`Не удалось сохранить изменения: ${error.response.data.message || error.message}`);
      } else if (error.request) {
        console.error('Возможная причина: CORS ошибка или сервер недоступен.');
        alert('Не удалось сохранить изменения: проблема с подключением к серверу');
      } else {
        alert(`Не удалось сохранить изменения: ${error.message}`);
      }
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
    'ISTP', 'ISFP', 'ESTP', 'ESFP',
  ];

  if (isLoading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pb-14">
      <header className="fixed top-0 left-0 right-0 bg-black z-50">
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

          <div>
            <label className="block text-gray-600 text-sm mb-1">Теги:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 border-2 border-black rounded-[15px] p-2 text-black"
                placeholder="Новый тег"
              />
              <button
                onClick={handleAddTag}
                className="bg-gray-200 text-gray-600 px-4 py-2 border-2 border-black rounded-[15px]"
              >
                Добавить
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map(tag => (
                <div
                  key={tag.id}
                  className="flex items-center bg-gray-200 rounded-[15px] px-3 py-1"
                >
                  <span className="text-gray-600 text-sm">{tag.name}</span>
                  <button
                    onClick={() => handleRemoveTag(tag.id)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="h-20" />
    </div>
  );
};

export default EditProfilePage;