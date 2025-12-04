import { Delete, Plus, Trash2 } from "lucide-react";
import React from "react";

const Requirements: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center py-10">
      <div className="max-w-6xl w-full  rounded-lg ">
        {/* Job Scope Section */}
        <div>
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center gap-2">
              <img
                src="./assets/icons/focus.png"
                alt="Focus"
                className="w-5 h-5"
              />
              <h2 className="text-[16px] leading-[19px] font-medium text-[#000000]">
                Job Scope
              </h2>
            </div>
            <Trash2 className="w-8 h-8 bg-[#FFDCD5] rounded-full p-2 cursor-pointer" />
          </div>
          <div className="text-[16px] leading-[19px] font-medium text-[#000000] py-3 px-4 text-center bg-[#F0F0F0] rounded-lg">
            <p>Job scope description</p>
          </div>
          <div className="">
            {[
              "Station at tray collection section",
              "Clearing & Cleaning of table and tray",
              "Maintain floor cleanliness (Sweep/Mop)",
              "Push trolley to the dishwashing area",
            ].map((scope, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-4 px-8 border-2 border-gray-100 bg-[#F9FDFF] rounded-lg"
              >
                <div className="flex items-center gap-16">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-500 rounded border-gray-300"
                  />
                  <p className="text-[16px] leading-[22px] font-normal text-[#000000]">{scope}</p>
                </div>
                <button className="cursor-pointer">
                  <img
                    src="./assets/icons/edit.png"
                    alt="Edit"
                    className="w-4 h-4"
                  />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center cursor-pointer justify-between py-4 px-8 border-2 border-gray-100 bg-[#FFFFFF] rounded-lg">
            <div className="flex items-center gap-10 ">
              <Plus
                className="w-10 h-10 rounded-full border-2 border-gray-100 p-2"
                color="#000000"
              />
              <p className="text-[16px] leading-[22px]  text-[#4C4C4C]">Add job scope description</p>
            </div>
          </div>
        </div>

        {/* Job Requirements Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 py-4" >
              <img
                src="./assets/icons/focus.png"
                alt="Focus"
                className="w-5 h-5"
              />
              <h2 className="text-[16px] leading-[19px] font-medium text-[#000000]">
                Job Requirements
              </h2>
            </div>
            <Trash2 className="w-8 h-8 bg-[#FFDCD5] rounded-full p-2 cursor-pointer" />
          </div>
          <div className="text-[16px] flex items-center gap-6 justify-between leading-[19px] font-medium text-[#000000] py-3 px-4  bg-[#F0F0F0] rounded-lg">
            <div className="flex items-center gap-8 ">
            <div className="w-[60px] "></div>
            <div >
              <p>Add Icon</p>
            </div>

            </div>
            <p>Job requirements description</p>
            <div></div>
          </div>
          <div className="">
            {[
              {
                description: "Black T-shirt",
                icon: "./assets/icons/icon1.png",
              },
              {
                description: "Dark colored long pants / Jeans",
                icon: "./assets/icons/icon2.png",
              },
              {
                description: "Covered Shoes",
                icon: "./assets/icons/icon3.png",
              },
              {
                description:
                  "Must Arrive AT LEAST 15 mins before job start time for briefing!!",
                icon: "./assets/icons/icon4.png",
              },
            ].map((requirement, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-4 px-8 border-2 border-gray-100 bg-[#F9FDFF] rounded-lg"
              >
                <div className="flex items-center gap-16">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-500 rounded  border-gray-300"
                  />
                  <img src={requirement.icon} alt="Icon" className="w-5 h-5" />
                  <p className="text-gray-600">{requirement.description}</p>
                </div>
                <button>
                  <img
                    src="./assets/icons/edit.png"
                    alt="Edit"
                    className="w-4 h-4"
                  />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center cursor-pointer justify-between py-4 px-8 border-2 border-gray-100 bg-[#FFFFFF] rounded-lg">
            <div className="flex items-center gap-10 ">
              <Plus
                className="w-10 h-10 rounded-full border-2 border-gray-100 p-2"
                color="#000000"
              />
              <p className="text-[16px] leading-[22px]  text-[#4C4C4C]">Add job scope description</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="py-12 flex items-center justify-center gap-8">
            <button
              type="button"
              className="px-24 py-4 text-[20px] leading-[30px] font-bold text-[#0099FF] bg-white border border-[#0099FF] rounded-md "
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-24 py-4 text-[20px] leading-[30px] font-bold  text-white bg-[#0099FF] rounded-md"
            >
              Save
            </button>
          </div>
      </div>
    </div>
  );
};

export default Requirements;
