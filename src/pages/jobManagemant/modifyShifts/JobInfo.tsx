import { ArrowDown, ChevronDown, Edit } from "lucide-react";
import React from "react";

const JobInfo: React.FC = () => {
  return (
    <div className="flex flex-col items-center min-h-screen ">
      <div className="max-w-6xl w-full rounded-lg ">
        <form>
          <div className="grid grid-cols-2 gap-10 pb-32">
            {/* Job Name */}
            <div>
              <label className="block text-[16px] font-medium text-[#4C4C4C] leading-[24px]">
                Job Name
              </label>
              <div className="flex items-center justify-between gap-6 mt-2 py-5 px-8 border-2 bg-[#F9FDFF] border-gray-200 shadow-md rounded-lg">
                <div className="flex items-center gap-6">
                  <button
                    type="button"
                    className="text-blue-500 text-sm underline hover:text-blue-700"
                  >
                    <img
                      src="./assets/icons/dropdown.png"
                      alt="dropdown"
                      className="w-7 h-7"
                    />
                  </button>
                  <p className="text-[16px] font-medium text-[#000000] leading-[24px]">
                    Tray Collector
                  </p>
                </div>
                <div>
                  <img
                    src="./assets/icons/edit.png"
                    alt="dropdown"
                    className="w-4 h-4"
                  />
                </div>
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="block text-[16px] font-medium text-[#4C4C4C] leading-[24px]">
                Company
              </label>
              <div className="flex items-center gap-6 mt-2 py-5 px-8 border-2 bg-[#F9FDFF] border-gray-200 shadow-md rounded-lg">
                <button
                  type="button"
                  className="text-blue-500 text-sm underline hover:text-blue-700"
                >
                  <img
                    src="./assets/icons/dropdown.png"
                    alt="dropdown"
                    className="w-7 h-7"
                  />
                </button>
                <div className="flex items-center gap-2">
                  <img
                    src="./assets/company.png"
                    alt="outlet"
                    className="w-8 h-8 rounded-full"
                  />
                  <p className="text-[16px] font-normal text-[#000000] leading-[24px]">
                    RIGHT SERVICE PTE. LTD.
                  </p>
                </div>
              </div>
            </div>

            {/* Change Outlet */}
            <div>
              <label className="block text-[16px] font-medium text-[#4C4C4C] leading-[24px]">
                Change Outlet
              </label>
              <div className="flex items-center justify-between gap-6 mt-2 py-5 px-8 border-2 bg-[#F9FDFF] border-gray-200 shadow-md rounded-lg">
                <div className="flex items-center gap-6">
                  <button
                    type="button"
                    className="text-blue-500 text-sm underline hover:text-blue-700"
                  >
                    <img
                      src="./assets/icons/dropdown.png"
                      alt="dropdown"
                      className="w-7 h-7"
                    />
                  </button>
                  <div className="flex items-center gap-2">
                    <img
                      src="./assets/ecompany.png"
                      alt="outlet"
                      className="w-7 h-7 rounded-full"
                    />
                    <p className="text-[16px] font-medium text-[#000000] leading-[19px]">
                      Dominos
                    </p>
                  </div>
                </div>
                <img
                  src="./assets/icons/edit.png"
                  alt="dropdown"
                  className="w-4 h-4"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[16px] font-medium text-[#4C4C4C] leading-[24px]">
                Category
              </label>
              <div className="flex items-center gap-6 mt-2 py-5 px-8 border-2 bg-[#F9FDFF] border-gray-200 shadow-md rounded-lg">
                <button
                  type="button"
                  className="text-blue-500 text-sm underline hover:text-blue-700"
                >
                  <img
                    src="./assets/icons/dropdown.png"
                    alt="dropdown"
                    className="w-7 h-7"
                  />
                </button>
                
                  <p className="text-[16px] py-2 px-3 rounded-full bg-[#E2F8FF] font-normal text-[#000000] leading-[24px]">
                    Cleaning
                  </p>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-[16px] font-medium text-[#4C4C4C] leading-[24px]">
                Location
              </label>
              <div className="flex items-center justify-between gap-6 mt-2 py-5 px-8 border-2 bg-[#F9FDFF] border-gray-200 shadow-md rounded-lg">
                <div className="flex items-center gap-6">
                  <button
                    type="button"
                    className="text-blue-500 text-sm underline hover:text-blue-700"
                  >
                    <img
                      src="./assets/icons/dropdown.png"
                      alt="dropdown"
                      className="w-7 h-7"
                    />
                  </button>
                  <p className="text-[16px] font-nomral text-[#000000] leading-[19px]">
                    SengKang, Singpore
                  </p>
                </div>
                <a href="#" className="underline text-[#0099FF] text-[12px] font-normal leading-[18px]">View on map</a>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-[16px] font-medium text-[#4C4C4C] leading-[24px]">
                Date
              </label>
              <div className="flex items-center gap-2 mt-2 w-full">
                <div className="flex items-center gap-6 py-5 px-8 border-2 bg-[#F9FDFF] border-gray-200 shadow-md rounded-lg w-[30%]">
                  <button
                    type="button"
                    className="text-blue-500 text-sm underline hover:text-blue-700"
                  >
                    <img
                      src="./assets/icons/dropdown.png"
                      alt="dropdown"
                      className="w-7 h-7"
                    />
                  </button>
                  <p className="text-[16px] font-nomral text-[#000000] leading-[19px]">
                    1
                  </p>
                </div>
                <div className="flex items-center gap-6 py-5 px-8 border-2 bg-[#F9FDFF] border-gray-200 shadow-md rounded-lg w-[40%]">
                  <button
                    type="button"
                    className="text-blue-500 text-sm underline hover:text-blue-700"
                  >
                    <img
                      src="./assets/icons/dropdown.png"
                      alt="dropdown"
                      className="w-7 h-7"
                    />
                  </button>
                  <p className="text-[16px] font-nomral text-[#000000] leading-[19px]">
                    January
                  </p>
                </div>
                <div className="flex items-center gap-6 py-5 px-8 border-2 bg-[#F9FDFF] border-gray-200 shadow-md rounded-lg w-[30%]">
                  <button
                    type="button"
                    className="text-blue-500 text-sm underline hover:text-blue-700"
                  >
                    <img
                      src="./assets/icons/dropdown.png"
                      alt="dropdown"
                      className="w-7 h-7"
                    />
                  </button>
                  <p className="text-[16px] font-nomral text-[#000000] leading-[19px]">
                    2024
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
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
        </form>
      </div>
    </div>
  );
};

export default JobInfo;
