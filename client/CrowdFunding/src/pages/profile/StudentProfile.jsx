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
  const [studentIdImage, setStudentIdImage] = useState(null);
  const [studentIdPreview, setStudentIdPreview] = useState('');
  const [serverErrors, setServerErrors] = useState([]);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleStudentIdImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image (JPEG, JPG, or PNG)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setStudentIdImage(file);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setStudentIdPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeStudentIdImage = () => {
    setStudentIdImage(null);
    setStudentIdPreview('');
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setServerErrors([]);

    // Validate student ID image
    if (!studentIdImage) {
      setError('Please upload a photo of your student ID card');
      setLoading(false);
      return;
    }

    try {
      // Create FormData to handle file upload
      const formData = new FormData();
      
      // Append the student ID image
      formData.append('studentIdImage', studentIdImage);
      
      // Append all other form data with consistent field names
      formData.append('studentId', data.studentIdNumber || '');
      formData.append('dateOfBirth', data.dateOfBirth);
      formData.append('gender', data.gender);
      formData.append('institutionName', data.schoolName); // Try different field names
      formData.append('schoolName', data.schoolName);
      formData.append('schoolAddress', data.schoolAddress || '');
      formData.append('schoolType', data.schoolType);
      formData.append('institutionType', data.schoolType);
      formData.append('courseName', data.courseName);
      formData.append('program', data.courseName);
      formData.append('courseDuration', data.courseDuration || '');
      formData.append('yearOfStudy', data.yearOfStudy);
      formData.append('currentYear', data.yearOfStudy);
      formData.append('bio', data.bio || '');
      formData.append('academicPerformance', data.academicPerformance || '');
      formData.append('futureGoals', data.futureGoals || '');

      console.log('Submitting profile data with student ID image');

      const response = await fetch('/api/students/profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();

      console.log('Server response:', result);

      if (response.ok) {
        navigate('/create-campaign');
      } else {
        // Handle validation errors from server
        if (result.errors) {
          setServerErrors(result.errors);
          setError('Please fix the validation errors below');
        } else {
          setError(result.message || 'Failed to create profile');
        }
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
            {/* Student ID Image Upload */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                🎓 Student ID Verification
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student ID Card Photo *
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, JPEG (MAX. 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleStudentIdImageChange}
                      className="hidden"
                      required
                    />
                  </label>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Upload a clear photo of your official student ID card. Make sure all details are readable.
                </p>
              </div>

              {/* Student ID Image Preview */}
              {studentIdPreview && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student ID Preview:
                  </label>
                  <div className="relative inline-block">
                    <img
                      src={studentIdPreview}
                      alt="Student ID preview"
                      className="h-32 rounded-lg border border-gray-300 object-contain"
                    />
                    <button
                      type="button"
                      onClick={removeStudentIdImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-green-600">
                    ✓ Student ID image uploaded successfully
                  </p>
                </div>
              )}

              {/* Student ID Number (Optional but recommended) */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student ID Number (Recommended)
                </label>
                <input
                  type="text"
                  {...register('studentIdNumber', {
                    required: 'Student ID number is recommended for verification'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your student ID number for reference"
                />
                {errors.studentIdNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.studentIdNumber.message}</p>
                )}
              </div>
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
                  <option value="prefer-not-to-say">Prefer not to say</option>
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
                    Institution Name *
                  </label>
                  <input
                    type="text"
                    {...register('schoolName', { 
                      required: 'Institution name is required'
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="University or college name"
                  />
                  {errors.schoolName && (
                    <p className="mt-1 text-sm text-red-600">{errors.schoolName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institution Type *
                  </label>
                  <select
                    {...register('schoolType', { required: 'Institution type is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select type</option>
                    <option value="university">University</option>
                    <option value="college">College</option>
                    <option value="high-school">High School</option>
                    <option value="vocational">Vocational School</option>
                    <option value="technical">Technical Institute</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.schoolType && (
                    <p className="mt-1 text-sm text-red-600">{errors.schoolType.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institution Address
                </label>
                <input
                  type="text"
                  {...register('schoolAddress')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full institution address"
                />
              </div>
            </div>

            {/* Course Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Academic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program/Course Name *
                  </label>
                  <input
                    type="text"
                    {...register('courseName', { 
                      required: 'Program/Course name is required'
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Computer Science, Medicine, etc."
                  />
                  {errors.courseName && (
                    <p className="mt-1 text-sm text-red-600">{errors.courseName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Duration
                  </label>
                  <input
                    type="text"
                    {...register('courseDuration')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 4 years, 2 semesters, etc."
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
                    placeholder="e.g., GPA 3.8, First Class, Distinction, etc."
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
                placeholder="Tell us about your academic journey, interests, and aspirations..."
              />
            </div>

            {/* Future Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Future Goals & Career Aspirations
              </label>
              <textarea
                {...register('futureGoals')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What are your career goals after graduation? How will this education help you achieve them?"
              />
            </div>

            {/* Display Server Validation Errors */}
            {serverErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <h4 className="font-semibold mb-2">Please fix the following errors:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {serverErrors.map((err, index) => (
                    <li key={index} className="text-sm">
                      {err.msg || err.message || err}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {error && !serverErrors.length && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !studentIdImage}
              className="w-full bg-yellow-300 text-white py-3 px-4 rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
            >
              {loading ? 'Creating Profile...' : 'Complete Profile & Continue'}
            </button>

            <p className="text-sm text-gray-600 text-center">
              Your student ID will be verified by our team before you can create campaigns. 
              This helps ensure the legitimacy of all campaigns on our platform.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;