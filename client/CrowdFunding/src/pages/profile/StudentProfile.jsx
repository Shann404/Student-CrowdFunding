import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const StudentProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      // Structure the data to match the StudentProfile model exactly
      const profileData = {
        // user field is automatically handled by backend via auth middleware
        studentId: data.studentId,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        school: {
          name: data.schoolName,
          address: data.schoolAddress,
          type: data.schoolType
        },
        course: {
          name: data.courseName,
          duration: data.courseDuration,
          yearOfStudy: parseInt(data.yearOfStudy)
        },
        bio: data.bio,
        academicPerformance: data.academicPerformance,
        futureGoals: data.futureGoals
        // academicDocuments will be handled separately via file upload
      };

      console.log('Submitting profile data:', profileData);

      const response = await fetch('/api/students/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });

      const result = await response.json();

      if (response.ok) {
        navigate('/create-campaign');
      } else {
        setError(result.message || 'Failed to create profile');
        console.error('Server error:', result);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Request error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-yellow-500 mb-2">
              Complete Your Student Profile
            </h1>
            <p className="text-gray-600">
              Before creating campaigns, we need to verify your student status
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Student ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student ID *
              </label>
              <input
                type="text"
                {...register('studentId', { 
                  required: 'Student ID is required',
                  minLength: {
                    value: 3,
                    message: 'Student ID must be at least 3 characters'
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your student ID"
              />
              {errors.studentId && (
                <p className="mt-1 text-sm text-red-600">{errors.studentId.message}</p>
              )}
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  {...register('dateOfBirth', { 
                    required: 'Date of birth is required'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  {...register('gender', { required: 'Gender is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                )}
              </div>
            </div>

            {/* School Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">School Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School Name *
                  </label>
                  <input
                    type="text"
                    {...register('schoolName', { 
                      required: 'School name is required'
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="University name"
                  />
                  {errors.schoolName && (
                    <p className="mt-1 text-sm text-red-600">{errors.schoolName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School Type *
                  </label>
                  <select
                    {...register('schoolType', { required: 'School type is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select type</option>
                    <option value="university">University</option>
                    <option value="college">College</option>
                    <option value="high-school">High School</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.schoolType && (
                    <p className="mt-1 text-sm text-red-600">{errors.schoolType.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Address
                </label>
                <input
                  type="text"
                  {...register('schoolAddress')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full school address"
                />
              </div>
            </div>

            {/* Course Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Course Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    {...register('courseName', { 
                      required: 'Course name is required'
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Computer Science"
                  />
                  {errors.courseName && (
                    <p className="mt-1 text-sm text-red-600">{errors.courseName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Duration
                  </label>
                  <input
                    type="text"
                    {...register('courseDuration')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 4 years, 2 semesters"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year of Study *
                  </label>
                  <select
                    {...register('yearOfStudy', { required: 'Year of study is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select year</option>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                    <option value="5">Year 5+</option>
                  </select>
                  {errors.yearOfStudy && (
                    <p className="mt-1 text-sm text-red-600">{errors.yearOfStudy.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Performance
                  </label>
                  <input
                    type="text"
                    {...register('academicPerformance')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., GPA 3.8, First Class Honors"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                {...register('bio')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us about your academic journey and aspirations..."
              />
            </div>

            {/* Future Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Future Goals
              </label>
              <textarea
                {...register('futureGoals')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What are your career goals after graduation?"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-300 text-white py-3 px-4 rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
            >
              {loading ? 'Creating Profile...' : 'Complete Profile & Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;