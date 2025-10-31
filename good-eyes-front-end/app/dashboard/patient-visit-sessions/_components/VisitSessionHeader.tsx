import React from "react"
import type { PatientVisitSession } from "../../../../lib/types"
import { User, CalendarDays, Receipt } from "lucide-react"

export interface VisitSessionHeaderProps {
  visitSession: PatientVisitSession
  className?: string
  rightActions?: React.ReactNode
}

export function VisitSessionHeader({ visitSession, className, rightActions }: VisitSessionHeaderProps) {
  return (
    <div className={`mb-4 rounded-lg border border-gray-200 bg-white shadow-sm ${className || ""}`}>
      <div className="px-4 py-3 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-semibold text-gray-900">{visitSession.patientName}</div>
              <div className="text-xs text-gray-500">Session #{visitSession.id}</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
              {visitSession.status}
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
              {visitSession.currentStage}
            </span>
            {visitSession.invoiceId ? (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
                <Receipt className="mr-1 h-3.5 w-3.5" /> #{visitSession.invoiceId}
              </span>
            ) : null}
            {rightActions}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600">
          <div className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-gray-400" />
            <span>{new Date(visitSession.visitDate).toLocaleString()}</span>
          </div>
          <div className="inline-flex items-center gap-2">
            <span>Purpose: {visitSession.visitPurpose}</span>
          </div>
          <div className="inline-flex items-center gap-2">
            <span>Fee: {visitSession.consultationFeeAmount != null ? `UGX ${visitSession.consultationFeeAmount}` : 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VisitSessionHeader


