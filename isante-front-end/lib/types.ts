// Authentication Types
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  username: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
  passwordChangeRequired: boolean
  accessTokenExpiresAt: string
  refreshTokenExpiresAt: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface CreateUserRequest {
  username: string
  email: string
  firstName: string
  lastName: string
  password?: string
  roles: string[]
  departmentId: number
  sendEmailNotification: boolean
  customMessage?: string
}

export interface InviteUserRequest {
  email: string
  firstName: string
  lastName: string
  roles: string[]
  departmentId?: number
  customMessage?: string
}

export interface UserInvitation {
  id: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
  departmentId?: number
  customMessage?: string
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED'
  invitedBy: string
  invitedAt: string
  expiresAt: string
  acceptedAt?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ChangePasswordResponse {
  message: string
  username: string
  passwordChangeRequired: boolean
  passwordChangedAt: string
  status: string
}

export interface AssignDepartmentRequest {
  userId: number
  departmentId: number
}

// Department Types
export interface Department {
  id: number
  name: string
  description: string
  enabled: boolean
}

export interface CreateDepartmentRequest {
  name: string
  description: string
}

// Patient Types
export interface Patient {
  id: number
  patientNumber: string
  firstName: string
  lastName: string
  gender: string
  nationalId: string
  dateOfBirth: string
  ageInYears: number
  ageInMonths: number
  maritalStatus: string
  occupation: string
  nextOfKin: string
  nextOfKinRelationship: string
  nextOfKinPhone: string
  phone: string
  alternativePhone: string
  phoneOwner: string
  ownerName: string
  patientCategory: string
  company: string
  preferredLanguage: string
  citizenship: string
  countryId: string
  foreignerOrRefugee: string
  nonUgandanNationalIdNo: string
  residence: string
  researchNumber: string
  receptionTimestamp?: string
  receivedBy?: string
}

// Procedure Types
export interface Procedure {
  id: number
  name: string
  description: string
  category: string
  price: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PatientProcedure {
  id: number
  visitSessionId: number
  procedureId: number
  procedureName: string
  procedureCategory: string
  procedurePrice: number
  eyeSide: string
  cost: number
  performed: boolean
  performedBy: string
  performedDate: string
  staffFee: number
  notes: string
  createdAt: string
  updatedAt: string
  patientName?: string
  patientPhone?: string
}

export interface CreatePatientProcedureRequest {
  visitSessionId: number
  procedureId: number
  eyeSide: string
  cost: number
  performed: boolean
  performedBy: string
  staffFee: number
  notes: string
}

export interface CreatePatientRequest {
  firstName: string
  lastName: string
  gender: string
  nationalId: string
  dateOfBirth: string
  ageInYears: number
  ageInMonths: number
  maritalStatus: string
  occupation: string
  nextOfKin: string
  nextOfKinRelationship: string
  nextOfKinPhone: string
  phone: string
  alternativePhone: string
  phoneOwner: string
  ownerName: string
  patientCategory: string
  company: string
  preferredLanguage: string
  citizenship: string
  countryId: string
  foreignerOrRefugee: string
  nonUgandanNationalIdNo: string
  residence: string
  researchNumber: string
}

// Eye Examination Types
export interface EyeExamination {
  id: number
  patientId: number
  examinerId: number
  examinerName: string
  chiefComplaint: string
  visualAcuityRight: string
  visualAcuityLeft: string
  intraocularPressureRight: number
  intraocularPressureLeft: number
  refractionRight: string
  refractionLeft: string
  diagnosis: string
  treatmentPlan: string
  nextAppointment: string
  eyeHistory: string
  familyEyeHistory: string
  notes: string
  createdAt: string
}

export interface CreateEyeExaminationRequest {
  patientId: number
  examinerId: number
  examinerName: string
  chiefComplaint: string
  visualAcuityRight: string
  visualAcuityLeft: string
  intraocularPressureRight: number
  intraocularPressureLeft: number
  refractionRight: string
  refractionLeft: string
  diagnosis: string
  treatmentPlan: string
  nextAppointment: string
  eyeHistory: string
  familyEyeHistory: string
  notes: string
}

// Role & Permission Types
export interface Role {
  id: number
  name: string
  description: string
  enabled: boolean
  permissionIds: number[]
}

export interface CreateRoleRequest {
  name: string
  description: string
  enabled: boolean
  permissionIds: number[]
}

export interface Permission {
  id: number
  name: string
  description: string
  resourceName: string
  actionName: string
  enabled: boolean
}

export interface CreatePermissionRequest {
  name: string
  description: string
  resourceName: string
  actionName: string
  enabled: boolean
}

// Reception Types
export interface PatientReception {
  id: number
  firstName: string
  lastName: string
  receptionTimestamp: string
  receivedBy: string
}

// User Management Types
export interface User {
  id: number
  username: string
  email: string
  firstName?: string
  lastName?: string
  roles: Role[]
  departmentId?: number
  departmentName?: string
  enabled?: boolean
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

// API Error Response
export interface ApiErrorResponse {
  status: number
  error: string
  message: string
  path: string
  timestamp: string
}

// Pagination Types
export interface Pageable {
  page?: number
  size?: number
  sort?: string
}

export interface Sort {
  empty: boolean
  sorted: boolean
  unsorted: boolean
}

export interface SpringPageable {
  pageNumber: number
  pageSize: number
  sort: Sort
  offset: number
  paged: boolean
  unpaged: boolean
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  numberOfElements: number
  empty: boolean
  pageable: SpringPageable
  sort: Sort
}

// Appointment Types
export interface Appointment {
  id: number
  patientId: number
  patientName: string
  patientPhone?: string
  patientEmail?: string
  doctorId: number
  doctorName: string
  doctorSpecialty?: string
  appointmentDate: string
  appointmentTime: string
  endTime: string
  duration: number
  appointmentType: AppointmentType
  reason: string
  priority: AppointmentPriority
  notes?: string
  status: AppointmentStatus
  reminderSent: boolean
  reminderSentAt?: string
  checkInTime?: string
  checkOutTime?: string
  actualDuration?: number
  followUpRequired: boolean
  followUpDate?: string
  insuranceProvider?: string
  insuranceNumber?: string
  cost?: number
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy?: string
  cancelledAt?: string
  cancelledBy?: string
  cancellationReason?: string
}

export interface CreateAppointmentRequest {
  patientId: number
  patientName: string
  patientPhone?: string
  patientEmail?: string
  doctorId: number
  doctorName: string
  doctorSpecialty?: string
  appointmentDate: string
  appointmentTime: string
  duration?: number
  appointmentType: AppointmentType
  reason: string
  priority?: AppointmentPriority
  notes?: string
  followUpRequired?: boolean
  followUpDate?: string
  insuranceProvider?: string
  insuranceNumber?: string
  cost?: number
  paymentMethod?: PaymentMethod
}

export interface UpdateAppointmentRequest {
  patientId?: number
  patientName?: string
  patientPhone?: string
  patientEmail?: string
  doctorId?: number
  doctorName?: string
  doctorSpecialty?: string
  appointmentDate?: string
  appointmentTime?: string
  duration?: number
  appointmentType?: AppointmentType
  reason?: string
  priority?: AppointmentPriority
  notes?: string
  followUpRequired?: boolean
  followUpDate?: string
  insuranceProvider?: string
  insuranceNumber?: string
  cost?: number
  paymentMethod?: PaymentMethod
}

export interface UpdateAppointmentStatusRequest {
  status: AppointmentStatus
  checkInTime?: string
  checkOutTime?: string
  actualDuration?: number
}

export interface CancelAppointmentRequest {
  cancellationReason: string
}

export interface RescheduleAppointmentRequest {
  newDate: string
  newTime: string
}

export interface DoctorAvailabilityRequest {
  doctorId: number
  date: string
  startTime: string
  endTime: string
}

export interface DoctorAvailabilityResponse {
  available: boolean
  conflictingAppointments: Appointment[]
}

export interface ConflictCheckRequest {
  doctorId: number
  date: string
  startTime: string
  endTime: string
}

export interface ConflictCheckResponse {
  hasConflict: boolean
  conflictingAppointments: Appointment[]
}

export interface BatchAvailabilityRequest {
  doctorId: number
  date: string
  duration: number
  timeSlots: string[]
}


export type AppointmentType = 
  | 'ROUTINE_EXAMINATION'
  | 'FOLLOW_UP'
  | 'EMERGENCY'
  | 'SURGERY_CONSULTATION'
  | 'PRESCRIPTION_RENEWAL'
  | 'DIAGNOSTIC_TEST'
  | 'PRE_OPERATIVE_ASSESSMENT'
  | 'POST_OPERATIVE_FOLLOW_UP'
  | 'VISION_THERAPY'
  | 'CONTACT_LENS_FITTING'
  | 'GLASSES_FITTING'
  | 'GLAUCOMA_SCREENING'
  | 'CATARACT_EVALUATION'
  | 'RETINAL_EXAMINATION'
  | 'PEDIATRIC_EXAMINATION'

export type AppointmentStatus = 
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'RESCHEDULED'
  | 'WAITING'
  | 'READY'

export type AppointmentPriority = 
  | 'LOW'
  | 'NORMAL'
  | 'HIGH'
  | 'URGENT'
  | 'EMERGENCY'



// Doctor Schedule Types
export interface DoctorSchedule {
  id: number
  doctorId: number
  doctorName: string
  doctorSpecialty?: string
  doctorEmail?: string
  dayOfWeek: number
  dayName: string
  startTime: string
  endTime: string
  breakStart?: string
  breakEnd?: string
  isAvailable: boolean
  scheduleTime: string
  breakTime?: string
  totalWorkingHours: number
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

export interface CreateDoctorScheduleRequest {
  doctor: {
    id: number
  }
  dayOfWeek: number
  startTime: string
  endTime: string
  breakStart?: string
  breakEnd?: string
  isAvailable: boolean
}

export interface UpdateDoctorScheduleRequest {
  startTime?: string
  endTime?: string
  breakStart?: string
  breakEnd?: string
  isAvailable?: boolean
}

export interface DoctorScheduleSearchRequest {
  doctorId?: number
  dayOfWeek?: number
  doctorName?: string
  isAvailable?: boolean
}

// Day of Week Constants
export const DAYS_OF_WEEK = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7
} as const

export const DAY_NAMES = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday'
} as const

export type DayOfWeek = typeof DAYS_OF_WEEK[keyof typeof DAYS_OF_WEEK] 

// Finance Types
export interface Invoice {
  id: number
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  patientId: number
  patientNumber?: string
  patientName: string
  patientPhone?: string
  patientEmail?: string
  userId: number
  doctorName: string
  doctorSpecialty?: string
  appointmentId: number
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  amountPaid: number
  balanceDue: number
  status: InvoiceStatus
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  paymentReference?: string
  paymentDate?: string
  insuranceProvider?: string
  insuranceNumber?: string
  insuranceCoverage?: number
  insuranceAmount?: number
  notes?: string
  internalNotes?: string
  invoiceItems: InvoiceItem[]
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  invoicePurpose?: string
}

export interface InvoiceItem {
  id?: number
  itemName: string
  itemDescription: string
  itemType: 'CONSULTATION' | 'PROCEDURE' | 'MEDICATION' | 'EQUIPMENT' | 'OTHER' | 'INVENTORY_ITEM'
  quantity: number
  unitPrice: number
  discountPercentage: number
  taxPercentage: number
  insuranceCovered: boolean
  insuranceCoveragePercentage: number
  notes: string
  inventoryItemId?: number
  sku?: string
}

export interface CreateInvoiceRequest {
  appointmentId: number
  notes?: string
  internalNotes?: string
}

export interface UpdateInvoiceRequest {
  notes?: string
  internalNotes?: string
  status?: InvoiceStatus
}

export interface RecordPaymentRequest {
  amount: number
  method: PaymentMethod
  reference?: string
}

export interface FinancialSummary {
  startDate: string
  endDate: string
  totalInvoices: number
  totalRevenue: number
  totalPaid: number
  totalOutstanding: number
  totalOverdue: number
  averageInvoiceAmount: number
  paymentMethodBreakdown: Record<PaymentMethod, number>
  statusBreakdown: Record<InvoiceStatus, number>
  topDoctors: TopDoctor[]
  topServices: TopService[]
}

export interface TopDoctor {
  doctorId: number
  doctorName: string
  totalInvoices: number
  totalRevenue: number
}

export interface TopService {
  serviceName: string
  totalInvoices: number
  totalRevenue: number
}

export interface InvoiceSearchRequest {
  patientId?: number
  doctorId?: number
  status?: InvoiceStatus
  paymentStatus?: PaymentStatus
  startDate?: string
  endDate?: string
  page?: number
  size?: number
  sort?: string
}

// Finance Enums
export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  MOBILE_MONEY = 'MOBILE_MONEY',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CARD = 'CARD',
  INSURANCE = 'INSURANCE',
  CHEQUE = 'CHEQUE'
} 

// Inventory Types
export interface InventoryCategory {
  id: number
  name: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface InventoryItem {
  id: number
  name: string
  description: string
  sku: string
  unitPrice: number
  costPrice: number
  quantityInStock: number
  minimumStockLevel: number
  maximumStockLevel: number
  unitOfMeasure: string
  categoryId: number
  categoryName: string
  supplierName: string
  supplierContact: string
  reorderPoint: number
  reorderQuantity: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  // Optional optics fields
  opticsType?: string
  brand?: string
  model?: string
  frameShape?: string
  frameMaterial?: string
  // Optional medicine fields
  genericName?: string
  dosageForm?: string
  strength?: string
  activeIngredient?: string
  expiryDate?: string
  batchNumber?: string
  requiresPrescription?: boolean
  controlledSubstance?: boolean
  storageConditions?: string
}

export interface CreateInventoryCategoryRequest {
  name: string
  description: string
}

export interface CreateInventoryItemRequest {
  name: string
  description: string
  sku: string
  unitPrice: number
  costPrice: number
  quantityInStock: number
  minimumStockLevel: number
  maximumStockLevel: number
  unitOfMeasure: string
  categoryId: number
  supplierName: string
  supplierContact: string
  reorderPoint: number
  reorderQuantity: number
  // Optional medicine fields
  genericName?: string
  dosageForm?: string
  strength?: string
  activeIngredient?: string
  expiryDate?: string
  batchNumber?: string
  requiresPrescription?: boolean
  controlledSubstance?: boolean
  storageConditions?: string
}

export interface UpdateInventoryItemRequest {
  name?: string
  description?: string
  sku?: string
  unitPrice?: number
  costPrice?: number
  minimumStockLevel?: number
  maximumStockLevel?: number
  unitOfMeasure?: string
  categoryId?: number
  supplierName?: string
  supplierContact?: string
  reorderPoint?: number
  reorderQuantity?: number
} 

// Patient Visit Session Types - Updated to match actual API response
export interface PatientVisitSession {
  id: number
  patientId: number
  patientNumber?: string
  patientName: string
  visitDate: string
  visitPurpose: VisitPurpose
  status: VisitStatus
  currentStage: VisitStage
  consultationFeePaid: boolean
  consultationFeeAmount: number | null
  paymentMethod?: PaymentMethod | null
  paymentReference?: string | null
  chiefComplaint?: string | null
  previousVisitId?: number | null
  emergencyLevel: EmergencyLevel
  requiresTriage: boolean
  requiresDoctorVisit: boolean
  isEmergency: boolean
  notes?: string | null
  invoiceId?: number | null
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

export interface CreatePatientVisitSessionRequest {
  patientId: number
  visitPurpose: VisitPurpose
  chiefComplaint?: string
  consultationFeeAmount?: number | null
}

export interface MarkFeePaidRequest {
  paymentMethod: PaymentMethod
  paymentReference?: string
}

export interface DeleteVisitSessionResponse {
  status: string
  message: string
  deletedId: number
}

// Triage Measurement Types
export interface TriageMeasurement {
  id: number
  visitSessionId: number
  systolicBp?: number
  diastolicBp?: number
  rbsValue?: number
  rbsUnit?: string
  iopRight?: number
  iopLeft?: number
  weightKg?: number
  weightLbs?: number | null
  notes?: string
  measuredBy: number | null
  measurementDate: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  patientName?: string
  patientPhone?: string
}

export interface BasicRefractionExam {
  id: number
  visitSessionId: number
  
