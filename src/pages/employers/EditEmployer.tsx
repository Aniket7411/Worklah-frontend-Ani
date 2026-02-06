import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance, axiosFileInstance } from "../../lib/authInstances";
import {
  UploadCloud,
  Trash2,
  Plus,
  X,
  Building2,
  Phone,
  MapPin,
  User,
  FileText,
  Eye,
  EyeOff,
  Save,
  ArrowLeft,
  Clock,
  AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";
// @ts-ignore - Loader is a JSX file without types
import Loader from "../../components/Loader";
import { buildEmployerUpdateFormData, validateEmail, validateDate } from "../../utils/dataTransformers";
import { validatePhone, getPlaceholder } from "../../utils/phoneValidation";

// Images come as complete URLs from backend - no base URL needed

// Outlet structure - simplified
// Required: name, managerName, contactNumber, address
// Optional: openingHours, closingHours
// _id for existing outlets

const EditEmployer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employerId: "",
    companyLogo: null as File | null,
    companyLegalName: "",
    companyNumber: "", // ACRA Company Number (Optional)
    hqAddress: "",
    contactPersonName: "",
    jobPosition: "",
    mainContactNumber: "",
    mainContactExtension: "",
    alternateContactNumber: "",
    alternateContactExtension: "",
    emailAddress: "",
    accountManager: "",
    acraBizfileCert: null as File | null,
    industry: "",
    serviceAgreement: "",
    serviceContract: null as File | null,
    contractExpiryDate: "",
    phoneCountry: "SG" as "SG" | "MY" | "IN",
  });

  const [existingFiles, setExistingFiles] = useState({
    companyLogo: "",
    acraBizfileCert: "",
    serviceContract: "",
  });

  const [outlets, setOutlets] = useState<Array<{ name: string; managerName: string; contactNumber: string; contactExtension?: string; address: string; openingHours: string; closingHours: string; isActive: boolean; _id?: string; barcode?: string }>>([]);
  const [showAccountManager, setShowAccountManager] = useState(false);

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    outletIndex: number | null;
    outletName: string;
  }>({
    isOpen: false,
    outletIndex: null,
    outletName: "",
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEmployerData();
    }
  }, [id]);

  const fetchEmployerData = async () => {
    try {
      setLoading(true);
      // API accepts both MongoDB ObjectId and EMP-xxxx format
      // The id from URL params can be either format
      const response = await axiosInstance.get(`/admin/employers/${id}`);

      // Check for success field according to API spec
      if (response.data?.success === false) {
        throw new Error(response.data?.message || "Failed to fetch employer data");
      }

      const employer = response?.data?.employer || response?.data;

      if (employer) {
        const country = (employer.phoneCountry === "MY" || employer.phoneCountry === "IN") ? employer.phoneCountry : "SG";
        setFormData({
          employerId: employer.employerId || employer._id || "",
          companyLegalName: employer.companyLegalName || employer.companyName || "",
          companyNumber: employer.companyNumber || "",
          hqAddress: employer.hqAddress || "",
          contactPersonName: employer.contactPersonName || employer.mainContactPersonName || (employer.mainContactPersons && Array.isArray(employer.mainContactPersons) && employer.mainContactPersons.length > 0 ? employer.mainContactPersons[0].name : "") || "",
          jobPosition: employer.jobPosition || employer.mainContactPersonPosition || "",
          mainContactNumber: employer.mainContactNumber || employer.mainContactPersonNumber || "",
          mainContactExtension: employer.mainContactExtension || "",
          alternateContactNumber: employer.alternateContactNumber || "",
          alternateContactExtension: employer.alternateContactExtension || "",
          emailAddress: employer.emailAddress || employer.companyEmail || "",
          accountManager: employer.accountManager || "",
          industry: employer.industry || "",
          serviceAgreement: employer.serviceAgreement || employer.contractStatus || "",
          contractExpiryDate: employer.contractExpiryDate || employer.contractEndDate || "",
          companyLogo: null,
          acraBizfileCert: null,
          serviceContract: null,
          phoneCountry: country,
        });

        // Images come as complete URLs from backend
        setExistingFiles({
          companyLogo: employer.companyLogo || "",
          acraBizfileCert: employer.acraBizfileCert || "",
          serviceContract: employer.serviceContract || "",
        });

        // Handle outlets - simplified structure (barcode is read-only from API for shift check-in)
        // When no outlets: start with empty array so "Add Outlet" count matches what user expects (e.g. 2 clicks = 2 outlets)
        if (employer.outlets && Array.isArray(employer.outlets) && employer.outlets.length > 0) {
          // @ts-ignore - outlet type from API
          setOutlets(employer.outlets.map((outlet) => ({
            name: outlet.name || outlet.outletName || "",
            managerName: outlet.managerName || "",
            contactNumber: outlet.contactNumber || "",
            contactExtension: outlet.contactExtension || "",
            address: outlet.address || outlet.outletAddress || outlet.location || "",
            openingHours: outlet.openingHours || "",
            closingHours: outlet.closingHours || "",
            isActive: outlet.isActive !== undefined ? outlet.isActive : true,
            _id: outlet._id || outlet.id,
            barcode: outlet.barcode || "",
          })));
        } else {
          setOutlets([]);
        }
      }
    } catch (error) {
      // @ts-ignore - error handling
      toast.error(error?.response?.data?.message || "Failed to load employer data");
      navigate("/employers");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // @ts-ignore
  const handleFileChange = (e, field) => {
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


  const handleOutletChange = (index: number, field: string, value: string | boolean) => {
    const updated = [...outlets];
    updated[index] = { ...updated[index], [field]: value };
    setOutlets(updated);
  };

  const addOutlet = () => {
    setOutlets([...outlets, { name: "", managerName: "", contactNumber: "", contactExtension: "", address: "", openingHours: "", closingHours: "", isActive: true }]);
  };

  const openDeleteModal = (index: number) => {
    const outlet = outlets[index];
    setDeleteModal({
      isOpen: true,
      outletIndex: index,
      outletName: outlet.name || `Outlet ${index + 1}`,
    });
    setConfirmDelete(false);
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      outletIndex: null,
      outletName: "",
    });
    setConfirmDelete(false);
  };

  const confirmDeleteOutlet = async () => {
    if (!confirmDelete) {
      toast.error("Please confirm by checking the warning checkbox");
      return;
    }

    if (deleteModal.outletIndex === null) {
      closeDeleteModal();
      return;
    }

    const outlet = outlets[deleteModal.outletIndex];
    const outletId = outlet?._id;
    const employerIdForApi = id || formData.employerId;

    if (outletId && employerIdForApi) {
      try {
        await axiosInstance.delete(`/admin/employers/${employerIdForApi}/outlets/${outletId}`);
        setOutlets(outlets.filter((_, i) => i !== deleteModal.outletIndex));
        toast.success("Outlet deleted successfully");
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to delete outlet");
      }
    } else {
      // New outlet (no _id) - just remove from local state
      setOutlets(outlets.filter((_, i) => i !== deleteModal.outletIndex));
      toast.success("Outlet removed");
    }
    closeDeleteModal();
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const phoneCountry = formData.phoneCountry || "SG";
    if (formData.mainContactNumber?.trim()) {
      const mainResult = validatePhone(formData.mainContactNumber.trim(), phoneCountry);
      if (!mainResult.valid) {
        toast.error(mainResult.message || "Invalid contact number");
        return;
      }
    }
    if (formData.alternateContactNumber?.trim()) {
      const altResult = validatePhone(formData.alternateContactNumber.trim(), phoneCountry);
      if (!altResult.valid) {
        toast.error(altResult.message || "Invalid alternate contact number");
        return;
      }
    }
    for (let i = 0; i < outlets.length; i++) {
      const o = outlets[i];
      if (o.contactNumber?.trim()) {
        const oResult = validatePhone(o.contactNumber.trim(), phoneCountry);
        if (!oResult.valid) {
          toast.error(`Outlet ${i + 1}: ${oResult.message || "Invalid contact number"}`);
          return;
        }
      }
    }

    if (formData.emailAddress && !validateEmail(formData.emailAddress)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (formData.contractExpiryDate && !validateDate(formData.contractExpiryDate)) {
      toast.error("Contract Expiry Date must be in YYYY-MM-DD format");
      return;
    }

    setIsSubmitting(true);

    try {
      const industryToSend = formData.industry || "";
      const formDataToSend = buildEmployerUpdateFormData(formData, outlets, industryToSend);

      // Use file instance with longer timeout
      const response = await axiosFileInstance.put(`/admin/employers/${id}`, formDataToSend);

      if (response.data?.success === false) {
        toast.error(response.data?.message || "Failed to update employer");
        return;
      }

      if (response.status === 200 || response.status === 201) {
        toast.success("Employer updated successfully!");
        const updated = response.data?.employer;
        if (updated) {
          setFormData(prev => ({
            ...prev,
            companyLegalName: updated.companyLegalName ?? prev.companyLegalName,
            mainContactNumber: updated.mainContactNumber ?? prev.mainContactNumber,
            mainContactExtension: updated.mainContactExtension ?? prev.mainContactExtension,
            alternateContactNumber: updated.alternateContactNumber ?? prev.alternateContactNumber,
            alternateContactExtension: updated.alternateContactExtension ?? prev.alternateContactExtension,
            phoneCountry: (updated.phoneCountry === "MY" || updated.phoneCountry === "IN") ? updated.phoneCountry : "SG",
          }));
          if (Array.isArray(updated.outlets)) {
            setOutlets(updated.outlets.map((o: any) => ({
              name: o.name || o.outletName || "",
              managerName: o.managerName || "",
              contactNumber: o.contactNumber || "",
              contactExtension: o.contactExtension || "",
              address: o.address || o.outletAddress || o.location || "",
              openingHours: o.openingHours || "",
              closingHours: o.closingHours || "",
              isActive: o.isActive !== undefined ? o.isActive : true,
              _id: o._id || o.id,
              barcode: o.barcode || "",
            })));
          }
        }
        navigate("/employers");
      }
    } catch (error: any) {
      // Handle different error types
      if (error?.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        const errorMessage = errorData?.message || "An error occurred while updating the employer.";

        // Handle 409 Conflict (duplicate company number)
        if (status === 409) {
          toast.error(errorMessage, {
            duration: 6000,
            icon: "⚠️"
          });
          // Focus on company number field if duplicate
          if (errorMessage.includes("company number")) {
            const companyNumberInput = document.querySelector('input[name="companyNumber"]') as HTMLInputElement;
            if (companyNumberInput) {
              companyNumberInput.focus();
              companyNumberInput.select();
            }
          }
        } else {
          toast.error(errorMessage, { duration: 5000 });
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, outlets, id, navigate]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4 pl-2 border-l-4 border-[#FED408]">
          <button
            onClick={() => navigate("/employers")}
            className="p-2 hover:bg-white rounded-lg transition-colors border border-gray-200"
            aria-label="Back to employers"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Employer</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8 space-y-8">
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
                      value={formData.employerId || "N/A"}
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
                      {formData.companyLogo ? (
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
                      ) : existingFiles.companyLogo ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={existingFiles.companyLogo}
                            alt="Current logo"
                            className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                          />
                          <span className="text-sm text-gray-600">Current logo</span>
                        </div>
                      ) : null}
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

                  {/* Company Number (ACRA) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Number (ACRA) <span className="text-gray-400 text-xs">(Optional - Must be unique if provided)</span>
                    </label>
                    <input
                      type="text"
                      name="companyNumber"
                      value={formData.companyNumber}
                      onChange={handleChange}
                      placeholder="Enter ACRA company number (if available)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Leave empty if you don't have a company number. If provided, it must be unique.
                    </p>
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
                      <option value="Hospitality">Hospitality</option>
                      <option value="IT">IT</option>
                      <option value="F&B">F&B (Food & Beverage)</option>
                      <option value="Hotel">Hotel</option>
                      <option value="Retail">Retail</option>
                      <option value="Logistics">Logistics</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Construction">Construction</option>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Location (country) - drives validation */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location (Country) <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="phoneCountry"
                      value={formData.phoneCountry}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneCountry: e.target.value as "SG" | "MY" | "IN" }))}
                      className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="SG">+65 Singapore</option>
                      <option value="MY">+60 Malaysia</option>
                      <option value="IN">+91 India</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">Used for contact number validation and format.</p>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="contactPersonName"
                      value={formData.contactPersonName}
                      onChange={handleChange}
                      placeholder="Enter name"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Position in Company */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position in Company <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="jobPosition"
                      value={formData.jobPosition}
                      onChange={handleChange}
                      placeholder="Enter position in company"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Contact Number + Extension */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="mainContactNumber"
                      value={formData.mainContactNumber}
                      onChange={handleChange}
                      placeholder={getPlaceholder(formData.phoneCountry)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Extension <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="mainContactExtension"
                      value={formData.mainContactExtension}
                      onChange={handleChange}
                      placeholder="e.g. 101"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Alternate Contact Number + Extension */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alternate Contact Number <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      name="alternateContactNumber"
                      value={formData.alternateContactNumber}
                      onChange={handleChange}
                      placeholder={getPlaceholder(formData.phoneCountry)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alternate Extension <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="alternateContactExtension"
                      value={formData.alternateContactExtension}
                      onChange={handleChange}
                      placeholder="e.g. 102"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="emailAddress"
                      value={formData.emailAddress}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      required
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
                      <option value="Active">Active</option>
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
                    {formData.acraBizfileCert ? (
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
                    ) : existingFiles.acraBizfileCert ? (
                      <span className="text-sm text-gray-600">Current file exists</span>
                    ) : null}
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
                    {formData.serviceContract ? (
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
                    ) : existingFiles.serviceContract ? (
                      <span className="text-sm text-gray-600">Current file exists</span>
                    ) : null}
                  </div>
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
                          onClick={() => openDeleteModal(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete outlet"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Outlet Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={outlet.name || ""}
                          onChange={(e) => handleOutletChange(index, "name", e.target.value)}
                          placeholder="Enter outlet name"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Manager Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={outlet.managerName || ""}
                          onChange={(e) => handleOutletChange(index, "managerName", e.target.value)}
                          placeholder="Enter manager name"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Outlet Contact Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={outlet.contactNumber || ""}
                          onChange={(e) => handleOutletChange(index, "contactNumber", e.target.value)}
                          placeholder={getPlaceholder(formData.phoneCountry)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Outlet Extension <span className="text-gray-400 text-xs">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={outlet.contactExtension ?? ""}
                          onChange={(e) => handleOutletChange(index, "contactExtension", e.target.value)}
                          placeholder="e.g. 201"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Outlet Address <span className="text-red-500">*</span>
                          <span className="text-gray-400 text-xs font-normal ml-2">(Singapore addresses only)</span>
                        </label>
                        <textarea
                          value={outlet.address || ""}
                          onChange={(e) => handleOutletChange(index, "address", e.target.value)}
                          placeholder="Enter outlet address"
                          rows={3}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Format: Blk 123, Ang Mo Kio Avenue 3, #05-67, Singapore 560123
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Opening Hours <span className="text-gray-400 text-xs">(Optional - HH:MM)</span>
                        </label>
                        <input
                          type="time"
                          value={outlet.openingHours || ""}
                          onChange={(e) => handleOutletChange(index, "openingHours", e.target.value)}
                          placeholder="09:00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Closing Hours <span className="text-gray-400 text-xs">(Optional - HH:MM)</span>
                        </label>
                        <input
                          type="time"
                          value={outlet.closingHours || ""}
                          onChange={(e) => handleOutletChange(index, "closingHours", e.target.value)}
                          placeholder="18:00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={outlet.isActive !== false}
                            onChange={(e) => handleOutletChange(index, "isActive", e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs font-medium text-gray-700">Active Outlet</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Uncheck to mark this outlet as inactive
                        </p>
                      </div>
                      {(outlet as any).barcode && (
                        <div className="md:col-span-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                          <span className="text-xs font-medium text-blue-800">Shift check-in barcode (for workers at outlet)</span>
                          <p className="mt-1 font-mono text-sm font-semibold text-blue-900">{(outlet as any).barcode}</p>
                          <p className="text-xs text-blue-600 mt-1">Workers scan this barcode to check in for shifts.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </section>

              {/* Delete Confirmation Modal */}
              {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Delete Outlet</h3>
                        <p className="text-sm text-gray-600">This action cannot be undone</p>
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700 mb-3">
                        You are about to delete <span className="font-semibold text-red-600">"{deleteModal.outletName}"</span>
                      </p>
                      <p className="text-xs text-gray-600 mb-3">
                        <strong>Warning:</strong> Deleting this outlet will permanently remove all associated data including:
                      </p>
                      <ul className="text-xs text-gray-600 list-disc list-inside space-y-1 mb-3">
                        <li>Outlet information and contact details</li>
                        <li>Manager information</li>
                        <li>Operating hours</li>
                        <li>Any jobs associated with this outlet</li>
                      </ul>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={confirmDelete}
                          onChange={(e) => setConfirmDelete(e.target.checked)}
                          className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">
                          I understand the consequences and want to delete this outlet permanently
                        </span>
                      </label>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={closeDeleteModal}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={confirmDeleteOutlet}
                        disabled={!confirmDelete}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Delete Outlet
                      </button>
                    </div>
                  </div>
                </div>
              )}

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
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Update Employer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployer;
