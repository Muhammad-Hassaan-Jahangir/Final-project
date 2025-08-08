'use client';

import { useState } from 'react';

type ConfigItem = {
  id: string;
  name: string;
  value: string;
  type: 'text' | 'boolean' | 'number';
  description: string;
};

export default function AdminSettingsPage() {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Blocklance',
    siteDescription: 'Decentralized Freelancing Platform',
    contactEmail: 'admin@gamil.com',
  });
  
  const [featureFlags, setFeatureFlags] = useState({
    enableBlockchain: true,
    enableNotifications: true,
    enableChat: true,
    maintenanceMode: false,
  });

  const [configItems, setConfigItems] = useState<ConfigItem[]>([
    {
      id: '1',
      name: 'Platform Fee',
      value: '5%',
      type: 'text',
      description: 'Fee charged on each transaction'
    },
    {
      id: '2',
      name: 'Max File Upload Size',
      value: '10',
      type: 'number',
      description: 'Maximum file size in MB'
    },
    {
      id: '3',
      name: 'Enable Job Approval',
      value: 'true',
      type: 'boolean',
      description: 'Require admin approval for new jobs'
    },
  ]);

  const [viewConfig, setViewConfig] = useState<ConfigItem | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);

  const handleGeneralSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeatureFlagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFeatureFlags(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically save the settings to your backend
    alert('Settings saved successfully!');
  };

  const handleViewConfig = (config: ConfigItem) => {
    setViewConfig(config);
  };

  const handleDeleteConfig = (id: string) => {
    // In a real app, you would call an API to delete the config
    setConfigItems(configItems.filter(item => item.id !== id));
    setDeleteConfirmation(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Settings</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">General Settings</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="siteName">
              Site Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="siteName"
              type="text"
              name="siteName"
              value={generalSettings.siteName}
              onChange={handleGeneralSettingsChange}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="siteDescription">
              Site Description
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="siteDescription"
              type="text"
              name="siteDescription"
              value={generalSettings.siteDescription}
              onChange={handleGeneralSettingsChange}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contactEmail">
              Contact Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="contactEmail"
              type="email"
              name="contactEmail"
              value={generalSettings.contactEmail}
              onChange={handleGeneralSettingsChange}
            />
          </div>
          
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Feature Flags</h2>
          
          <div className="mb-4">
            <div className="flex items-center">
              <input
                id="enableBlockchain"
                type="checkbox"
                name="enableBlockchain"
                checked={featureFlags.enableBlockchain}
                onChange={handleFeatureFlagChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="enableBlockchain" className="ml-2 block text-sm text-gray-900">
                Enable Blockchain Features
              </label>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center">
              <input
                id="enableNotifications"
                type="checkbox"
                name="enableNotifications"
                checked={featureFlags.enableNotifications}
                onChange={handleFeatureFlagChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="enableNotifications" className="ml-2 block text-sm text-gray-900">
                Enable Notifications
              </label>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center">
              <input
                id="enableChat"
                type="checkbox"
                name="enableChat"
                checked={featureFlags.enableChat}
                onChange={handleFeatureFlagChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="enableChat" className="ml-2 block text-sm text-gray-900">
                Enable Chat System
              </label>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center">
              <input
                id="maintenanceMode"
                type="checkbox"
                name="maintenanceMode"
                checked={featureFlags.maintenanceMode}
                onChange={handleFeatureFlagChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
                Maintenance Mode
              </label>
            </div>
          </div>
          
          <div className="flex items-center justify-end">
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>

      {/* Configuration Items */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Configuration Items</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {configItems.map((config) => (
                <tr key={config.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{config.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{config.value}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{config.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleViewConfig(config)} 
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => setDeleteConfirmation(config.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Config Modal */}
      {viewConfig && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">{viewConfig.name}</h2>
                <button 
                  onClick={() => setViewConfig(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Value:</span> {viewConfig.value}</p>
                <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Type:</span> {viewConfig.type}</p>
                <p className="text-sm text-gray-700 mb-4"><span className="font-medium">Description:</span> {viewConfig.description}</p>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setViewConfig(null)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
              <p className="text-gray-500 mb-6">Are you sure you want to delete this configuration item? This action cannot be undone.</p>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteConfig(deleteConfirmation)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}