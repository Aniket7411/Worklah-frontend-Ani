import { Plus, Trash2 } from "lucide-react";
import React from "react";

const DefaultPenalties = () => {
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
            {[
              {
                frame: "5 Times after applying",
                penalty: "No Penalty",
              },
              {
                frame: "> 48 Hours",
                penalty: "No Penalty",
              },
              {
                frame: "> 24 Hours (1st Time)",
                penalty: "$5 Penalty",
              },
              {
                frame: "> 24 Hours (2nd Time)",
                penalty: "$10 Penalty",
              },
              {
                frame: "> 24 Hours (3rd Time)",
                penalty: "$15 Penalty",
              },
              {
                frame: "No Show - During Shift",
                penalty: "$50 Penalty",
              },
            ].map((item, index) => {
              const penaltyValue = parseInt(
                item.penalty.replace("$", "").replace(" Penalty", "")
              );

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
                      {item.frame}
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
