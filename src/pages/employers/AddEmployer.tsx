import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { axiosFileInstance } from "../../lib/authInstances";
import { useAuth } from "../../context/AuthContext";
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
  Save,
  ArrowLeft,
  Clock,
  AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { buildEmployerFormData, validateEmail, validateDate } from "../../utils/dataTransformers";
import { validatePhone, getPlaceholder, PHONE_RULES } from "../../utils/phoneValidation";

// Google Maps API type declaration
declare global {
  interface Window {
    google: any;
  }
}

// Outlet interface - required: name, managerName, contactNumber, address; optional: contactExtension, openingHours, closingHours, isActive
interface Outlet {
  name: string;
  managerName: string;
  contactNumber: string;
  contactExtension?: string;
  address: string;
  openingHours?: string;
  closingHours?: string;
  isActive?: boolean;
  _id?: string;
}

const AddEmployer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user is admin
  useEffect(() => {
    if (user?.role !== "ADMIN") {
      toast.error("Only admins can add employers");
      navigate("/employers");
    }
  }, [user, navigate]);

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsGoogleMapsLoaded(true);
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        // API key not set, autocomplete will work as regular textarea
        console.log("Google Maps API key not set. Address autocomplete will be disabled.");
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsGoogleMapsLoaded(true);
      script.onerror = () => {
        console.error("Failed to load Google Maps API");
        // Don't show error toast if API key is missing - it's expected
        if (apiKey) {
          toast.error("Failed to load Google Maps API");
        }
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  const [formData, setFormData] = useState({
    employerId: "", // Auto-generated, read-only
    companyLogo: null as File | null,
    companyLegalName: "", // Name of employer (required)
    companyNumber: "", // ACRA Company Number (Optional - must be unique if provided)
    hqAddress: "", // Address (required)
    contactPersonName: "", // Name (required)
    jobPosition: "", // Position in company
    mainContactNumber: "", // Contact no. (required)
    mainContactExtension: "", // Optional extension
    alternateContactNumber: "", // Alternate no. (Optional)
    alternateContactExtension: "", // Optional extension
    emailAddress: "", // Email (required)
    acraBizfileCert: null as File | null,
    industry: "", // Industry type (required)
    customIndustry: "", // Custom industry input
    serviceAgreement: "",
    serviceContract: null as File | null,
    contractExpiryDate: "",
  });

  const [showCustomIndustry, setShowCustomIndustry] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const employerAddressRef = useRef<HTMLTextAreaElement>(null);
  const outletAddressRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  // Outlets are OPTIONAL - employer can be created without outlets
  // Outlets can be added later via update endpoint
  const [outlets, setOutlets] = useState<Outlet[]>([]);

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generateCredentials, setGenerateCredentials] = useState(true);
  const [phoneCountry, setPhoneCountry] = useState<keyof typeof PHONE_RULES>("SG");
  const [employerCredentials, setEmployerCredentials] = useState<{
    email: string;
    password: string;
    emailSent?: boolean;
    error?: string;
  } | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Handle industry change
    if (name === "industry") {
      setShowCustomIndustry(value === "Others" || value === "");
      setFormData(prev => ({ ...prev, [name]: value, customIndustry: value === "Others" ? prev.customIndustry : "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Google Places Autocomplete for Employer Address
  // Only use autocomplete if Google Maps is available
  const hasGoogleMapsKey = !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const {
    ready: employerAddressReady = false,
    value: employerAddressValue = "",
    suggestions: { status = "", data = [] } = { status: "", data: [] },
    setValue: setEmployerAddressValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: "sg" }, // Singapore only
    },
    debounce: 300,
    initOnMount: hasGoogleMapsKey && isGoogleMapsLoaded,
  });

  // Handle employer address selection
  const handleEmployerAddressSelect = async (description: string) => {
    setEmployerAddressValue(description, false);
    clearSuggestions();
    setFormData(prev => ({ ...prev, hqAddress: description }));

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      // You can store lat/lng if needed
    } catch (error) {
      console.error("Error:", error);
    }
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


  const handleOutletChange = (index: number, field: keyof Outlet, value: string | boolean) => {
    const updated = [...outlets];
    updated[index] = { ...updated[index], [field]: value };
    setOutlets(updated);
  };

  const addOutlet = () => {
    setOutlets([...outlets, { name: "", managerName: "", contactNumber: "", contactExtension: "", address: "", openingHours: "", closingHours: "", isActive: true }]);
    outletAddressRefs.current.push(null);
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

  const confirmDeleteOutlet = () => {
    if (!confirmDelete) {
      toast.error("Please confirm by checking the warning checkbox");
      return;
    }

    if (deleteModal.outletIndex !== null) {
      // Outlets are optional, so we can delete the last one
      setOutlets(outlets.filter((_, i) => i !== deleteModal.outletIndex));
      outletAddressRefs.current = outletAddressRefs.current.filter((_, i) => i !== deleteModal.outletIndex);
      toast.success("Outlet deleted successfully");
    }
    closeDeleteModal();
  };

  // Validation function
  const validateForm = useCallback((): boolean => {
    if (!formData.companyLegalName?.trim()) {
      toast.error("Name of employer is required");
      return false;
    }

    const industryValue = showCustomIndustry ? formData.customIndustry?.trim() : formData.industry?.trim();
    if (!industryValue) {
      toast.error("Industry type is required");
      return false;
    }

    if (!formData.contactPersonName?.trim()) {
      toast.error("Name is required");
      return false;
    }

    if (!formData.hqAddress?.trim()) {
      toast.error("Address is required");
      return false;
    }

    if (!formData.mainContactNumber?.trim()) {
      toast.error("Contact number is required");
      return false;
    }
    const phoneResult = validatePhone(formData.mainContactNumber.trim(), phoneCountry);
    if (!phoneResult.valid) {
      toast.error(phoneResult.message || "Invalid contact number");
      return false;
    }
    if (formData.alternateContactNumber?.trim()) {
      const altResult = validatePhone(formData.alternateContactNumber.trim(), phoneCountry);
      if (!altResult.valid) {
        toast.error(altResult.message || "Invalid alternate contact number");
        return false;
      }
    }

    if (!formData.emailAddress?.trim()) {
      toast.error("Email address is required");
      return false;
    }

    if (!validateEmail(formData.emailAddress)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (formData.contractExpiryDate && !validateDate(formData.contractExpiryDate)) {
      toast.error("Contract Expiry Date must be in YYYY-MM-DD format");
      return false;
    }

    // Validate outlets - outlets are optional, but if provided, all required fields must be filled
    // Validate each outlet has required fields (only if outlet data is partially filled)
    for (let i = 0; i < outlets.length; i++) {
      const outlet = outlets[i];
      // If any field is filled, all required fields must be filled
      if (outlet.name?.trim() || outlet.address?.trim() || outlet.managerName?.trim() || outlet.contactNumber?.trim()) {
        if (!outlet.name?.trim()) {
          toast.error(`Outlet ${i + 1}: Outlet Name is required`);
          return false;
        }
        if (!outlet.managerName?.trim()) {
          toast.error(`Outlet ${i + 1}: Manager Name is required`);
          return false;
        }
        if (!outlet.contactNumber?.trim()) {
          toast.error(`Outlet ${i + 1}: Outlet Contact Number is required`);
          return false;
        }
        const outletPhoneResult = validatePhone(outlet.contactNumber.trim(), phoneCountry);
        if (!outletPhoneResult.valid) {
          toast.error(`Outlet ${i + 1}: ${outletPhoneResult.message || "Invalid contact number"}`);
          return false;
        }
        if (!outlet.address?.trim()) {
          toast.error(`Outlet ${i + 1}: Outlet Address is required`);
          return false;
        }
      }
    }

    return true;
  }, [formData, showCustomIndustry, outlets, phoneCountry]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const industryToSend = showCustomIndustry ? formData.customIndustry : formData.industry;
      const formDataToSend = buildEmployerFormData(
        { ...formData, phoneCountry },
        outlets,
        industryToSend || "",
        generateCredentials
      );

      // Use file instance with longer timeout
      const response = await axiosFileInstance.post("/admin/employers", formDataToSend);

      // Check response
      if (response.data?.success === false) {
        toast.error(response.data?.message || "Failed to add employer");
        setIsSubmitting(false);
        return;
      }

      // Success - handle response (credentials modal commented out; navigate to list)
      if (response.status === 201 || response.status === 200) {
        if (generateCredentials && response.data?.credentials) {
          const credentials = response.data.credentials;
          if (credentials.emailSent === false || credentials.sentToEmail === false) {
            toast.success("Employer added successfully. Share login details with the employer manually if needed.");
          } else {
            toast.success("Employer added successfully! Credentials have been sent via email.");
          }
        } else {
          toast.success("Employer added successfully!");
        }
        setTimeout(() => navigate("/employers"), 800);
      }
    } catch (error: any) {
      // Handle different error types
      if (error?.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        const errorMessage = errorData?.message || "An error occurred while adding the employer.";

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
      } else if (error.code === 'ECONNABORTED') {
        // Timeout - but check if employer was actually created
        toast.error("Request took too long. Please check if employer was created.");
      } else {
        toast.error("Network error. Please check your connection.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, outlets, showCustomIndustry, generateCredentials, validateForm, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8 relative">
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-4 shadow-xl">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-base font-semibold text-gray-700">Saving employer...</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Page header */}
        <div className="mb-6 flex items-center gap-4 pl-2 border-l-4 border-[#FED408]">
          <button
            onClick={() => navigate("/employers")}
            className="p-2 hover:bg-white rounded-lg transition-colors border border-gray-200"
            aria-label="Back to employers"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Add New Employer</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 sm:px-8 py-6 sm:py-8 space-y-8">
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
                    Name of Employer <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyLegalName"
                    value={formData.companyLegalName ?? ""}
                    onChange={handleChange}
                    placeholder="Enter employer name"
                    required
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
                    value={formData.companyNumber ?? ""}
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
                    Industry Type <span className="text-red-500">*</span>
                  </label>
                  {!showCustomIndustry ? (
                    <select
                      name="industry"
                      value={formData.industry ?? ""}
                      onChange={handleChange}
                      required
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
                      <option value="Others">Others (Add Custom)</option>
                    </select>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        name="customIndustry"
                        value={formData.customIndustry ?? ""}
                        onChange={handleChange}
                        placeholder="Enter custom industry type"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomIndustry(false);
                          setFormData(prev => ({ ...prev, customIndustry: "" }));
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        ← Back to list
                      </button>
                    </div>
                  )}
                </div>

                {/* HQ Address with Google Places Autocomplete */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employer Address <span className="text-red-500">*</span>
                    {hasGoogleMapsKey && isGoogleMapsLoaded && (
                      <span className="text-gray-400 text-xs font-normal ml-2">(Singapore addresses only)</span>
                    )}
                  </label>
                  <div className="relative">
                    <textarea
                      ref={employerAddressRef}
                      name="hqAddress"
                      value={hasGoogleMapsKey && isGoogleMapsLoaded ? (employerAddressValue || formData.hqAddress) ?? "" : formData.hqAddress ?? ""}
                      onChange={(e) => {
                        if (hasGoogleMapsKey && isGoogleMapsLoaded) {
                          setEmployerAddressValue(e.target.value);
                        }
                        setFormData(prev => ({ ...prev, hqAddress: e.target.value }));
                      }}
                      placeholder={hasGoogleMapsKey && isGoogleMapsLoaded
                        ? "Start typing address (e.g., Blk 123 Ang Mo Kio Avenue 3)"
                        : "Enter address (e.g., Blk 123, Ang Mo Kio Avenue 3, #05-67, Singapore 560123)"}
                      rows={4}
                      required
                      disabled={hasGoogleMapsKey && (!employerAddressReady || !isGoogleMapsLoaded)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    />
                    {hasGoogleMapsKey && isGoogleMapsLoaded && status === "OK" && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {data.map(({ place_id, description }) => (
                          <button
                            key={place_id}
                            type="button"
                            onClick={() => handleEmployerAddressSelect(description)}
                            className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm"
                          >
                            {description}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Format: Blk 123, Ang Mo Kio Avenue 3, #05-67, Singapore 560123
                  </p>
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
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contactPersonName"
                    value={formData.contactPersonName ?? ""}
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

                {/* Location first (drives contact validation) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location (Country) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={phoneCountry}
                    onChange={(e) => setPhoneCountry(e.target.value as keyof typeof PHONE_RULES)}
                    className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="SG">+65 Singapore</option>
                    <option value="MY">+60 Malaysia</option>
                    <option value="IN">+91 India</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Used for contact number validation and format.</p>
                </div>

                {/* Contact Number (validated per phoneCountry) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mainContactNumber"
                    value={formData.mainContactNumber ?? ""}
                    onChange={handleChange}
                    placeholder={getPlaceholder(phoneCountry)}
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
                    value={formData.mainContactExtension ?? ""}
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
                    value={formData.alternateContactNumber ?? ""}
                    onChange={handleChange}
                    placeholder={getPlaceholder(phoneCountry)}
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
                    value={formData.alternateContactExtension ?? ""}
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
                    value={formData.emailAddress ?? ""}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Section 3: Service Details */}
            <section className="space-y-6 border-t border-gray-200 pt-8">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Service Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              {/* <div className="md:col-span-2">
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
              </div> */}
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
                        value={outlet.name ?? ""}
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
                        placeholder={getPlaceholder(phoneCountry)}
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
                        value={outlet.address ?? ""}
                        onChange={(e) => handleOutletChange(index, "address", e.target.value)}
                        placeholder="Start typing address (e.g., Blk 123 Ang Mo Kio Avenue 3)"
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

        {/* Credentials Modal - COMMENTED OUT: modal after employer creation (navigate to list instead) */}
        {/* {showCredentials && employerCredentials && ( ... modal JSX ... )} */}
      </div>
    </div>
  );
};

export default AddEmployer;
