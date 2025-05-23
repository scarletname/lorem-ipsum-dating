import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import SwipesPage from './pages/SwipesPage';
import LoginPage from './pages/LoginPage';
import CallbackPage from './pages/CallbackPage';
import NavigationBar from './components/NavigationBar';

// Компонент для рендеринга навигации на нужных страницах
const Layout = ({ children }) => {
  const location = useLocation();
  const showNavigation = !['/login', '/code_callback'].includes(location.pathname);

  return (
    <>
      {children}
      {showNavigation && <NavigationBar />}
    </>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Убрано перенаправление на /login */}
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/home"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/profile"
          element={
            <Layout>
              <ProfilePage />
            </Layout>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <Layout>
              <EditProfilePage />
            </Layout>
          }
        />
        <Route
          path="/settings"
          element={
            <Layout>
              <SwipesPage />
            </Layout>
          }
        />
        <Route path="/code_callback" element={<CallbackPage />} />
      </Routes>
    </Router>
  );
}

export default App;