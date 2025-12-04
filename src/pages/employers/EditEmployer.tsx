import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../../lib/authInstances";
import { UploadCloud, Trash2, Plus, Image, Edit, Calendar, ArrowLeft } from "lucide-react";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";

const IMAGE_BASE_URL = "https://worklah.onrender.com";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const EditEmployer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    companyLegalName: "",
    hqAddress: "",
    companyNumber: "",
    companyEmail: "",
    mainContactPersonName: "",
    mainContactPersonPosition: "",
    mainContactPersonNumber: "",
    accountManager: "",
    industry: "",
    contractStartDate: { day: "1", month: "January", year: "2024" },
    contractEndDate: { day: "1", month: "January", year: "2024" },
    contractStatus: "In Discussion",
    companyLogo: null as File | null,
    acraCertificate: null as File | null,
    existingLogo: "",
  });

  const [outlets, setOutlets] = useState<Array<{ name: string; address: string; type: string; image: File | null; _id?: string }>>([]);

  useEffect(() => {
    if (id) {
      fetchEmployerData();
    }
  }, [id]);

  const fetchEmployerData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/employers/${id}`);
      const employer = response?.data?.employer || response?.data;

      if (employer) {
        const startDate = employer?.contractStartDate ? new Date(employer.contractStartDate) : new Date();
        const endDate = employer?.contractEndDate ? new Date(employer.contractEndDate) : new Date();

        setFormData({
          companyLegalName: employer?.companyLegalName || employer?.companyName || "",
          hqAddress: employer?.hqAddress || "",
          companyNumber: employer?.companyNumber || "",
          companyEmail: employer?.companyEmail || "",
          mainContactPersonName: employer?.mainContactPersonName || "",
          mainContactPersonPosition: employer?.mainContactPersonPosition || "",
          mainContactPersonNumber: employer?.mainContactPersonNumber || "",
          accountManager: employer?.accountManager || "",
          industry: employer?.industry || "",
          contractStartDate: {
            day: startDate.getDate().toString(),
            month: months[startDate.getMonth()] || "January",
            year: startDate.getFullYear().toString(),
          },
          contractEndDate: {
            day: endDate.getDate().toString(),
            month: months[endDate.getMonth()] || "January",
            year: endDate.getFullYear().toString(),
          },
          contractStatus: employer?.serviceAgreement || employer?.contractStatus || "In Discussion",
          companyLogo: null,
          acraCertificate: null,
          existingLogo: employer?.companyLogo ? `${IMAGE_BASE_URL}${employer.companyLogo}` : "",
        });

        if (employer?.outlets && Array.isArray(employer.outlets)) {
          setOutlets(employer.outlets.map((outlet: any) => ({
            name: outlet?.name || "",
            address: outlet?.address || outlet?.location || "",
            type: outlet?.type || "",
            image: null,
            _id: outlet?._id || outlet?.id,
          })));
        } else {
          setOutlets([{ name: "", address: "", type: "", image: null }]);
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load employer data");
      navigate("/employers");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDropdownChange = (
    field: "contractStartDate" | "contractEndDate",
    key: "day" | "month" | "year",
    value: string
  ) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: {
        ...prevData[field],
        [key]: value,
      },
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files?.[0]) {
      setFormData({ ...formData, [field]: e.target.files[0] });
    }
  };

  const handleOutletChange = (index: number, field: string, value: string | File | null) => {
    const updatedOutlets = [...outlets];
    (updatedOutlets[index] as any)[field] = value;
    setOutlets(updatedOutlets);
  };

  const addOutlet = () => {
    setOutlets([...outlets, { name: "", address: "", type: "", image: null }]);
  };

  const removeOutlet = (index: number) => {
    const updatedOutlets = outlets.filter((_, i) => i !== index);
    setOutlets(updatedOutlets);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = {
      companyLegalName: formData.companyLegalName,
      hqAddress: formData.hqAddress,
      companyNumber: formData.companyNumber,
      companyEmail: formData.companyEmail,
      mainContactPersonName: formData.mainContactPersonName,
      mainContactPersonPosition: formData.mainContactPersonPosition,
      mainContactPersonNumber: formData.mainContactPersonNumber,
      accountManager: formData.accountManager,
      industry: formData.industry,
      contractStartDate: {
        day: formData.contractStartDate.day,
        month: formData.contractStartDate.month,
        year: formData.contractStartDate.year,
      },
      contractEndDate: {
        day: formData.contractEndDate.day,
        month: formData.contractEndDate.month,
        year: formData.contractEndDate.year,
      },
      contractStatus: formData.contractStatus,
      outlets: outlets.map((outlet) => ({
        name: outlet.name,
        address: outlet.address,
        type: outlet.type,
        ...(outlet._id && { _id: outlet._id }),
      })),
    };

    try {
      const response = await axiosInstance.put(`/employers/${id}`, formDataToSend, {
        headers: { "Content-Type": "application/json" },
      });

      if (response?.status === 200 || response?.status === 201) {
        toast.success("Employer updated successfully!");
        navigate("/employers");
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error?.response?.data?.message || "An error occurred while updating the employer.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/employers")}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-3xl font-semibold">Edit Employer</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Logo Upload */}
          <div className="col-span-2 flex items-center gap-4">
            <label className="block text-gray-700 font-medium">Company Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "companyLogo")}
              className="hidden"
              id="logoInput"
            />
            <label htmlFor="logoInput" className="p-3 bg-blue-100 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors">
              <UploadCloud className="w-6 h-6 text-blue-600" />
            </label>
            {formData.companyLogo ? (
              <img
                src={URL.createObjectURL(formData.companyLogo)}
                alt="Logo Preview"
                className="w-16 h-16 object-cover rounded"
              />
            ) : formData.existingLogo ? (
              <img src={formData.existingLogo} alt="Current Logo" className="w-16 h-16 object-cover rounded" />
            ) : null}
          </div>

          {/* Text Fields */}
          {[
            { name: "companyLegalName", placeholder: "Enter company legal name", label: "Company legal name" },
            { name: "companyNumber", placeholder: "Enter company number", label: "Company number" },
            { name: "companyEmail", placeholder: "Enter company email", label: "Company Email" },
            { name: "mainContactPersonName", placeholder: "Enter MCP name", label: "Main contact person name" },
            { name: "mainContactPersonPosition", placeholder: "Enter MCP position", label: "Main contact person position" },
            { name: "mainContactPersonNumber", placeholder: "MCP number", label: "Main contact person number" },
            { name: "accountManager", placeholder: "Enter account manager name", label: "Account Manager" },
            { name: "hqAddress", placeholder: "SengKang, Singapore", label: "HQ Address" },
          ].map(({ name, placeholder, label }) => (
            <div key={name} className="relative">
              <label className="block text-gray-700 font-medium mb-1">{label}</label>
              <input
                type="text"
                name={name}
                placeholder={placeholder}
                value={(formData as any)[name]}
                onChange={handleChange}
                className="input-field w-full bg-gray-100 p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
              <Edit className="absolute right-3 top-9 text-gray-500 w-4 h-4" />
            </div>
          ))}

          {/* Industry */}
          <div className="relative">
            <label className="block text-gray-700 font-medium mb-1">Industry</label>
            <select
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className="input-field w-full bg-gray-100 p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select Industry</option>
              <option value="Retail">Retail</option>
              <option value="Hospitality">Hospitality</option>
              <option value="IT">IT</option>
              <option value="Healthcare">Healthcare</option>
            </select>
          </div>

          {/* Contract Start Date */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Contract Start Date</label>
            <div className="flex gap-2">
              <select
                value={formData.contractStartDate.day}
                onChange={(e) => handleDropdownChange("contractStartDate", "day", e.target.value)}
                className="p-2 rounded bg-gray-100 border border-gray-300"
              >
                {Array.from({ length: 31 }, (_, i) => (i + 1).toString()).map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              <select
                value={formData.contractStartDate.month}
                onChange={(e) => handleDropdownChange("contractStartDate", "month", e.target.value)}
                className="p-2 rounded bg-gray-100 border border-gray-300"
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                value={formData.contractStartDate.year}
                onChange={(e) => handleDropdownChange("contractStartDate", "year", e.target.value)}
                className="p-2 rounded bg-gray-100 border border-gray-300"
              >
                {Array.from({ length: 10 }, (_, i) => (2024 + i).toString()).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <Calendar className="text-gray-500 w-5 h-5 mt-2" />
            </div>
          </div>

          {/* Contract End Date */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Contract End Date</label>
            <div className="flex gap-2">
              <select
                value={formData.contractEndDate.day}
                onChange={(e) => handleDropdownChange("contractEndDate", "day", e.target.value)}
                className="p-2 rounded bg-gray-100 border border-gray-300"
              >
                {Array.from({ length: 31 }, (_, i) => (i + 1).toString()).map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              <select
                value={formData.contractEndDate.month}
                onChange={(e) => handleDropdownChange("contractEndDate", "month", e.target.value)}
                className="p-2 rounded bg-gray-100 border border-gray-300"
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                value={formData.contractEndDate.year}
                onChange={(e) => handleDropdownChange("contractEndDate", "year", e.target.value)}
                className="p-2 rounded bg-gray-100 border border-gray-300"
              >
                {Array.from({ length: 10 }, (_, i) => (2024 + i).toString()).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <Calendar className="text-gray-500 w-5 h-5 mt-2" />
            </div>
          </div>

          {/* Contract Status */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Contract Status</label>
            <select
              name="contractStatus"
              value={formData.contractStatus}
              onChange={handleChange}
              className="input-field w-full bg-gray-100 p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="In Discussion">In Discussion</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          {/* Outlets Section */}
          <div className="col-span-2">
            <h3 className="text-lg font-bold mb-4">Outlets</h3>
            {outlets.map((outlet, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border rounded-lg">
                <div className="flex flex-col gap-2">
                  <label className="font-medium">Outlet Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter Outlet name"
                      value={outlet.name}
                      onChange={(e) => handleOutletChange(index, "name", e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    />
                    <Edit className="absolute top-3 right-3 text-gray-400" size={16} />
                  </div>
                  <label className="font-medium">Outlet Type</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter Outlet type"
                      value={outlet.type}
                      onChange={(e) => handleOutletChange(index, "type", e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    />
                    <Edit className="absolute top-3 right-3 text-gray-400" size={16} />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-medium">Outlet Address</label>
                  <div className="relative">
                    <textarea
                      placeholder="Enter Outlet Address"
                      value={outlet.address}
                      onChange={(e) => handleOutletChange(index, "address", e.target.value)}
                      className="w-full p-2 border rounded-lg h-16"
                    />
                    <Edit className="absolute top-3 right-3 text-gray-400" size={16} />
                  </div>
                </div>
                <div className="col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeOutlet(index)}
                    className="text-red-600 flex items-center gap-2 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                    <span>Remove Outlet</span>
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addOutlet}
              className="mt-2 flex items-center gap-2 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
            >
              <Plus className="w-4 h-4" /> Add Outlet
            </button>
          </div>

          {/* Cancel & Save Buttons */}
          <div className="col-span-2 flex justify-between mt-6">
            <button
              type="button"
              onClick={() => navigate("/employers")}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Update Employer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployer;

