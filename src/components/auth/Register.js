// src/components/auth/Register.js
import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      carModel: '',
      licenseNo: '',
      aadharNo: '',
      panNo: '',
      carRegNo: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Required'),
      password: Yup.string().min(6, 'Must be 6 characters or more').required('Required'),
      // Add more validation
    }),
    onSubmit: async (values) => {
      try {
        // API call to register user
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        
        if (response.ok) {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Registration failed:', error);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          {step === 1 && (
            <div className="rounded-md shadow-sm -space-y-px">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                {...formik.getFieldProps('email')}
              />
              {/* Add more fields */}
            </div>
          )}
          
          {step === 2 && (
            <div className="rounded-md shadow-sm -space-y-px">
              <input
                id="carModel"
                name="carModel"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Car Model"
                {...formik.getFieldProps('carModel')}
              />
              {/* Add more car-related fields */}
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={() => setStep(step === 1 ? 2 : 1)}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {step === 1 ? 'Next' : 'Back'}
            </button>
            {step === 2 && (
              <button
                type="submit"
                className="mt-4 group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Register
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 