  // Neuro/Psych Section
  neuroOriented?: boolean
  neuroMood?: string
  neuroPsychNotes?: string
  
  // Pupils Section
  pupilsPerrl?: boolean
  pupilsRightDark?: string
  pupilsLeftDark?: string
  pupilsRightLight?: string
  pupilsLeftLight?: string
  pupilsRightShape?: string
  pupilsLeftShape?: string
  pupilsRightReact?: string
  pupilsLeftReact?: string
  pupilsRightApd?: string
  pupilsLeftApd?: string
  pupilsNotes?: string
  
  // Visual Acuity Section
  visualAcuityDistanceScRight?: string
  visualAcuityDistanceScLeft?: string
  visualAcuityDistancePhRight?: string
  visualAcuityDistancePhLeft?: string
  visualAcuityDistanceCcRight?: string
  visualAcuityDistanceCcLeft?: string
  visualAcuityNearScRight?: string
  visualAcuityNearScLeft?: string
  visualAcuityNearCcRight?: string
  visualAcuityNearCcLeft?: string
  visualAcuityNotes?: string
  
  // Refraction Section
  manifestAutoRightSphere?: string
  manifestAutoRightCylinder?: string
  manifestAutoRightAxis?: string
  manifestAutoLeftSphere?: string
  manifestAutoLeftCylinder?: string
  manifestAutoLeftAxis?: string
  manifestRetRightSphere?: string
  manifestRetRightCylinder?: string
  manifestRetRightAxis?: string
  manifestRetLeftSphere?: string
  manifestRetLeftCylinder?: string
  manifestRetLeftAxis?: string
  subjectiveRightSphere?: string
  subjectiveRightCylinder?: string
  subjectiveRightAxis?: string
  subjectiveLeftSphere?: string
  subjectiveLeftCylinder?: string
  subjectiveLeftAxis?: string
  
