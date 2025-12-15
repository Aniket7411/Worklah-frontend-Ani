import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../lib/authInstances";
import {
  UploadCloud,
  Trash2,
  Plus,
  X,
  Building2,
  Mail,
  Phone,
  MapPin,
  User,
  FileText,
  Calendar,
  Eye,
  EyeOff,
  Save,
  ArrowLeft
} from "lucide-react";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

interface ContactPerson {
  name: string;
  position: string;
  number: string;
}

interface Outlet {
  address: string;
  managerName?: string;
  managerContact?: string;
}

const AddEmployer: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    employerId: "", // Auto-generated, read-only
    companyLogo: null as File | null,
    companyLegalName: "",
    hqAddress: "",
    mainContactPersonName: "",
    jobPosition: "",
    mainContactNumber: "",
    emailAddress: "",
    officeNumber: "",
    accountManager: "", // Prefilled, masked, read-only
    acraBizfileCert: null as File | null,
    industry: "",
    serviceAgreement: "",
    serviceContract: null as File | null,
    contractExpiryDate: "",
  });

  const [contactPersons, setContactPersons] = useState<ContactPerson[]>([
    { name: "", position: "", number: "" }
  ]);
  const [outlets, setOutlets] = useState<Outlet[]>([{ address: "" }]);
  const [showAccountManager, setShowAccountManager] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generateCredentials, setGenerateCredentials] = useState(true);
  const [employerCredentials, setEmployerCredentials] = useState<{
    email: string;
    password: string;
    emailSent?: boolean;
    error?: string;
  } | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate PDF for Service Contract
      if (field === "serviceContract" && file.type !== "application/pdf") {
        toast.error("Service Contract must be a PDF file");
        return;
      }

      setFormData(prev => ({ ...prev, [field]: file }));
    }
  };

  const handleContactPersonChange = (index: number, field: keyof ContactPerson, value: string) => {
    const updated = [...contactPersons];
    updated[index] = { ...updated[index], [field]: value };
    setContactPersons(updated);
  };

  const addContactPerson = () => {
    setContactPersons([...contactPersons, { name: "", position: "", number: "" }]);
  };

  const removeContactPerson = (index: number) => {
    if (contactPersons.length > 1) {
      setContactPersons(contactPersons.filter((_, i) => i !== index));
    }
  };

  const handleOutletChange = (index: number, field: keyof Outlet, value: string) => {
    const updated = [...outlets];
    updated[index] = { ...updated[index], [field]: value };
    setOutlets(updated);
  };

  const addOutlet = () => {
    setOutlets([...outlets, { address: "" }]);
  };

  const removeOutlet = (index: number) => {
    if (outlets.length > 1) {
      setOutlets(outlets.filter((_, i) => i !== index));
    }
  };

  const validateEmail = (email: string) => {
    if (!email) return true; // Optional field
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateDate = (date: string) => {
    if (!date) return true; // Optional field
    const re = /^\d{4}-\d{2}-\d{2}$/;
    return re.test(date);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate email
    if (formData.emailAddress && !validateEmail(formData.emailAddress)) {
      toast.error("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }

    // Validate date format
    if (formData.contractExpiryDate && !validateDate(formData.contractExpiryDate)) {
      toast.error("Contract Expiry Date must be in YYYY-MM-DD format");
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          formDataToSend.append(key, value);
        } else if (value !== null && value !== undefined && value !== "") {
          formDataToSend.append(key, String(value));
        }
      });

      // Append contact persons
      contactPersons.forEach((contact, index) => {
        if (contact.name || contact.position || contact.number) {
          formDataToSend.append(`contactPersons[${index}][name]`, contact.name);
          formDataToSend.append(`contactPersons[${index}][position]`, contact.position);
          formDataToSend.append(`contactPersons[${index}][number]`, contact.number);
        }
      });

      // Append outlets
      outlets.forEach((outlet, index) => {
        if (outlet.address) {
          formDataToSend.append(`outlets[${index}][address]`, outlet.address);
          if (outlet.managerName) {
            formDataToSend.append(`outlets[${index}][managerName]`, outlet.managerName);
          }
          if (outlet.managerContact) {
            formDataToSend.append(`outlets[${index}][managerContact]`, outlet.managerContact);
          }
        }
      });

      // Add credential generation flag
      formDataToSend.append("generateCredentials", String(generateCredentials));

      const response = await axiosInstance.post("/employers/create", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Check for success field according to API spec
      if (response.data?.success === false) {
        toast.error(response.data?.message || "Failed to add employer");
        return;
      }

      if (response.status === 201 || response.status === 200) {
        // If credentials were generated, show them
        if (generateCredentials && response.data?.credentials) {
          const credentials = response.data.credentials;
          setEmployerCredentials({
            email: credentials.email || formData.emailAddress || "",
            password: credentials.password || "",
            emailSent: credentials.emailSent !== false && credentials.sentToEmail !== false,
            error: credentials.error || undefined,
          });
          setShowCredentials(true);
          
          // Show warning if email failed to send
          if (credentials.emailSent === false || credentials.sentToEmail === false) {
            toast.error(
              credentials.error || "Employer created successfully, but email could not be sent. Please share credentials manually.",
              { duration: 6000 }
            );
          } else {
            toast.success("Employer added successfully! Credentials generated and sent via email.");
          }
        } else {
          toast.success("Employer added successfully!");
          navigate("/employers");
        }
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error?.response?.data?.message || "An error occurred while adding the employer.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate("/employers")}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Employer</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="space-y-8">
            {/* Section 1: Basic Information */}
            <section className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Employer ID - Read Only */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employer ID <span className="text-gray-400 text-xs">(Auto-generated)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.employerId || "Will be generated automatically"}
                    disabled
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* Company Logo */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Logo <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "companyLogo")}
                      className="hidden"
                      id="companyLogo"
                    />
                    <label
                      htmlFor="companyLogo"
                      className="flex items-center gap-2 px-4 py-3 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                    >
                      <UploadCloud className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">Upload Logo</span>
                    </label>
                    {formData.companyLogo && (
                      <div className="flex items-center gap-2">
                        <img
                          src={URL.createObjectURL(formData.companyLogo)}
                          alt="Logo preview"
                          className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, companyLogo: null }))}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Legal Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Legal Name <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="companyLegalName"
                    value={formData.companyLegalName}
                    onChange={handleChange}
                    placeholder="Enter company legal name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select Industry</option>
                    <option value="F&B">F&B (Food & Beverage)</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Retail">Retail</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                {/* HQ Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HQ Address <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <textarea
                    name="hqAddress"
                    value={formData.hqAddress}
                    onChange={handleChange}
                    placeholder="Enter headquarters address"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Section 2: Contact Information */}
            <section className="space-y-6 border-t border-gray-200 pt-8">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-600" />
                Contact Information
              </h2>

              {/* Main Contact Person Name - Multiple */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Main Contact Person(s) <span className="text-gray-400 text-xs">(Optional - Multiple allowed)</span>
                  </label>
                  <button
                    type="button"
                    onClick={addContactPerson}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Contact
                  </button>
                </div>

                {contactPersons.map((contact, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => handleContactPersonChange(index, "name", e.target.value)}
                        placeholder="Contact name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Position</label>
                      <input
                        type="text"
                        value={contact.position}
                        onChange={(e) => handleContactPersonChange(index, "position", e.target.value)}
                        placeholder="Job position"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Number</label>
                        <input
                          type="tel"
                          value={contact.number}
                          onChange={(e) => handleContactPersonChange(index, "number", e.target.value)}
                          placeholder="Contact number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      {contactPersons.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeContactPerson(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Main Contact Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Contact Number <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    name="mainContactNumber"
                    value={formData.mainContactNumber}
                    onChange={handleChange}
                    placeholder="Enter main contact number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    name="emailAddress"
                    value={formData.emailAddress}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Office Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Office Number <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    name="officeNumber"
                    value={formData.officeNumber}
                    onChange={handleChange}
                    placeholder="Enter office number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Job Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Position <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="jobPosition"
                    value={formData.jobPosition}
                    onChange={handleChange}
                    placeholder="Enter job position"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Section 3: Account & Service Details */}
            <section className="space-y-6 border-t border-gray-200 pt-8">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Account & Service Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Manager - Read Only, Masked */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Manager <span className="text-gray-400 text-xs">(Assigned by Admin)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showAccountManager ? "text" : "password"}
                      value={formData.accountManager || "Not assigned"}
                      disabled
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAccountManager(!showAccountManager)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showAccountManager ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Service Agreement */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Agreement <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <select
                    name="serviceAgreement"
                    value={formData.serviceAgreement}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select Status</option>
                    <option value="In Discussion">In Discussion</option>
                    <option value="Completed">Completed</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>

                {/* Contract Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contract Expiry Date <span className="text-gray-400 text-xs">(Optional - YYYY-MM-DD)</span>
                  </label>
                  <input
                    type="date"
                    name="contractExpiryDate"
                    value={formData.contractExpiryDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* ACRA Bizfile Cert */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ACRA Bizfile Cert <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => handleFileChange(e, "acraBizfileCert")}
                    className="hidden"
                    id="acraBizfileCert"
                  />
                  <label
                    htmlFor="acraBizfileCert"
                    className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Upload ACRA Certificate</span>
                  </label>
                  {formData.acraBizfileCert && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">{formData.acraBizfileCert.name}</span>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, acraBizfileCert: null }))}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Contract - PDF Only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Contract <span className="text-gray-400 text-xs">(Optional - PDF only)</span>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, "serviceContract")}
                    className="hidden"
                    id="serviceContract"
                  />
                  <label
                    htmlFor="serviceContract"
                    className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Upload Service Contract (PDF)</span>
                  </label>
                  {formData.serviceContract && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">{formData.serviceContract.name}</span>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, serviceContract: null }))}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Generate Login Credentials */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generateCredentials}
                    onChange={(e) => setGenerateCredentials(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Generate Login Credentials for Employer
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      If checked, system will generate email and password for employer login. 
                      {formData.emailAddress && " Email will be sent to: " + formData.emailAddress}
                    </p>
                  </div>
                </label>
              </div>
            </section>

            {/* Section 4: Outlets */}
            <section className="space-y-6 border-t border-gray-200 pt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Outlets <span className="text-gray-400 text-xs font-normal">(Optional - Multiple allowed)</span>
                </h2>
                <button
                  type="button"
                  onClick={addOutlet}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Outlet
                </button>
              </div>

              {outlets.map((outlet, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700">Outlet {index + 1}</h3>
                    {outlets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOutlet(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Outlet Address</label>
                      <textarea
                        value={outlet.address}
                        onChange={(e) => handleOutletChange(index, "address", e.target.value)}
                        placeholder="Enter outlet address"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Manager Name (Optional)</label>
                      <input
                        type="text"
                        value={outlet.managerName || ""}
                        onChange={(e) => handleOutletChange(index, "managerName", e.target.value)}
                        placeholder="Outlet manager name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Manager Contact (Optional)</label>
                      <input
                        type="tel"
                        value={outlet.managerContact || ""}
                        onChange={(e) => handleOutletChange(index, "managerContact", e.target.value)}
                        placeholder="Manager contact number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/employers")}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Employer
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Credentials Modal */}
        {showCredentials && employerCredentials && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Employer Login Credentials</h3>
                <button
                  onClick={() => {
                    setShowCredentials(false);
                    navigate("/employers");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {employerCredentials?.emailSent === false ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800 font-medium mb-2">
                    ⚠️ Email Delivery Failed
                  </p>
                  <p className="text-xs text-red-700">
                    {employerCredentials.error || "The credentials could not be sent via email. Please share these credentials with the employer manually."}
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 font-medium mb-2">
                    ⚠️ Important: Save these credentials securely
                  </p>
                  <p className="text-xs text-yellow-700">
                    These credentials have been sent to the employer's email address. 
                    Please share them with the employer if needed.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={employerCredentials.email}
                      readOnly
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(employerCredentials.email);
                        toast.success("Email copied to clipboard!");
                      }}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type={showAccountManager ? "text" : "password"}
                      value={employerCredentials.password}
                      readOnly
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(employerCredentials.password);
                        toast.success("Password copied to clipboard!");
                      }}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                    >
                      Copy
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAccountManager(!showAccountManager)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                    >
                      {showAccountManager ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowCredentials(false);
                    navigate("/employers");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const text = `Email: ${employerCredentials.email}\nPassword: ${employerCredentials.password}`;
                    navigator.clipboard.writeText(text);
                    toast.success("Credentials copied to clipboard!");
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Copy All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddEmployer;
