'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowDownTrayIcon, 
  PhotoIcon,
  DocumentIcon,
  Cog6ToothIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface TimelineExportProps {
  timelineRef: React.RefObject<HTMLElement>;
  userName?: string;
  totalEvents?: number;
}

interface ExportOptions {
  format: 'png' | 'pdf';
  quality: 'low' | 'medium' | 'high';
  includeTitle: boolean;
  includeStats: boolean;
  includeDate: boolean;
  paperSize: 'a4' | 'letter' | 'a3';
  orientation: 'portrait' | 'landscape';
}

export default function TimelineExport({ 
  timelineRef, 
  userName = 'User',
  totalEvents = 0 
}: TimelineExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'png',
    quality: 'high',
    includeTitle: true,
    includeStats: true,
    includeDate: true,
    paperSize: 'a4',
    orientation: 'landscape'
  });

  const qualitySettings = {
    low: { scale: 1, quality: 0.7 },
    medium: { scale: 2, quality: 0.85 },
    high: { scale: 3, quality: 0.95 }
  };

  const exportAsImage = async () => {
    if (!timelineRef.current) return;

    setIsExporting(true);
    try {
      const element = timelineRef.current;
      const settings = qualitySettings[exportOptions.quality];
      
      // Create a wrapper div with title and stats if needed
      const wrapper = document.createElement('div');
      wrapper.style.backgroundColor = 'white';
      wrapper.style.padding = '40px';
      wrapper.style.fontFamily = 'system-ui, -apple-system, sans-serif';

      // Add title
      if (exportOptions.includeTitle) {
        const title = document.createElement('h1');
        title.textContent = `${userName}'s Life Timeline`;
        title.style.fontSize = '32px';
        title.style.fontWeight = 'bold';
        title.style.textAlign = 'center';
        title.style.marginBottom = '20px';
        title.style.color = '#1f2937';
        wrapper.appendChild(title);
      }

      // Add stats
      if (exportOptions.includeStats) {
        const stats = document.createElement('div');
        stats.style.textAlign = 'center';
        stats.style.marginBottom = '30px';
        stats.style.fontSize = '16px';
        stats.style.color = '#6b7280';
        stats.innerHTML = `
          <p>Total Events: ${totalEvents} | Generated on ${new Date().toLocaleDateString()}</p>
          <p>Each square represents one week of life</p>
        `;
        wrapper.appendChild(stats);
      }

      // Clone and append the timeline
      const timelineClone = element.cloneNode(true) as HTMLElement;
      wrapper.appendChild(timelineClone);

      // Add date if needed
      if (exportOptions.includeDate) {
        const date = document.createElement('div');
        date.style.textAlign = 'center';
        date.style.marginTop = '20px';
        date.style.fontSize = '12px';
        date.style.color = '#9ca3af';
        date.textContent = `Exported on ${new Date().toLocaleString()}`;
        wrapper.appendChild(date);
      }

      // Temporarily add to DOM for rendering
      wrapper.style.position = 'absolute';
      wrapper.style.left = '-9999px';
      wrapper.style.top = '0';
      document.body.appendChild(wrapper);

      const canvas = await html2canvas(wrapper, {
        scale: settings.scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Remove temporary element
      document.body.removeChild(wrapper);

      // Download image
      const link = document.createElement('a');
      link.download = `${userName.replace(/\s+/g, '_')}_timeline_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png', settings.quality);
      link.click();

    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPDF = async () => {
    if (!timelineRef.current) return;

    setIsExporting(true);
    try {
      const element = timelineRef.current;
      const settings = qualitySettings[exportOptions.quality];

      const canvas = await html2canvas(element, {
        scale: settings.scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      
      // PDF dimensions based on paper size and orientation
      const paperSizes = {
        a4: { width: 210, height: 297 },
        letter: { width: 216, height: 279 },
        a3: { width: 297, height: 420 }
      };

      const size = paperSizes[exportOptions.paperSize];
      const isLandscape = exportOptions.orientation === 'landscape';
      const pdfWidth = isLandscape ? size.height : size.width;
      const pdfHeight = isLandscape ? size.width : size.height;

      const pdf = new jsPDF({
        orientation: exportOptions.orientation,
        unit: 'mm',
        format: exportOptions.paperSize
      });

      // Add title page if options are enabled
      if (exportOptions.includeTitle || exportOptions.includeStats) {
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        
        if (exportOptions.includeTitle) {
          pdf.text(`${userName}'s Life Timeline`, pdfWidth / 2, 40, { align: 'center' });
        }

        if (exportOptions.includeStats) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Total Events: ${totalEvents}`, pdfWidth / 2, 60, { align: 'center' });
          pdf.text('Each square represents one week of life', pdfWidth / 2, 70, { align: 'center' });
        }

        if (exportOptions.includeDate) {
          pdf.setFontSize(10);
          pdf.text(`Generated on ${new Date().toLocaleString()}`, pdfWidth / 2, pdfHeight - 20, { align: 'center' });
        }

        pdf.addPage();
      }

      // Calculate image dimensions to fit PDF
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 20) / imgHeight);
      
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;
      const x = (pdfWidth - scaledWidth) / 2;
      const y = (pdfHeight - scaledHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);

      // Save PDF
      pdf.save(`${userName.replace(/\s+/g, '_')}_timeline_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = () => {
    if (exportOptions.format === 'png') {
      exportAsImage();
    } else {
      exportAsPDF();
    }
  };

  return (
    <div className="relative">
      {/* Export Button */}
      <button
        onClick={() => setShowOptions(true)}
        disabled={isExporting}
        className="btn-secondary flex items-center"
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
            Exporting...
          </>
        ) : (
          <>
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            Export Timeline
          </>
        )}
      </button>

      {/* Export Options Modal */}
      <AnimatePresence>
        {showOptions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Cog6ToothIcon className="w-5 h-5 mr-2" />
                  Export Options
                </h3>
                <button
                  onClick={() => setShowOptions(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Format Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Export Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setExportOptions(prev => ({ ...prev, format: 'png' }))}
                      className={`
                        flex items-center justify-center p-3 border rounded-lg transition-colors
                        ${exportOptions.format === 'png'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <PhotoIcon className="w-5 h-5 mr-2" />
                      PNG Image
                    </button>
                    <button
                      onClick={() => setExportOptions(prev => ({ ...prev, format: 'pdf' }))}
                      className={`
                        flex items-center justify-center p-3 border rounded-lg transition-colors
                        ${exportOptions.format === 'pdf'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <DocumentIcon className="w-5 h-5 mr-2" />
                      PDF Document
                    </button>
                  </div>
                </div>

                {/* Quality Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality
                  </label>
                  <select
                    value={exportOptions.quality}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      quality: e.target.value as ExportOptions['quality']
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low (Fast)</option>
                    <option value="medium">Medium</option>
                    <option value="high">High (Best Quality)</option>
                  </select>
                </div>

                {/* PDF Options */}
                {exportOptions.format === 'pdf' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Paper Size
                      </label>
                      <select
                        value={exportOptions.paperSize}
                        onChange={(e) => setExportOptions(prev => ({ 
                          ...prev, 
                          paperSize: e.target.value as ExportOptions['paperSize']
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="a4">A4</option>
                        <option value="letter">Letter</option>
                        <option value="a3">A3</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Orientation
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setExportOptions(prev => ({ ...prev, orientation: 'portrait' }))}
                          className={`
                            p-2 border rounded-lg transition-colors
                            ${exportOptions.orientation === 'portrait'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:bg-gray-50'
                            }
                          `}
                        >
                          Portrait
                        </button>
                        <button
                          onClick={() => setExportOptions(prev => ({ ...prev, orientation: 'landscape' }))}
                          className={`
                            p-2 border rounded-lg transition-colors
                            ${exportOptions.orientation === 'landscape'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:bg-gray-50'
                            }
                          `}
                        >
                          Landscape
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Include Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Include
                  </label>
                  <div className="space-y-2">
                    {[
                      { key: 'includeTitle', label: 'Title' },
                      { key: 'includeStats', label: 'Statistics' },
                      { key: 'includeDate', label: 'Export Date' }
                    ].map(option => (
                      <label key={option.key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={exportOptions[option.key as keyof ExportOptions] as boolean}
                          onChange={(e) => setExportOptions(prev => ({ 
                            ...prev, 
                            [option.key]: e.target.checked 
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowOptions(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleExport();
                    setShowOptions(false);
                  }}
                  disabled={isExporting}
                  className="btn-primary flex items-center"
                >
                  {isExporting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <CheckIcon className="w-4 h-4 mr-2" />
                  )}
                  Export
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