  // Additional Data
  addedValues?: string
  bestRightVision?: string
  bestLeftVision?: string
  pdRightEye?: number
  pdLeftEye?: number
  refractionNotes?: string
  comment?: string
  examinationDate: string
  examinedBy?: string
  
  // Enhanced fields from API examples
  keratometryK1Right?: number
  keratometryK2Right?: number
  keratometryAxisRight?: number
  keratometryK1Left?: number
  keratometryK2Left?: number
  keratometryAxisLeft?: number
  pupilSizeRight?: number
  pupilSizeLeft?: number
  pupilSizeUnit?: string
  iopRight?: number
  iopLeft?: number
  iopMethod?: string
  colorVisionRight?: string
  colorVisionLeft?: string
  colorVisionTest?: string
  stereopsis?: number
  stereopsisUnit?: string
  nearAdditionRight?: number
  nearAdditionLeft?: number
  clinicalAssessment?: string
  diagnosis?: string
  treatmentPlan?: string
  equipmentUsed?: string
  equipmentCalibrationDate?: string
  
  // Audit fields
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  
  // Patient details
  patientName?: string
  patientPhone?: string
}

export interface CreateBasicRefractionExamRequest {
  visitSessionId: number
  neuroOriented?: boolean
  neuroMood?: string
  neuroPsychNotes?: string
  pupilsPerrl?: boolean
  pupilsRightDark?: string
  pupilsLeftDark?: string
  pupilsRightLight?: string
  pupilsLeftLight?: string
  pupilsRightShape?: string
  pupilsLeftShape?: string
  pupilsRightReact?: string
  pupilsLeftReact?: string
  pupilsRightApd?: string
  pupilsLeftApd?: string
  pupilsNotes?: string
  visualAcuityDistanceScRight?: string
  visualAcuityDistanceScLeft?: string
  visualAcuityDistancePhRight?: string
  visualAcuityDistancePhLeft?: string
  visualAcuityDistanceCcRight?: string
  visualAcuityDistanceCcLeft?: string
  visualAcuityNearScRight?: string
  visualAcuityNearScLeft?: string
  visualAcuityNearCcRight?: string
  visualAcuityNearCcLeft?: string
  visualAcuityNotes?: string
  manifestAutoRightSphere?: string
  manifestAutoRightCylinder?: string
  manifestAutoRightAxis?: string
  manifestAutoLeftSphere?: string
  manifestAutoLeftCylinder?: string
  manifestAutoLeftAxis?: string
  manifestRetRightSphere?: string
  manifestRetRightCylinder?: string
  manifestRetRightAxis?: string
  manifestRetLeftSphere?: string
  manifestRetLeftCylinder?: string
  manifestRetLeftAxis?: string
  subjectiveRightSphere?: string
  subjectiveRightCylinder?: string
  subjectiveRightAxis?: string
  subjectiveLeftSphere?: string
  subjectiveLeftCylinder?: string
  subjectiveLeftAxis?: string
  addedValues?: string
  bestRightVision?: string
  bestLeftVision?: string
  pdRightEye?: string
  pdLeftEye?: string
  refractionNotes?: string
  comment?: string
  examinedBy?: string
  
