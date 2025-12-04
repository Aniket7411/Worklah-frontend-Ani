// Loader.tsx
import React from "react";

const Loader = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="spinner-border animate-spin inline-block w-16 h-16 border-4 border-solid border-blue-500 border-t-transparent rounded-full"></div>
    </div>
  );
};

export default Loader;
