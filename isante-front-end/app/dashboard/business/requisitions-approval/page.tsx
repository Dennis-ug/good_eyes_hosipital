'use client'
// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { theaterRequisitionApi } from '@/lib/api'
import { TheaterRequisition, ApproveTheaterRequisitionRequest } from '@/lib/types'
import { formatUGX } from '@/lib/currency'
import { Clock, CheckCircle, XCircle, Eye, Loader2, AlertCircle } from 'lucide-react'

export default function RequisitionsApprovalPage() {
  const [requisitions, setRequisitions] = useState<TheaterRequisition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [approvingId, setApprovingId] = useState<number | null>(null)
  const [rejectingId, setRejectingId] = useState<number | null>(null)
  const [selectedRequisition, setSelectedRequisition] = useState<TheaterRequisition | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await theaterRequisitionApi.getAll({ page: 0, size: 50 })
      // Filter only SUBMITTED requisitions
      const submittedRequisitions = (response.content || []).filter(req => req.status === 'SUBMITTED')
      setRequisitions(submittedRequisitions)
    } catch (error: any) {
      console.error('Failed to fetch requisitions:', error)
      setError('Failed to load requisitions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewRequisition = (requisition: TheaterRequisition) => {
    setSelectedRequisition(requisition)
    setShowViewModal(true)
  }

  const handleApproveRequisition = async (requisition: TheaterRequisition) => {
    if (!confirm('Are you sure you want to approve this requisition?')) {
      return
    }

    try {
      setApprovingId(requisition.id)
      setError(null)
      
      // Create item approvals - approve all requested quantities
      const itemApprovals = requisition.requisitionItems.map(item => ({
        requisitionItemId: item.id,
        quantityApproved: item.quantityRequested, // Approve the full requested quantity
        notes: 'Approved in full'
      }))
      
      const approvalRequest: ApproveTheaterRequisitionRequest = {
        action: 'APPROVE',
        itemApprovals: itemApprovals,
        notes: 'Approved by approver'
      }
      
      await theaterRequisitionApi.approve(requisition.id, approvalRequest)
      await fetchData() // Refresh the data
    } catch (error: any) {
      console.error('Failed to approve requisition:', error)
      setError('Failed to approve requisition. Please try again.')
    } finally {
      setApprovingId(null)
    }
  }

  const handleRejectClick = (requisition: TheaterRequisition) => {
    setRejectingId(requisition.id)
    setRejectionReason('')
    setError(null)
  }

  const handleRejectRequisition = async (requisition: TheaterRequisition) => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection.')
      return
    }

    try {
      setError(null)
      
      const rejectionRequest: ApproveTheaterRequisitionRequest = {
        action: 'REJECT',
        rejectionReason: rejectionReason
      }
      
      await theaterRequisitionApi.approve(requisition.id, rejectionRequest)
      setRejectionReason('')
      setRejectingId(null)
      await fetchData() // Refresh the data
    } catch (error: any) {
      console.error('Failed to reject requisition:', error)
      setError('Failed to reject requisition. Please try again.')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'URGENT': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Requisitions Waiting for Approval</h1>
          <p className="text-gray-600 dark:text-gray-400">Review and approve theater requisitions</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Requisitions Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Submitted Requisitions ({requisitions.length})
            </h2>
          </div>
          
          {requisitions.length === 0 ? (
            <div className="p-6 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Requisitions Pending</h3>
              <p className="text-gray-600 dark:text-gray-400">There are no requisitions waiting for approval at the moment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Requisition
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Requested By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Items
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {requisitions.map((requisition) => (
                    <tr key={requisition.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {requisition.requisitionNumber}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {requisition.title}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {requisition.requestedByUserName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(requisition.requestedDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(requisition.priority)}`}>
                          {requisition.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {requisition.requisitionItems.length} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewRequisition(requisition)}
                            title="View Details"
                            aria-label="View requisition details"
                            className="inline-flex items-center justify-center p-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleApproveRequisition(requisition)}
                            title="Approve"
                            aria-label="Approve requisition"
                            disabled={approvingId === requisition.id}
                            className="inline-flex items-center justify-center p-2 rounded-md bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {approvingId === requisition.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleRejectClick(requisition)}
                            title="Reject"
                            aria-label="Reject requisition"
                            disabled={rejectingId === requisition.id}
                            className="inline-flex items-center justify-center p-2 rounded-md bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* View Modal */}
        {showViewModal && selectedRequisition && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Requisition Details - {selectedRequisition.requisitionNumber}
                  </h3>
                  <button
                    onClick={() => {
                      setShowViewModal(false)
                      setSelectedRequisition(null)
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</span>
                      <p className="text-gray-900 dark:text-white">{selectedRequisition.title}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</span>
                      <p className="text-gray-900 dark:text-white">{selectedRequisition.priority}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Requested By</span>
                      <p className="text-gray-900 dark:text-white">{selectedRequisition.requestedByUserName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Requested Date</span>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(selectedRequisition.requestedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {selectedRequisition.description && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</span>
                      <p className="text-gray-900 dark:text-white">{selectedRequisition.description}</p>
                    </div>
                  )}

                  {selectedRequisition.status === 'REJECTED' && selectedRequisition.rejectionReason && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex">
                        <XCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Rejection Reason</h3>
                          <p className="text-sm text-red-700 dark:text-red-300 mt-1">{selectedRequisition.rejectionReason}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Requisition Items</span>
                    <div className="mt-2 space-y-3">
                      {selectedRequisition.requisitionItems.map((item, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Item</span>
                              <p className="text-gray-900 dark:text-white">{item.consumableItemName}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">SKU</span>
                              <p className="text-gray-900 dark:text-white">{item.consumableItemSku}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Quantity</span>
                              <p className="text-gray-900 dark:text-white">
                                {item.quantityRequested} {item.consumableItemUnit}
                              </p>
                            </div>

                          </div>
                          {item.purpose && (
                            <div className="mt-2">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Purpose</span>
                              <p className="text-gray-900 dark:text-white">{item.purpose}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>


                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowViewModal(false)
                      setSelectedRequisition(null)
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleApproveRequisition(selectedRequisition)}
                    disabled={approvingId === selectedRequisition.id}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {approvingId === selectedRequisition.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      'Approve Requisition'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        {rejectingId && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Reject Requisition
                </h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason for Rejection
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={4}
                    placeholder="Please provide a reason for rejecting this requisition..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setRejectingId(null)
                      setRejectionReason('')
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const requisition = requisitions.find(r => r.id === rejectingId)
                      if (requisition) {
                        handleRejectRequisition(requisition)
                      }
                    }}
                    disabled={!rejectionReason.trim()}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject Requisition
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
