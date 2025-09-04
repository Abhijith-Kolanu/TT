// Backup of original Footsteps component
// This file serves as a backup while we fix the main Footsteps.jsx
import React from "react";

const FootstepsBackup = () => {
  return (
    <div className="fixed inset-0 lg:left-64 bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Footsteps Map (Under Maintenance)
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The footsteps mapping feature is temporarily unavailable while we update dependencies.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FootstepsBackup;
