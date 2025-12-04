import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../lib/authInstances";
import { UploadCloud, Trash2, Plus, Image, Edit, Calendar } from "lucide-react";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const AddEmployer: React.FC = () => {
  const navigate = useNavigate();
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
  });


  const [outlets, setOutlets] = useState([{ name: "", address: "", type: "", image: null as File | null }]);


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
    if (e.target.files && e.target.files[0]) {
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


  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
 
  //   const formDataToSend = new FormData();
  //   Object.entries(formData).forEach(([key, value]) => {
  //     if (value instanceof File) {
  //       formDataToSend.append(key, value);
  //     } else if (value && typeof value === "object" && !Array.isArray(value)) {
  //       Object.entries(value).forEach(([subKey, subValue]) => {
  //         formDataToSend.append(`${key}[${subKey}]`, String(subValue));
  //       });
  //     } else {
  //       formDataToSend.append(key, String(value));
  //     }
  //   });
 
  //   // ✅ Remove empty outlets before sending
  //   const validOutlets = outlets.filter(
  //     (outlet) => outlet.name.trim() && outlet.address.trim() && outlet.type.trim()
  //   );
 
  //   validOutlets.forEach((outlet, index) => {
  //     formDataToSend.append(`outlets[${index}][name]`, outlet.name);
  //     formDataToSend.append(`outlets[${index}][address]`, outlet.address);
  //     formDataToSend.append(`outlets[${index}][type]`, outlet.type);
  //     if (outlet.image) formDataToSend.append(`outlets[${index}][image]`, outlet.image);
  //   });
 
  //   try {
  //     const response = await axiosInstance.post("/employers/create", formDataToSend);
  //     if (response.status === 201) {
  //       alert("Employer added successfully!");
  //       navigate("/employers");
  //     }
  //   } catch (error) {
  //     console.error("Error adding employer:", error);
  //     alert("Failed to add employer.");
  //   }
  // };
 


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create the JSON body
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
      })),
    };
  
    try {
      const response = await axiosInstance.post("/employers/create", formDataToSend, {
        headers: { "Content-Type": "application/json" },
      });
  
      if (response.status === 201) {
        alert("Employer added successfully!");
        navigate("/employers");
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error?.response?.data?.message || "An error occurred while adding the employer.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };
  
  

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-full max-w-6xl mx-auto">
      <h2 className="text-3xl font-semibold mb-4">Add New Employer</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">

        {/* Company Logo Upload */}
        <div className="col-span-2 flex items-center gap-4">
          <label className="block text-gray-700">Company Logo</label>
          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "companyLogo")} className="hidden" id="logoInput" />
          <label htmlFor="logoInput" className="p-3 bg-blue-100 rounded-lg cursor-pointer">
            <UploadCloud className="w-6 h-6 text-blue-600" />
          </label>
          {formData.companyLogo && <img src={URL.createObjectURL(formData.companyLogo)} alt="Logo Preview" className="w-16 h-16 object-cover" />}
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
            <label className="block text-gray-700">{label}</label>
            <input type="text" name={name} placeholder={placeholder} onChange={handleChange} className="input-field w-full bg-gray-100 p-3 rounded-lg" required />
            <Edit className="absolute right-3 top-9 text-gray-500 w-4 h-4 cursor-pointer" />
          </div>
        ))}
        {/* Industry */}
        <div className="relative">
          <label className="block text-gray-700">Industry</label>
          <select name="industry" onChange={handleChange} className="input-field w-full bg-gray-100 p-3 rounded-lg">
            <option value="">Select Industry</option>
            <option value="Retail">Retail</option>
            <option value="Hospitality">Hospitality</option>
            <option value="IT">IT</option>
            <option value="Healthcare">Healthcare</option>
          </select>
        </div>

        {/* Contract Start Date */}
        <div>
          <label className="block text-gray-700">Contract Start Date</label>
          <div className="flex gap-2">
            <select onChange={(e) => handleDropdownChange("contractStartDate", "day", e.target.value)} className="p-2 rounded bg-gray-100">
              {Array.from({ length: 31 }, (_, i) => (i + 1).toString()).map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <select onChange={(e) => handleDropdownChange("contractStartDate", "month", e.target.value)} className="p-2 rounded bg-gray-100">
              {months.map((month) => <option key={month} value={month}>{month}</option>)}
            </select>
            <select onChange={(e) => handleDropdownChange("contractStartDate", "year", e.target.value)} className="p-2 rounded bg-gray-100">
              {Array.from({ length: 10 }, (_, i) => (2024 + i).toString()).map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <Calendar className="text-gray-500 w-5 h-5" />
          </div>
        </div>

        {/* Contract End Date */}
        <div>
          <label className="block text-gray-700">Contract End Date</label>
          <div className="flex gap-2">
            <select onChange={(e) => handleDropdownChange("contractEndDate", "day", e.target.value)} className="p-2 rounded bg-gray-100">
              {Array.from({ length: 31 }, (_, i) => (i + 1).toString()).map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <select onChange={(e) => handleDropdownChange("contractEndDate", "month", e.target.value)} className="p-2 rounded bg-gray-100">
              {months.map((month) => <option key={month} value={month}>{month}</option>)}
            </select>
            <select onChange={(e) => handleDropdownChange("contractEndDate", "year", e.target.value)} className="p-2 rounded bg-gray-100">
              {Array.from({ length: 10 }, (_, i) => (2024 + i).toString()).map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <Calendar className="text-gray-500 w-5 h-5" />
          </div>
        </div>

        {/* Contract Status */}
        <div>
          <label className="block text-gray-700">Contract Status</label>
          <select name="contractStatus" onChange={handleChange} className="input-field w-full bg-gray-100 p-3 rounded-lg">
            <option value="In Discussion">In Discussion</option>
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        {/* Upload ACRA BizFile Certificate */}
        <div className="col-span-2 flex items-center gap-4">
          <label className="block text-gray-700">Upload ACRA BizFile Certificate</label>
          <input type="file" accept=".png,.jpg,.jpeg,.pdf" onChange={(e) => handleFileChange(e, "acraCertificate")} className="hidden" id="acraInput" />
          <label htmlFor="acraInput" className="p-3 bg-blue-100 rounded-lg cursor-pointer">
            <UploadCloud className="w-6 h-6 text-blue-600" />
          </label>
          {formData.acraCertificate && <span className="text-gray-700">{formData.acraCertificate.name}</span>}
        </div>

        {/* Outlets Section */}
        <div className="col-span-2">
          <h3 className="text-lg font-bold mb-2">Outlets</h3>
          {outlets.map((outlet, index) => (
            <div key={index} className="grid grid-cols-2 gap-4 mb-4 p-4 border rounded-lg">
              {/* Left Side - Outlet Name & Type */}
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

              {/* Right Side - Outlet Address & Image */}
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

                <label className="font-medium">Outlet Image</label>
                <div className="flex items-center gap-2 border p-2 rounded-lg">
                  {outlet.image ? (
                    <div className="flex items-center gap-2 bg-blue-100 text-blue-600 px-2 py-1 rounded-md">
                      <Image size={20} />
                      <span>Outlet Image</span>
                      <button onClick={() => handleOutletChange(index, "image", null)} className="text-red-500">✕</button>
                    </div>
                  ) : (
                    <label htmlFor={`outletImage${index}`} className="flex items-center gap-2 cursor-pointer">
                      <UploadCloud size={20} className="text-gray-500" />
                      <span className="text-gray-600">Upload Image</span>
                    </label>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleOutletChange(index, "image", e.target.files?.[0] || null)}
                    className="hidden"
                    id={`outletImage${index}`}
                  />
                </div>
              </div>

              {/* Delete Button */}
              <div className="col-span-2 flex justify-end">
                <button onClick={() => removeOutlet(index)} className="text-red-600 flex items-center gap-2">
                  <Trash2 size={18} />
                  <span>Remove Outlet</span>
                </button>
              </div>
            </div>
          ))}

          {/* Add Outlet Button */}
          <button
            type="button"
            onClick={addOutlet}
            className="mt-2 flex items-center gap-2 bg-blue-500 text-white p-2 rounded-lg"
          >
            <Plus className="w-4 h-4" /> Add Outlet
          </button>
        </div>

        {/* ✅ Cancel & Save Buttons */}
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
            Save
          </button>
        </div>
       
      </form>
    </div>
  );
};


export default AddEmployer;
