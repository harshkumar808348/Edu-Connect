import React, { useState, useEffect } from 'react';

const AssignmentSubmissions = ({ assignmentId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, [assignmentId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/assignment/submissions/${assignmentId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const data = await response.json();
      if (response.ok) {
        setSubmissions(data);
      }
    } catch (error) {
      setError('Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) return <p className="text-gray-600">Loading submissions...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="mt-4">
      <h4 className="text-lg font-semibold mb-3">Submissions ({submissions.length})</h4>
      {submissions.length === 0 ? (
        <p className="text-gray-600">No submissions yet</p>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div key={submission._id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{submission.student.name}</p>
                  <p className="text-sm text-gray-600">{submission.student.email}</p>
                  <p className="text-sm text-gray-500">
                    Submitted: {formatDate(submission.createdAt)}
                  </p>
                </div>
              </div>
              
              {submission.comment && (
                <div className="mt-2">
                  <p className="font-medium">Comment:</p>
                  <p className="text-gray-700">{submission.comment}</p>
                </div>
              )}

              {submission.attachments && submission.attachments.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Attachments:</p>
                  <ul className="list-disc list-inside">
                    {submission.attachments.map((file, index) => (
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentSubmissions; 