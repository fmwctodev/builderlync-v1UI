import React, { useState } from 'react';
import { Camera, User, MapPin, Calendar } from 'lucide-react';

const JobCam: React.FC = () => {
  const [selectedJob, setSelectedJob] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);

  // Dummy data for jobs
  const jobs = [
    { id: 1, name: 'Roof Repair - Main St', customer: 'John Smith', location: '123 Main St' },
    { id: 2, name: 'New Installation - Oak Ave', customer: 'Jane Doe', location: '456 Oak Ave' },
    { id: 3, name: 'Inspection - Pine Rd', customer: 'Bob Johnson', location: '789 Pine Rd' }
  ];

  // Dummy data for customers
  const customers = [
    { id: 1, name: 'John Smith', email: 'john@email.com' },
    { id: 2, name: 'Jane Doe', email: 'jane@email.com' },
    { id: 3, name: 'Bob Johnson', email: 'bob@email.com' }
  ];

  // Dummy data for job images
  const jobImages = [
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      jobId: 1,
      customerId: 1,
      date: '2024-01-15',
      description: 'Before repair - damaged shingles',
      linked: true
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400',
      jobId: 1,
      customerId: 1,
      date: '2024-01-16',
      description: 'After repair - completed work',
      linked: true
    },
    {
      id: 3,
      url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
      jobId: null,
      customerId: null,
      date: '2024-01-17',
      description: 'New installation progress',
      linked: false
    },
    {
      id: 4,
      url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
      jobId: 2,
      customerId: 2,
      date: '2024-01-18',
      description: 'Installation materials',
      linked: true
    },
    {
      id: 5,
      url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400',
      jobId: null,
      customerId: null,
      date: '2024-01-19',
      description: 'Inspection findings',
      linked: false
    }
  ];

  const filteredImages = jobImages.filter(image => {
    if (selectedJob && image.jobId !== parseInt(selectedJob)) return false;
    if (selectedCustomer && image.customerId !== parseInt(selectedCustomer)) return false;
    return true;
  });

  const handleLinkImage = (imageId:any, jobId:any, customerId:any) => {
    // In a real app, this would make an API call
    console.log('Linking image', imageId, 'to job', jobId, 'and customer', customerId);
    setShowLinkModal(false);
  };

  return (
    <div className="relative space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Camera className="w-8 h-8 text-red-600" />
          <h1 className="text-2xl font-bold text-gray-900">Job Cam</h1>
        </div>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2">
          <Camera size={16} />
          <span>Take Photo</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Job</label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">All Jobs</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Customer</label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">All Customers</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredImages.map(image => (
          <div key={image.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="relative">
              <img
                src={image.url}
                alt={image.description}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2">
                {image.linked ? (
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Linked
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedImage(image);
                      setShowLinkModal(true);
                    }}
                    className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium hover:bg-red-700"
                  >
                    Link
                  </button>
                )}
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-gray-900 mb-2">{image.description}</p>
              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar size={12} />
                  <span>{image.date}</span>
                </div>
                {image.linked && (
                  <>
                    <div className="flex items-center space-x-1">
                      <User size={12} />
                      <span>{customers.find(c => c.id === image.customerId)?.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin size={12} />
                      <span>{jobs.find(j => j.id === image.jobId)?.name}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Link Image Modal */}
      {showLinkModal && selectedImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Link Image to Job & Customer</h3>
              <button
                onClick={() => setShowLinkModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <img
                src={selectedImage.url}
                alt={selectedImage.description}
                className="w-full h-32 object-cover rounded-lg"
              />
              <p className="text-sm text-gray-600 mt-2">{selectedImage.description}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Job</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500">
                  <option value="">Select a job</option>
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>{job.name} - {job.customer}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500">
                  <option value="">Select a customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleLinkImage(selectedImage.id, 1, 1)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Link Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCam;