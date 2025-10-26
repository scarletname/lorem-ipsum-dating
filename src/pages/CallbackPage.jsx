import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { decodeToken } from '../utils/api';

const createOrCheckUserProfile = async (userId, token) => {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  try {
    const createUrl = `${process.env.REACT_APP_API_URL}/users`;
    const userData = { id: userId, name: "Имя", surname: "Фамилия" };
    await axios.post(createUrl, userData, { headers });
    console.log('Профиль успешно создан для userId:', userId);
    return true;
  } catch (error) {
    const checkUrl = `${process.env.REACT_APP_API_URL}/users/${userId}`;
    console.log('Проверка профиля для userId:', userId);
    if (error.response && error.response.status === 400) {
      await axios.get(checkUrl, { headers });
      return true;
    } else {
      console.error('Ошибка при проверке или создании профиля:', error.message);
      return false;
    }
  }
};

const refreshToken = async (refreshToken) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  try {
    const refreshUrl = `${process.env.REACT_APP_API_URL}/auth/refresh?refresh_token=${encodeURIComponent(refreshToken)}`;
    const response = await axios.post(refreshUrl, null, { headers });
    const tokens = response.data;
    sessionStorage.setItem('authToken', tokens.access_token);
    sessionStorage.setItem('refreshToken', tokens.refresh_token || '');
    sessionStorage.setItem('tokenExpiresIn', tokens.expires_in || 0);
    sessionStorage.setItem('refreshTokenExpiresIn', tokens.refresh_expires_in || 0);
    return true;
  } catch (error) {
    console.error('Ошибка при обновлении токена:', error.message);
    sessionStorage.clear();
    window.location.href = '/login';
    return false;
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
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      if (!code) {
        setError('Код авторизации отсутствует в URL');
        return;
      }
      try {
        const callbackUrl = `${process.env.REACT_APP_API_URL}/auth/callback?code=${encodeURIComponent(code)}`;
        const response = await axios.post(callbackUrl, null, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        const tokens = response.data;
        sessionStorage.setItem('authToken', tokens.access_token);
        sessionStorage.setItem('refreshToken', tokens.refresh_token);
        sessionStorage.setItem('tokenExpiresIn', tokens.expires_in);
        sessionStorage.setItem('refreshTokenExpiresIn', tokens.refresh_expires_in);
        const userId = decodeToken(tokens.access_token);
        if (userId) {
          sessionStorage.setItem('userId', userId);
          const profileCreated = await createOrCheckUserProfile(userId, tokens.access_token);
          if (!profileCreated) {
            throw new Error('Не удалось создать или проверить профиль');
          }

          const accessExpiresIn = tokens.expires_in * 1000;
          setTimeout(() => {
            const refreshTokenValue = sessionStorage.getItem('refreshToken');
            if (refreshTokenValue) {
              refreshToken(refreshTokenValue);
            } else {
              console.error('Refresh token отсутствует');
              navigate('/login');
            }
          }, accessExpiresIn * 0.75);

          navigate('/edit-profile');
        } else {
          throw new Error('Не удалось извлечь userId из токена');
        }
      } catch (error) {
        console.error('Ошибка в handleCallback:', error.message);
        setError('Не удалось получить токены');
      }
    };

    handleCallback();
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl">Авторизация...</h1>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default CallbackPage;