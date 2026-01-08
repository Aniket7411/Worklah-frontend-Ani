"use client";

import { useState } from "react";
import { UserPlus, Mail, User, Building2, Shield, X } from "lucide-react";
import { axiosInstance } from "../../lib/authInstances";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";

export default function CreateUser() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "USER", // USER, EMPLOYER, ADMIN
    nric: "",
    phoneNumber: "",
    employerId: "",
    sendCredentials: true,
  });
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [employers, setEmployers] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.password || !formData.role) {
      toast.error("Please fill all required fields");
      return;
    }

    if (formData.role === "USER" && !formData.nric) {
      toast.error("NRIC is required for USER role");
      return;
    }

    if (formData.role === "EMPLOYER" && !formData.employerId) {
      toast.error("Please select an employer");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        nric: formData.nric || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        employerId: formData.employerId || undefined,
        sendCredentials: formData.sendCredentials,
      };

      const response = await axiosInstance.post("/admin/users/create", payload);

      if (response.data?.success !== false) {
        toast.success("User created successfully");
        setGeneratedCredentials({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
        });
        
        // Reset form
        setFormData({
          fullName: "",
          email: "",
          password: "",
          role: "USER",
          nric: "",
          phoneNumber: "",
          employerId: "",
          sendCredentials: true,
        });

        if (formData.sendCredentials) {
          toast.success("Credentials sent to email");
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployers = async () => {
    try {
      const response = await axiosInstance.get("/admin/employers?limit=100");
      if (response.data?.success !== false && response.data?.employers) {
        setEmployers(response.data.employers);
      }
    } catch (err) {
      console.error("Error fetching employers:", err);
    }
  };

  if (formData.role === "EMPLOYER" && employers.length === 0) {
    fetchEmployers();
  }

  if (loading) return <Loader />;

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <UserPlus size={28} />
          Create New User Account
        </h2>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="user@example.com"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Generate or enter password"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={generatePassword}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Generate
              </button>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="USER">USER (Worker/Hustle Hero)</option>
                <option value="EMPLOYER">EMPLOYER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>

          {/* NRIC (for USER role) */}
          {formData.role === "USER" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NRIC <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nric"
                value={formData.nric}
                onChange={handleChange}
                placeholder="S1234567A"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+65 1234 5678"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Employer Selection (for EMPLOYER role) */}
          {formData.role === "EMPLOYER" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Employer <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  name="employerId"
                  value={formData.employerId}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none"
                  required
                >
                  <option value="">Select an employer</option>
                  {employers.map((employer) => (
                    <option key={employer._id} value={employer._id}>
                      {employer.companyLegalName || employer.name || "Unknown"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Send Credentials */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="sendCredentials"
              checked={formData.sendCredentials}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded border-gray-300"
            />
            <label className="text-sm font-medium text-gray-700">
              Send credentials to email automatically
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus size={18} />
            Create User Account
          </button>
        </form>

        {/* Generated Credentials Modal */}
        {generatedCredentials && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Credentials Generated</h3>
                <button
                  onClick={() => setGeneratedCredentials(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
             <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Full Name:</p>
                  <p className="font-semibold">{generatedCredentials.fullName}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Email:</p>
                  <p className="font-semibold">{generatedCredentials.email}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Password:</p>
                  <p className="font-mono font-semibold">{generatedCredentials.password}</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
                  <p className="font-semibold">⚠️ Important:</p>
                  <p>Please save these credentials. They will not be shown again.</p>
                  {formData.sendCredentials && (
                    <p className="mt-2">Credentials have been sent to the user's email.</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setGeneratedCredentials(null)}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

