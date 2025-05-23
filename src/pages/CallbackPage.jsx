import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const decodeToken = (token) => {
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

const createOrCheckUserProfile = async (userId, token, baseUrl) => {
  const checkUrl = `${baseUrl}/users/${userId}`;
  console.log('Проверка профиля для userId:', userId);

  try {
    // Проверяем существование профиля
    await axios.get(checkUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      timeout: 10000,
    });
    console.log('Профиль уже существует для userId:', userId);
    return true; // Профиль есть, ничего не создаём
  } catch (error) {
    if (error.response && error.response.status === 404) {
      const createUrl = `${baseUrl}/users`;
      const userData = { id: userId, name: "Имя", surname: "Фамилия" }; // Минимальные данные
      console.log('Создание профиля для userId:', userId);
      await axios.post(createUrl, userData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        timeout: 15000,
      });
      console.log('Профиль успешно создан для userId:', userId);
      return true;
    } else {
      console.error('Ошибка при проверке или создании профиля:', error.message, 'Config:', error.config);
      return false;
    }
  }
};

const CallbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const isProcessed = useRef(false);

  useEffect(() => {
    if (isProcessed.current) return;

    const handleCallback = async () => {
      isProcessed.current = true;

      console.log('Текущий URL:', location.search);
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      console.log('Извлечённый code из URL:', code);

      if (!code) {
        setError('Код авторизации отсутствует в URL');
        return;
      }

      try {
        const url = `http://192.168.1.50/auth/callback?code=${encodeURIComponent(code)}`;
        const response = await axios.post(url, null, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 10000,
        });
        console.log('Полный ответ от сервера:', response.data);

        const tokens = response.data;
        console.log('Полученные токены:', tokens);

        sessionStorage.setItem('authToken', tokens.access_token);
        sessionStorage.setItem('refreshToken', tokens.refresh_token || '');
        sessionStorage.setItem('tokenExpiresIn', tokens.expires_in || 0);
        sessionStorage.setItem('refreshTokenExpiresIn', tokens.refresh_expires_in || 0);

        const userId = decodeToken(tokens.access_token);
        if (userId) {
          console.log('Сохранённый userId:', userId);
          sessionStorage.setItem('userId', userId);
          const baseUrl = process.env.REACT_APP_API_URL;
          const profileCreated = await createOrCheckUserProfile(userId, tokens.access_token, baseUrl);
          if (!profileCreated) {
            throw new Error('Не удалось создать или проверить профиль');
          }

          setTimeout(() => navigate('/edit-profile'), 10000); // Задержка перед навигацией
        } else {
          throw new Error('Не удалось извлечь userId из токена');
        }
      } catch (error) {
        console.error('Детали ошибки:', error.response?.status, error.response?.data);
        let errorMessage = 'Неизвестная ошибка';
        if (error.response?.data) {
          if (error.response.data.error_description) {
            errorMessage = error.response.data.error_description;
          } else if (error.response.data.detail) {
            errorMessage = JSON.stringify(error.response.data.detail);
          } else {
            errorMessage = JSON.stringify(error.response.data);
          }
        } else if (error.code === 'ECONNABORTED') {
          errorMessage = 'Таймаут запроса, код истёк';
        } else {
          errorMessage = error.message;
        }
        setError('Не удалось получить токены: ' + errorMessage);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl">Авторизация...</h1>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default CallbackPage;