  // Enhanced fields from API examples
  keratometryK1Right?: string
  keratometryK2Right?: string
  keratometryAxisRight?: string
  keratometryK1Left?: string
  keratometryK2Left?: string
  keratometryAxisLeft?: string
  pupilSizeRight?: string
  pupilSizeLeft?: string
  pupilSizeUnit?: string
  iopRight?: string
  iopLeft?: string
  iopMethod?: string
  colorVisionRight?: string
  colorVisionLeft?: string
  colorVisionTest?: string
  stereopsis?: string
  stereopsisUnit?: string
  nearAdditionRight?: string
  nearAdditionLeft?: string
  clinicalAssessment?: string
  diagnosis?: string
  treatmentPlan?: string
  equipmentUsed?: string
  equipmentCalibrationDate?: string
  
  // Patient details (from API response)
  patientName?: string
  patientPhone?: string
}

export interface UpdateBasicRefractionExamRequest extends CreateBasicRefractionExamRequest {
  id: number
}

export interface CreateTriageMeasurementRequest {
  visitSessionId: number
  systolicBp?: number
  diastolicBp?: number
  rbsValue?: number
  rbsUnit?: string
  iopRight?: number
  iopLeft?: number
  weightKg?: number
  notes?: string
  measurementDate?: string
}

export interface UpdateTriageMeasurementRequest {
  systolicBp?: number
  diastolicBp?: number
  rbsValue?: number
  rbsUnit?: string
  iopRight?: number
  iopLeft?: number
  weightKg?: number
  notes?: string
  measurementDate?: string
}

export interface UpdatePatientVisitSessionRequest {
  visitPurpose?: VisitPurpose
  chiefComplaint?: string
  consultationFeeAmount?: number
}

export interface PatientVisitSessionStatistics {
  totalVisits: number
  completedVisits: number
  cancelledVisits: number
  noShowVisits: number
  emergencyVisits: number
  averageConsultationFee: number
  totalRevenue: number
  visitsByStatus: Record<VisitStatus, number>
  visitsByPurpose: Record<VisitPurpose, number>
}

export enum VisitPurpose {
  NEW_CONSULTATION = 'NEW_CONSULTATION',
  FOLLOW_UP = 'FOLLOW_UP',
  MEDICATION_REFILL = 'MEDICATION_REFILL',
  REVIEW = 'REVIEW',
  EMERGENCY = 'EMERGENCY',
  SURGERY = 'SURGERY',
  ROUTINE_CHECKUP = 'ROUTINE_CHECKUP',
  COMPLAINT_VISIT = 'COMPLAINT_VISIT'
}

export enum VisitStage {
  RECEPTION = 'RECEPTION',
  CASHIER = 'CASHIER',
  TRIAGE = 'TRIAGE',
  BASIC_REFRACTION_EXAM = 'BASIC_REFRACTION_EXAM',
  DOCTOR_VISIT = 'DOCTOR_VISIT',
  PHARMACY = 'PHARMACY',
  COMPLETED = 'COMPLETED'
}

export enum VisitStatus {
  REGISTERED = 'REGISTERED',
  FREE = 'FREE',
  INVOICE_CREATED = 'INVOICE_CREATED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  TRIAGE_COMPLETED = 'TRIAGE_COMPLETED',
  BASIC_REFRACTION_COMPLETED = 'BASIC_REFRACTION_COMPLETED',
  DOCTOR_VISIT_COMPLETED = 'DOCTOR_VISIT_COMPLETED',
  MEDICATION_DISPENSED = 'MEDICATION_DISPENSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export enum EmergencyLevel {
  NONE = 'NONE',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

 

// Main Examination Types (strictly per MAIN_EXAM_CRUD.md)
export type EyeSide = 'R' | 'L' | 'Both'

export interface SlitLampObservationRequest {
  structure: string
  finding: string
  eyeSide: EyeSide
}

export interface SlitLampObservation extends SlitLampObservationRequest {
  id: number
}

export interface MainExam {
  id: number
  visitSessionId: number
  externalRight?: string
  externalLeft?: string
  slitLampObservations?: SlitLampObservation[]
  cdrRight?: number
  cdrLeft?: number
  iopRight?: number
  iopLeft?: number
  advice?: string
  historyComments?: string
  doctorsNotes?: string
  timeCompleted?: string
}

export interface CreateMainExamRequest {
  visitSessionId: number
  externalRight?: string
  externalLeft?: string
  slitLampObservations?: SlitLampObservationRequest[]
  cdrRight?: number
  cdrLeft?: number
  iopRight?: number
  iopLeft?: number
  advice?: string
  historyComments?: string
  doctorsNotes?: string
  timeCompleted?: string
}

export interface UpdateMainExamRequest extends CreateMainExamRequest {
  id: number
}

// Consumables Types
export interface ConsumableCategory {
  id: number
  name: string
  description?: string
  departmentId?: number
  departmentName?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ConsumableItem {
  id: number
  name: string
  description?: string
  categoryId?: number
  categoryName?: string
  sku?: string
  unitOfMeasure: string
  currentStock: number
  minimumStockLevel?: number
  maximumStockLevel?: number
  reorderPoint?: number
  reorderQuantity?: number
  supplierName?: string
  supplierContact?: string
  costPerUnit?: number
  location?: string
  store?: string
  expiryDate?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ConsumableUsage {
  id: number
  consumableItemId: number
  consumableItemName: string
  quantityUsed: number
  usedByUserId?: number
  usedByUserName?: string
  departmentId?: number
  departmentName?: string
  usageDate: string
  purpose?: string
  patientId?: number
  patientName?: string
  visitSessionId?: number
  notes?: string
  createdAt: string
}

export interface ConsumableRestock {
  id: number
  consumableItemId: number
  consumableItemName: string
  quantityAdded: number
  restockDate: string
  restockedByUserId?: number
  restockedByUserName?: string
  supplierName?: string
  costPerUnit?: number
  totalCost?: number
  invoiceNumber?: string
  expiryDate?: string
  notes?: string
  createdAt: string
}

export interface CreateConsumableCategoryRequest {
  name: string
  description?: string
  departmentId?: number
  isActive?: boolean
}

export interface CreateConsumableItemRequest {
  name: string
  description?: string
  categoryId?: number
  sku?: string
  unitOfMeasure: string
  currentStock?: number
  minimumStockLevel?: number
  maximumStockLevel?: number
  reorderPoint?: number
  reorderQuantity?: number
  supplierName?: string
  supplierContact?: string
  costPerUnit?: number
  location?: string
  store?: string
  expiryDate?: string
  isActive?: boolean
}

export interface CreateConsumableUsageRequest {
  consumableItemId: number
  quantityUsed: number
  departmentId?: number
  purpose?: string
  patientId?: number
  visitSessionId?: number
  notes?: string
  usageDate?: string
}

export interface CreateConsumableRestockRequest {
  consumableItemId: number
  quantityAdded: number
  supplierName?: string
  costPerUnit?: number
  totalCost?: number
  invoiceNumber?: string
  expiryDate?: string
  notes?: string
  restockDate?: string
}

// Diagnosis Types
export interface DiagnosisCategory {
  id: number
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Diagnosis {
  id: number
  name: string
  description?: string
  categoryId: number
  categoryName: string
  createdAt: string
  updatedAt: string
}

export interface CreateDiagnosisCategoryRequest {
  name: string
  description?: string
}

export interface CreateDiagnosisRequest {
  name: string
  description?: string
  categoryId: number
}

// Patient Diagnosis Types
export interface PatientDiagnosis {
  id: number
  visitSessionId: number
  diagnosis: Diagnosis
  diagnosisDate: string
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'CRITICAL'
  eyeSide?: 'LEFT' | 'RIGHT' | 'BOTH' | 'L' | 'R' | 'Both'
  notes?: string
  isPrimaryDiagnosis: boolean
  isConfirmed: boolean
  diagnosedBy?: string
  createdAt: string
  updatedAt: string
}

export interface CreatePatientDiagnosisRequest {
  visitSessionId: number
  diagnosisId: number
  severity?: 'MILD' | 'MODERATE' | 'SEVERE' | 'CRITICAL'
  eyeSide?: 'LEFT' | 'RIGHT' | 'BOTH' | 'L' | 'R' | 'Both'
  notes?: string
  isPrimaryDiagnosis?: boolean
  isConfirmed?: boolean
  diagnosedBy?: string
}

// Investigation Types
export interface InvestigationType {
  id: number
  name: string
  normalRange?: string
  unit?: string
  description?: string
  price?: number
}

export interface PatientInvestigation {
  id: number
  visitSessionId: number
  investigationTypeId: number
  investigationName: string
  eyeSide?: 'R' | 'L' | 'Both'
  quantity: number
  cost: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreatePatientInvestigationRequest {
  visitSessionId: number
  investigationTypeId: number
  eyeSide?: 'R' | 'L' | 'Both'
  quantity: number
  cost: number
  notes?: string
}

// Theater Requisition Types
export interface TheaterRequisition {
  id: number
  requisitionNumber: string
  title: string
  description?: string
  requestedByUserId: number
  requestedByUserName: string
  requestedDate: string
  requiredDate?: string
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'FULFILLED' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  departmentId?: number
  departmentName?: string
  patientProcedureId?: number
  patientProcedureName?: string
  approvedByUserId?: number
  approvedByUserName?: string
  approvedDate?: string
  rejectionReason?: string
  notes?: string
  requisitionItems: TheaterRequisitionItem[]
  createdAt: string
  updatedAt: string
}

export interface TheaterRequisitionItem {
  id: number
  requisitionId: number
  consumableItemId: number
  consumableItemName: string
  consumableItemSku?: string
  consumableItemUnit: string
  quantityRequested: number
  quantityApproved: number
  quantityFulfilled: number
  unitCost?: number
  totalCost?: number
  purpose?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateTheaterRequisitionRequest {
  title: string
  description?: string
  requiredDate?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  departmentId?: number
  patientProcedureId?: number
  notes?: string
  requisitionItems: TheaterRequisitionItemRequest[]
}

export interface TheaterRequisitionItemRequest {
  consumableItemId: number
  quantityRequested: number
  purpose?: string
  notes?: string
}

export interface ApproveTheaterRequisitionRequest {
  action: 'APPROVE' | 'REJECT'
  rejectionReason?: string
  itemApprovals?: TheaterRequisitionItemApproval[]
}

export interface TheaterRequisitionItemApproval {
  requisitionItemId: number
  quantityApproved: number
  notes?: string
}

// Theater Procedure Usage Types
export interface TheaterProcedureUsage {
  id: number
  patientProcedureId: number
  patientProcedureName: string
  consumableItemId: number
  consumableItemName: string
  consumableItemSku?: string
  theaterStoreId?: number
  theaterStoreName?: string
  quantityUsed: number
  usedByUserId: number
  usedByUserName: string
  usageDate: string
  batchNumber?: string
  purpose?: string
  notes?: string
  createdAt: string
}

export interface CreateTheaterProcedureUsageRequest {
  patientProcedureId: number
  usageItems: TheaterProcedureUsageItem[]
}

export interface TheaterProcedureUsageItem {
  consumableItemId: number
  theaterStoreId?: number
  quantityUsed: number
  batchNumber?: string
  purpose?: string
  notes?: string
}

// Surgery Report Types
export type AnesthesiaType = 'LOCAL' | 'GENERAL'
export type SurgeryType = 'ELECTIVE' | 'EMERGENCY'
export type SurgeryEyeSide = 'LEFT' | 'RIGHT' | 'BOTH'

export interface SurgeryReportConsumable {
  id: number
  consumableItemId: number
  consumableItemName: string
  consumableItemSku: string
  quantityUsed: number
  notes?: string
}

export interface SurgeryReport {
  id: number
  patientProcedureId: number
  anesthesiaType: AnesthesiaType
  diagnosis?: string
  surgeryType: SurgeryType
  eyeSide?: SurgeryEyeSide
  surgeonName?: string
  assistantName?: string
  comments?: string
  startTime?: string
  endTime?: string
  createdAt: string
  consumableItems?: SurgeryReportConsumable[]
}

export interface CreateSurgeryReportRequest {
  patientProcedureId: number
  anesthesiaType: AnesthesiaType
  diagnosis?: string
  surgeryType: SurgeryType
  eyeSide?: SurgeryEyeSide
  surgeonName?: string
  assistantName?: string
  comments?: string
  startTime?: string
  endTime?: string
  consumableItems?: SurgeryReportConsumableRequest[]
}

export interface SurgeryReportConsumableRequest {
  consumableItemId: number
  quantityUsed: number
  notes?: string
}

export interface UpdateSurgeryReportRequest {
  anesthesiaType?: AnesthesiaType
  diagnosis?: string
  surgeryType?: SurgeryType
  eyeSide?: SurgeryEyeSide
  surgeonName?: string
  assistantName?: string
  comments?: string
  startTime?: string
  endTime?: string
  consumableItems?: SurgeryReportConsumableRequest[]
}

// Theater Store Types
export interface TheaterStore {
  id: number
  name: string
  description?: string
  location: string
  storeType: string
  capacity?: number
  isActive: boolean
  managedByUserId?: number
  managedByUserName?: string
  createdAt: string
  updatedAt: string
  totalItems: number
  totalStock: number
  itemNames: string[]
}

export interface TheaterStoreItem {
  id: number
  theaterStoreId: number
  theaterStoreName: string
  consumableItemId: number
  consumableItemName: string
  consumableItemSku: string
  quantityAvailable: number
  minimumQuantity: number
  maximumQuantity: number
  batchNumber?: string
  isSterile: boolean
}

export interface CreateTheaterStoreRequest {
  name: string
  description?: string
  location: string
  storeType: string
  capacity?: number
  isActive: boolean
  managedByUserId?: number
}