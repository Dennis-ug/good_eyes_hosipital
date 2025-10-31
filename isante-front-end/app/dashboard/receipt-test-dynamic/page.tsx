'use client'

import { useState, useEffect } from 'react'
import { ReceiptPrinter } from '@/components/receipt-printer'
import { ReceiptData } from '@/lib/thermal-printer'
// import { clinicApi } from '@/lib/api'
// import { Clinic } from '@/lib/types'

export default function ReceiptTestDynamicPage() {
  const [showPrinter, setShowPrinter] = useState(false)
  const [clinicConfig, setClinicConfig] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [sampleReceiptData, setSampleReceiptData] = useState<ReceiptData>({
    clinicName: 'EYE SANTE CLINIC',
    clinicAddress: 'Plot 47, Lumumba Avenue, Nakasero, Kampala - Uganda',
    clinicPhone: '+256 758 341 772 / +256 200 979 911',
    clinicEmail: undefined,
    clinicWebsite: undefined,
    clinicLogoText: 'Seeing is Life',
    receiptFooterMessage: 'Thank you for choosing Eye Sante Clinic',
    receiptContactMessage: 'For inquiries: ',
    receiptNumber: 'RCP-2025-001',
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    patientName: 'John Doe',
    patientId: '12345',
    items: [
      { name: 'Consultation Fee', quantity: 1, unitPrice: 50000, total: 50000 },
      { name: 'Eye Examination', quantity: 1, unitPrice: 25000, total: 25000 }
    ],
    subtotal: 75000,
    taxAmount: 0,
    totalAmount: 75000,
    amountPaid: 75000,
    balanceDue: 0,
    paymentMethod: 'MOBILE_MONEY',
    paymentReference: 'TXN123456789',
    cashierName: 'Dr. Sarah Johnson',
    footerMessage: 'Keep this receipt for your records'
  })

  const fetchClinicConfig = async () => {
    try {
      setIsLoading(true)
      // const clinic = await clinicApi.getDefaultClinic()
      const clinic = null // TODO: Implement clinic API
      setClinicConfig(clinic)
      
      setSampleReceiptData(prev => ({
        ...prev,
        clinicName: clinic.clinicName || prev.clinicName,
        clinicAddress: clinic.clinicAddress || prev.clinicAddress,
        clinicPhone: clinic.clinicPhone || prev.clinicPhone,
        clinicEmail: clinic.clinicEmail,
        clinicWebsite: clinic.clinicWebsite,
        clinicLogoText: clinic.clinicLogoText || prev.clinicLogoText,
        receiptFooterMessage: clinic.receiptFooterMessage || prev.receiptFooterMessage,
        receiptContactMessage: clinic.receiptContactMessage || prev.receiptContactMessage
      }))
    } catch (error) {
      console.error('Failed to fetch clinic configuration:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClinicConfig()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dynamic Receipt Test</h1>
        <p className="text-gray-600 dark:text-gray-400">Test receipt with dynamic clinic contact information</p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Current Clinic Configuration
        </h2>
        
        {isLoading ? (
          <div className="text-gray-500">Loading clinic configuration...</div>
        ) : clinicConfig ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm space-y-1">
                <div><span className="text-gray-500">Clinic Name:</span> {clinicConfig.clinicName}</div>
                <div><span className="text-gray-500">Address:</span> {clinicConfig.clinicAddress}</div>
                <div><span className="text-gray-500">Phone:</span> {clinicConfig.clinicPhone}</div>
                {clinicConfig.clinicEmail && (
                  <div><span className="text-gray-500">Email:</span> {clinicConfig.clinicEmail}</div>
                )}
              </div>
            </div>
            
            <div>
              <div className="text-sm space-y-1">
                <div><span className="text-gray-500">Footer Message:</span> {clinicConfig.receiptFooterMessage}</div>
                <div><span className="text-gray-500">Contact Message:</span> {clinicConfig.receiptContactMessage}</div>
                <div><span className="text-gray-500">Status:</span> 
                  <span className={`ml-1 px-2 py-1 text-xs rounded-full ${
                    clinicConfig.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {clinicConfig.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-red-500">Failed to load clinic configuration</div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Receipt Preview
        </h2>
        
        <div className="mb-4">
          <div className="text-sm space-y-1">
            <div><span className="text-gray-500">Receipt #:</span> {sampleReceiptData.receiptNumber}</div>
            <div><span className="text-gray-500">Patient:</span> {sampleReceiptData.patientName}</div>
            <div><span className="text-gray-500">Total:</span> UGX {sampleReceiptData.totalAmount.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setShowPrinter(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Print Receipt
          </button>
          
          <button
            onClick={fetchClinicConfig}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          >
            Refresh Config
          </button>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          Instructions
        </h3>
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <div>1. Go to <strong>Administration → Clinic Configuration</strong> to update clinic details</div>
          <div>2. Update clinic name, address, phone, or messages</div>
          <div>3. Save and return here to see changes</div>
          <div>4. Print receipt to see updated contact information</div>
        </div>
      </div>

      {showPrinter && (
        <ReceiptPrinter
          receiptData={sampleReceiptData}
          onClose={() => setShowPrinter(false)}
          showPreview={true}
        />
      )}
    </div>
  )
}
