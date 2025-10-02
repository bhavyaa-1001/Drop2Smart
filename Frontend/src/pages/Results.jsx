import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAssessmentResults } from '../utils/apiUtils';
import Toast from '../components/Toast';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart 
} from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { assessmentResults, formData, image } = location.state || {};
  const [activeTab, setActiveTab] = useState('analysis');
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Fetch assessment data from backend
  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        setLoading(true);
        
        // If we have assessmentResults passed from Assessment page, use it
        if (assessmentResults) {
          setAssessment(assessmentResults);
          setLoading(false);
          return;
        }
        
        // Otherwise, if we have formData with an assessment ID, fetch it
        if (formData?.assessmentId) {
          const response = await getAssessmentResults(formData.assessmentId);
          setAssessment(response.data || response);
          setLoading(false);
          return;
        }
        
        // No data available
        setError('No assessment data available');
        setLoading(false);
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('Error fetching assessment:', err);
        }
        setError(err.message || 'Failed to load assessment data');
        setLoading(false);
        showToast('Failed to load assessment data', 'error');
      }
    };

    fetchAssessmentData();
  }, [assessmentResults, formData]);

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 5000);
  };

  // Extract data from assessment with fallbacks
  const getDisplayData = () => {
    if (!assessment) return null;

    // Extract real data from backend
    const results = assessment.results || {};
    const mlPredictions = assessment.mlPredictions || {};
    const environmentalData = assessment.environmentalData || {};
    const buildingDetails = assessment.buildingDetails || formData || {};
    const locationData = assessment.location || {};

    return {
      // Harvesting Potential (from backend calculations)
      annualRainwaterPotential: results.harvestingPotential?.annualCollection || 0,
      monthlyAverage: results.harvestingPotential?.averageMonthlyCollection || 0,
      peakMonthly: results.harvestingPotential?.peakMonthlyCollection || 0,
      
      // Environmental Impact (from backend)
      costSavings: results.environmentalImpact?.costSavings || 0,
      co2Reduction: results.environmentalImpact?.carbonFootprintReduction || 0,
      waterSaved: results.environmentalImpact?.waterSaved || 0,
      
      // Assessment Score (from backend)
      assessmentScore: results.assessmentScore || 0,
      roofEfficiency: buildingDetails.roofMaterial === 'metal' ? 95 : 
                      buildingDetails.roofMaterial === 'concrete' ? 90 :
                      buildingDetails.roofMaterial === 'tiles' ? 85 : 80,
      
      // Location Info (real coordinates)
      locationInfo: {
        latitude: locationData.coordinates?.latitude || formData?.coordinates?.lat || 'N/A',
        longitude: locationData.coordinates?.longitude || formData?.coordinates?.lng || 'N/A',
        address: locationData.address || formData?.location || 'N/A'
      },
      
      // Soil Properties (from ML predictions - REAL DATA!)
      soilProperties: {
        soilTexture: mlPredictions.soilAnalysis?.texture_class || 
                     environmentalData.soilData?.soilType || 'Unknown',
        organicCarbon: environmentalData.soilData?.organicCarbon 
          ? `${(environmentalData.soilData.organicCarbon * 100).toFixed(2)}%` 
          : 'N/A',
        clayContent: environmentalData.soilData?.clay 
          ? `${environmentalData.soilData.clay.toFixed(1)}%` 
          : 'N/A',
        siltContent: environmentalData.soilData?.silt 
          ? `${environmentalData.soilData.silt.toFixed(1)}%` 
          : 'N/A',
        sandContent: environmentalData.soilData?.sand 
          ? `${environmentalData.soilData.sand.toFixed(1)}%` 
          : 'N/A'
      },
      
      // Hydraulic Properties (from ML predictions - REAL KSAT!)
      hydraulicProperties: {
        saturatedHydraulicConductivity: environmentalData.soilData?.ksat 
          ? `${environmentalData.soilData.ksat.toFixed(2)} mm/hr` 
          : 'N/A',
        confidence: mlPredictions.ksatPrediction?.confidence 
          ? `${(mlPredictions.ksatPrediction.confidence * 100).toFixed(0)}%` 
          : 'N/A'
      },
      
      // Infiltration Analysis (from backend)
      infiltrationAnalysis: results.infiltrationAnalysis || {},
      
      // Runoff Assessment (calculated from soil data)
      runoffAssessment: {
        runoffCoefficient: buildingDetails.roofMaterial === 'metal' ? '0.95' :
                          buildingDetails.roofMaterial === 'concrete' ? '0.90' :
                          buildingDetails.roofMaterial === 'tiles' ? '0.85' : '0.80'
      },
      
      // Interpretation (from ML predictions)
      interpretation: {
        title: mlPredictions.soilAnalysis?.infiltrationCategory 
          ? `${mlPredictions.soilAnalysis.infiltrationCategory.toUpperCase()} INFILTRATION POTENTIAL`
          : 'INFILTRATION ASSESSMENT',
        description: results.infiltrationAnalysis?.soilSuitability || 
                    'Soil infiltration characteristics determined by ML analysis.'
      },
      
      // System Recommendations (from backend)
      recommendations: [
        {
          type: 'Storage Tank',
          capacity: `${Math.round(results.systemRecommendations?.tankSize || 5000)}L`,
          cost: `₹${(results.systemRecommendations?.estimatedCost || 50000).toLocaleString()}`,
          description: results.systemRecommendations?.filterType || 
                      'Underground concrete tank with first-flush diverter'
        },
        {
          type: 'Pipe System',
          capacity: results.systemRecommendations?.pipeSize || '4 inch',
          cost: `₹${(15000).toLocaleString()}`,
          description: 'PVC pipes with proper gradient for water flow'
        },
        {
          type: 'Filtration',
          capacity: 'Multi-stage',
          cost: `₹${(25000).toLocaleString()}`,
          description: 'First flush + Sand filter + Carbon filter'
        }
      ],
      
      // Groundwater Status (from backend ML service)
      groundwaterStatus: results.systemRecommendations?.groundwaterStatus || null,
      groundwaterRecommendations: results.systemRecommendations?.groundwaterRecommendations || [],
      rechargePriority: results.systemRecommendations?.rechargePriority || null,
      
      // Monthly Collection (from backend - REAL DATA!)
      monthlyData: results.harvestingPotential?.monthlyCollection || [],
      
      // Building Details
      buildingDetails: buildingDetails,
      
      // Raw assessment data for debugging
      rawAssessment: assessment
    };
  };

  const displayData = getDisplayData();

  // Chart colors
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // PDF Export Function
  const generatePDF = async () => {
    try {
      setGeneratingPDF(true);
      setToast({ show: true, message: 'Generating PDF report...', type: 'info' });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPos = 20;

      // Header
      pdf.setFontSize(22);
      pdf.setTextColor(59, 130, 246);
      pdf.text('Drop2Smart - Rainwater Harvesting Report', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 10;
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Assessment Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });
      pdf.text(`Location: ${displayData.locationInfo.address}`, pageWidth / 2, yPos + 6, { align: 'center' });

      yPos += 20;

      // Key Metrics Section
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Key Metrics', 14, yPos);
      yPos += 10;

      pdf.autoTable({
        startY: yPos,
        head: [['Metric', 'Value']],
        body: [
          ['Annual Rainwater Potential', `${displayData.annualRainwaterPotential.toLocaleString()} L`],
          ['Annual Cost Savings', `₹${displayData.costSavings.toLocaleString()}`],
          ['CO₂ Reduction per Year', `${displayData.co2Reduction} kg`],
          ['Assessment Score', `${displayData.assessmentScore}%`],
        ],
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
      });

      yPos = pdf.lastAutoTable.finalY + 15;

      // Building Details
      if (yPos > pageHeight - 60) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.setFontSize(16);
      pdf.text('Building Details', 14, yPos);
      yPos += 10;

      pdf.autoTable({
        startY: yPos,
        head: [['Property', 'Value']],
        body: [
          ['Roof Area', `${displayData.buildingDetails.roofArea} sq ft`],
          ['Roof Material', displayData.buildingDetails.roofMaterial],
          ['Building Height', `${displayData.buildingDetails.buildingHeight} ft`],
          ['Building Type', displayData.buildingDetails.buildingType || 'Residential'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
      });

      yPos = pdf.lastAutoTable.finalY + 15;

      // Soil Properties
      if (yPos > pageHeight - 60) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFontSize(16);
      pdf.text('Soil Analysis (ML Predictions)', 14, yPos);
      yPos += 10;

      pdf.autoTable({
        startY: yPos,
        head: [['Property', 'Value']],
        body: [
          ['Soil Texture', displayData.soilProperties.soilTexture],
          ['Clay Content', displayData.soilProperties.clayContent],
          ['Silt Content', displayData.soilProperties.siltContent],
          ['Sand Content', displayData.soilProperties.sandContent],
          ['Organic Carbon', displayData.soilProperties.organicCarbon],
          ['Saturated Hydraulic Conductivity', displayData.hydraulicProperties.saturatedHydraulicConductivity],
        ],
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] },
      });

      yPos = pdf.lastAutoTable.finalY + 15;

      // System Recommendations
      if (yPos > pageHeight - 60) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFontSize(16);
      pdf.text('System Recommendations', 14, yPos);
      yPos += 10;

      const recommendations = displayData.recommendations.map(rec => [
        rec.type,
        rec.capacity,
        rec.cost,
        rec.description
      ]);

      pdf.autoTable({
        startY: yPos,
        head: [['Type', 'Capacity', 'Cost', 'Description']],
        body: recommendations,
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246] },
        columnStyles: {
          3: { cellWidth: 60 }
        }
      });

      yPos = pdf.lastAutoTable.finalY + 15;

      // Groundwater Status
      if (displayData.groundwaterStatus) {
        if (yPos > pageHeight - 60) {
          pdf.addPage();
          yPos = 20;
        }

        pdf.setFontSize(16);
        pdf.text('Groundwater Status', 14, yPos);
        yPos += 10;

        pdf.autoTable({
          startY: yPos,
          head: [['Parameter', 'Value']],
          body: [
            ['Category', displayData.groundwaterStatus.category],
            ['Extraction Level', `${displayData.groundwaterStatus.stagePercent}%`],
            ['Risk Level', displayData.groundwaterStatus.riskLevel],
            ['Recharge Priority', displayData.rechargePriority || 'N/A'],
          ],
          theme: 'grid',
          headStyles: { fillColor: [239, 68, 68] },
        });

        if (displayData.groundwaterRecommendations && displayData.groundwaterRecommendations.length > 0) {
          yPos = pdf.lastAutoTable.finalY + 10;
          if (yPos > pageHeight - 40) {
            pdf.addPage();
            yPos = 20;
          }
          pdf.setFontSize(12);
          pdf.text('Groundwater Recommendations:', 14, yPos);
          yPos += 8;
          pdf.setFontSize(10);
          displayData.groundwaterRecommendations.forEach((rec, idx) => {
            if (yPos > pageHeight - 20) {
              pdf.addPage();
              yPos = 20;
            }
            pdf.text(`${idx + 1}. ${rec}`, 14, yPos);
            yPos += 6;
          });
        }
      }

      // Monthly Collection Data
      if (displayData.monthlyData && displayData.monthlyData.length > 0) {
        pdf.addPage();
        yPos = 20;

        pdf.setFontSize(16);
        pdf.text('Monthly Collection Breakdown', 14, yPos);
        yPos += 10;

        const monthlyTableData = displayData.monthlyData.map(month => [
          month.month,
          `${month.volume.toLocaleString()} L`,
          `${month.percentage}%`
        ]);

        pdf.autoTable({
          startY: yPos,
          head: [['Month', 'Volume', 'Percentage']],
          body: monthlyTableData,
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246] },
        });
      }

      // Footer
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Generated by Drop2Smart | Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Save PDF
      pdf.save(`Drop2Smart-Assessment-${new Date().getTime()}.pdf`);
      
      setToast({ show: true, message: 'PDF report generated successfully!', type: 'success' });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('PDF generation error:', error);
      }
      setToast({ show: true, message: 'Failed to generate PDF report', type: 'error' });
    } finally {
      setGeneratingPDF(false);
      setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 dark:text-gray-400">Loading assessment results...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !displayData) {
    return (
      <div className="min-h-screen pt-20 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'No assessment data found'}
          </h1>
          <button 
            onClick={() => navigate('/assessment')}
            className="btn-primary"
          >
            Start New Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Rainwater Harvesting Assessment Report
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Analysis for {formData.location}
          </p>
          
          {/* Export Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={generatePDF}
              disabled={generatingPDF}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingPDF ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export PDF Report
                </>
              )}
            </button>
            
            <button
              onClick={() => navigate('/assessment')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              New Assessment
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="card-glass text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2c-1.5 4.5-6 7.5-6 12a6 6 0 0 0 12 0c0-4.5-4.5-7.5-6-12z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gradient mb-2">
              {displayData.annualRainwaterPotential.toLocaleString()}L
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Annual Rainwater Potential
            </p>
          </div>

          <div className="card-glass text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gradient mb-2">
              ₹{displayData.costSavings.toLocaleString()}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Annual Cost Savings
            </p>
          </div>

          <div className="card-glass text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gradient mb-2">
              {displayData.co2Reduction}kg
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              CO₂ Reduction/Year
            </p>
          </div>

          <div className="card-glass text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gradient mb-2">
              {displayData.assessmentScore}%
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Assessment Score
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap justify-center mb-8">
          <div className="glass rounded-lg p-2">
            {[
              { id: 'analysis', name: 'Assessment Results' },
              { id: 'overview', name: 'Overview' },
              { id: 'detailed-analysis', name: 'Detailed Analysis' },
              { id: 'recommendations', name: 'Recommendations' },
              { id: 'monitoring', name: 'Monitoring' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Assessment Results Section */}
        {activeTab === 'analysis' && (
          <div className="card-glass bg-white dark:bg-gray-800 p-8 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Location Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Location Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Latitude</div>
                      <div className="text-lg font-mono text-gray-900 dark:text-white">
                        {displayData.locationInfo.latitude}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Longitude</div>
                      <div className="text-lg font-mono text-gray-900 dark:text-white">
                        {displayData.locationInfo.longitude}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hydraulic Properties */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Hydraulic Properties
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Saturated Hydraulic Conductivity (Ksat)
                    </div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {displayData.hydraulicProperties.saturatedHydraulicConductivity}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      ML Confidence: {displayData.hydraulicProperties.confidence}
                    </div>
                  </div>
                </div>
              </div>

              {/* Soil Properties */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Soil Properties
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-600">
                        <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Soil Texture</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Organic Carbon</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Clay Content</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Silt Content</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Sand Content</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-3 px-3 font-semibold text-gray-900 dark:text-white">
                          {displayData.soilProperties.soilTexture}
                        </td>
                        <td className="py-3 px-3 text-gray-900 dark:text-white">
                          {displayData.soilProperties.organicCarbon}
                        </td>
                        <td className="py-3 px-3 text-gray-900 dark:text-white">
                          {displayData.soilProperties.clayContent}
                        </td>
                        <td className="py-3 px-3 text-gray-900 dark:text-white">
                          {displayData.soilProperties.siltContent}
                        </td>
                        <td className="py-3 px-3 text-gray-900 dark:text-white">
                          {displayData.soilProperties.sandContent}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Soil Composition Chart */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-600">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Soil Composition Analysis
              </h3>
              {(() => {
                const soilCompositionData = [
                  { 
                    component: 'Clay', 
                    percentage: parseFloat(displayData.soilProperties.clayContent) || 0,
                    color: '#EF4444'
                  },
                  { 
                    component: 'Silt', 
                    percentage: parseFloat(displayData.soilProperties.siltContent) || 0,
                    color: '#F59E0B'
                  },
                  { 
                    component: 'Sand', 
                    percentage: parseFloat(displayData.soilProperties.sandContent) || 0,
                    color: '#10B981'
                  }
                ].filter(item => item.percentage > 0);

                return soilCompositionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={soilCompositionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="component" 
                        stroke="#9CA3AF"
                        style={{ fontSize: '14px' }}
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        style={{ fontSize: '14px' }}
                        label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                        formatter={(value) => [`${value.toFixed(1)}%`, 'Content']}
                      />
                      <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                        {soilCompositionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <p className="text-gray-600 dark:text-gray-400">No soil composition data available</p>
                  </div>
                );
              })()}
            </div>

            {/* Runoff Assessment */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Runoff Assessment
                  </h3>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Runoff Coefficient
                    </div>
                    <div className="text-6xl font-bold text-blue-500 dark:text-blue-400 mb-2">
                      {displayData.runoffAssessment.runoffCoefficient}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Interpretation
                    </h3>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-l-4 border-yellow-400">
                      <div className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                        {displayData.interpretation.title}
                      </div>
                      <div className="text-yellow-700 dark:text-yellow-300 text-sm leading-relaxed">
                        {displayData.interpretation.description}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Continue to Assessment Results Button */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600 text-center">
              <button 
                onClick={() => setActiveTab('overview')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-300 inline-flex items-center"
              >
                Continue to Assessment Results
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Roof Analysis */}
              <div className="card-glass">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Roof Analysis
                </h3>
                {image && (
                  <div className="mb-6">
                    <img 
                      src={image} 
                      alt="Analyzed rooftop" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      AI-analyzed rooftop structure
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Area</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {displayData.buildingDetails.roofArea} sq ft
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Slope</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {displayData.buildingDetails.roofSlope}°
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Material</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                      {displayData.buildingDetails.roofMaterial}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Efficiency</div>
                    <div className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                      {displayData.roofEfficiency}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Collection */}
              <div className="card-glass">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Monthly Water Collection Pattern
                </h3>
                <div className="space-y-2">
                  {displayData.monthlyData && displayData.monthlyData.length > 0 ? (
                    displayData.monthlyData.map((data, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{data.month}</span>
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">
                          {data.volume ? `${data.volume.toLocaleString()}L` : 'N/A'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {data.efficiency ? `${data.efficiency}%` : ''}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      Monthly data not available
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-8">
              {/* Groundwater Alert Banner (if critical) */}
              {displayData.groundwaterStatus && 
               (displayData.groundwaterStatus.category === 'Over-exploited' || 
                displayData.groundwaterStatus.category === 'Critical') && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-red-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-red-800 dark:text-red-300 mb-2">
                        ⚠️ Groundwater Alert: {displayData.groundwaterStatus.category} Area
                      </h4>
                      <p className="text-red-700 dark:text-red-400 mb-3">
                        Groundwater extraction is at {displayData.groundwaterStatus.stagePercent}% - 
                        {displayData.groundwaterStatus.riskLevel} risk level. 
                        Artificial recharge structures are ESSENTIAL in this area.
                      </p>
                      {displayData.groundwaterRecommendations && displayData.groundwaterRecommendations.length > 0 && (
                        <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-400">
                          {displayData.groundwaterRecommendations.map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* System Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {displayData.recommendations.map((rec, index) => (
                  <div key={index} className="card-glass">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {rec.type}
                      </h3>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Cost</div>
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          {rec.cost}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Capacity:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{rec.capacity}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Groundwater Status Card (always show if available) */}
              {displayData.groundwaterStatus && (
                <div className="card-glass">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    Local Groundwater Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Category</div>
                      <div className={`text-xl font-bold ${
                        displayData.groundwaterStatus.category === 'Safe' ? 'text-green-600 dark:text-green-400' :
                        displayData.groundwaterStatus.category === 'Semi-critical' ? 'text-yellow-600 dark:text-yellow-400' :
                        displayData.groundwaterStatus.category === 'Critical' ? 'text-orange-600 dark:text-orange-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {displayData.groundwaterStatus.category}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Extraction Level</div>
                      <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        {displayData.groundwaterStatus.stagePercent}%
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Risk Level</div>
                      <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                        {displayData.groundwaterStatus.riskLevel}
                      </div>
                    </div>
                  </div>
                  {displayData.rechargePriority && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Recharge Priority: <span className="text-blue-600 dark:text-blue-400 font-bold">{displayData.rechargePriority}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'detailed-analysis' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card-glass">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Monthly Rainwater Collection
                </h3>
                {displayData.monthlyData && displayData.monthlyData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={displayData.monthlyData}>
                        <defs>
                          <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="month" 
                          stroke="#9CA3AF"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis 
                          stroke="#9CA3AF"
                          style={{ fontSize: '12px' }}
                          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                          labelStyle={{ color: '#F3F4F6' }}
                          formatter={(value) => [`${value.toLocaleString()} L`, 'Volume']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="volume" 
                          stroke="#3B82F6" 
                          fillOpacity={1} 
                          fill="url(#colorVolume)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">Peak Month</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {displayData.monthlyData.reduce((max, month) => 
                            month.volume > max.volume ? month : max
                          ).month}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">Lowest Month</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {displayData.monthlyData.reduce((min, month) => 
                            month.volume < min.volume ? month : min
                          ).month}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <p className="text-gray-600 dark:text-gray-400">No monthly data available</p>
                  </div>
                )}
              </div>

              <div className="card-glass">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Collection Efficiency
                </h3>
                {(() => {
                  const efficiencyData = [
                    { name: 'Collected', value: displayData.roofEfficiency || 85, color: '#10B981' },
                    { name: 'First Flush Loss', value: 5, color: '#F59E0B' },
                    { name: 'Evaporation Loss', value: 10, color: '#EF4444' }
                  ];
                  return (
                    <>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={efficiencyData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {efficiencyData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                            formatter={(value) => `${value}%`}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2 text-sm mt-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Collection Rate:</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">{displayData.roofEfficiency}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">First Flush Loss:</span>
                          <span className="font-semibold text-yellow-600 dark:text-yellow-400">5%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Evaporation Loss:</span>
                          <span className="font-semibold text-red-600 dark:text-red-400">10%</span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <div className="card-glass">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Annual Collection Projection
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    {displayData.monthlyData && displayData.monthlyData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={displayData.monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis 
                            dataKey="month" 
                            stroke="#9CA3AF"
                            style={{ fontSize: '12px' }}
                          />
                          <YAxis 
                            stroke="#9CA3AF"
                            style={{ fontSize: '12px' }}
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                            formatter={(value) => [`${value.toLocaleString()} L`, 'Collection']}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="volume" 
                            stroke="#3B82F6" 
                            strokeWidth={3}
                            dot={{ fill: '#3B82F6', r: 4 }}
                            name="Monthly Collection"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <p className="text-gray-600 dark:text-gray-400">No projection data available</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <div className="text-sm text-green-600 dark:text-green-400 font-medium">System Status</div>
                      <div className="text-lg font-bold text-green-700 dark:text-green-300">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          Ready
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Peak Collection</div>
                      <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                        {displayData.peakMonthly.toLocaleString()}L
                      </div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                      <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Avg Monthly</div>
                      <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                        {displayData.monthlyAverage.toLocaleString()}L
                      </div>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                      <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">Annual Total</div>
                      <div className="text-lg font-bold text-orange-700 dark:text-orange-300">
                        {displayData.annualRainwaterPotential.toLocaleString()}L
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Environmental Impact Chart */}
              <div className="card-glass">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Environmental Impact Metrics
                </h3>
                {(() => {
                  const impactData = [
                    { metric: 'Water Saved', value: displayData.waterSaved / 1000, unit: 'kL', color: '#3B82F6' },
                    { metric: 'Cost Savings', value: displayData.costSavings / 1000, unit: 'k₹', color: '#10B981' },
                    { metric: 'CO₂ Reduction', value: displayData.co2Reduction, unit: 'kg', color: '#8B5CF6' }
                  ];
                  return (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={impactData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis type="number" stroke="#9CA3AF" />
                        <YAxis 
                          type="category" 
                          dataKey="metric" 
                          stroke="#9CA3AF"
                          width={120}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                          formatter={(value, name, props) => [
                            `${value.toFixed(2)} ${props.payload.unit}`, 
                            props.payload.metric
                          ]}
                        />
                        <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                          {impactData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
          <button 
            className="btn-primary"
            onClick={() => showToast('PDF generation coming soon!', 'info')}
          >
            Download Report (PDF)
            <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          <button 
            onClick={() => navigate('/assessment')}
            className="btn-secondary"
          >
            New Assessment
          </button>
        </div>
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

export default Results;