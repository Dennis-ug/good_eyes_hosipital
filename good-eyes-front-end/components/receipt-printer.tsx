'use client'

import { useState } from 'react'
import { Printer, Download, Eye, X } from 'lucide-react'
import { thermalPrinter, ReceiptData } from '@/lib/thermal-printer'

interface ReceiptPrinterProps {
  receiptData: ReceiptData
  onClose?: () => void
  showPreview?: boolean
}

export function ReceiptPrinter({ 
  receiptData, 
  onClose, 
  showPreview = true
}: ReceiptPrinterProps) {
  const [isPrinting, setIsPrinting] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewContent, setPreviewContent] = useState('')

  const handlePrint = async () => {
    try {
      setIsPrinting(true)
      await thermalPrinter.printReceipt(receiptData)
      console.log('Receipt printed successfully')
    } catch (error) {
      console.error('Failed to print receipt:', error)
      alert('Failed to print receipt. Please check your printer settings.')
    } finally {
      setIsPrinting(false)
    }
  }

  const handlePreview = () => {
    try {
      const content = thermalPrinter.formatReceipt(receiptData)
      setPreviewContent(content)
      setShowPreviewModal(true)
    } catch (error) {
      console.error('Failed to generate preview:', error)
      alert('Failed to generate preview.')
    }
  }

  const handleDownload = () => {
    try {
      const content = thermalPrinter.formatReceipt(receiptData)
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `receipt-${receiptData.receiptNumber}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download receipt:', error)
      alert('Failed to download receipt.')
    }
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Print Receipt
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Receipt Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Receipt Summary
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Receipt #:</span>
                <span className="ml-2 font-medium">{receiptData.receiptNumber}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Patient:</span>
                <span className="ml-2 font-medium">{receiptData.patientName}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Total:</span>
                <span className="ml-2 font-medium">UGX {receiptData.totalAmount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Payment:</span>
                <span className="ml-2 font-medium">{receiptData.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isPrinting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isPrinting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
              ) : (
                <Printer className="h-4 w-4 mr-2" />
              )}
              {isPrinting ? 'Printing...' : 'Print Receipt'}
            </button>

            {showPreview && (
              <button
                onClick={handlePreview}
                className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </button>
            )}

            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Receipt Preview
              </h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 max-h-96 overflow-y-auto">
              <pre className="text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {previewContent}
              </pre>
            </div>
            
            <div className="flex justify-end mt-4 space-x-3">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                  isPrinting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isPrinting ? 'Printing...' : 'Print'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 