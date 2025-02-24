import React, { useState, useEffect } from 'react';

const AssignmentList = ({ classroomId }) => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submission, setSubmission] = useState({
    comment: '',
    files: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (classroomId) {
      fetchAssignments();
    }
  }, [classroomId]);

  const fetchAssignments = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/assignment/classroom/${classroomId}`,
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
      setError('Failed to fetch assignments');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('comment', submission.comment);
      
      submission.files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/assignment/submit/${selectedAssignment._id}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit assignment');
      }

      setSelectedAssignment(null);
      setSubmission({ comment: '', files: [] });
      fetchAssignments();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-4">Assignments</h3>
      {assignments.length === 0 ? (
        <p className="text-gray-600">No assignments yet</p>
      ) : (
        <div className="space-y-4">
          {assignments.map(assignment => (
            <div key={assignment._id} className="border rounded-lg p-4 bg-white shadow-sm">
              <h4 className="text-lg font-semibold">{assignment.title}</h4>
              <p className="text-gray-600 mt-2">{assignment.description}</p>
              <p className="text-sm text-gray-500 mt-2">
                Due: {formatDate(assignment.dueDate)}
              </p>
              {assignment.attachments && assignment.attachments.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Attachments:</p>
                  <ul className="list-disc list-inside">
                    {assignment.attachments.map((attachment, index) => (
                      <li key={index}>
                        <a 
                          href={attachment.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          {attachment.filename}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                onClick={() => setSelectedAssignment(assignment)}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Submit Assignment
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              Submit Assignment: {selectedAssignment.title}
            </h3>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comment:
                </label>
                <textarea
                  value={submission.comment}
                  onChange={(e) => setSubmission({
                    ...submission,
                    comment: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Files:
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  onChange={(e) => setSubmission({
                    ...submission,
                    files: Array.from(e.target.files)
                  })}
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Accepted files: PDF, Word, Images (JPG, PNG), Text
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentList; 