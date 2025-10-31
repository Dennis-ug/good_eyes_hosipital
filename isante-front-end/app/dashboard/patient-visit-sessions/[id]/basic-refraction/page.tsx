'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { basicRefractionExamApi, patientVisitSessionApi } from "../../../../../lib/api"
import type { PatientVisitSession, BasicRefractionExam } from "../../../../../lib/types"
import VisitSessionHeader from "../../_components/VisitSessionHeader"

export default function BasicRefractionByVisitSessionPage() {
  const router = useRouter()
  const routeParams = useParams() as { id?: string | string[] }
  const idParam = Array.isArray(routeParams?.id) ? routeParams.id[0] : routeParams?.id
  const visitSessionId = Number(idParam)
  const [loading, setLoading] = useState(true)
  const [examExists, setExamExists] = useState<boolean | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [visitSession, setVisitSession] = useState<PatientVisitSession | null>(null)
  const [existingExamId, setExistingExamId] = useState<number | null>(null)
  const [existingExam, setExistingExam] = useState<BasicRefractionExam | null>(null)

  useEffect(() => {
    let isMounted = true
    async function load() {
      try {
        const vs = await patientVisitSessionApi.getVisitSession(visitSessionId)
        if (isMounted) setVisitSession(vs)
        const exam = await basicRefractionExamApi.getByVisitSession(visitSessionId)
        if (isMounted) {
          setExamExists(true)
          setExistingExamId(exam.id)
          setExistingExam(exam)
        }
      } catch (e) {
        // If 404 (not found), we show the create form
        if (isMounted) {
          setExamExists(false)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    if (!Number.isFinite(visitSessionId)) {
      setError("Invalid visit session id")
      setLoading(false)
      return
    }
    load()
    return () => {
      isMounted = false
    }
  }, [visitSessionId])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const formData = new FormData(event.currentTarget)

      const text = (name: string) => ((formData.get(name) as string) || "").toString()
      const payload: any = {
        visitSessionId,
        neuroOriented: formData.get("neuroOriented") === "on",
        neuroMood: text("neuroMood"),
        neuroPsychNotes: text("neuroPsychNotes"),
        pupilsPerrl: formData.get("pupilsPerrl") === "on",
        pupilsRightDark: text("pupilsRightDark"),
        pupilsRightLight: text("pupilsRightLight"),
        pupilsRightShape: text("pupilsRightShape"),
        pupilsRightReact: text("pupilsRightReact"),
        pupilsRightApd: text("pupilsRightApd"),
        pupilsLeftDark: text("pupilsLeftDark"),
        pupilsLeftLight: text("pupilsLeftLight"),
        pupilsLeftShape: text("pupilsLeftShape"),
        pupilsLeftReact: text("pupilsLeftReact"),
        pupilsLeftApd: text("pupilsLeftApd"),
        visualAcuityDistanceScRight: text("visualAcuityDistanceScRight"),
        visualAcuityDistanceScLeft: text("visualAcuityDistanceScLeft"),
        visualAcuityDistancePhRight: text("visualAcuityDistancePhRight"),
        visualAcuityDistancePhLeft: text("visualAcuityDistancePhLeft"),
        visualAcuityDistanceCcRight: text("visualAcuityDistanceCcRight"),
        visualAcuityDistanceCcLeft: text("visualAcuityDistanceCcLeft"),
        visualAcuityNearScRight: text("visualAcuityNearScRight"),
        visualAcuityNearScLeft: text("visualAcuityNearScLeft"),
        visualAcuityNearCcRight: text("visualAcuityNearCcRight"),
        visualAcuityNearCcLeft: text("visualAcuityNearCcLeft"),
        manifestAutoRightSphere: text("manifestAutoRightSphere"),
        manifestAutoRightCylinder: text("manifestAutoRightCylinder"),
        manifestAutoRightAxis: text("manifestAutoRightAxis"),
        manifestAutoLeftSphere: text("manifestAutoLeftSphere"),
        manifestAutoLeftCylinder: text("manifestAutoLeftCylinder"),
        manifestAutoLeftAxis: text("manifestAutoLeftAxis"),
        keratometryK1Right: text("keratometryK1Right"),
        keratometryK2Right: text("keratometryK2Right"),
        keratometryAxisRight: text("keratometryAxisRight"),
        keratometryK1Left: text("keratometryK1Left"),
        keratometryK2Left: text("keratometryK2Left"),
        keratometryAxisLeft: text("keratometryAxisLeft"),
        manifestRetRightSphere: text("manifestRetRightSphere"),
        manifestRetRightCylinder: text("manifestRetRightCylinder"),
        manifestRetRightAxis: text("manifestRetRightAxis"),
        manifestRetLeftSphere: text("manifestRetLeftSphere"),
        manifestRetLeftCylinder: text("manifestRetLeftCylinder"),
        manifestRetLeftAxis: text("manifestRetLeftAxis"),
        subjectiveRightSphere: text("subjectiveRightSphere"),
        subjectiveRightCylinder: text("subjectiveRightCylinder"),
        subjectiveRightAxis: text("subjectiveRightAxis"),
        subjectiveLeftSphere: text("subjectiveLeftSphere"),
        subjectiveLeftCylinder: text("subjectiveLeftCylinder"),
        subjectiveLeftAxis: text("subjectiveLeftAxis"),
        addedValues: text("addedValues"),
        bestRightVision: text("bestRightVision"),
        bestLeftVision: text("bestLeftVision"),
        pdRightEye: text("pdRightEye"),
        pdLeftEye: text("pdLeftEye"),
        comment: text("comment"),
      }

      const created = await basicRefractionExamApi.create(payload)
      // After creation, return to the visit session overview
      router.push(`/dashboard/patient-visit-sessions/${visitSessionId}`)
      return created
    } catch (e: any) {
      setError(e?.message || "Failed to create exam")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-sm text-gray-600">Loading...</div>
      </div>
    )
  }

  if (examExists) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back
          </button>
        </div>
        {visitSession && (<VisitSessionHeader visitSession={visitSession} />)}
        {existingExam && (
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="px-4 py-3 sm:px-6">
              <div className="text-sm font-semibold text-gray-900 mb-3">Basic Refraction Summary</div>
              {/* Neuro/Psych */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                <div className="space-y-1">
                  <div className="text-gray-500">Neuro/Psych</div>
                  <div className="text-gray-900">Oriented x3: {existingExam.neuroOriented ? 'Yes' : 'No'}</div>
                  <div className="text-gray-900">Mood/Affect: {existingExam.neuroMood || '-'}</div>
                  <div className="text-gray-900">Notes: {existingExam.neuroPsychNotes || '-'}</div>
                </div>
                {/* Pupils */}
                <div className="space-y-1">
                  <div className="text-gray-500">Pupils</div>
                  <div className="text-gray-900">PERRL: {existingExam.pupilsPerrl ? 'Yes' : 'No'}</div>
                  <div className="text-gray-900">R: Dark {existingExam.pupilsRightDark || '-'} / Light {existingExam.pupilsRightLight || '-'} / Shape {existingExam.pupilsRightShape || '-'} / React {existingExam.pupilsRightReact || '-'} / APD {existingExam.pupilsRightApd || '-'}</div>
                  <div className="text-gray-900">L: Dark {existingExam.pupilsLeftDark || '-'} / Light {existingExam.pupilsLeftLight || '-'} / Shape {existingExam.pupilsLeftShape || '-'} / React {existingExam.pupilsLeftReact || '-'} / APD {existingExam.pupilsLeftApd || '-'}</div>
                </div>
              </div>

              {/* Visual Acuity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                <div className="space-y-1">
                  <div className="text-gray-500">Distance VA</div>
                  <div className="text-gray-900">sc R/L: {existingExam.visualAcuityDistanceScRight || '-'} / {existingExam.visualAcuityDistanceScLeft || '-'}</div>
                  <div className="text-gray-900">ph R/L: {existingExam.visualAcuityDistancePhRight || '-'} / {existingExam.visualAcuityDistancePhLeft || '-'}</div>
                  <div className="text-gray-900">cc R/L: {existingExam.visualAcuityDistanceCcRight || '-'} / {existingExam.visualAcuityDistanceCcLeft || '-'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-gray-500">Near VA</div>
                  <div className="text-gray-900">sc R/L: {existingExam.visualAcuityNearScRight || '-'} / {existingExam.visualAcuityNearScLeft || '-'}</div>
                  <div className="text-gray-900">cc R/L: {existingExam.visualAcuityNearCcRight || '-'} / {existingExam.visualAcuityNearCcLeft || '-'}</div>
                </div>
              </div>

              {/* Refraction */}
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-gray-500 mb-1">Autorefractor (S/Cx/A)</div>
                  <div className="text-gray-900">R: {existingExam.manifestAutoRightSphere ?? '-'} / {existingExam.manifestAutoRightCylinder ?? '-'} / {existingExam.manifestAutoRightAxis ?? '-'}</div>
                  <div className="text-gray-900">L: {existingExam.manifestAutoLeftSphere ?? '-'} / {existingExam.manifestAutoLeftCylinder ?? '-'} / {existingExam.manifestAutoLeftAxis ?? '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Keratometry (K1/K2/Axis)</div>
                  <div className="text-gray-900">R: {existingExam.keratometryK1Right ?? '-'} / {existingExam.keratometryK2Right ?? '-'} / {existingExam.keratometryAxisRight ?? '-'}</div>
                  <div className="text-gray-900">L: {existingExam.keratometryK1Left ?? '-'} / {existingExam.keratometryK2Left ?? '-'} / {existingExam.keratometryAxisLeft ?? '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Retinoscope (S/Cx/A)</div>
                  <div className="text-gray-900">R: {existingExam.manifestRetRightSphere ?? '-'} / {existingExam.manifestRetRightCylinder ?? '-'} / {existingExam.manifestRetRightAxis ?? '-'}</div>
                  <div className="text-gray-900">L: {existingExam.manifestRetLeftSphere ?? '-'} / {existingExam.manifestRetLeftCylinder ?? '-'} / {existingExam.manifestRetLeftAxis ?? '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Subjective (S/Cx/A)</div>
                  <div className="text-gray-900">R: {existingExam.subjectiveRightSphere ?? '-'} / {existingExam.subjectiveRightCylinder ?? '-'} / {existingExam.subjectiveRightAxis ?? '-'}</div>
                  <div className="text-gray-900">L: {existingExam.subjectiveLeftSphere ?? '-'} / {existingExam.subjectiveLeftCylinder ?? '-'} / {existingExam.subjectiveLeftAxis ?? '-'}</div>
                </div>
              </div>

              {/* Additional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
                <div className="space-y-1">
                  <div className="text-gray-500">Best Vision (R/L)</div>
                  <div className="text-gray-900">{existingExam.bestRightVision || '-'} / {existingExam.bestLeftVision || '-'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-gray-500">Add</div>
                  <div className="text-gray-900">{existingExam.addedValues || '-'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-gray-500">PD (R/L)</div>
                  <div className="text-gray-900">{existingExam.pdRightEye ?? '-'} / {existingExam.pdLeftEye ?? '-'}</div>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <div className="text-gray-500">Comments</div>
                  <div className="text-gray-900">{existingExam.comment || '-'}</div>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                {existingExamId && (
                  <button
                    type="button"
                    onClick={() => router.push(`/dashboard/basic-refraction-exams/${existingExamId}`)}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Full Summary
                  </button>
                )}
                {existingExamId && (
                  <button
                    type="button"
                    onClick={() => router.push(`/dashboard/basic-refraction-exams/${existingExamId}/edit`)}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Update
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back
        </button>
                </div>
      {visitSession && (<VisitSessionHeader visitSession={visitSession} />)}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <div className="border-b-2 border-blue-500 py-2 px-1 text-sm font-medium text-blue-600">Basic Exam Refraction</div>
          </nav>
              </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded">
              {successMessage}
          </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
                  <h3 className="text-sm font-medium text-gray-900">Neuro/Psych</h3>
                </div>
                <div className="p-4">
                  <div className="flex items-center mb-4">
                    <input id="neuroOriented" name="neuroOriented" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" type="checkbox" />
                    <label htmlFor="neuroOriented" className="ml-2 text-sm text-gray-900">Oriented x3</label>
                  </div>

                  <hr className="my-4" />

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Mood/Affect</p>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="col-span-1">
                        <button type="button" className="w-full px-3 py-1 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500">nl</button>
                      </div>
                      <div className="col-span-3">
                        <input name="neuroMood" className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Mood description" type="text" defaultValue="" />
                      </div>
                    </div>
                </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Neuro/Psych Notes</label>
                    <textarea name="neuroPsychNotes" rows={2} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Additional neuro/psych observations..."></textarea>
                </div>
                </div>
              </div>

              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
                  <h3 className="text-sm font-medium text-gray-900">Pupils</h3>
                </div>
                <div className="p-4">
                  <div className="flex items-center mb-4">
                    <input id="pupilsPerrl" name="pupilsPerrl" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" type="checkbox" />
                    <label htmlFor="pupilsPerrl" className="ml-2 text-sm text-gray-900">PERRL</label>
            </div>

                  <div className="grid grid-cols-6 gap-2 mb-2 text-xs font-medium text-gray-700">
                    <div className="col-span-1"></div>
                    <div className="col-span-1 text-center">Dark</div>
                    <div className="col-span-1 text-center">Light</div>
                    <div className="col-span-1 text-center">Shape</div>
                    <div className="col-span-1 text-center">React</div>
                    <div className="col-span-1 text-center">APD</div>
                  </div>

                  <div className="grid grid-cols-6 gap-2 mb-2">
                    <div className="col-span-1 text-center text-sm font-medium">R</div>
                    <div className="col-span-1"><input name="pupilsRightDark" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="3mm" type="text" defaultValue="" /></div>
                    <div className="col-span-1"><input name="pupilsRightLight" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="2mm" type="text" defaultValue="" /></div>
                    <div className="col-span-1"><input name="pupilsRightShape" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Round" type="text" defaultValue="" /></div>
                    <div className="col-span-1"><input name="pupilsRightReact" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Brisk" type="text" defaultValue="" /></div>
                    <div className="col-span-1"><input name="pupilsRightApd" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="None" type="text" defaultValue="" /></div>
                  </div>

                  <div className="grid grid-cols-6 gap-2">
                    <div className="col-span-1 text-center text-sm font-medium">L</div>
                    <div className="col-span-1"><input name="pupilsLeftDark" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="3mm" type="text" defaultValue="" /></div>
                    <div className="col-span-1"><input name="pupilsLeftLight" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="2mm" type="text" defaultValue="" /></div>
                    <div className="col-span-1"><input name="pupilsLeftShape" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Round" type="text" defaultValue="" /></div>
                    <div className="col-span-1"><input name="pupilsLeftReact" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Brisk" type="text" defaultValue="" /></div>
                    <div className="col-span-1"><input name="pupilsLeftApd" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="None" type="text" defaultValue="" /></div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
                  <h3 className="text-sm font-medium text-gray-900">Visual Acuity</h3>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <div className="grid grid-cols-3 gap-2 mb-2 text-xs font-medium text-gray-700">
                      <div className="col-span-1">Distance</div>
                      <div className="col-span-1 text-center">Right</div>
                      <div className="col-span-1 text-center">Left</div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="col-span-1 text-center text-xs">sc</div>
                      <div className="col-span-1">
                        <select name="visualAcuityDistanceScRight" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" defaultValue="">
                          <option value="">--Select--</option>
                          {['6/4','6/5','6/6','6/9','6/12','6/18','6/24','6/36','6/60','5/60','4/60','3/60','2/60','1/60','HM','PL','NPL'].map(v => (<option key={'dscr-'+v} value={v}>{v}</option>))}
                        </select>
                      </div>
                      <div className="col-span-1">
                        <select name="visualAcuityDistanceScLeft" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" defaultValue="">
                          <option value="">--Select--</option>
                          {['6/4','6/5','6/6','6/9','6/12','6/18','6/24','6/36','6/60','5/60','4/60','3/60','2/60','1/60','HM','PL','NPL'].map(v => (<option key={'dscl-'+v} value={v}>{v}</option>))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="col-span-1 text-center text-xs">ph</div>
                      <div className="col-span-1">
                        <select name="visualAcuityDistancePhRight" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" defaultValue="">
                          <option value="">--Select--</option>
                          {['6/4','6/5','6/6','6/9','6/12','6/18','6/24','6/36','6/60','5/60','4/60','3/60','2/60','1/60','HM','PL','NPL'].map(v => (<option key={'dphr-'+v} value={v}>{v}</option>))}
                        </select>
                      </div>
                      <div className="col-span-1">
                        <select name="visualAcuityDistancePhLeft" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" defaultValue="">
                          <option value="">--Select--</option>
                          {['6/4','6/5','6/6','6/9','6/12','6/18','6/24','6/36','6/60','5/60','4/60','3/60','2/60','1/60','HM','PL','NPL'].map(v => (<option key={'dphl-'+v} value={v}>{v}</option>))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="col-span-1 text-center text-xs">cc</div>
                      <div className="col-span-1">
                        <select name="visualAcuityDistanceCcRight" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" defaultValue="">
                          <option value="">--Select--</option>
                          {['6/4','6/5','6/6','6/9','6/12','6/18','6/24','6/36','6/60','5/60','4/60','3/60','2/60','1/60','HM','PL','NPL'].map(v => (<option key={'dccr-'+v} value={v}>{v}</option>))}
                        </select>
                      </div>
                      <div className="col-span-1">
                        <select name="visualAcuityDistanceCcLeft" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" defaultValue="">
                          <option value="">--Select--</option>
                          {['6/4','6/5','6/6','6/9','6/12','6/18','6/24','6/36','6/60','5/60','4/60','3/60','2/60','1/60','HM','PL','NPL'].map(v => (<option key={'dccl-'+v} value={v}>{v}</option>))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="grid grid-cols-3 gap-2 mb-2 text-xs font-medium text-gray-700">
                      <div className="col-span-1">Near</div>
                      <div className="col-span-1 text-center">Right</div>
                      <div className="col-span-1 text-center">Left</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="col-span-1 text-center text-xs">sc</div>
                      <div className="col-span-1">
                        <select name="visualAcuityNearScRight" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" defaultValue="">
                          <option value="">--Select--</option>
                          {['N4','N5','N6','N7','N8','N9','N10','N11'].map(v => (<option key={'nscr-'+v} value={v}>{v}</option>))}
                        </select>
                      </div>
                      <div className="col-span-1">
                        <select name="visualAcuityNearScLeft" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" defaultValue="">
                          <option value="">--Select--</option>
                          {['N4','N5','N6','N7','N8','N9','N10','N11'].map(v => (<option key={'nscl-'+v} value={v}>{v}</option>))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1 text-center text-xs">cc</div>
                      <div className="col-span-1">
                        <select name="visualAcuityNearCcRight" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" defaultValue="">
                          <option value="">--Select--</option>
                          {['N4','N5','N6','N7','N8','N9','N10','N11'].map(v => (<option key={'nccr-'+v} value={v}>{v}</option>))}
                        </select>
                      </div>
                      <div className="col-span-1">
                        <select name="visualAcuityNearCcLeft" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" defaultValue="">
                          <option value="">--Select--</option>
                          {['N4','N5','N6','N7','N8','N9','N10','N11'].map(v => (<option key={'nccl-'+v} value={v}>{v}</option>))}
                        </select>
                      </div>
                  </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-green-50 px-4 py-2 border-b border-gray-300">
                  <h3 className="text-sm font-medium text-gray-900 text-center">Refraction</h3>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Autorefractor</div>
                    <div className="grid grid-cols-4 gap-2 mb-2 text-xs font-medium text-gray-700">
                      <div className="col-span-1"></div>
                      <div className="col-span-1 text-center">Sphere</div>
                      <div className="col-span-1 text-center">Cylinder</div>
                      <div className="col-span-1 text-center">Axis</div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      <div className="col-span-1 text-center text-sm font-medium">R</div>
                      <div className="col-span-1"><input name="manifestAutoRightSphere" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="e.g., -1.25" type="text" defaultValue="" /></div>
                      <div className="col-span-1"><input name="manifestAutoRightCylinder" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="e.g., -0.75" type="text" defaultValue="" /></div>
                      <div className="col-span-1"><input name="manifestAutoRightAxis" step="1" min="0" max="180" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="0" type="number" defaultValue="" /></div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <div className="col-span-1 text-center text-sm font-medium">L</div>
                      <div className="col-span-1"><input name="manifestAutoLeftSphere" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="e.g., -1.00" type="text" defaultValue="" /></div>
                      <div className="col-span-1"><input name="manifestAutoLeftCylinder" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="e.g., -0.50" type="text" defaultValue="" /></div>
                      <div className="col-span-1"><input name="manifestAutoLeftAxis" step="1" min="0" max="180" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="0" type="number" defaultValue="" /></div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Keratometry</div>
                    <div className="grid grid-cols-4 gap-2 mb-2 text-xs font-medium text-gray-700">
                      <div className="col-span-1"></div>
                      <div className="col-span-1 text-center">K1</div>
                      <div className="col-span-1 text-center">K2</div>
                      <div className="col-span-1 text-center">Axis</div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      <div className="col-span-1 text-center text-sm font-medium">R</div>
                      <div className="col-span-1"><input name="keratometryK1Right" step="0.01" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="0.00" type="number" defaultValue="" /></div>
                      <div className="col-span-1"><input name="keratometryK2Right" step="0.01" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="0.00" type="number" defaultValue="" /></div>
                      <div className="col-span-1"><input name="keratometryAxisRight" step="1" min="0" max="180" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="0" type="number" defaultValue="" /></div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <div className="col-span-1 text-center text-sm font-medium">L</div>
                      <div className="col-span-1"><input name="keratometryK1Left" step="0.01" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="0.00" type="number" defaultValue="" /></div>
                      <div className="col-span-1"><input name="keratometryK2Left" step="0.01" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="0.00" type="number" defaultValue="" /></div>
                      <div className="col-span-1"><input name="keratometryAxisLeft" step="1" min="0" max="180" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="0" type="number" defaultValue="" /></div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Retinoscope</div>
                    <div className="grid grid-cols-4 gap-2 mb-2 text-xs font-medium text-gray-700">
                      <div className="col-span-1"></div>
                      <div className="col-span-1 text-center">Sphere</div>
                      <div className="col-span-1 text-center">Cylinder</div>
                      <div className="col-span-1 text-center">Axis</div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      <div className="col-span-1 text-center text-sm font-medium">R</div>
                      <div className="col-span-1"><input name="manifestRetRightSphere" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="e.g., +0.50" type="text" defaultValue="" /></div>
                      <div className="col-span-1"><input name="manifestRetRightCylinder" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="e.g., -0.25" type="text" defaultValue="" /></div>
                      <div className="col-span-1"><input name="manifestRetRightAxis" step="1" min="0" max="180" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="0" type="number" defaultValue="" /></div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <div className="col-span-1 text-center text-sm font-medium">L</div>
                      <div className="col-span-1"><input name="manifestRetLeftSphere" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="e.g., +0.25" type="text" defaultValue="" /></div>
                      <div className="col-span-1"><input name="manifestRetLeftCylinder" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="e.g., -0.25" type="text" defaultValue="" /></div>
                      <div className="col-span-1"><input name="manifestRetLeftAxis" step="1" min="0" max="180" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="0" type="number" defaultValue="" /></div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Subjective</div>
                    <div className="grid grid-cols-4 gap-2 mb-2 text-xs font-medium text-gray-700">
                      <div className="col-span-1"></div>
                      <div className="col-span-1 text-center">Sphere</div>
                      <div className="col-span-1 text-center">Cylinder</div>
                      <div className="col-span-1 text-center">Axis</div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      <div className="col-span-1 text-center text-sm font-medium">R</div>
                      <div className="col-span-1"><input name="subjectiveRightSphere" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="e.g., -1.50" type="text" defaultValue="" /></div>
                      <div className="col-span-1"><input name="subjectiveRightCylinder" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="e.g., -0.50" type="text" defaultValue="" /></div>
                      <div className="col-span-1"><input name="subjectiveRightAxis" step="1" min="0" max="180" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="0" type="number" defaultValue="" /></div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="col-span-1 text-center text-sm font-medium">L</div>
                      <div className="col-span-1"><input name="subjectiveLeftSphere" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="e.g., -1.25" type="text" defaultValue="" /></div>
                      <div className="col-span-1"><input name="subjectiveLeftCylinder" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="e.g., -0.25" type="text" defaultValue="" /></div>
                      <div className="col-span-1"><input name="subjectiveLeftAxis" step="1" min="0" max="180" className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="0" type="number" defaultValue="" /></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Add</label>
                      <input name="addedValues" className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="e.g., +1.50 for reading" type="text" defaultValue="" />
                    </div>
                    <div></div>
                </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Best Vision Right Eye</label>
                      <select name="bestRightVision" className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" defaultValue="">
                        <option value="">--Select--</option>
                        {['6/4','6/5','6/6','6/9','6/12','6/18','6/24','6/36','6/60','5/60','4/60','3/60','2/60','1/60','HM','PL','NPL'].map(v => (<option key={'brv-'+v} value={v}>{v}</option>))}
                      </select>
                </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Best Vision Left Eye</label>
                      <select name="bestLeftVision" className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" defaultValue="">
                        <option value="">--Select--</option>
                        {['6/4','6/5','6/6','6/9','6/12','6/18','6/24','6/36','6/60','5/60','4/60','3/60','2/60','1/60','HM','PL','NPL'].map(v => (<option key={'blv-'+v} value={v}>{v}</option>))}
                      </select>
                </div>
              </div>

                  <div className="grid grid-cols-2 gap-4">
              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PD for Right Eye</label>
                      <input name="pdRightEye" className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" type="text" defaultValue="" />
              </div>
              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PD for Left Eye</label>
                      <input name="pdLeftEye" className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" type="text" defaultValue="" />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                    <textarea name="comment" rows={6} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Enter examination comments and recommendations..."></textarea>
                  </div>
              </div>
              </div>
              </div>
            </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button type="reset" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Cancel</button>
            <button disabled={submitting} className="justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" type="submit">
              {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
      </div>
    </div>
  )
}
