import React, { useState } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../lib/authInstances';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axiosInstance.post('/user/forgot-password', { email });
      setIsEmailSent(true);
      toast.success('Password reset email sent! Please check your inbox.');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to send reset email. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Section with Illustration */}
      <div className="hidden md:flex md:w-1/2 bg-[#0066FF] relative">
        <div className="absolute inset-0 p-12">
          <img
            src="/assets/login.svg"
            alt="Forgot Password illustration"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Right Section with Form */}
      <div className="flex flex-col w-full md:w-1/2 p-12 sm:p-20 lg:p-24 justify-center">
        <div className="w-full max-w-lg mx-auto space-y-10">
          {/* Logo */}
          <div className="flex justify-center py-2">
            <img
              src="/assets/logo.png"
              alt="Work Lah! Logo"
              className="h-24 w-auto"
            />
          </div>

          {/* Form */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
              <p className="text-gray-600">
                {isEmailSent
                  ? 'We\'ve sent a password reset link to your email address.'
                  : 'Enter your email address and we\'ll send you a link to reset your password.'}
              </p>
            </div>

            {!isEmailSent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-base font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="block w-full rounded-lg border border-gray-300 pl-10 pr-5 py-4 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-lg bg-[#007BE5] px-6 py-4 text-white text-lg font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  Check your email for further instructions.
                </div>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full rounded-lg bg-[#007BE5] px-6 py-4 text-white text-lg font-semibold hover:bg-blue-600"
                >
                  Back to Login
                </button>
              </div>
            )}

            <div className="flex items-center">
              <Link
                to="/login"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <ArrowLeft size={16} />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

