import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AssignmentForm from './AssignmentForm';
import ChatComponent from '../components/ChatComponent';
import Whiteboard from './Whiteboard';
import ManageStudents from './ManageStudents';
import AttendanceForm from './AttendanceForm';

const CreateClassroom = () => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [showStudents, setShowStudents] = useState(false);
  const [activeTab, setActiveTab] = useState('assignments');

  useEffect(() => {
    if (!user) {
      navigate('/teacher/login');
      return;
    }
    fetchClassrooms();
    window.scrollTo(0, 0);
  }, [user, navigate]);

  const fetchClassrooms = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/teacher/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/classroom/teacher`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch classrooms');
      }

      const data = await response.json();
      setClassrooms(data);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      setError('Failed to load classrooms');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/teacher/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/classroom/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Classroom created successfully!');
        setFormData({ name: '', subject: '', description: '' });
        fetchClassrooms();
      } else {
        setError(data.message || 'Failed to create classroom');
      }
    } catch (error) {
      console.error('Error creating classroom:', error);
      setError('Failed to create classroom');
    }
  };

  const handleStudentRemoved = (studentId) => {
    setClassrooms(classrooms.map(classroom => {
      if (classroom._id === selectedClassroom) {
        return {
          ...classroom,
          students: classroom.students.filter(student => student._id !== studentId)
        };
      }
      return classroom;
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-visible">
      {/* Top Stats Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-medium">Active Classes</h3>
              <p className="text-3xl font-bold mt-2">{classrooms.length}</p>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg p-6 text-white">
              <h3 className="text-lg font-medium">Total Students</h3>
              <p className="text-3xl font-bold mt-2">
                {classrooms.reduce((acc, classroom) => acc + (classroom.students?.length || 0), 0)}
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg p-6 text-white">
              <h3 className="text-lg font-medium">Active Assignments</h3>
              <p className="text-3xl font-bold mt-2">
                {classrooms.reduce((acc, classroom) => acc + (classroom.assignments?.length || 0), 0)}
              </p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
              <h3 className="text-lg font-medium">Pending Reviews</h3>
              <p className="text-3xl font-bold mt-2">12</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Create Classroom Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Class</h2>
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
                    Classroom Name:
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject:
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description:
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
                >
                  Create Classroom
                </button>
              </form>
            </div>
          </div>

          {/* Classrooms List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">My Classes</h2>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                    Filter
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                    Sort
                  </button>
                </div>
              </div>
              
              {classrooms.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="mx-auto h-24 w-24 text-gray-400">
                    <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No classes created</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new class.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {classrooms.map((classroom) => (
                    <div key={classroom._id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{classroom.name}</h3>
                          <p className="text-sm text-gray-500">Subject: {classroom.subject}</p>
                          <p className="text-sm text-gray-500">
                            Students: {classroom.students?.length || 0}
                          </p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setShowStudents(true);
                              setSelectedClassroom(classroom._id);
                            }}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                          >
                            Manage Students
                          </button>
                        </div>
                      </div>

                      {/* Tab Navigation */}
                      <div className="border-b border-gray-200 mb-4">
                        <nav className="flex space-x-8" aria-label="Tabs">
                          <button
                            onClick={() => setActiveTab('assignments')}
                            className={`${
                              activeTab === 'assignments'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                          >
                            Assignments
                          </button>
                          <button
                            onClick={() => setActiveTab('attendance')}
                            className={`${
                              activeTab === 'attendance'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                          >
                            Attendance
                          </button>
                          <button
                            onClick={() => setActiveTab('chat')}
                            className={`${
                              activeTab === 'chat'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                          >
                            Class Discussion
                          </button>
                        </nav>
                      </div>

                      {/* Tab Content */}
                      <div className="mt-6 space-y-6">
                        {activeTab === 'assignments' ? (
                          <AssignmentForm 
                            classroomId={classroom._id} 
                            onAssignmentCreated={() => fetchClassrooms()}
                          />
                        ) : activeTab === 'attendance' ? (
                          <AttendanceForm classroomId={classroom._id} />
                        ) : (
                          <div>
                            <ChatComponent 
                              classroomId={classroom._id}
                              chatType="classroom"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showStudents && selectedClassroom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Manage Students</h2>
                <button
                  onClick={() => setShowStudents(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <ManageStudents
                classroomId={selectedClassroom}
                onStudentRemoved={handleStudentRemoved}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateClassroom;
