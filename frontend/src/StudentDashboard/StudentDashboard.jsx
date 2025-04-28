import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import JoinClassroom from './JoinClassroom';

const StudentDashboard = () => {
  const { user, logout } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-100 overflow-x-hidden">
      <nav className="bg-white shadow-md p-4 fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">Student Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user.name}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <div className="container mx-auto py-8 mt-16">
        <JoinClassroom />
      </div>
    </div>
  );
};

export default StudentDashboard; 