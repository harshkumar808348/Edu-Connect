import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const ManageStudents = ({ classroomId, onStudentRemoved }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchStudents();
  }, [classroomId]);

  const fetchStudents = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/classroom/${classroomId}/students`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const data = await response.json();
      if (response.ok) {
        setStudents(data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const removeStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student?')) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/classroom/${classroomId}/remove-student`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ studentId })
        }
      );

      if (response.ok) {
        setStudents(students.filter(student => student._id !== studentId));
        if (onStudentRemoved) {
          onStudentRemoved(studentId);
        }
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to remove student');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading students...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Manage Students</h3>
      {students.length === 0 ? (
        <p className="text-gray-500 text-center">No students in this classroom</p>
      ) : (
        <div className="space-y-4">
          {students.map((student) => (
            <div
              key={student._id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <h4 className="font-medium">{student.name}</h4>
                <p className="text-sm text-gray-500">{student.email}</p>
              </div>
              <button
                onClick={() => removeStudent(student._id)}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageStudents; 