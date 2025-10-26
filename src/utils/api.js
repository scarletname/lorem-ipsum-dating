import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Функция для получения токена
export const getAuthToken = () => {
  return sessionStorage.getItem('authToken');
};

// Функция для декодирования JWT токена
export const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    const decodedPayload = atob(payload);
    const parsedPayload = JSON.parse(decodedPayload);
    return parsedPayload.sub || parsedPayload.id || parsedPayload.user_id;
  } catch (error) {
    console.error('Ошибка при декодировании токена:', error.message);
    return null;
  }
};

// Функция для вычисления возраста из даты рождения
export const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  
  let birth;
  // Если передана строка в формате DD.MM.YYYY
  if (typeof birthDate === 'string' && /^\d{2}\.\d{2}\.\d{4}$/.test(birthDate)) {
    const [day, month, year] = birthDate.split('.').map(Number);
    birth = new Date(year, month - 1, day);
  } 
  // Если передана строка ISO или объект Date
  else {
    birth = new Date(birthDate);
  }
  
  if (isNaN(birth.getTime())) return null;
  
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age > 0 ? age : null;
};

// Функция для форматирования пола
export const formatGender = (gender) => {
  if (gender === 'MALE' || gender === 'М') return 'М';
  if (gender === 'FEMALE' || gender === 'Ж') return 'Ж';
  return gender;
};

// Создание заголовков для запросов
const createHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

// Загрузка фотографий пользователя
export const fetchUserPhotos = async (userId, token) => {
  try {
    const response = await axios.get(`${API_URL}/users/${userId}/photos`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.data || [];
  } catch (error) {
    console.warn(`Не удалось загрузить фото для пользователя ${userId}:`, error.message);
    return [];
  }
};

// Загрузка тегов пользователя
export const fetchUserTags = async (userId, token) => {
  try {
    const response = await axios.get(`${API_URL}/users/${userId}/tags`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return (response.data || []).map(tag => ({
      id: tag.id,
      user_id: tag.user_id,
      name: tag.value,
    }));
  } catch (error) {
    console.warn(`Не удалось загрузить теги для пользователя ${userId}:`, error.message);
    return [];
  }
};

// Загрузка полных данных пользователя
export const fetchUserData = async (userId, token) => {
  try {
    const userResponse = await axios.get(`${API_URL}/users/${userId}`, {
      headers: createHeaders(token),
    });
    const userData = userResponse.data;

    const [photos, tags] = await Promise.all([
      fetchUserPhotos(userId, token),
      fetchUserTags(userId, token),
    ]);

    return {
      ...userData,
      age: calculateAge(userData.birth_date),
      photos,
      tags,
    };
  } catch (error) {
    console.error(`Ошибка загрузки данных пользователя ${userId}:`, error.message);
    return null;
  }
};

// Загрузка списка пользователей по ID
export const fetchUsersByIds = async (userIds, token) => {
  const userPromises = userIds.map(id => fetchUserData(id, token));
  const usersData = await Promise.all(userPromises);
  return usersData.filter(user => user !== null);
};

// Выполнение свайпа
export const performSwipe = async (targetId, like, token) => {
  const response = await axios.post(`${API_URL}/swipes`, 
    { targetId, like },
    { headers: createHeaders(token) }
  );
  return response.data;
};

// Получение мэтчей
export const fetchMatches = async (page = 0, limit = 4, token) => {
  const response = await axios.get(`${API_URL}/matches?page=${page}&limit=${limit}`, {
    headers: createHeaders(token),
  });
  const userIds = response.data;
  return fetchUsersByIds(userIds, token);
};

// Получение свайпов
export const fetchSwipes = async (page = 0, limit = 4, token) => {
  const response = await axios.get(`${API_URL}/swipes?page=${page}&limit=${limit}`, {
    headers: createHeaders(token),
  });
  const userIds = response.data;
  return fetchUsersByIds(userIds, token);
};

// Получение рекомендаций
export const fetchRecommendations = async (limit = 1, token) => {
  const response = await axios.get(`${API_URL}/api/v1/recommend/fetch?limit=${limit}`, {
    headers: createHeaders(token),
  });
  const userIds = response.data.users || [];
  return fetchUsersByIds(userIds, token);
};
