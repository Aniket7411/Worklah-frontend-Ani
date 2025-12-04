import { ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';
import JobInfo from './JobInfo';
import ShiftsInfo from './ShiftsInfo';
import Requirements from './Requirements';
import DefaultPenalties from './DefaultPenalties';



const ModifyShifts: React.FC = () => {
  const [activeTab, setActiveTab] = useState('job-info');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'job-info':
        return <JobInfo />;
      case 'shifts-info':
        return <ShiftsInfo />;
      case 'requirements':
        return <Requirements />;
      case 'default-penalties':
        return <DefaultPenalties />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-6">
        <button className="p-2 rounded-full hover:bg-gray-200">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-semibold">Modify</h2>
      </div>

      <div className="mb-6 px-8">
        <ul className="flex border-b border-[#CED0D1] items-center justify-between">
          {['Job Info', 'Shifts Info', 'Requirements', 'Default Penalties'].map((tab) => (
            <li key={tab} className="-mb-px mr-1">
              <a
                href="#"
                className={`inline-block py-2 px-8 text-[16px] leading-[24px] font-medium ${
                  activeTab === tab.toLowerCase().replace(' ', '-')
                    ? 'border-b-2 border-[#0099FF]'
                    : 'text-gray-500 hover:text-blue-600'
                }`}
                onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '-'))}
              >
                {tab}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">{renderTabContent()}</div>
    </div>
  );
};

export default ModifyShifts;
