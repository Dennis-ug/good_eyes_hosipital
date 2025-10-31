'use client'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { ReceiptPrinter } from '@/components/receipt-printer'
import { ReceiptData } from '@/lib/thermal-printer'

export default function ReceiptTestPage() {
  const [showPrinter, setShowPrinter] = useState(false)

  // Sample receipt data
  const sampleReceiptData: ReceiptData = {
    clinicName: 'EYE SANTE CLINIC',
    clinicAddress: 'Plot 47, Lumumba Avenue, Nakasero, Kampala - Uganda',
    clinicPhone: '+256 758 341 772 / +256 200 979 911',
    receiptNumber: 'RCP-2025-001',
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    patientName: 'John Doe',
    patientId: '12345',
    items: [
      {
        name: 'Consultation Fee',
        quantity: 1,
        unitPrice: 50000,
        total: 50000
      },
      {
        name: 'Eye Examination',
        quantity: 1,
        unitPrice: 25000,
        total: 25000
      },
      {
        name: 'Prescription Glasses',
        quantity: 1,
        unitPrice: 150000,
        total: 150000
      }
    ],
    subtotal: 225000,
    taxAmount: 0,
    totalAmount: 225000,
    amountPaid: 225000,
    balanceDue: 0,
    paymentMethod: 'MOBILE_MONEY',
    paymentReference: 'TXN123456789',
    cashierName: 'Dr. Sarah Johnson',
    footerMessage: 'Thank you for choosing Eye Sante Clinic'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Receipt Printer Test</h1>
          <p className="text-gray-600 dark:text-gray-400">Test thermal printer functionality</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Sample Receipt Data
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Receipt Information</h3>
            <div className="space-y-1 text-sm">
              <div><span className="text-gray-500">Receipt #:</span> {sampleReceiptData.receiptNumber}</div>
              <div><span className="text-gray-500">Date:</span> {sampleReceiptData.date}</div>
              <div><span className="text-gray-500">Time:</span> {sampleReceiptData.time}</div>
              <div><span className="text-gray-500">Patient:</span> {sampleReceiptData.patientName}</div>
              <div><span className="text-gray-500">Total:</span> UGX {sampleReceiptData.totalAmount.toLocaleString()}</div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Items</h3>
            <div className="space-y-1 text-sm">
              {sampleReceiptData.items.map((item, index) => (
                <div key={index}>
                  <span className="text-gray-500">{item.name}:</span> {item.quantity} x UGX {item.unitPrice.toLocaleString()} = UGX {item.total.toLocaleString()}
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowPrinter(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Test Receipt Printer
        </button>
      </div>

      {/* Receipt Printer Modal */}
      {showPrinter && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <ReceiptPrinter
              receiptData={sampleReceiptData}
              onClose={() => setShowPrinter(false)}
              showPreview={true}
            />
          </div>
        </div>
      )}
    </div>
  )
} 