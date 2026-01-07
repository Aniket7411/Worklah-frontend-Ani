"use client";

import { useState, useEffect } from "react";
import { axiosInstance } from "../../lib/authInstances";

const IMAGE_BASE_URL = "https://worklah.onrender.com";

interface Outlet {
  id: string;
  name: string;
  location: string;
  logo: string;
}

export default function OutletFilter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/admin/outlets");
        const outletsData = response.data.data || response.data.outlets || [];
        
        const formattedOutlets: Outlet[] = outletsData.map((outlet: any) => ({
          id: outlet._id || outlet.id || '',
          name: outlet.outletName || outlet.name || 'Unknown',
          location: outlet.outletAddress || outlet.location || 'N/A',
          logo: outlet.outletImage 
            ? `${IMAGE_BASE_URL}${outlet.outletImage}`
            : '/assets/company.png',
        }));
        
        setOutlets(formattedOutlets);
      } catch (error) {
        console.error('Error fetching outlets:', error);
        setOutlets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOutlets();
  }, []);

  const alphabet = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");

  // Filter outlets based on search term and selected letter
  const filteredOutlets = outlets.filter((outlet) => {
    const matchesSearch =
      outlet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      outlet.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLetter = selectedLetter
      ? outlet.name.charAt(0).toUpperCase() === selectedLetter
      : true;
    return matchesSearch && matchesLetter;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm w-[300px]">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Outlets</h2>
          <button className="text-gray-500 hover:text-gray-700">×</button>
        </div>

        <div className="h-[400px] overflow-y-auto relative">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredOutlets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No outlets found
            </div>
          ) : (
            <div className="pr-8">
              {filteredOutlets.map((outlet) => (
              <div
                key={outlet.id}
                className="flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b"
              >
                <div className="w-6 h-6 relative flex-shrink-0">
                  <img
                    src={outlet.logo || "/placeholder.svg"}
                    alt={outlet.name}
                    className="object-contain"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium">{outlet.name}</div>
                  <div className="text-xs text-gray-500">{outlet.location}</div>
                </div>
              </div>
              ))}
            </div>
          )}

          {/* Alphabet Index */}
          <div className="absolute right-0 top-0 flex flex-col items-center text-xs">
            {alphabet.map((letter) => (
              <button
                key={letter}
                className={`w-6 h-6 flex items-center justify-center hover:text-gray-600 ${
                  selectedLetter === letter
                    ? "text-blue-600 font-bold"
                    : "text-gray-400"
                }`}
                onClick={() => {
                  if (selectedLetter === letter) {
                    setSelectedLetter(null);
                  } else {
                    setSelectedLetter(letter);
                  }
                }}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
