import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex gap-4">
          {!user && (
            <>
              <Link to="/student/login" className="text-blue-500 hover:text-blue-700">
                Student Login
              </Link>
              <Link to="/student/register" className="text-blue-500 hover:text-blue-700">
                Student Register
              </Link>
              <Link to="/teacher/login" className="text-blue-500 hover:text-blue-700">
                Teacher Login
              </Link>
              <Link to="/teacher/register" className="text-blue-500 hover:text-blue-700">
                Teacher Register
              </Link>
            </>
          )}
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user.name}</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation; 