import React, { useState, useEffect } from 'react';

const AttendanceForm = ({ classroomId }) => {
  const [students, setStudents] = useState([]);
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
        setAttendanceRecords(
          data.map(student => ({
            student: student._id,
            status: 'present'
          }))
        );
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev =>
      prev.map(record =>
        record.student === studentId ? { ...record, status } : record
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/attendance/take`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            classroomId,
            date: new Date(date).toISOString(),
            records: attendanceRecords
          })
        }
      );

      const data = await response.json();
      if (response.ok) {
        setSuccess('Attendance recorded successfully!');
      } else {
        throw new Error(data.message || 'Failed to record attendance');
      }
    } catch (error) {
      console.error('Error recording attendance:', error);
      setError(error.message || 'Failed to record attendance');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Take Attendance</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date:
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        <div className="space-y-4">
          {students.map((student) => (
            <div
              key={student._id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded"
            >
              <div>
                <p className="font-medium">{student.name}</p>
                <p className="text-sm text-gray-500">{student.email}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange(student._id, 'present')}
                  className={`px-3 py-1 rounded ${
                    attendanceRecords.find(r => r.student === student._id)?.status === 'present'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Present
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(student._id, 'absent')}
                  className={`px-3 py-1 rounded ${
                    attendanceRecords.find(r => r.student === student._id)?.status === 'absent'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Absent
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Save Attendance
        </button>
      </form>
    </div>
  );
};

export default AttendanceForm; 