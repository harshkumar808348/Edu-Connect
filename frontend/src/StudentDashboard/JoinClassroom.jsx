import React, { useState, useEffect } from 'react';
import AssignmentList from './AssignmentList';
import ChatComponent from '../components/ChatComponent';
import { useAuth } from '../context/AuthContext';

const JoinClassroom = () => {
  const [code, setCode] = useState('');
  const [joinedClassrooms, setJoinedClassrooms] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchJoinedClassrooms = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/classroom/student', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setJoinedClassrooms(data);
      }
    } catch (error) {
      console.error('Error fetching classrooms:', error);
    }
  };

  useEffect(() => {
    fetchJoinedClassrooms();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/classroom/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to join classroom');
      }

      setSuccess('Successfully joined the classroom!');
      setCode('');
      fetchJoinedClassrooms(); // Refresh the list
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Stats Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-medium">Total Classes</h3>
              <p className="text-3xl font-bold mt-2">{joinedClassrooms.length}</p>
            </div>
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg p-6 text-white">
              <h3 className="text-lg font-medium">Active Assignments</h3>
              <p className="text-3xl font-bold mt-2">
                {joinedClassrooms.reduce((acc, classroom) => acc + (classroom.assignments?.length || 0), 0)}
              </p>
            </div>
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg p-6 text-white">
              <h3 className="text-lg font-medium">Upcoming Due Dates</h3>
              <p className="text-3xl font-bold mt-2">5</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Join New Class Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Join New Class</h2>
              {error && (
                <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
                  {success}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter 5-digit code"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                >
                  Join Class
                </button>
              </form>
            </div>

            {/* Quick Links */}
            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
              <nav className="space-y-2">
                <a href="#" className="flex items-center px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md">
                  <span className="mr-3">📚</span>
                  My Assignments
                </a>
                <a href="#" className="flex items-center px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md">
                  <span className="mr-3">📊</span>
                  Progress Report
                </a>
                <a href="#" className="flex items-center px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md">
                  <span className="mr-3">📅</span>
                  Calendar
                </a>
              </nav>
            </div>
          </div>

          {/* Joined Classrooms */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-xl font-semibold text-gray-900">My Classes</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {joinedClassrooms.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="mx-auto h-24 w-24 text-gray-400">
                      <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No classes joined</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by joining a class using a class code.</p>
                  </div>
                ) : (
                  joinedClassrooms.map(classroom => (
                    <div key={classroom._id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{classroom.name}</h3>
                          <p className="text-sm text-gray-500">Teacher: {classroom.teacher.name}</p>
                          <p className="text-sm text-gray-500">Subject: {classroom.subject}</p>
                        </div>
                        <span className="px-3 py-1 text-sm text-green-700 bg-green-100 rounded-full">
                          Active
                        </span>
                      </div>
                      
                      <div className="mt-6 space-y-6">
                        <AssignmentList classroomId={classroom._id} />
                        <div className="border-t pt-6">
                          <h4 className="text-lg font-medium text-gray-900 mb-4">Class Discussion</h4>
                          <ChatComponent 
                            classroomId={classroom._id}
                            chatType="classroom"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinClassroom;
