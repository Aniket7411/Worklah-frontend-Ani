import { useState, useEffect } from "react";
import { axiosInstance } from "../../lib/authInstances";
import toast from "react-hot-toast";
import { ArrowLeft, Save, Plus, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PenaltyRule {
  condition: string;
  penalty: string;
  _id?: string;
}

const PenaltyManagement = () => {
  const navigate = useNavigate();
  const [penalties, setPenalties] = useState<PenaltyRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPenalties();
  }, []);

  const fetchPenalties = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/admin/penalties");
      if (response?.data?.penalties && Array.isArray(response.data.penalties)) {
        setPenalties(response.data.penalties);
      } else {
        setPenalties([]);
      }
    } catch {
      setPenalties([]);
    } finally {
      setLoading(false);
    }
  };

  const updatePenalty = (index: number, field: "condition" | "penalty", value: string) => {
    setPenalties((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const addRule = () => {
    setPenalties((prev) => [...prev, { condition: "", penalty: "No Penalty" }]);
  };

  const removeRule = (index: number) => {
    setPenalties((prev) => prev.filter((_, i) => i !== index));
  };

  const formatPenaltyForDisplay = (val: string) => {
    if (!val) return "No Penalty";
    const v = val.trim();
    if (/^\d+(\.\d+)?$/.test(v)) return `$${v} Penalty`;
    if (v.toLowerCase().includes("no")) return "No Penalty";
    return v;
  };

  const parsePenaltyToInput = (val: string) => {
    if (!val || val.toLowerCase().includes("no penalty") || val === "0") return "";
    return val.replace(/\$/g, "").replace(/\s*Penalty/gi, "").trim();
  };

  const handlePenaltyChange = (index: number, raw: string) => {
    const v = raw.trim().toLowerCase();
    if (!v || v === "no" || v === "0" || v === "no penalty")
      updatePenalty(index, "penalty", "No Penalty");
    else if (/^\d+(\.\d+)?$/.test(raw.trim()))
      updatePenalty(index, "penalty", `$${raw.trim()} Penalty`);
    else
      updatePenalty(index, "penalty", raw ? `$${raw} Penalty` : "No Penalty");
  };

  const handleSave = async () => {
    const invalid = penalties.some((p) => !p.condition?.trim());
    if (invalid) {
      toast.error("All penalty conditions must have a description.");
      return;
    }
    setSaving(true);
    try {
      const payload = penalties.map((p) => ({
        condition: p.condition.trim(),
        penalty: p.penalty?.trim() ? formatPenaltyForDisplay(p.penalty.replace(/\$/g, "").replace(/\s*Penalty/gi, "").trim() || "0") : "No Penalty",
      }));
      await axiosInstance.put("/admin/penalties", { penalties: payload });
      toast.success("Penalties updated successfully.");
      fetchPenalties();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save penalties.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Shift Cancellation Penalties</h1>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-medium">Admin-configurable penalties</p>
          <p>Edit conditions and amounts below. Changes apply globally to all jobs unless a job has its own override.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Penalty Rules</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addRule}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <Plus className="w-4 h-4" />
              Add Rule
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {penalties.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No penalty rules yet. Click &quot;Add Rule&quot; to create one.
            </div>
          )}
          {penalties.map((item, index) => (
            <div key={index} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-medium text-gray-500 mb-1">Condition</label>
                <input
                  type="text"
                  value={item.condition}
                  onChange={(e) => updatePenalty(index, "condition", e.target.value)}
                  placeholder="e.g. 24 Hours (1st Time)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-full sm:w-40">
                <label className="block text-xs font-medium text-gray-500 mb-1">Penalty</label>
                <input
                  type="text"
                  value={parsePenaltyToInput(item.penalty)}
                  onChange={(e) => handlePenaltyChange(index, e.target.value)}
                  placeholder="0 or No Penalty"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={() => removeRule(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg mt-6 sm:mt-0"
                title="Remove rule"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PenaltyManagement;
