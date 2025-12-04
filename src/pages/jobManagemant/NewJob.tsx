import { ArrowLeft, Briefcase, Rows2, Trash2, Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import { TiDocumentText } from "react-icons/ti";
import { axiosInstance } from "../../lib/authInstances";
import { useNavigate } from "react-router-dom";

export default function NewJob() {
  const navigate = useNavigate();

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Error states
  const [submitError, setSubmitError] = useState("");

  // Form state - simple object
  const [jobName, setJobName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [outletName, setOutletName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("Hotel");
  const [shortAddress, setShortAddress] = useState("");
  const [jobScope, setJobScope] = useState("");
  const [jobRequirements, setJobRequirements] = useState("");
  const [shifts, setShifts] = useState([{
    id: Date.now(),
    startTime: "09:00",
    endTime: "17:00",
    vacancy: 3,
    standbyVacancy: 1,
    duration: 8,
    breakHours: 1,
    breakType: "Paid",
    rateType: "Flat rate",
    payRate: 20,
    totalWage: 160,
  }]);


  // Calculate shift totals
  const calculateShiftTotal = (shift: any) => {
    const start = new Date(`2000-01-01T${shift.startTime}`);
    const end = new Date(`2000-01-01T${shift.endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const calculatedDuration = Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));

    const duration = shift.startTime && shift.endTime ? calculatedDuration : shift.duration;
    const totalWage = shift.rateType === "Hourly rate"
      ? shift.payRate * duration
      : shift.payRate;

    return { duration, totalWage };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "jobName") setJobName(value);
    else if (name === "companyName") setCompanyName(value);
    else if (name === "outletName") setOutletName(value);
    else if (name === "date") setDate(value);
    else if (name === "location") setLocation(value);
    else if (name === "industry") setIndustry(value);
    else if (name === "shortAddress") setShortAddress(value);
    else if (name === "jobScope") setJobScope(value);
    else if (name === "jobRequirements") setJobRequirements(value);

    setSubmitError("");
  };

  const addShift = () => {
    const newShift = {
      id: Date.now(),
      startTime: "09:00",
      endTime: "17:00",
      vacancy: 3,
      standbyVacancy: 1,
      duration: 8,
      breakHours: 1,
      breakType: "Paid",
      rateType: "Flat rate",
      payRate: 20,
      totalWage: 160,
    };

    const calculated = calculateShiftTotal(newShift);
    setShifts([...shifts, { ...newShift, ...calculated }]);
  };

  const deleteShift = (id: number) => {
    if (shifts.length <= 1) {
      setSubmitError("At least one shift is required");
      return;
    }
    setShifts(shifts.filter(shift => shift.id !== id));
  };

  const updateShift = (id: number, field: string, value: any) => {
    setShifts(shifts.map(shift => {
      if (shift.id === id) {
        const updatedShift = { ...shift, [field]: value };
        const calculated = calculateShiftTotal(updatedShift);
        return { ...updatedShift, ...calculated };
      }
      return shift;
    }));
  };


  const handleCompanyLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError("Image size should be less than 5MB");
        return;
      }

      if (!file.type.startsWith('image/')) {
        setSubmitError("Please select a valid image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result && typeof reader.result === 'string') {
          setCompanyLogo(reader.result);
        }
      };
      reader.onerror = () => {
        setSubmitError("Failed to read image file");
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!jobName.trim()) {
      setSubmitError("Job name is required");
      return false;
    }

    if (!companyName.trim()) {
      setSubmitError("Company name is required");
      return false;
    }

    if (!outletName.trim()) {
      setSubmitError("Outlet name is required");
      return false;
    }

    if (!date) {
      setSubmitError("Please select a date");
      return false;
    }

    if (!location.trim()) {
      setSubmitError("Location is required");
      return false;
    }

    if (shifts.length === 0) {
      setSubmitError("At least one shift is required");
      return false;
    }

    for (const shift of shifts) {
      if (shift.vacancy < 0) {
        setSubmitError("Headcount cannot be negative");
        return false;
      }
      if (shift.standbyVacancy < 0) {
        setSubmitError("Standby headcount cannot be negative");
        return false;
      }
      if (shift.payRate <= 0) {
        setSubmitError("Pay rate must be greater than 0");
        return false;
      }
    }

    if (!jobScope.trim()) {
      setSubmitError("Job description is required");
      return false;
    }

    if (!jobRequirements.trim()) {
      setSubmitError("Job requirements are required");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const formattedShifts = shifts.map((shift) => {
        const [startHour, startMin] = shift.startTime.split(':');
        const [endHour, endMin] = shift.endTime.split(':');
        const startHourNum = parseInt(startHour);
        const endHourNum = parseInt(endHour);
        const startPeriod = startHourNum >= 12 ? 'PM' : 'AM';
        const endPeriod = endHourNum >= 12 ? 'PM' : 'AM';

        return {
          startTime: `${startHour}:${startMin}`,
          startMeridian: startPeriod,
          endTime: `${endHour}:${endMin}`,
          endMeridian: endPeriod,
          vacancy: shift.vacancy,
          standbyVacancy: shift.standbyVacancy,
          duration: shift.duration,
          breakHours: shift.breakHours,
          breakType: shift.breakType,
          rateType: shift.rateType,
          payRate: shift.payRate,
          totalWage: shift.totalWage,
        };
      });

      const requestData = {
        jobName: jobName.trim(),
        companyName: companyName.trim(),
        companyLogo: companyLogo || null,
        outletName: outletName.trim(),
        date: date,
        location: location.trim(),
        industry: industry || "Hotel",
        shortAddress: shortAddress.trim(),
        jobScope: jobScope.split(',').map(s => s.trim()).filter(s => s),
        jobRequirements: jobRequirements.split(',').map(s => s.trim()).filter(s => s),
        shifts: formattedShifts,
      };

      const response = await axiosInstance.post("/admin/jobs/", requestData);

      if (response.data) {
        navigate("/jobs/job-management");
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setSubmitError(
        error?.response?.data?.message ||
        "Failed to create job. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto p-12 max-w-6xl">
      <div className="flex items-center gap-2 mb-6">
        <button
          type="button"
          className="p-2 rounded-full shadow-custom bg-white hover:bg-gray-50"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" color="#000000" />
        </button>
        <h1 className="text-lg font-medium">Add new job</h1>
      </div>

      {submitError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Job Info Section */}
        <div className="pb-4 border-b">
          <h2 className="flex items-center gap-2 text-blue-500 text-xl">
            <Briefcase className="w-6 h-6" />
            Job Info
          </h2>
        </div>

        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Job name</label>
              <input
                type="text"
                name="jobName"
                value={jobName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Enter job name"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Company</label>
                <span className="text-xs text-gray-500">Click + to add logo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 border rounded-lg">
                  {companyLogo ? (
                    <div className="border-r px-2 border-dashed relative group">
                      <label htmlFor="companyLogoUpload" className="cursor-pointer">
                        <img
                          src={companyLogo}
                          alt="Company Logo"
                          width={38}
                          height={38}
                          className="rounded-full p-1 object-cover hover:opacity-80 transition-opacity"
                        />
                      </label>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        Click to change logo
                      </div>
                    </div>
                  ) : (
                    <div className="border-r px-2 border-dashed relative group">
                      <label
                        htmlFor="companyLogoUpload"
                        className="cursor-pointer flex items-center justify-center w-[38px] h-[38px] border-2 border-dashed border-gray-300 rounded-full hover:border-blue-500 transition-colors"
                        title="Upload Company Logo"
                      >
                        <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </label>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        Upload Company Logo
                      </div>
                    </div>
                  )}
                  <input
                    id="companyLogoUpload"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleCompanyLogoChange}
                  />
                  <input
                    type="text"
                    className="flex-1 border-none p-0 focus:outline-none"
                    name="companyName"
                    value={companyName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter company name"
                  />
                  {companyLogo && (
                    <button
                      type="button"
                      onClick={() => setCompanyLogo(null)}
                      className="text-red-500 hover:text-red-600 text-sm"
                      title="Remove Company Logo"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Outlet</label>
              <input
                type="text"
                name="outletName"
                value={outletName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Enter outlet name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <input
                type="date"
                name="date"
                value={date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <input
                type="text"
                name="location"
                value={location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Enter location"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Short Address</label>
              <input
                type="text"
                name="shortAddress"
                value={shortAddress}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter short address"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Industry</label>
            <select
              name="industry"
              value={industry}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Hotel">Hotel</option>
              <option value="Restaurant">Restaurant</option>
              <option value="Retail">Retail</option>
              <option value="Healthcare">Healthcare</option>
            </select>
          </div>
        </div>

        {/* Shifts Info Section */}
        <div>
          <div className="pb-4 border-b mb-6">
            <div className="flex items-center gap-2 text-blue-500">
              <Rows2 className="w-5 h-5" />
              <h2 className="text-xl">Shifts Info</h2>
            </div>
          </div>

          <div className="space-y-6">
            {shifts.map((shift, index) => (
              <div key={shift.id} className="bg-white rounded-2xl border p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Shift {index + 1}</h3>
                  {shifts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteShift(shift.id)}
                      className="text-red-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start time</label>
                    <input
                      type="time"
                      value={shift.startTime}
                      onChange={(e) => updateShift(shift.id, "startTime", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">End time</label>
                    <input
                      type="time"
                      value={shift.endTime}
                      onChange={(e) => updateShift(shift.id, "endTime", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Headcount Needed</label>
                    <input
                      type="number"
                      min="0"
                      value={shift.vacancy}
                      onChange={(e) => updateShift(shift.id, "vacancy", Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Standby Headcount</label>
                    <input
                      type="number"
                      min="0"
                      value={shift.standbyVacancy}
                      onChange={(e) => updateShift(shift.id, "standbyVacancy", Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duration (Hours)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={shift.duration}
                      onChange={(e) => updateShift(shift.id, "duration", Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Break Hours</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={shift.breakHours}
                      onChange={(e) => updateShift(shift.id, "breakHours", Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Break Type</label>
                    <select
                      value={shift.breakType}
                      onChange={(e) => updateShift(shift.id, "breakType", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rate type</label>
                    <select
                      value={shift.rateType}
                      onChange={(e) => updateShift(shift.id, "rateType", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="Flat rate">Flat rate</option>
                      <option value="Hourly rate">Hourly rate</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pay Rate ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={shift.payRate}
                      onChange={(e) => updateShift(shift.id, "payRate", Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Total Wages ($)
                    </label>
                    <input
                      type="text"
                      value={`$${shift.totalWage.toFixed(2)}`}
                      className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addShift}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Shift
          </button>
        </div>

        {/* Requirements Section */}
        <div>
          <div className="pb-4 border-b mb-6">
            <div className="flex items-center gap-2 text-blue-500">
              <TiDocumentText className="w-5 h-5" />
              <h2 className="text-xl">Requirements</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Job Description (comma-separated)
              </label>
              <textarea
                name="jobScope"
                value={jobScope}
                onChange={handleInputChange}
                className="w-full min-h-[150px] p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter job description, separated by commas"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Job Requirements (comma-separated)
              </label>
              <textarea
                name="jobRequirements"
                value={jobRequirements}
                onChange={handleInputChange}
                className="w-full min-h-[150px] p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter job requirements, separated by commas"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 h-16 w-64 text-xl border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 h-16 w-64 bg-blue-500 text-xl text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
