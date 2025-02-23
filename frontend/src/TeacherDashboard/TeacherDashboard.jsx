import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CreateClassroom from './CreateClassroom';
import AssignmentManager from './AssignmentManager';
import StudentList from './StudentList';
import TeacherProfile from './TeacherProfile';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('classrooms');
  const { user, logout } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case 'classrooms':
        return <CreateClassroom />;
      case 'assignments':
        return <AssignmentManager />;
      case 'students':
        return <StudentList />;
      case 'profile':
        return <TeacherProfile />;
      default:
        return <CreateClassroom />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user.name}</span>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('classrooms')}
              className={`px-3 py-4 text-sm font-medium ${
                activeTab === 'classrooms'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Classrooms
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-3 py-4 text-sm font-medium ${
                activeTab === 'assignments'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Assignments
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-3 py-4 text-sm font-medium ${
                activeTab === 'students'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-4 text-sm font-medium ${
                activeTab === 'profile'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Profile
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default TeacherDashboard; 