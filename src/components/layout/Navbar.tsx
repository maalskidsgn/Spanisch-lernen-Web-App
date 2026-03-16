import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '../shared/UI';
import { useAuth } from '../../AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/vocabulary', label: 'Vokabeltrainer' },
    { path: '/generator', label: 'KI Video Generator' },
    { path: '/world', label: 'Spanische Welt' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>

          <div className="flex gap-8">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-semibold transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'text-primary border-b-2 border-primary pb-2'
                    : 'text-text-secondary hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-600">
              {user?.displayName || user?.email}
            </span>
            <button 
              onClick={handleLogout}
              className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              Abmelden
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
