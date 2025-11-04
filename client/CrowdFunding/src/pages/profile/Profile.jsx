import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useSelector(state => state.auth);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch student profile if user is a student
  useEffect(() => {
    const fetchStudentProfile = async () => {
      if (user?.role === 'student') {
        try {
          const response = await fetch('/api/students/profile', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (response.ok) {
            const profile = await response.json();
            setStudentProfile(profile);
          }
        } catch (error) {
          console.error('Error fetching student profile:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Header - Keep your existing header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-blue-100">{user.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    user.isVerified 
                      ? 'bg-green-500 bg-opacity-20 text-green-100' 
                      : 'bg-yellow-500 bg-opacity-20 text-yellow-100'
                  }`}>
                    {user.isVerified ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information - Keep your existing section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Full Name</label>
                    <p className="mt-1 text-gray-800">{user.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Email Address</label>
                    <p className="mt-1 text-gray-800">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Account Type</label>
                    <p className="mt-1 text-gray-800 capitalize">{user.role}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Member Since</label>
                    <p className="mt-1 text-gray-800">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Student Profile Section - NEW */}
              {user.role === 'student' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Academic Information</h2>
                  {loading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  ) : studentProfile ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Student ID</label>
                        <p className="mt-1 text-gray-800">{studentProfile.studentId}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">School</label>
                        <p className="mt-1 text-gray-800">{studentProfile.school?.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Course</label>
                        <p className="mt-1 text-gray-800">{studentProfile.course?.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Year of Study</label>
                        <p className="mt-1 text-gray-800">Year {studentProfile.yearOfStudy}</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-green-700 text-sm">
                          ✓ Your student profile is complete. You can create campaigns.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-800 mb-2">Profile Incomplete</h3>
                      <p className="text-yellow-700 mb-4">
                        You need to complete your student profile before creating campaigns.
                      </p>
                      <Link
                        to="/student-profile"
                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition duration-300 inline-block"
                      >
                        Complete Student Profile
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Account Status - Keep your existing section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Status</h2>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">Verification Status</h3>
                    <p className="text-blue-700">
                      {user.isVerified 
                        ? 'Your account has been verified and you can access all features.'
                        : 'Your account is pending verification. Some features may be limited.'
                      }
                    </p>
                  </div>

                  {user.role === 'student' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-semibold text-green-800 mb-2">Student Features</h3>
                      <ul className="text-green-700 list-disc list-inside space-y-1">
                        <li>Create fundraising campaigns</li>
                        <li>Upload academic documents</li>
                        <li>Receive donations from global donors</li>
                        <li>Track campaign progress</li>
                      </ul>
                    </div>
                  )}

                  {user.role === 'donor' && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-800 mb-2">Donor Features</h3>
                      <ul className="text-purple-700 list-disc list-inside space-y-1">
                        <li>Browse student campaigns</li>
                        <li>Make secure donations</li>
                        <li>Track your donation history</li>
                        <li>Receive updates from supported students</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex space-x-4">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300">
                  Edit Profile
                </button>
                <button className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition duration-300">
                  Change Password
                </button>
                {user.role === 'student' && !studentProfile && (
                  <Link
                    to="/student-profile"
                    className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition duration-300"
                  >
                    Complete Student Profile
                  </Link>
                )}
                <button className="bg-red-100 text-red-600 px-6 py-2 rounded-lg hover:bg-red-200 transition duration-300">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;