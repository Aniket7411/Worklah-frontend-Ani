"use client";

import { useState } from "react";
import { Send, Users, User, Building2, X } from "lucide-react";
import { axiosInstance } from "../../lib/authInstances";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";

export default function SendNotification() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipientType: "all", // all, user, employer
    userId: "",
    employerId: "",
    type: "System",
    title: "",
    message: "",
  });
  const [users, setUsers] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const [showEmployerList, setShowEmployerList] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/admin/users?limit=100");
      if (response.data?.success !== false && response.data?.users) {
        setUsers(response.data.users);
        setShowUserList(true);
      }
    } catch (err) {
      toast.error("Failed to fetch users");
    }
  };

  const fetchEmployers = async () => {
    try {
      const response = await axiosInstance.get("/admin/employers?limit=100");
      if (response.data?.success !== false && response.data?.employers) {
        setEmployers(response.data.employers);
        setShowEmployerList(true);
      }
    } catch (err) {
      toast.error("Failed to fetch employers");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.message) {
      toast.error("Please fill all required fields");
      return;
    }

    if (formData.recipientType === "user" && !formData.userId) {
      toast.error("Please select a user");
      return;
    }

    if (formData.recipientType === "employer" && !formData.employerId) {
      toast.error("Please select an employer");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        type: formData.type,
        title: formData.title,
        message: formData.message,
      };

      if (formData.recipientType === "user") {
        payload.userId = formData.userId;
      } else if (formData.recipientType === "employer") {
        payload.employerId = formData.employerId;
      }

      const response = await axiosInstance.post("/admin/notifications/send", payload);

      if (response.data?.success !== false) {
        toast.success("Notification sent successfully");
        setFormData({
          recipientType: "all",
          userId: "",
          employerId: "",
          type: "System",
          title: "",
          message: "",
        });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  const selectedUser = users.find(u => u._id === formData.userId);
  const selectedEmployer = employers.find(e => e._id === formData.employerId);

  if (loading) return <Loader />;

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Send Notification</h2>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Recipient Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Send To <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="recipientType"
                  value="all"
                  checked={formData.recipientType === "all"}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600"
                />
                <Users size={18} />
                <span>All Users</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="recipientType"
                  value="user"
                  checked={formData.recipientType === "user"}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600"
                />
                <User size={18} />
                <span>Specific User</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="recipientType"
                  value="employer"
                  checked={formData.recipientType === "employer"}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600"
                />
                <Building2 size={18} />
                <span>Employer</span>
              </label>
            </div>
          </div>

          {/* User Selection */}
          {formData.recipientType === "user" && (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select User <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={selectedUser ? `${selectedUser.fullName || selectedUser.name || ""} (${selectedUser.nric || selectedUser.icNumber || ""})` : ""}
                  placeholder="Click to select user"
                  onClick={fetchUsers}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer"
                />
                {selectedUser && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, userId: "" }));
                      setShowUserList(false);
                    }}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              {showUserList && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, userId: user._id }));
                        setShowUserList(false);
                      }}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b"
                    >
                      <p className="font-medium">{user.fullName || user.name || "Unknown"}</p>
                      <p className="text-sm text-gray-600">{user.nric || user.icNumber || ""}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Employer Selection */}
          {formData.recipientType === "employer" && (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Employer <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={selectedEmployer ? selectedEmployer.companyLegalName || selectedEmployer.name || "" : ""}
                  placeholder="Click to select employer"
                  onClick={fetchEmployers}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer"
                />
                {selectedEmployer && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, employerId: "" }));
                      setShowEmployerList(false);
                    }}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              {showEmployerList && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {employers.map((employer) => (
                    <div
                      key={employer._id}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, employerId: employer._id }));
                        setShowEmployerList(false);
                      }}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b"
                    >
                      <p className="font-medium">{employer.companyLegalName || employer.name || "Unknown"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notification Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Type <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="System">System</option>
              <option value="Payment">Payment</option>
              <option value="Job">Job</option>
              <option value="Application">Application</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter notification title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Enter notification message"
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send size={18} />
              Send Notification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

