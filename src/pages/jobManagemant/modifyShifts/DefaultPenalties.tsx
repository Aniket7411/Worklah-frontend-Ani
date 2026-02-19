import { Plus, Trash2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../../../lib/authInstances";

interface Penalty {
  frame: string;
  penalty: string;
}

const DefaultPenalties = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPenalties = async () => {
      try {
        setLoading(true);
        
        // Try to fetch penalties from job data first
        if (jobId) {
          try {
            const jobResponse = await axiosInstance.get(`/admin/jobs/${jobId}`);
            const job = jobResponse.data?.job || jobResponse.data;
            if (job?.penalties && Array.isArray(job.penalties)) {
              setPenalties(job.penalties);
              setLoading(false);
              return;
            }
          } catch (error) {
            console.error("Error fetching job penalties:", error);
          }
        }

        // Try to fetch default penalties from API
        try {
          const response = await axiosInstance.get("/admin/penalties");
          if (response.data?.penalties && Array.isArray(response.data.penalties)) {
            setPenalties(response.data.penalties);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error fetching default penalties:", error);
        }

        // Fallback to empty array if no penalties found
        setPenalties([]);
      } catch (error) {
        console.error("Error fetching penalties:", error);
        setPenalties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPenalties();
  }, [jobId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-10">
        <div className="text-gray-500">Loading penalties...</div>
      </div>
    );
  }

  if (penalties.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-10">
        <div className="text-gray-500">No penalties configured</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-10">
      <div className="max-w-6xl w-full  rounded-lg ">
        {/* Job Scope Section */}
        <div>
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center gap-2">
              <img
                src="./assets/icons/shift-penality.png"
                alt="penality"
                className="w-5 h-5"
              />
              <h2 className="text-[16px] leading-[19px] font-medium text-[#9F120E]">
                Shift Cancellation Penalties info
              </h2>
            </div>
          </div>
          <div className="text-[16px] leading-[19px] font-medium text-[#000000] py-3 pl-24 pr-32 flex items-center justify-between bg-[#F0F0F0] rounded-lg">
            <p>Time frmae</p>
            <p>Penalties</p>
          </div>
          <div className="">
            {penalties.map((item, index) => {
              const penaltyValue = parseInt(
                String(item.penalty || "0").replace("$", "").replace(" Penalty", "").replace("No Penalty", "0"),
                10
              ) || 0;

              // Determine penalty text color
              const penaltyColor =
                penaltyValue >= 50
                  ? "text-[#941F15]" // Darkest red for $50 or more
                  : penaltyValue >= 15
                  ? "text-[#941F15]" // Dark red for $15 or more
                  : penaltyValue >= 10
                  ? "text-[#BB2F23]" // Bold red for $10
                  : penaltyValue >= 5
                  ? "text-[#D14236]" // Light red for $5
                  : "text-[#797979]";

              return (
                <div
                  key={index}
                  className="flex items-center justify-between py-4 px-24 border-2 border-gray-100 bg-[#F9FDFF] rounded-lg"
                >
                  <div className="flex items-center gap-16">
                    <p className="text-[16px] leading-[22px] font-normal text-[#000000]">
                      {item.frame ?? item.condition}
                    </p>
                  </div>
                  <p
                    className={`py-3 px-6 rounded-full text-[16px] leading-[19px] font-medium bg-[#F5F5F5] ${penaltyColor}`}
                  >
                    {item.penalty}
                  </p>
                </div>
              );
            })}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default DefaultPenalties;
