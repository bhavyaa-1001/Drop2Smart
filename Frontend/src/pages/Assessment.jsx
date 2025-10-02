import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationSectionFree from '../components/LocationSectionFree';
import { 
  submitAssessment, 
  uploadRooftopImage, 
  formatAssessmentData,
  pollAssessmentStatus,
  APIError 
} from '../utils/apiUtils';
import Toast from '../components/Toast';

const Assessment = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImageData, setUploadedImageData] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    roofArea: '',
    roofSlope: '',
    roofMaterial: '',
    location: '',
    coordinates: { lat: '', lng: '' },
    buildingHeight: '',
    annualRainfall: ''
  });
  const [loading, setLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    if (file && file.type.startsWith('image/')) {
      // Show preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
      
      try {
        // Upload to backend
        setUploadProgress(0);
        const uploadResponse = await uploadRooftopImage(file, (progress) => {
          setUploadProgress(progress);
        });
        
        if (uploadResponse.success) {
          setUploadedImageData(uploadResponse.data);
          showToast('Image uploaded successfully!', 'success');
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Image upload failed:', error);
        }
        showToast('Image upload failed. You can still proceed with the assessment.', 'warning');
      } finally {
        setUploadProgress(0);
      }
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested coordinates object
    if (name === 'coordinates') {
      setFormData(prev => ({
        ...prev,
        coordinates: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleLocationChange = (locationData) => {
    // Handle location updates from LocationSection
    if (import.meta.env.DEV) {
      console.log('Location updated:', locationData);
    }
  };
  
  // Toast helper function
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProcessingStatus('Submitting assessment...');
    
    try {
      // Validate required fields
      const lat = parseFloat(formData.coordinates.lat);
      const lng = parseFloat(formData.coordinates.lng);
      
      // Check for missing or invalid fields
      const missingFields = [];
      if (!formData.roofArea) missingFields.push('Roof Area');
      if (!formData.roofSlope) missingFields.push('Roof Slope');
      if (!formData.roofMaterial) missingFields.push('Roof Material');
      if (!formData.buildingHeight) missingFields.push('Building Height');
      if (!formData.location) missingFields.push('Location/Address');
      if (!formData.annualRainfall) missingFields.push('Annual Rainfall');
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        missingFields.push('Valid Coordinates (click on map or use auto-detect)');
      }
      
      if (missingFields.length > 0) {
        showToast(`Please fill in: ${missingFields.join(', ')}`, 'error');
        setLoading(false);
        return;
      }
      
      // Format assessment data
      const assessmentData = formatAssessmentData(
        formData, 
        uploadedImageData,
        { method: 'frontend-detected' }
      );
      
      // Submit assessment
      const submissionResponse = await submitAssessment(assessmentData);
      
      if (submissionResponse.success) {
        const assessmentId = submissionResponse.data._id;
        
        showToast('Assessment submitted successfully! Processing...', 'success');
        setProcessingStatus('Processing assessment with AI and ML models...');
        
        // Poll for results
        const results = await pollAssessmentStatus(
          assessmentId,
          (statusUpdate) => {
            setProcessingStatus(`Processing: ${statusUpdate.status}`);
          },
          30, // max attempts
          3000 // 3 second intervals
        );
        
        // Navigate to results with the assessment data
        navigate(`/results`, {
  state: {
    assessmentResults: results.data,   // optional if you also want to pass data
    formData,
    image: uploadedImage
  }
});
      } else {
        throw new Error(submissionResponse.message || 'Assessment submission failed');
      }
      
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Assessment submission failed:', error);
      }
      
      if (error instanceof APIError) {
        if (error.code === 'ASSESSMENT_TIMEOUT_ERROR') {
          showToast('Assessment is taking longer than expected. Please check results page later.', 'warning');
          // Could redirect to a status page
        } else {
          showToast(`Assessment failed: ${error.message}`, 'error');
        }
      } else {
        showToast('An unexpected error occurred. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
      setProcessingStatus('');
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Rooftop Assessment
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Upload your rooftop image and provide building details for AI-powered rainwater harvesting analysis.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Image Upload Section */}
          <div className="card-glass">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Upload Rooftop Image
            </h2>
            
            <div
              className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 ${
                dragActive 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {uploadedImage ? (
                <div className="relative">
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded rooftop" 
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setUploadedImage(null)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                    >
                      Remove Image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Drag & drop your rooftop image here
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    or click to browse files
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-primary"
                  >
                    Choose File
                  </button>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Supported formats: JPG, PNG, WebP. Max size: 10MB
            </p>
          </div>

          {/* Building Details */}
          <div className="card-glass">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Building Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Roof Area (sq ft)
                </label>
                <input
                  type="number"
                  name="roofArea"
                  value={formData.roofArea}
                  onChange={handleInputChange}
                  placeholder="e.g., 1200"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Roof Slope (degrees)
                </label>
                <input
                  type="number"
                  name="roofSlope"
                  value={formData.roofSlope}
                  onChange={handleInputChange}
                  placeholder="e.g., 15"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Roof Material
                </label>
                <select
                  name="roofMaterial"
                  value={formData.roofMaterial}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  required
                >
                  <option value="">Select Material</option>
                  <option value="concrete">Concrete</option>
                  <option value="tiles">Tiles</option>
                  <option value="metal">Metal Sheet</option>
                  <option value="asphalt">Asphalt</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Building Height (ft)
                </label>
                <input
                  type="number"
                  name="buildingHeight"
                  value={formData.buildingHeight}
                  onChange={handleInputChange}
                  placeholder="e.g., 25"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
            </div>
          </div>

          {/* Free Location Section with OpenStreetMap */}
          <LocationSectionFree 
            formData={formData}
            onFormDataChange={handleInputChange}
            onLocationChange={handleLocationChange}
          />

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={!uploadedImage || loading}
              className={`btn-primary text-lg px-12 py-4 ${
                (!uploadedImage || loading) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center flex-col">
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {processingStatus || 'Analyzing Rooftop...'}
                  </div>
                  {uploadProgress > 0 && (
                    <div className="mt-2 text-sm text-white/80">
                      Uploading: {uploadProgress}%
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center">
                  Generate Assessment Report
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Toast Notification */}
      {toast.show && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'info' })}
        />
      )}
    </div>
  );
};

export default Assessment;