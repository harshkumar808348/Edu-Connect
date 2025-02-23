import React, { useState, useEffect } from 'react';
import AssignmentSubmissions from './AssignmentSubmissions';

const AssignmentForm = ({ classroomId, onAssignmentCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    files: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    if (e.target.name === 'files') {
      setFormData({
        ...formData,
        files: Array.from(e.target.files)
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!formData.files.length) {
        throw new Error('Please select at least one file');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('dueDate', formData.dueDate);
      formDataToSend.append('classroomId', classroomId);

      formData.files.forEach(file => {
        formDataToSend.append('files', file);
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/assignment/create/${classroomId}`, {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Assignment created successfully!');
        setFormData({
          title: '',
          description: '',
          dueDate: '',
          files: []
        });
        if (onAssignmentCreated) onAssignmentCreated();
        fetchAssignments(); // Refresh the assignments list
      } else {
        throw new Error(data.message || 'Failed to create assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      setError('Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/assignment/classroom/${classroomId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const data = await response.json();
      if (response.ok) {
        setAssignments(data);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [classroomId]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Create New Assignment</h3>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title:
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Assignment Title"
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
              placeholder="Assignment Description"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows="4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date:
            </label>
            <input
              type="datetime-local"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attachments:
            </label>
            <input
              type="file"
              name="files"
              onChange={handleChange}
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              Accepted files: PDF, Word, Images (JPG, PNG), Text
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Creating...' : 'Create Assignment'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Assignments</h3>
        <div className="space-y-6">
          {assignments.map(assignment => (
            <div key={assignment._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-semibold">{assignment.title}</h4>
                  <p className="text-gray-600 mt-1">{assignment.description}</p>
                  <p className="text-sm text-gray-500">
                    Due: {new Date(assignment.dueDate).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAssignment(
                    selectedAssignment?._id === assignment._id ? null : assignment
                  )}
                  className="text-blue-500 hover:text-blue-700"
                >
                  {selectedAssignment?._id === assignment._id ? 'Hide' : 'View'} Submissions
                </button>
              </div>

              {assignment.attachments && assignment.attachments.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Attachments:</p>
                  <ul className="list-disc list-inside">
                    {assignment.attachments.map((file, index) => (
                      <li key={index}>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          {file.filename}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedAssignment?._id === assignment._id && (
                <AssignmentSubmissions assignmentId={assignment._id} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssignmentForm; 