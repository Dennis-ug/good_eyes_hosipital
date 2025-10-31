import { 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenRequest,
  CreateUserRequest,
  ChangePasswordRequest,
  ChangePasswordResponse,
  AssignDepartmentRequest,
  Department,
  CreateDepartmentRequest,
  Patient,
  CreatePatientRequest,
  EyeExamination,
  CreateEyeExaminationRequest,
  Role,
  CreateRoleRequest,
  Permission,
  CreatePermissionRequest,
  PatientReception,
  User,
  ApiErrorResponse,
  Pageable,
  Page,
  Appointment,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  UpdateAppointmentStatusRequest,
  CancelAppointmentRequest,
  RescheduleAppointmentRequest,
  DoctorAvailabilityRequest,
  DoctorAvailabilityResponse,
  ConflictCheckRequest,
  ConflictCheckResponse,
  BatchAvailabilityRequest,
  DoctorSchedule,
  CreateDoctorScheduleRequest,
  UpdateDoctorScheduleRequest,
  Invoice,
  RecordPaymentRequest,
  FinancialSummary,
  InventoryCategory,
  CreateInventoryCategoryRequest,
  InventoryItem,
  CreateInventoryItemRequest,
  CreatePatientVisitSessionRequest,
  PatientVisitSession,
  UpdatePatientVisitSessionRequest,
  MarkFeePaidRequest,
  VisitStatus,
  VisitStage,
  VisitPurpose,
  InvestigationType,
  PatientVisitSessionStatistics,
  DeleteVisitSessionResponse,
  TriageMeasurement,
  CreateTriageMeasurementRequest,
  UpdateTriageMeasurementRequest,
  BasicRefractionExam,
  CreateBasicRefractionExamRequest,
  UpdateBasicRefractionExamRequest,
  MainExam,
  CreateMainExamRequest,
  UpdateMainExamRequest,
  ConsumableCategory,
  ConsumableItem,
  ConsumableUsage,
  ConsumableRestock,
  CreateConsumableCategoryRequest,
  CreateConsumableItemRequest,
  CreateConsumableUsageRequest,
  CreateConsumableRestockRequest,
  DiagnosisCategory,
  Diagnosis,
  CreateDiagnosisCategoryRequest,
  CreateDiagnosisRequest,
  PatientDiagnosis,
  CreatePatientDiagnosisRequest,
  Procedure,
  PatientProcedure,
  CreatePatientProcedureRequest,
  TheaterRequisition,
  CreateTheaterRequisitionRequest,
  ApproveTheaterRequisitionRequest,
  TheaterProcedureUsage,
  CreateTheaterProcedureUsageRequest,
  TheaterStore,
  CreateTheaterStoreRequest,
  TheaterStoreItem,
  SurgeryReport,
  CreateSurgeryReportRequest,
  UpdateSurgeryReportRequest,
  SurgeryReportConsumable,
  SurgeryReportConsumableRequest
} from './types'
import { shouldRefreshToken } from './auth-utils'

// Backend base URL from environment variables with fallback
const API_BASE_URL = (() => {
  // During build time, provide a fallback
  if (typeof process === 'undefined') {
    return 'http://localhost:5025/api'
  }

  // Client-side: use environment variable or fallback
  const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL
  return envUrl || 'http://localhost:5025/api'
})()

// Debug environment variables (only in development)
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('Environment variables debug:')
  console.log('process.env.BACKEND_URL:', process.env.BACKEND_URL)
  console.log('process.env.NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL)
  console.log('Final API_BASE_URL:', API_BASE_URL)
} 

// Utility function to safely parse JSON
function safeJsonParse(text: string, endpoint: string): unknown {
  try {
    return JSON.parse(text)
  } catch (error) {
    console.error(`JSON Parse Error for ${endpoint}:`, error)
    console.error('Raw response text length:', text.length)
    console.error('Raw response text (first 500 chars):', text.substring(0, 500))
    console.error('Raw response text (last 500 chars):', text.substring(Math.max(0, text.length - 500)))
    
    // Handle common JSON issues
    if (text.includes('<!DOCTYPE html>') || text.includes('<html>')) {
      throw new Error('Response is HTML, not JSON. Server might be returning an error page.')
    }
    
    if (text.includes('Unexpected token') && text.includes('JSON')) {
      throw new Error('Invalid JSON format detected.')
    }
    
    if (error instanceof SyntaxError && error.message.includes('position')) {
      const match = error.message.match(/position (\d+)/)
      if (match) {
        const position = parseInt(match[1])
        console.error('Error at position:', position)
        console.error('Character at error position:', text.charAt(position))
        console.error('Context around error (50 chars before and after):', 
          text.substring(Math.max(0, position - 50), position + 50))
        
        // Try to find the end of valid JSON
        let jsonEnd = position
        for (let i = position - 1; i >= 0; i--) {
          if (text.charAt(i) === '}') {
            // Found a closing brace, check if it's the end of the JSON
            const beforeBrace = text.substring(0, i + 1)
            try {
              JSON.parse(beforeBrace)
              jsonEnd = i + 1
              console.log('Found valid JSON ending at position:', jsonEnd)
              break
            } catch (e) {
              // Continue searching
            }
          }
        }
        
        if (jsonEnd < position) {
          const validJson = text.substring(0, jsonEnd)
          console.log('Attempting to parse truncated JSON...')
          try {
            const result = JSON.parse(validJson)
            console.log('Successfully parsed truncated JSON')
            return result
          } catch (truncatedError) {
            console.error('Truncated JSON also failed:', truncatedError)
          }
        }
      }
    }
    
    const trimmedText = text.trim()
    if (trimmedText !== text) {
      console.log('Attempting to parse trimmed text...')
      try {
        return JSON.parse(trimmedText)
      } catch (trimmedError) {
        console.error('Trimmed text also failed to parse:', trimmedError)
      }
    }
    
    // Try to extract JSON from the response by finding the first { and last }
    try {
      const jsonStart = text.indexOf('{')
      const jsonEnd = text.lastIndexOf('}')
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const potentialJson = text.substring(jsonStart, jsonEnd + 1)
        console.log('Attempting to extract JSON from response...')
        console.log('Extracted JSON length:', potentialJson.length)
        console.log('Extracted JSON (first 200 chars):', potentialJson.substring(0, 200))
        return JSON.parse(potentialJson)
      }
    } catch (extractError) {
      console.error('JSON extraction also failed:', extractError)
    }
    
    // Try to find JSON array if object extraction failed
    try {
      const arrayStart = text.indexOf('[')
      const arrayEnd = text.lastIndexOf(']')
      
      if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
        const potentialArray = text.substring(arrayStart, arrayEnd + 1)
        console.log('Attempting to extract JSON array from response...')
        console.log('Extracted array length:', potentialArray.length)
        return JSON.parse(potentialArray)
      }
    } catch (arrayError) {
      console.error('JSON array extraction also failed:', arrayError)
    }
    
    // Last resort: try to clean the text by removing common problematic characters
    try {
      let cleanedText = text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\t/g, ' ')
        .replace(/\f/g, ' ')
        .replace(/\v/g, ' ')
      
      // Remove any characters after the last valid JSON structure
      const lastBrace = cleanedText.lastIndexOf('}')
      const lastBracket = cleanedText.lastIndexOf(']')
      const lastJsonChar = Math.max(lastBrace, lastBracket)
      
      if (lastJsonChar > 0) {
        cleanedText = cleanedText.substring(0, lastJsonChar + 1)
        console.log('Attempting to parse cleaned text...')
        return JSON.parse(cleanedText)
      }
    } catch (cleanedError) {
      console.error('Cleaned text also failed:', cleanedError)
    }
    
    throw new Error(`Invalid JSON response: ${error instanceof Error ? error.message : 'Unknown parse error'}`)
  }
}

// Main Exam API (strictly per MAIN_EXAM_CRUD.md)
export const mainExamApi = {
  create: (data: CreateMainExamRequest): Promise<MainExam> => {
    return apiRequest<MainExam>('/main-exams', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  getById: (id: number): Promise<MainExam> => {
    return apiRequest<MainExam>(`/main-exams/${id}`)
  },
  getByVisitSession: (visitSessionId: number): Promise<MainExam> => {
    return apiRequest<MainExam>(`/main-exams/visit-session/${visitSessionId}`)
  },
  getAll: (pageable?: Pageable): Promise<Page<MainExam>> => {
    const params = new URLSearchParams()
    if (pageable?.page !== undefined) params.append('page', pageable.page.toString())
    if (pageable?.size !== undefined) params.append('size', pageable.size.toString())
    if (pageable?.sort) params.append('sort', pageable.sort)
    const endpoint = params.toString() ? `/main-exams?${params.toString()}` : '/main-exams'
    return apiRequest<unknown>(endpoint).then((resp) => {
      // Case 1: Backend returns Spring Page shape
      if (resp && typeof resp === 'object' && 'content' in resp && Array.isArray((resp as Page<MainExam>).content)) {
        return resp as Page<MainExam>
      }

      // Case 2: Backend returns a bare array
      if (Array.isArray(resp)) {
        const arr = resp as MainExam[]
        const effectiveSize = pageable?.size || arr.length || 0
        const pageNumber = pageable?.page || 0
        return {
          content: arr,
          totalElements: arr.length,
          totalPages: 1,
          size: effectiveSize,
          number: pageNumber,
          first: true,
          last: true,
          numberOfElements: arr.length,
          empty: arr.length === 0,
          pageable: {
            pageNumber,
            pageSize: effectiveSize,
            sort: { empty: true, sorted: false, unsorted: true },
            offset: pageNumber * effectiveSize,
            paged: true,
            unpaged: false,
          },
          sort: { empty: true, sorted: false, unsorted: true },
        } as Page<MainExam>
      }

      // Fallback: Try to coerce unknown shapes into Page<MainExam>
      const respObj = resp as Record<string, unknown>
      const content = respObj?.content && Array.isArray(respObj.content) ? respObj.content as MainExam[] : []
      const totalElements = Number(respObj?.totalElements ?? content.length ?? 0)
      const totalPages = Number(respObj?.totalPages ?? 1)
      const size = Number(respObj?.size ?? pageable?.size ?? content.length ?? 0)
      const number = Number(respObj?.number ?? pageable?.page ?? 0)
      const first = Boolean(respObj?.first ?? true)
      const last = Boolean(respObj?.last ?? true)
      const numberOfElements = Number(respObj?.numberOfElements ?? content.length ?? 0)
      const empty = Boolean(respObj?.empty ?? content.length === 0)
      const pageableNormalized = respObj?.pageable ?? {
        pageNumber: number,
        pageSize: size,
        sort: { empty: true, sorted: false, unsorted: true },
        offset: number * size,
        paged: true,
        unpaged: false,
      }
      const sortNormalized = respObj?.sort ?? { empty: true, sorted: false, unsorted: true }

      return {
        content,
        totalElements,
        totalPages,
        size,
        number,
        first,
        last,
        numberOfElements,
        empty,
        pageable: pageableNormalized,
        sort: sortNormalized,
      } as Page<MainExam>
    })
  },
  update: (id: number, data: UpdateMainExamRequest): Promise<MainExam> => {
    return apiRequest<MainExam>(`/main-exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
  delete: (id: number): Promise<void> => {
    return apiRequest<void>(`/main-exams/${id}`, {
      method: 'DELETE',
    })
  },
}
class ApiRequestError extends Error {
  constructor(
    public status: number,
    public message: string,
    public error: string,
    public path: string,
    public timestamp: string
  ) {
    super(message)
    this.name = 'ApiRequestError'
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  // Add auth token if available
  const token = localStorage.getItem('accessToken')
  if (token) {
    // Check if token needs refresh before making request
    if (shouldRefreshToken(token)) {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken && retryCount === 0) {
        try {
          const refreshResponse = await authApi.refreshToken(refreshToken)
          localStorage.setItem('accessToken', refreshResponse.accessToken)
          localStorage.setItem('refreshToken', refreshResponse.refreshToken)
          // Update token for this request
          config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${refreshResponse.accessToken}`,
          }
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          window.location.href = '/login'
          throw new ApiRequestError(
            401,
            'Authentication expired. Please login again.',
            'AUTH_EXPIRED',
            endpoint,
            new Date().toISOString()
          )
        }
      } else {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${token}`,
        }
      }
    } else {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      }
    }
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && retryCount === 0) {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          try {
            const refreshResponse = await authApi.refreshToken(refreshToken)
            localStorage.setItem('accessToken', refreshResponse.accessToken)
            localStorage.setItem('refreshToken', refreshResponse.refreshToken)
            // Retry the original request with new token
            return apiRequest<T>(endpoint, options, retryCount + 1)
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            window.location.href = '/login'
            throw new ApiRequestError(
              401,
              'Authentication expired. Please login again.',
              'AUTH_EXPIRED',
              endpoint,
              new Date().toISOString()
            )
          }
        }
      }

      // Try to parse error response with better error handling
      let errorData: Record<string, unknown> = {}
      try {
        const errorText = await response.text()
        console.log(`Error Response for ${endpoint}:`, errorText)
        
        if (errorText.trim()) {
          errorData = safeJsonParse(errorText, endpoint) as Record<string, unknown>
        }
      } catch (parseError) {
        console.error(`Error Response Parse Error for ${endpoint}:`, parseError)
        errorData = {
          message: `HTTP ${response.status}: ${response.statusText}`,
          error: 'PARSE_ERROR',
          path: endpoint,
          timestamp: new Date().toISOString()
        }
      }
      
      throw new ApiRequestError(
        response.status,
        (errorData.message as string) || `HTTP ${response.status}: ${response.statusText}`,
        (errorData.error as string) || 'Unknown error',
        (errorData.path as string) || endpoint,
        (errorData.timestamp as string) || new Date().toISOString()
      )
    }

    // Handle 204 No Content responses (common for DELETE operations)
    if (response.status === 204) {
      return undefined as T
    }

    // Try to parse JSON response with better error handling
    try {
      const text = await response.text()
      console.log(`API Response for ${endpoint}:`, text)
      
      if (!text.trim()) {
        throw new Error('Empty response from server')
      }
      
      return safeJsonParse(text, endpoint) as T
    } catch (parseError) {
      throw new ApiRequestError(
        response.status,
        `Invalid JSON response from server: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`,
        'JSON_PARSE_ERROR',
        endpoint,
        new Date().toISOString()
      )
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      // Enhanced error message for backend connection issues
      const errorMessage = `Unable to connect to ${endpoint}. Please check if the backend is running at ${API_BASE_URL}.`
      console.error('Backend Connection Error:', {
        endpoint,
        baseUrl: API_BASE_URL,
        error: error.message,
        suggestion: 'Make sure the backend server is running on port 5025'
      })
      
      throw new ApiRequestError(
        0,
        errorMessage,
        'BACKEND_CONNECTION_ERROR',
        endpoint,
        new Date().toISOString()
      )
    }
    throw error
  }
}

// Authentication API
export const authApi = {
  login: (data: LoginRequest): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  refreshToken: (refreshToken: string): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
  },

  changePassword: (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    return apiRequest<ChangePasswordResponse>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  forgotPassword: (email: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  validateResetToken: (token: string): Promise<{ valid: string; message: string }> => {
    return apiRequest<{ valid: string; message: string }>(`/auth/validate-reset-token?token=${encodeURIComponent(token)}`)
  },

  resetPassword: (payload: { resetToken: string | null; newPassword: string; confirmPassword: string }): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/auth/reset-password`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  testAuth: (): Promise<Record<string, unknown>> => {
    return apiRequest<Record<string, unknown>>('/auth/test')
  },

  createUser: (data: CreateUserRequest): Promise<void> => {
    return apiRequest<void>('/auth/create-user', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  validateSetupToken: (token: string): Promise<{ valid: string; message: string }> => {
    return apiRequest<{ valid: string; message: string }>(`/auth/validate-setup-token?token=${encodeURIComponent(token)}`)
  },

  setupPassword: (payload: { resetToken: string | null; newPassword: string; confirmPassword: string }): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/auth/setup-password`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}

// User Management API
export const userManagementApi = {
  getAllUsers: (pageable?: Pageable): Promise<Page<User>> => {
    const params = new URLSearchParams()
    if (pageable?.page !== undefined) params.append('page', pageable.page.toString())
    if (pageable?.size !== undefined) params.append('size', pageable.size.toString())
    if (pageable?.sort) params.append('sort', pageable.sort)
    
    const queryString = params.toString()
    const endpoint = queryString ? `/user-management/users?${queryString}` : '/user-management/users'
    return apiRequest<Page<User>>(endpoint)
  },

  getAllUsersWithFilters: (
    filters: { search?: string; role?: string; status?: string },
    pageable?: Pageable
  ): Promise<Page<User>> => {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    if (filters.role) params.append('role', filters.role)
    if (filters.status) params.append('status', filters.status)
    if (pageable?.page !== undefined) params.append('page', pageable.page.toString())
    if (pageable?.size !== undefined) params.append('size', pageable.size.toString())
    if (pageable?.sort) params.append('sort', pageable.sort)
    const qs = params.toString()
    const endpoint = qs ? `/user-management/users?${qs}` : '/user-management/users'
    return apiRequest<Page<User>>(endpoint)
  },

  getUserById: (id: number): Promise<User> => {
    return apiRequest<User>(`/user-management/users/${id}`)
  },

  getUsersByDepartment: (departmentId: number, pageable?: Pageable): Promise<Page<User>> => {
    const params = new URLSearchParams()
    if (pageable?.page !== undefined) params.append('page', pageable.page.toString())
    if (pageable?.size !== undefined) params.append('size', pageable.size.toString())
    if (pageable?.sort) params.append('sort', pageable.sort)
    
    const queryString = params.toString()
    const endpoint = queryString ? `/user-management/users/department/${departmentId}?${queryString}` : `/user-management/users/department/${departmentId}`
    return apiRequest<Page<User>>(endpoint)
  },

  assignDepartment: (data: AssignDepartmentRequest): Promise<void> => {
    return apiRequest<void>('/user-management/assign-department', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  createUser: (data: CreateUserRequest): Promise<void> => {
    return apiRequest<void>('/user-management/users', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  deleteUser: (userId: number): Promise<void> => {
    return apiRequest<void>(`/user-management/users/${userId}`, {
      method: 'DELETE',
    })
  },
  updateUserRoles: (id: number, roleNames: string[]): Promise<void> => {
    return apiRequest<void>(`/user-management/users/${id}/roles`, {
      method: 'PUT',
      body: JSON.stringify(roleNames),
    })
  },
  updateUser: (id: number, data: {
    username?: string
    email?: string
    firstName?: string
    lastName?: string
    departmentId?: number
    enabled?: boolean
  }): Promise<User> => {
    return apiRequest<User>(`/user-management/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  sendInvitation: (data: {
    email: string
    firstName: string
    lastName: string
    roles: string[]
    departmentId?: number
    customMessage?: string
  }): Promise<{ message: string; invitationId: string }> => {
    return apiRequest<{ message: string; invitationId: string }>('/user-management/invitations', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

// Patient API
export const patientApi = {
  getAll: (pageable?: Pageable): Promise<Page<Patient>> => {
    const params = new URLSearchParams()
    if (pageable?.page !== undefined) params.append('page', pageable.page.toString())
    if (pageable?.size !== undefined) params.append('size', pageable.size.toString())
    if (pageable?.sort) params.append('sort', pageable.sort)
    
    const queryString = params.toString()
    const endpoint = queryString ? `/patients?${queryString}` : '/patients'
    return apiRequest<Page<Patient>>(endpoint)
  },

  getAllSortedByLatest: (): Promise<Patient[]> => {
    return apiRequest<Patient[]>('/patients/all')
  },

  // Search patients with backend query
  search: (query: string, pageable?: Pageable): Promise<Page<Patient>> => {
    const params = new URLSearchParams()
    if (query && query.trim()) {
      params.append('query', query.trim())
    }
    if (pageable?.page !== undefined) params.append('page', pageable.page.toString())
    if (pageable?.size !== undefined) params.append('size', pageable.size.toString())
    if (pageable?.sort) params.append('sort', pageable.sort)
    
    const queryString = params.toString()
    const endpoint = queryString ? `/patients/search?${queryString}` : '/patients/search'
    return apiRequest<Page<Patient>>(endpoint)
  },

  getById: (id: number): Promise<Patient> => {
    return apiRequest<Patient>(`/patients/${id}`)
  },

  create: (data: CreatePatientRequest): Promise<Patient> => {
    return apiRequest<Patient>('/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: (id: number, data: Partial<CreatePatientRequest>): Promise<Patient> => {
    return apiRequest<Patient>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: (id: number): Promise<void> => {
    return apiRequest<void>(`/patients/${id}`, {
      method: 'DELETE',
    })
  },
}

// Eye Examination API
export const eyeExaminationApi = {
  create: (data: CreateEyeExaminationRequest): Promise<EyeExamination> => {
    return apiRequest<EyeExamination>('/eye-examinations', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getAll: (pageable?: Pageable): Promise<Page<EyeExamination>> => {
    const params = new URLSearchParams()
    if (pageable?.page !== undefined) params.append('page', pageable.page.toString())
    if (pageable?.size !== undefined) params.append('size', pageable.size.toString())
    if (pageable?.sort) params.append('sort', pageable.sort)
    
    const queryString = params.toString()
    const endpoint = queryString ? `/eye-examinations?${queryString}` : '/eye-examinations'
    return apiRequest<Page<EyeExamination>>(endpoint)
  },

  getExaminationsByStatus: (status: string, pageable?: Pageable): Promise<Page<EyeExamination>> => {
    const params = new URLSearchParams()
    if (pageable?.page !== undefined) params.append('page', pageable.page.toString())
    if (pageable?.size !== undefined) params.append('size', pageable.size.toString())
    if (pageable?.sort) params.append('sort', pageable.sort)
    
    const queryString = params.toString()
    const endpoint = queryString ? `/eye-examinations/status/${status}?${queryString}` : `/eye-examinations/status/${status}`
    return apiRequest<Page<EyeExamination>>(endpoint)
  },

  getPatientExaminations: (patientId: number, pageable?: Pageable): Promise<Page<EyeExamination>> => {
    const params = new URLSearchParams()
    if (pageable?.page !== undefined) params.append('page', pageable.page.toString())
    if (pageable?.size !== undefined) params.append('size', pageable.size.toString())
    if (pageable?.sort) params.append('sort', pageable.sort)
    
    const queryString = params.toString()
    const endpoint = queryString ? `/eye-examinations/patient/${patientId}?${queryString}` : `/eye-examinations/patient/${patientId}`
    return apiRequest<Page<EyeExamination>>(endpoint)
  },

  getLatestExamination: (patientId: number): Promise<EyeExamination> => {
    return apiRequest<EyeExamination>(`/eye-examinations/patient/${patientId}/latest`)
  },
}

// Reception API
export const receptionApi = {
  receiveNewPatient: (data: CreatePatientRequest): Promise<Patient> => {
    return apiRequest<Patient>('/reception/receive-new-patient', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  receiveReturningPatient: (patientId: number): Promise<Patient> => {
    return apiRequest<Patient>(`/reception/receive-returning-patient/${patientId}`, {
      method: 'POST',
    })
  },

  getPatientsReceivedToday: (pageable?: Pageable): Promise<Page<PatientReception>> => {
    const params = new URLSearchParams()
    if (pageable?.page !== undefined) params.append('page', pageable.page.toString())
    if (pageable?.size !== undefined) params.append('size', pageable.size.toString())
    if (pageable?.sort) params.append('sort', pageable.sort)
    
    const queryString = params.toString()
    const endpoint = queryString ? `/reception/patients-received-today?${queryString}` : '/reception/patients-received-today'
    return apiRequest<Page<PatientReception>>(endpoint)
  },
}

// Optometry API
export const optometryApi = {
  examinePatient: (patientId: number, data: CreateEyeExaminationRequest): Promise<EyeExamination> => {
    return apiRequest<EyeExamination>(`/optometry/examine-patient/${patientId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getPatientsForExamination: (pageable?: Pageable): Promise<Page<Patient>> => {
    const params = new URLSearchParams()
    if (pageable?.page !== undefined) params.append('page', pageable.page.toString())
    if (pageable?.size !== undefined) params.append('size', pageable.size.toString())
    if (pageable?.sort) params.append('sort', pageable.sort)
    
    const queryString = params.toString()
    const endpoint = queryString ? `/optometry/patients-for-examination?${queryString}` : '/optometry/patients-for-examination'
    return apiRequest<Page<Patient>>(endpoint)
  },

  getPatientsWithDiagnosis: (diagnosis: string, pageable?: Pageable): Promise<Page<EyeExamination>> => {
    const params = new URLSearchParams()
    if (pageable?.page !== undefined) params.append('page', pageable.page.toString())
    if (pageable?.size !== undefined) params.append('size', pageable.size.toString())
    if (pageable?.sort) params.append('sort', pageable.sort)
    
    const queryString = params.toString()
    const endpoint = queryString ? `/optometry/patients-with-diagnosis/${diagnosis}?${queryString}` : `/optometry/patients-with-diagnosis/${diagnosis}`
    return apiRequest<Page<EyeExamination>>(endpoint)
  },
}

// Department API
export const departmentApi = {
  getAll: (pageable?: Pageable): Promise<Page<Department>> => {
    const params = new URLSearchParams()
    if (pageable?.page !== undefined) params.append('page', pageable.page.toString())
    if (pageable?.size !== undefined) params.append('size', pageable.size.toString())
    if (pageable?.sort) params.append('sort', pageable.sort)
    
    const queryString = params.toString()
    const endpoint = queryString ? `/departments?${queryString}` : '/departments'
    return apiRequest<Page<Department>>(endpoint)
  },

  getById: (id: number): Promise<Department> => {
    return apiRequest<Department>(`/departments/${id}`)
  },

  create: (data: CreateDepartmentRequest): Promise<Department> => {
    return apiRequest<Department>('/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: (id: number, data: Partial<CreateDepartmentRequest>): Promise<Department> => {
    return apiRequest<Department>(`/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: (id: number): Promise<void> => {
    return apiRequest<void>(`/departments/${id}`, {
      method: 'DELETE',
    })
  },
}

// Admin API (Roles & Permissions)
export const adminApi = {
  // Roles
  getAllRoles: (pageable?: Pageable): Promise<Page<Role>> => {
    const params = new URLSearchParams()
    if (pageable?.page !== undefined) params.append('page', pageable.page.toString())
    if (pageable?.size !== undefined) params.append('size', pageable.size.toString())
    if (pageable?.sort) params.append('sort', pageable.sort)
    
    const queryString = params.toString()
    const endpoint = queryString ? `/admin/roles?${queryString}` : '/admin/roles'
    return apiRequest<Page<Role>>(endpoint)
  },

  getRoleById: (id: number): Promise<Role> => {
    return apiRequest<Role>(`/admin/roles/${id}`)
  },

  createRole: (data: CreateRoleRequest): Promise<Role> => {
    return apiRequest<Role>('/admin/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateRole: (id: number, data: CreateRoleRequest): Promise<Role> => {
    return apiRequest<Role>(`/admin/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  deleteRole: (id: number): Promise<void> => {
    return apiRequest<void>(`/admin/roles/${id}`, {
      method: 'DELETE',
    })
  },

  // Permissions
  getAllPermissions: (pageable?: Pageable): Promise<Page<Permission>> => {
    const params = new URLSearchParams()
    if (pageable?.page !== undefined) params.append('page', pageable.page.toString())
    if (pageable?.size !== undefined) params.append('size', pageable.size.toString())
    if (pageable?.sort) params.append('sort', pageable.sort)
    
    const queryString = params.toString()
    const endpoint = queryString ? `/admin/permissions?${queryString}` : '/admin/permissions'
    return apiRequest<Page<Permission>>(endpoint)
  },

  getPermissionById: (id: number): Promise<Permission> => {
    return apiRequest<Permission>(`/admin/permissions/${id}`)
  },

  createPermission: (data: CreatePermissionRequest): Promise<Permission> => {
    return apiRequest<Permission>('/admin/permissions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updatePermission: (id: number, data: CreatePermissionRequest): Promise<Permission> => {
    return apiRequest<Permission>(`/admin/permissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  deletePermission: (id: number): Promise<void> => {
    return apiRequest<void>(`/admin/permissions/${id}`, {
      method: 'DELETE',
    })
  },
}

// Appointment API
export const appointmentApi = {
  createAppointment: (data: CreateAppointmentRequest): Promise<Appointment> => {
    return apiRequest<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getAppointments: (pageable?: Pageable): Promise<Page<Appointment>> => {
    const params = new URLSearchParams()
    if (pageable?.page !== undefined) params.append('page', pageable.page.toString())
    if (pageable?.size !== undefined) params.append('size', pageable.size.toString())
    if (pageable?.sort) params.append('sort', pageable.sort)
    
    const queryString = params.toString()
    const endpoint = queryString ? `/appointments?${queryString}` : '/appointments'
    return apiRequest<Page<Appointment>>(endpoint)
  },

  getAppointmentById: (id: number): Promise<Appointment> => {
    return apiRequest<Appointment>(`/appointments/${id}`)
  },

  updateAppointment: (id: number, data: UpdateAppointmentRequest): Promise<Appointment> => {
    return apiRequest<Appointment>(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  deleteAppointment: (id: number): Promise<void> => {
    return apiRequest<void>(`/appointments/${id}`, {
      method: 'DELETE',
    })
  },

  updateAppointmentStatus: (id: number, data: UpdateAppointmentStatusRequest): Promise<Appointment> => {
    return apiRequest<Appointment>(`/appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  cancelAppointment: (id: number, data: CancelAppointmentRequest): Promise<Appointment> => {
    return apiRequest<Appointment>(`/appointments/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  rescheduleAppointment: (id: number, data: RescheduleAppointmentRequest): Promise<Appointment> => {
    return apiRequest<Appointment>(`/appointments/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  checkDoctorAvailability: (data: DoctorAvailabilityRequest): Promise<DoctorAvailabilityResponse> => {
    return apiRequest<DoctorAvailabilityResponse>('/appointments/check-availability', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  checkAppointmentConflict: (data: ConflictCheckRequest): Promise<ConflictCheckResponse> => {
    const params = new URLSearchParams({
      doctorId: data.doctorId.toString(),
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime
    })
    return apiRequest<boolean>(`/appointments/conflicts/check?${params.toString()}`, {
      method: 'GET',
    }).then(hasConflict => ({
      hasConflict,
      conflictingAppointments: []
    }))
  },

  checkBatchAvailability: (data: BatchAvailabilityRequest): Promise<Record<string, boolean>> => {
    return apiRequest<Record<string, boolean>>('/appointments/availability/batch-check', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

// Doctor Schedule API
export const doctorScheduleApi = {
  createSchedule: (data: CreateDoctorScheduleRequest): Promise<DoctorSchedule> => {
    return apiRequest<DoctorSchedule>('/doctor-schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateSchedule: (id: number, data: UpdateDoctorScheduleRequest): Promise<DoctorSchedule> => {
    return apiRequest<DoctorSchedule>(`/doctor-schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  deleteSchedule: (id: number): Promise<Record<string, unknown>> => {
    console.log(`Deleting schedule with ID: ${id}`)
    return apiRequest<Record<string, unknown>>(`/doctor-schedules/${id}`, {
      method: 'DELETE',
    }).then(response => {
      console.log('Delete schedule response:', response)
      return response
    })
  },

  getScheduleById: (id: number): Promise<DoctorSchedule> => {
    return apiRequest<DoctorSchedule>(`/doctor-schedules/${id}`)
  },

  getSchedulesByDoctor: (doctorId: number): Promise<DoctorSchedule[]> => {
    return apiRequest<DoctorSchedule[]>(`/doctor-schedules/doctor/${doctorId}`)
  },

  getAvailableSchedulesByDoctor: (doctorId: number): Promise<DoctorSchedule[]> => {
    return apiRequest<DoctorSchedule[]>(`/doctor-schedules/doctor/${doctorId}/available`)
  },

  getAllAvailableSchedules: (): Promise<Page<DoctorSchedule>> => {
    console.log('Calling getAllAvailableSchedules API...')
    return apiRequest<DoctorSchedule[] | Page<DoctorSchedule>>('/doctor-schedules/available').then(response => {
      // Handle both array and paginated responses
      if (Array.isArray(response)) {
        console.log('API returned array, converting to Page format...')
        return {
          content: response,
          pageable: {
            pageNumber: 0,
            pageSize: response.length,
            sort: { empty: true, sorted: false, unsorted: true },
            offset: 0,
            unpaged: true,
            paged: false
          },
          last: true,
          totalPages: 1,
          totalElements: response.length,
          size: response.length,
          number: 0,
          sort: { empty: true, sorted: false, unsorted: true },
          first: true,
          numberOfElements: response.length,
          empty: response.length === 0
        }
      }
      return response as Page<DoctorSchedule>
    })
  },

  // Alternative method that might work better
  getAllSchedules: (): Promise<Page<DoctorSchedule>> => {
    console.log('Calling getAllSchedules API...')
    return apiRequest<DoctorSchedule[] | Page<DoctorSchedule>>('/doctor-schedules').then(response => {
      // Handle both array and paginated responses
      if (Array.isArray(response)) {
        console.log('API returned array, converting to Page format...')
        return {
          content: response,
          pageable: {
            pageNumber: 0,
            pageSize: response.length,
            sort: { empty: true, sorted: false, unsorted: true },
            offset: 0,
            unpaged: true,
            paged: false
          },
          last: true,
          totalPages: 1,
          totalElements: response.length,
          size: response.length,
          number: 0,
          sort: { empty: true, sorted: false, unsorted: true },
          first: true,
          numberOfElements: response.length,
          empty: response.length === 0
        }
      }
      return response as Page<DoctorSchedule>
    })
  },

  getSchedulesByDay: (dayOfWeek: number): Promise<DoctorSchedule[]> => {
    return apiRequest<DoctorSchedule[]>(`/doctor-schedules/day/${dayOfWeek}`)
  },

  searchSchedulesByDoctorName: (doctorName: string): Promise<DoctorSchedule[]> => {
    return apiRequest<DoctorSchedule[]>(`/doctor-schedules/search?doctorName=${encodeURIComponent(doctorName)}`)
  },

  checkDoctorAvailability: (doctorId: number, dayOfWeek: number): Promise<boolean> => {
    return apiRequest<boolean>(`/doctor-schedules/doctor/${doctorId}/day/${dayOfWeek}/available`)
  },

  getSchedulesByDoctorAndDayRange: (doctorId: number, startDay: number, endDay: number): Promise<DoctorSchedule[]> => {
    return apiRequest<DoctorSchedule[]>(`/doctor-schedules/doctor/${doctorId}/day-range?startDay=${startDay}&endDay=${endDay}`)
  },

  toggleScheduleAvailability: (id: number): Promise<string> => {
    return apiRequest<string>(`/doctor-schedules/${id}/toggle-availability`, {
      method: 'PUT',
    })
  },

  getDayName: (dayOfWeek: number): Promise<string> => {
    return apiRequest<string>(`/doctor-schedules/day-name/${dayOfWeek}`)
  },
}

// Optics API
export const opticsApi = {
  // Frame-related endpoints
  getAllFrameItems: (page: number = 0, size: number = 20): Promise<Page<InventoryItem>> => {
    return apiRequest<Page<InventoryItem>>(`/optics/frames?page=${page}&size=${size}`)
  },

  getFramesByShape: (shape: string, page: number = 0, size: number = 20): Promise<Page<InventoryItem>> => {
    return apiRequest<Page<InventoryItem>>(`/optics/frames/shape/${shape}?page=${page}&size=${size}`)
  },

  getFramesByMaterial: (material: string, page: number = 0, size: number = 20): Promise<Page<InventoryItem>> => {
    return apiRequest<Page<InventoryItem>>(`/optics/frames/material/${material}?page=${page}&size=${size}`)
  },

  getFramesByBrand: (brand: string, page: number = 0, size: number = 20): Promise<Page<InventoryItem>> => {
    return apiRequest<Page<InventoryItem>>(`/optics/frames/brand/${brand}?page=${page}&size=${size}`)
  },

  searchFrameItems: (query: string, page: number = 0, size: number = 20): Promise<Page<InventoryItem>> => {
    return apiRequest<Page<InventoryItem>>(`/optics/frames/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`)
  },

  getFrameItemById: (id: number): Promise<InventoryItem> => {
    return apiRequest<InventoryItem>(`/optics/frames/${id}`)
  },

  checkFrameStockAvailability: (id: number, requiredQuantity: number): Promise<{available: boolean, itemId: number, requiredQuantity: number}> => {
    return apiRequest<{available: boolean, itemId: number, requiredQuantity: number}>(`/optics/frames/${id}/stock?requiredQuantity=${requiredQuantity}`)
  },

  // Get available options
  getAvailableFrameShapes: (): Promise<string[]> => {
    return apiRequest<string[]>('/optics/frames/shapes')
  },

  getAvailableFrameMaterials: (): Promise<string[]> => {
    return apiRequest<string[]>('/optics/frames/materials')
  },

  getAvailableFrameBrands: (): Promise<string[]> => {
    return apiRequest<string[]>('/optics/frames/brands')
  },

  // Unified optical items search (frames and lenses from inventory)
  searchAllOpticalItems: (query: string, page: number = 0, size: number = 20): Promise<Page<InventoryItem>> => {
    return apiRequest<Page<InventoryItem>>(`/optics/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`)
  },

  getAllOpticalItems: (page: number = 0, size: number = 20): Promise<Page<InventoryItem>> => {
    return apiRequest<Page<InventoryItem>>(`/optics/all?page=${page}&size=${size}`)
  },

  getOpticalItemsByType: (opticsType: string, page: number = 0, size: number = 20): Promise<Page<InventoryItem>> => {
    return apiRequest<Page<InventoryItem>>(`/optics/type/${opticsType}?page=${page}&size=${size}`)
  },

  getOpticalItemsByBrand: (brand: string, page: number = 0, size: number = 20): Promise<Page<InventoryItem>> => {
    return apiRequest<Page<InventoryItem>>(`/optics/brand/${brand}?page=${page}&size=${size}`)
  },

  getAvailableOpticalItemBrands: (): Promise<string[]> => {
    return apiRequest<string[]>('/optics/brands')
  },

  getAvailableLensMaterialsFromInventory: (): Promise<string[]> => {
    return apiRequest<string[]>('/optics/lens-materials')
  },

  getAvailableLensTypesFromInventory: (): Promise<string[]> => {
    return apiRequest<string[]>('/optics/lens-types')
  },

  // Validation endpoints
  validateFrameSelection: (visitSessionId: number, frameIds: number[]): Promise<{valid: boolean, visitSessionId: number, itemCount: number}> => {
    return apiRequest<{valid: boolean, visitSessionId: number, itemCount: number}>('/optics/validate-frame-selection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitSessionId, frameIds })
    })
  },

  // Invoice creation - simplified for inventory-based items
  createInvoiceFromItems: (visitSessionId: number, itemSelections: { itemId: number; quantity: number; notes?: string }[]): Promise<Invoice> => {
    return apiRequest<Invoice>(`/appointments/visit-sessions/${visitSessionId}/create-invoice-from-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemSelections)
    })
  }
}

// Finance API
export const financeApi = {
  // Invoice Management
  generateInvoice: (appointmentId: number): Promise<Invoice> => 
    apiRequest(`/finance/invoices/generate/${appointmentId}`, { method: 'POST' }),

  createInvoiceFromProcedures: (visitSessionId: number): Promise<Invoice> => 
    apiRequest(`/appointments/visit-sessions/${visitSessionId}/create-invoice-from-procedures`, { method: 'POST' }),

  createInvoiceFromTreatments: (visitSessionId: number): Promise<Invoice> =>
    apiRequest(`/appointments/visit-sessions/${visitSessionId}/create-invoice-from-treatments`, { method: 'POST' }),

  createInvoice: (data: {
    patientId: number
    doctorId: number
    invoiceDate: string
    dueDate: string
    taxAmount: number
    discountAmount: number
    notes?: string
    internalNotes?: string
    insuranceProvider?: string
    insuranceNumber?: string
    insuranceCoverage?: number
    invoiceItems: Array<{
      itemName: string
      itemDescription: string
      itemType: string
      quantity: number
      unitPrice: number
      discountPercentage: number
      taxPercentage: number
      insuranceCovered: boolean
      insuranceCoveragePercentage: number
      notes: string
      inventoryItemId?: number
      sku?: string
    }>
  }): Promise<Invoice> => 
    apiRequest('/finance/invoices/create', { 
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getInvoiceById: (id: number): Promise<Invoice> => 
    apiRequest(`/finance/invoices/${id}`),

  getInvoiceByNumber: (invoiceNumber: string): Promise<Invoice> => 
    apiRequest(`/finance/invoices/number/${invoiceNumber}`),

  getAllInvoices: (pageable: Pageable): Promise<Page<Invoice>> => 
    apiRequest(`/finance/invoices?${new URLSearchParams({
      page: (pageable.page || 0).toString(),
      size: (pageable.size || 20).toString(),
      sort: pageable.sort || ''
    })}`),

  getInvoicesByPatient: (patientId: number, pageable: Pageable): Promise<Page<Invoice>> => 
    apiRequest(`/finance/invoices/patient/${patientId}?${new URLSearchParams({
      page: (pageable.page || 0).toString(),
      size: (pageable.size || 20).toString(),
      sort: pageable.sort || ''
    })}`),

  // New user-based endpoint (preferred)
  getInvoicesByUser: (userId: number, pageable: Pageable): Promise<Page<Invoice>> => 
    apiRequest(`/finance/invoices/user/${userId}?${new URLSearchParams({
      page: (pageable.page || 0).toString(),
      size: (pageable.size || 20).toString(),
      sort: pageable.sort || ''
    })}`),

  // Deprecated: Use getInvoicesByUser instead
  getInvoicesByDoctor: (doctorId: number, pageable: Pageable): Promise<Page<Invoice>> => 
    apiRequest(`/finance/invoices/doctor/${doctorId}?${new URLSearchParams({
      page: (pageable.page || 0).toString(),
      size: (pageable.size || 20).toString(),
      sort: pageable.sort || ''
    })}`),

  getInvoicesByStatus: (status: string, pageable: Pageable): Promise<Page<Invoice>> => 
    apiRequest(`/finance/invoices/status/${status}?${new URLSearchParams({
      page: (pageable.page || 0).toString(),
      size: (pageable.size || 20).toString(),
      sort: pageable.sort || ''
    })}`),

  getInvoicesByPaymentStatus: (paymentStatus: string, pageable: Pageable): Promise<Page<Invoice>> => 
    apiRequest(`/finance/invoices/payment-status/${paymentStatus}?${new URLSearchParams({
      page: (pageable.page || 0).toString(),
      size: (pageable.size || 20).toString(),
      sort: pageable.sort || ''
    })}`),

  getInvoicesByDateRange: (startDate: string, endDate: string, pageable: Pageable): Promise<Page<Invoice>> => 
    apiRequest(`/finance/invoices/date-range?${new URLSearchParams({
      startDate,
      endDate,
      page: (pageable.page || 0).toString(),
      size: (pageable.size || 20).toString(),
      sort: pageable.sort || ''
    })}`),

  getOverdueInvoices: (): Promise<Invoice[]> => 
    apiRequest('/finance/invoices/overdue'),

  getInvoicesWithBalanceDue: (pageable: Pageable): Promise<Page<Invoice>> => 
    apiRequest(`/finance/invoices/balance-due?${new URLSearchParams({
      page: (pageable.page || 0).toString(),
      size: (pageable.size || 20).toString(),
      sort: pageable.sort || ''
    })}`),

  // Payment Management
  recordPayment: (invoiceId: number, data: RecordPaymentRequest): Promise<Invoice> => 
    apiRequest(`/finance/invoices/${invoiceId}/payment?${new URLSearchParams({
      amount: data.amount.toString(),
      method: data.method,
      ...(data.reference && { reference: data.reference })
    })}`, { method: 'POST' }),

  updateInvoiceStatus: (invoiceId: number, status: string): Promise<Invoice> => 
    apiRequest(`/finance/invoices/${invoiceId}/status?status=${status}`, { method: 'PUT' }),

  deleteInvoice: (invoiceId: number): Promise<void> =>
    apiRequest(`/finance/invoices/${invoiceId}`, { method: 'DELETE' }),

  createInvoiceFromInvestigations: (visitSessionId: number, investigationIds?: number[]): Promise<Invoice> =>
    apiRequest(`/appointments/visit-sessions/${visitSessionId}/create-invoice-from-investigations${investigationIds && investigationIds.length ? `?ids=${investigationIds.join(',')}` : ''}`, { method: 'POST' }),

  // Financial Reporting
  getFinancialSummary: (startDate: string, endDate: string): Promise<FinancialSummary> => 
    apiRequest(`/finance/summary?${new URLSearchParams({ startDate, endDate })}`),
}

// Inventory API
export const inventoryApi = {
  // Category Management
  createCategory: (data: CreateInventoryCategoryRequest): Promise<InventoryCategory> => 
    apiRequest('/inventory/categories', { 
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getAllCategories: (pageable: Pageable, search?: string): Promise<Page<InventoryCategory>> => {
    const params = new URLSearchParams({
      page: (pageable.page || 0).toString(),
      size: (pageable.size || 20).toString(),
      sort: pageable.sort || ''
    })
    if (search) {
      params.append('search', search)
    }
    return apiRequest(`/inventory/categories?${params}`)
  },

  getActiveCategories: (): Promise<InventoryCategory[]> => 
    apiRequest('/inventory/categories/active'),

  searchCategories: (name: string): Promise<InventoryCategory[]> => 
    apiRequest(`/inventory/categories/search?name=${encodeURIComponent(name)}`),

  // Item Management
  createItem: (data: CreateInventoryItemRequest): Promise<InventoryItem> => 
    apiRequest('/inventory/items', { 
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getItemById: (id: number): Promise<InventoryItem> =>
    apiRequest(`/inventory/items/${id}`),

  updateItem: (id: number, data: Partial<CreateInventoryItemRequest>): Promise<InventoryItem> =>
    apiRequest(`/inventory/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  getAllItems: (pageable: Pageable, search?: string): Promise<Page<InventoryItem>> => {
    const params = new URLSearchParams({
      page: (pageable.page || 0).toString(),
      size: (pageable.size || 20).toString(),
      sort: pageable.sort || ''
    })
    if (search) {
      params.append('search', search)
    }
    return apiRequest(`/inventory/items?${params}`)
  },

  getActiveItems: (): Promise<InventoryItem[]> => 
    apiRequest('/inventory/items/active'),

  getItemsByCategory: (categoryId: number): Promise<InventoryItem[]> => 
    apiRequest(`/inventory/items/category/${categoryId}`),

  getLowStockItems: (): Promise<InventoryItem[]> => 
    apiRequest('/inventory/items/low-stock'),

  searchItemsByName: (name: string): Promise<InventoryItem[]> => 
    apiRequest(`/inventory/items/search/name?name=${encodeURIComponent(name)}`),

  updateStockQuantity: (itemId: number, quantity: number): Promise<InventoryItem> => 
    apiRequest(`/inventory/items/${itemId}/stock?quantity=${quantity}`, { 
      method: 'PUT' 
    }),

  getAvailableItemsForInvoice: (): Promise<InventoryItem[]> => 
    apiRequest('/inventory/items/available-for-invoice'),
}

// Test API
export const testApi = {
  public: (): Promise<Record<string, unknown>> => {
    return apiRequest<Record<string, unknown>>('/test/public')
  },

  user: (): Promise<Record<string, unknown>> => {
    return apiRequest<Record<string, unknown>>('/test/user')
  },

  admin: (): Promise<Record<string, unknown>> => {
    return apiRequest<Record<string, unknown>>('/test/admin')
  },

  authenticated: (): Promise<Record<string, unknown>> => {
    return apiRequest<Record<string, unknown>>('/test/authenticated')
  },
}

// Re-export ApiError for convenience
export { ApiRequestError as ApiError } 

// Patient Visit Session API - Updated for Simplified API
export const patientVisitSessionApi = {
  // Create a new visit session
  createVisitSession: (data: CreatePatientVisitSessionRequest): Promise<PatientVisitSession> => {
    return apiRequest<PatientVisitSession>('/patient-visit-sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Get visit session by ID
  getVisitSession: (id: number): Promise<PatientVisitSession> => {
    return apiRequest<PatientVisitSession>(`/patient-visit-sessions/${id}`)
  },

  // Get all visit sessions
  getAllVisitSessions: async (pageable: Pageable, search?: string): Promise<Page<PatientVisitSession>> => {
    const params = new URLSearchParams({
      page: pageable.page.toString(),
      size: pageable.size.toString()
    })
    
    if (search) {
      params.append('search', search)
    }
    
    const queryString = params.toString()
    const endpoint = queryString ? `/patient-visit-sessions?${queryString}` : '/patient-visit-sessions'
    
    try {
      // The API now returns a proper Page object from Spring Data
      const response = await apiRequest<Page<PatientVisitSession>>(endpoint)
      return response
    } catch (error) {
      console.error('Failed to fetch visit sessions:', error)
      throw error
    }
  },

  // Get visit sessions by patient ID
  getVisitSessionsByPatient: (patientId: number): Promise<PatientVisitSession[]> => {
    return apiRequest<PatientVisitSession[]>(`/patient-visit-sessions/patient/${patientId}`)
  },

  // Mark fee as paid
  markFeePaid: (id: number, data: MarkFeePaidRequest): Promise<PatientVisitSession> => {
    return apiRequest<PatientVisitSession>(`/patient-visit-sessions/${id}/mark-fee-paid`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Progress stage
  progressStage: (id: number): Promise<PatientVisitSession> => {
    return apiRequest<PatientVisitSession>(`/patient-visit-sessions/${id}/progress-stage`, {
      method: 'PUT',
    })
  },

  // Update visit session
  updateVisitSession: (id: number, data: UpdatePatientVisitSessionRequest): Promise<PatientVisitSession> => {
    return apiRequest<PatientVisitSession>(`/patient-visit-sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Delete visit session
  deleteVisitSession: (id: number): Promise<DeleteVisitSessionResponse> => {
    return apiRequest<DeleteVisitSessionResponse>(`/patient-visit-sessions/${id}`, {
      method: 'DELETE',
    })
  },

  // Get visit session statistics
  getVisitSessionStatistics: (): Promise<PatientVisitSessionStatistics> => {
    return apiRequest<PatientVisitSessionStatistics>('/patient-visit-sessions/statistics')
  }
}

// Triage Measurement API
export const triageApi = {
  // Create triage measurement
  create: async (data: CreateTriageMeasurementRequest): Promise<TriageMeasurement> => {
    console.log('Triage API create called with data:', data)
    console.log('API Base URL:', API_BASE_URL)
    console.log('Full endpoint:', `${API_BASE_URL}/triage-measurements`)
    console.log('Request body:', JSON.stringify(data, null, 2))
    
    try {
      const result = await apiRequest<TriageMeasurement>('/triage-measurements', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      console.log('Triage API create successful:', result)
      return result
    } catch (error) {
      console.error('Triage API create failed:', error)
      throw error
    }
  },

  // Get triage measurement by ID
  getById: (id: number): Promise<TriageMeasurement> => {
    return apiRequest<TriageMeasurement>(`/triage-measurements/${id}`)
  },

  // Get triage measurement by visit session ID
  getByVisitSession: (visitSessionId: number): Promise<TriageMeasurement> => {
    return apiRequest<TriageMeasurement>(`/triage-measurements/visit-session/${visitSessionId}`)
  },

    // Get all triage measurements
  getAll: async (pageable?: Pageable): Promise<Page<TriageMeasurement>> => {
    console.log('Triage API getAll called with pageable:', pageable)
    console.log('API Base URL:', API_BASE_URL)
    
    const params = new URLSearchParams()
    if (pageable?.page !== undefined) params.append('page', pageable.page.toString())
    if (pageable?.size !== undefined) params.append('size', pageable.size.toString())
    if (pageable?.sort) params.append('sort', pageable.sort)
    
    const queryString = params.toString()
    const endpoint = queryString ? `/triage-measurements?${queryString}` : '/triage-measurements'
    console.log('Full endpoint:', `${API_BASE_URL}${endpoint}`)
    
    try {
      // The API returns an array directly, not a paginated response
      const response = await apiRequest<TriageMeasurement[]>(endpoint)
      console.log('Triage API response (array):', response)

      // Convert array response to Page format
      const page: Page<TriageMeasurement> = {
        content: response,
        totalElements: response.length,
        totalPages: 1,
        size: pageable?.size || 20,
        number: pageable?.page || 0,
        first: true,
        last: true,
        numberOfElements: response.length,
        empty: response.length === 0,
        pageable: {
          pageNumber: pageable?.page || 0,
          pageSize: pageable?.size || 20,
          sort: { empty: true, sorted: false, unsorted: true },
          offset: (pageable?.page || 0) * (pageable?.size || 20),
          paged: true,
          unpaged: false
        },
        sort: { empty: true, sorted: false, unsorted: true }
      }

      return page
    } catch (error) {
      console.error('Failed to fetch triage measurements:', error)
      // Return empty page on error
      const emptyPage: Page<TriageMeasurement> = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: pageable?.size || 20,
        number: pageable?.page || 0,
        first: true,
        last: true,
        numberOfElements: 0,
        empty: true,
        pageable: {
          pageNumber: pageable?.page || 0,
          pageSize: pageable?.size || 20,
          sort: { empty: true, sorted: false, unsorted: true },
          offset: (pageable?.page || 0) * (pageable?.size || 20),
          paged: true,
          unpaged: false
        },
        sort: { empty: true, sorted: false, unsorted: true }
      }
      return emptyPage
    }
  },

  // Update triage measurement
  update: (id: number, data: UpdateTriageMeasurementRequest): Promise<TriageMeasurement> => {
    return apiRequest<TriageMeasurement>(`/triage-measurements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Delete triage measurement
  delete: (id: number): Promise<void> => {
    return apiRequest<void>(`/triage-measurements/${id}`, {
      method: 'DELETE',
    })
  }
}

// Basic Refraction Exam API
export const basicRefractionExamApi = {
  // Build payload restricted to fields supported by BASIC_REFRACTION_EXAM_CRUD.md
  _toCrudPayload: (data: CreateBasicRefractionExamRequest | UpdateBasicRefractionExamRequest) => {
    const payload: Record<string, unknown> = {}
    const keys: (keyof CreateBasicRefractionExamRequest | 'id')[] = [
      // identity
      'visitSessionId',
      // neuro/psych
      'neuroOriented', 'neuroMood', 'pupilsPerrl',
      // pupils
      'pupilsRightDark', 'pupilsRightLight', 'pupilsRightShape', 'pupilsRightReact', 'pupilsRightApd',
      'pupilsLeftDark', 'pupilsLeftLight', 'pupilsLeftShape', 'pupilsLeftReact', 'pupilsLeftApd',
      // visual acuity distance
      'visualAcuityDistanceScRight', 'visualAcuityDistancePhRight', 'visualAcuityDistanceCcRight',
      'visualAcuityDistanceScLeft',  'visualAcuityDistancePhLeft',  'visualAcuityDistanceCcLeft',
      // visual acuity near
      'visualAcuityNearScRight', 'visualAcuityNearCcRight',
      'visualAcuityNearScLeft',  'visualAcuityNearCcLeft',
      // autorefractor
      'manifestAutoRightSphere', 'manifestAutoRightCylinder', 'manifestAutoRightAxis',
      'manifestAutoLeftSphere',  'manifestAutoLeftCylinder',  'manifestAutoLeftAxis',
      // keratometry
      'keratometryK1Right', 'keratometryK2Right', 'keratometryAxisRight',
      'keratometryK1Left',  'keratometryK2Left',  'keratometryAxisLeft',
      // retinoscopy
      'manifestRetRightSphere', 'manifestRetRightCylinder', 'manifestRetRightAxis',
      'manifestRetLeftSphere',  'manifestRetLeftCylinder',  'manifestRetLeftAxis',
      // subjective
      'subjectiveRightSphere', 'subjectiveRightCylinder', 'subjectiveRightAxis',
      'subjectiveLeftSphere',  'subjectiveLeftCylinder',  'subjectiveLeftAxis',
      // additional
      'addedValues', 'bestRightVision', 'bestLeftVision', 'pdRightEye', 'pdLeftEye', 'comment'
    ]
    for (const key of keys) {
      const value = (data as unknown as Record<string, unknown>)[key]
      if (value !== undefined) payload[key] = value
    }
    // include id for update when present
    if ((data as unknown as Record<string, unknown>).id !== undefined) payload.id = (data as unknown as Record<string, unknown>).id
    return payload
  },
  // Create basic refraction exam
  create: async (data: CreateBasicRefractionExamRequest): Promise<BasicRefractionExam> => {
    console.log('Basic Refraction Exam API create called with data:', data)
    console.log('API Base URL:', API_BASE_URL)
    console.log('Full endpoint:', `${API_BASE_URL}/basic-refraction-exams`)
    console.log('Request body:', JSON.stringify(data, null, 2))
    
    try {
      const result = await apiRequest<BasicRefractionExam>('/basic-refraction-exams', {
        method: 'POST',
        body: JSON.stringify(basicRefractionExamApi._toCrudPayload(data)),
      })
      console.log('Basic Refraction Exam API create successful:', result)
      return result
    } catch (error) {
      console.error('Basic Refraction Exam API create failed:', error)
      
      // Check if it's a network error or API not available
      if (error instanceof Error && (
        error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError') ||
        error.message.includes('404') ||
        error.message.includes('500')
      )) {
        console.log('API not available, using demo mode')
        
        // Demo mode - return mock data
        const demoResult: BasicRefractionExam = {
          id: Math.floor(Math.random() * 1000) + 1,
          visitSessionId: data.visitSessionId,
          neuroOriented: data.neuroOriented,
          neuroMood: data.neuroMood,
          neuroPsychNotes: data.neuroPsychNotes,
          pupilsPerrl: data.pupilsPerrl,
          pupilsRightDark: data.pupilsRightDark,
          pupilsLeftDark: data.pupilsLeftDark,
          pupilsRightLight: data.pupilsRightLight,
          pupilsLeftLight: data.pupilsLeftLight,
          pupilsRightShape: data.pupilsRightShape,
          pupilsLeftShape: data.pupilsLeftShape,
          pupilsRightReact: data.pupilsRightReact,
          pupilsLeftReact: data.pupilsLeftReact,
          pupilsRightApd: data.pupilsRightApd,
          pupilsLeftApd: data.pupilsLeftApd,
          pupilsNotes: data.pupilsNotes,
          visualAcuityDistanceScRight: data.visualAcuityDistanceScRight,
          visualAcuityDistanceScLeft: data.visualAcuityDistanceScLeft,
          visualAcuityDistancePhRight: data.visualAcuityDistancePhRight,
          visualAcuityDistancePhLeft: data.visualAcuityDistancePhLeft,
          visualAcuityDistanceCcRight: data.visualAcuityDistanceCcRight,
          visualAcuityDistanceCcLeft: data.visualAcuityDistanceCcLeft,
          visualAcuityNearScRight: data.visualAcuityNearScRight,
          visualAcuityNearScLeft: data.visualAcuityNearScLeft,
          visualAcuityNearCcRight: data.visualAcuityNearCcRight,
          visualAcuityNearCcLeft: data.visualAcuityNearCcLeft,
          visualAcuityNotes: data.visualAcuityNotes,
          manifestAutoRightSphere: data.manifestAutoRightSphere,
          manifestAutoRightCylinder: data.manifestAutoRightCylinder,
          manifestAutoRightAxis: data.manifestAutoRightAxis,
          manifestAutoLeftSphere: data.manifestAutoLeftSphere,
          manifestAutoLeftCylinder: data.manifestAutoLeftCylinder,
          manifestAutoLeftAxis: data.manifestAutoLeftAxis,
          manifestRetRightSphere: data.manifestRetRightSphere,
          manifestRetRightCylinder: data.manifestRetRightCylinder,
          manifestRetRightAxis: data.manifestRetRightAxis,
          manifestRetLeftSphere: data.manifestRetLeftSphere,
          manifestRetLeftCylinder: data.manifestRetLeftCylinder,
          manifestRetLeftAxis: data.manifestRetLeftAxis,
          subjectiveRightSphere: data.subjectiveRightSphere,
          subjectiveRightCylinder: data.subjectiveRightCylinder,
          subjectiveRightAxis: data.subjectiveRightAxis,
          subjectiveLeftSphere: data.subjectiveLeftSphere,
          subjectiveLeftCylinder: data.subjectiveLeftCylinder,
          subjectiveLeftAxis: data.subjectiveLeftAxis,
          addedValues: data.addedValues,
          bestRightVision: data.bestRightVision,
          bestLeftVision: data.bestLeftVision,
          pdRightEye: parseFloat(data.pdRightEye || '0') || 0,
          pdLeftEye: parseFloat(data.pdLeftEye || '0') || 0,
          refractionNotes: undefined,
          comment: data.comment,
          examinationDate: new Date().toISOString(),
          examinedBy: data.examinedBy,
          keratometryK1Right: parseFloat(data.keratometryK1Right || '0') || 0,
          keratometryK2Right: parseFloat(data.keratometryK2Right || '0') || 0,
          keratometryAxisRight: parseFloat(data.keratometryAxisRight || '0') || 0,
          keratometryK1Left: parseFloat(data.keratometryK1Left || '0') || 0,
          keratometryK2Left: parseFloat(data.keratometryK2Left || '0') || 0,
          keratometryAxisLeft: parseFloat(data.keratometryAxisLeft || '0') || 0,
          // fields not in CRUD spec intentionally omitted in demo result
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'demo',
          updatedBy: 'demo',
          patientName: 'Demo Patient',
          patientPhone: '1234567890'
        }
        
        console.log('Demo mode result:', demoResult)
        return demoResult
      }
      
      throw error
    }
  },

  // Get basic refraction exam by ID
  getById: async (id: number): Promise<BasicRefractionExam> => {
    console.log('Basic Refraction Exam API getById called with ID:', id)
    console.log('API Base URL:', API_BASE_URL)
    console.log('Full endpoint:', `${API_BASE_URL}/basic-refraction-exams/${id}`)
    
    try {
      const result = await apiRequest<BasicRefractionExam>(`/basic-refraction-exams/${id}`)
      console.log('Basic Refraction Exam API getById successful:', result)
      return result
    } catch (error) {
      console.error('Basic Refraction Exam API getById failed:', error)
      
      // Check if it's a network error or API not available
      if (error instanceof Error && (
        error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError') ||
        error.message.includes('404') ||
        error.message.includes('500')
      )) {
        console.log('API not available, using demo mode for getById')
        
        // Demo mode - return mock data
        const demoResult: BasicRefractionExam = {
          id: id,
          visitSessionId: 1,
          neuroOriented: true,
          neuroMood: 'Alert and cooperative',
          neuroPsychNotes: 'Patient is alert and oriented to time, place, and person',
          pupilsPerrl: true,
          pupilsRightDark: '4.5',
          pupilsLeftDark: '4.5',
          pupilsRightLight: '3.0',
          pupilsLeftLight: '3.0',
          pupilsRightShape: 'Round',
          pupilsLeftShape: 'Round',
          pupilsRightReact: 'Brisk',
          pupilsLeftReact: 'Brisk',
          pupilsRightApd: 'Negative',
          pupilsLeftApd: 'Negative',
          pupilsNotes: 'Pupils are equal, round, and reactive to light',
          visualAcuityDistanceScRight: '20/20',
          visualAcuityDistanceScLeft: '20/25',
          visualAcuityDistancePhRight: '20/20',
          visualAcuityDistancePhLeft: '20/25',
          visualAcuityDistanceCcRight: '20/20',
          visualAcuityDistanceCcLeft: '20/20',
          visualAcuityNearScRight: 'J1',
          visualAcuityNearScLeft: 'J2',
          visualAcuityNearCcRight: 'J1',
          visualAcuityNearCcLeft: 'J1',
          visualAcuityNotes: 'Distance vision improved with correction',
          manifestAutoRightSphere: '-1.25',
          manifestAutoRightCylinder: '-0.50',
          manifestAutoRightAxis: '90',
          manifestAutoLeftSphere: '-1.00',
          manifestAutoLeftCylinder: '-0.25',
          manifestAutoLeftAxis: '85',
          manifestRetRightSphere: '-1.50',
          manifestRetRightCylinder: '-0.75',
          manifestRetRightAxis: '88',
          manifestRetLeftSphere: '-1.25',
          manifestRetLeftCylinder: '-0.50',
          manifestRetLeftAxis: '82',
          subjectiveRightSphere: '-1.25',
          subjectiveRightCylinder: '-0.50',
          subjectiveRightAxis: '90',
          subjectiveLeftSphere: '-1.00',
          subjectiveLeftCylinder: '-0.25',
          subjectiveLeftAxis: '85',
          addedValues: '+1.50',
          bestRightVision: '20/20',
          bestLeftVision: '20/20',
          pdRightEye: 32.0,
          pdLeftEye: 32.0,
          refractionNotes: 'Patient shows mild myopia with astigmatism',
          comment: 'Recommend prescription glasses',
          examinationDate: new Date().toISOString(),
          examinedBy: 'Dr. Smith',
          keratometryK1Right: 43.50,
          keratometryK2Right: 44.25,
          keratometryAxisRight: 90,
          keratometryK1Left: 43.75,
          keratometryK2Left: 44.00,
          keratometryAxisLeft: 85,
          pupilSizeRight: 4.5,
          pupilSizeLeft: 4.5,
          pupilSizeUnit: 'mm',
          iopRight: 16,
          iopLeft: 15,
          iopMethod: 'Goldmann',
          colorVisionRight: 'Normal',
          colorVisionLeft: 'Normal',
          colorVisionTest: 'Ishihara',
          stereopsis: 40,
          stereopsisUnit: 'arc seconds',
          nearAdditionRight: 1.50,
          nearAdditionLeft: 1.50,
          clinicalAssessment: 'Patient has mild myopia with astigmatism. No signs of pathology.',
          diagnosis: 'Myopia with astigmatism',
          treatmentPlan: 'Prescribe corrective lenses. Follow up in 6 months.',
          equipmentUsed: 'Auto-refractor, Phoropter, Trial lenses',
          equipmentCalibrationDate: '2025-01-01',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'demo',
          updatedBy: 'demo',
          patientName: 'Demo Patient',
          patientPhone: '1234567890'
        }
        
        console.log('Demo mode result for getById:', demoResult)
        return demoResult
      }
      
      throw error
    }
  },

  // Get basic refraction exam by visit session ID
  getByVisitSession: (visitSessionId: number): Promise<BasicRefractionExam> => {
    return apiRequest<BasicRefractionExam>(`/basic-refraction-exams/visit-session/${visitSessionId}`)
  },

  // Get all basic refraction exams
  getAll: async (pageable?: Pageable): Promise<Page<BasicRefractionExam>> => {
    console.log('Basic Refraction Exam API getAll called with pageable:', pageable)
    console.log('API Base URL:', API_BASE_URL)
    
    const params = new URLSearchParams()
    if (pageable?.page !== undefined) params.append('page', pageable.page.toString())
    if (pageable?.size !== undefined) params.append('size', pageable.size.toString())
    if (pageable?.sort) params.append('sort', pageable.sort)
    
    const queryString = params.toString()
    const endpoint = queryString ? `/basic-refraction-exams?${queryString}` : '/basic-refraction-exams'
    console.log('Full endpoint:', `${API_BASE_URL}${endpoint}`)
    
    try {
      // The API returns an array directly, not a paginated response
      const response = await apiRequest<BasicRefractionExam[]>(endpoint)
      console.log('Basic Refraction Exam API response (array):', response)

      // Convert array response to Page format
      const page: Page<BasicRefractionExam> = {
        content: response,
        totalElements: response.length,
        totalPages: 1,
        size: pageable?.size || 20,
        number: pageable?.page || 0,
        first: true,
        last: true,
        numberOfElements: response.length,
        empty: response.length === 0,
        pageable: {
          pageNumber: pageable?.page || 0,
          pageSize: pageable?.size || 20,
          sort: { empty: true, sorted: false, unsorted: true },
          offset: (pageable?.page || 0) * (pageable?.size || 20),
          paged: true,
          unpaged: false
        },
        sort: { empty: true, sorted: false, unsorted: true }
      }

      return page
    } catch (error) {
      console.error('Failed to fetch basic refraction exams:', error)
      // Return empty page on error
      const emptyPage: Page<BasicRefractionExam> = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: pageable?.size || 20,
        number: pageable?.page || 0,
        first: true,
        last: true,
        numberOfElements: 0,
        empty: true,
        pageable: {
          pageNumber: pageable?.page || 0,
          pageSize: pageable?.size || 20,
          sort: { empty: true, sorted: false, unsorted: true },
          offset: (pageable?.page || 0) * (pageable?.size || 20),
          paged: true,
          unpaged: false
        },
        sort: { empty: true, sorted: false, unsorted: true }
      }
      return emptyPage
    }
  },

  // Update basic refraction exam
  update: (id: number, data: UpdateBasicRefractionExamRequest): Promise<BasicRefractionExam> => {
    return apiRequest<BasicRefractionExam>(`/basic-refraction-exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(basicRefractionExamApi._toCrudPayload(data)),
    })
  },

  // Delete basic refraction exam
  delete: (id: number): Promise<void> => {
    return apiRequest<void>(`/basic-refraction-exams/${id}`, {
      method: 'DELETE',
    })
  }
}

// Consumables API
export const consumablesApi = {
  // Categories
  getAllCategories: (pageable?: Pageable): Promise<Page<ConsumableCategory>> => {
    const params = new URLSearchParams()
    if (pageable?.page !== undefined) params.append('page', pageable.page.toString())
    if (pageable?.size !== undefined) params.append('size', pageable.size.toString())
    if (pageable?.sort) params.append('sort', pageable.sort)
    
    const queryString = params.toString()
    const endpoint = queryString ? `/consumables/categories?${queryString}` : '/consumables/categories'
    return apiRequest<Page<ConsumableCategory>>(endpoint)
  },

  createCategory: (data: CreateConsumableCategoryRequest): Promise<ConsumableCategory> => {
    return apiRequest<ConsumableCategory>('/consumables/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getCategoryById: (id: number): Promise<ConsumableCategory> => {
    return apiRequest<ConsumableCategory>(`/consumables/categories/${id}`)
  },

  updateCategory: (id: number, data: Partial<ConsumableCategory>): Promise<ConsumableCategory> => {
    return apiRequest<ConsumableCategory>(`/consumables/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  deleteCategory: (id: number): Promise<void> => {
    return apiRequest<void>(`/consumables/categories/${id}`, {
      method: 'DELETE',
    })
  },

  // Items
  getAllItems: (pageable?: Pageable): Promise<Page<ConsumableItem>> => {
    const params = new URLSearchParams()
    if (pageable?.page !== undefined) params.append('page', pageable.page.toString())
    if (pageable?.size !== undefined) params.append('size', pageable.size.toString())
    if (pageable?.sort) params.append('sort', pageable.sort)

    const queryString = params.toString()
    const endpoint = queryString ? `/consumables/items?${queryString}` : '/consumables/items'
    return apiRequest<Page<ConsumableItem>>(endpoint)
  },

  searchItems: (query: string): Promise<ConsumableItem[]> => {
    return apiRequest<ConsumableItem[]>(`/consumables/items/search?q=${encodeURIComponent(query)}`)
  },

  createItem: (data: CreateConsumableItemRequest): Promise<ConsumableItem> => {
    return apiRequest<ConsumableItem>('/consumables/items', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getItemById: (id: number): Promise<ConsumableItem> => {
    return apiRequest<ConsumableItem>(`/consumables/items/${id}`)
  },

  updateItem: (id: number, data: Partial<ConsumableItem>): Promise<ConsumableItem> => {
    return apiRequest<ConsumableItem>(`/consumables/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  deleteItem: (id: number): Promise<void> => {
    return apiRequest<void>(`/consumables/items/${id}`, {
      method: 'DELETE',
    })
  },

  softDeleteItem: (id: number): Promise<void> => {
    return apiRequest<void>(`/consumables/items/${id}/soft`, {
      method: 'DELETE',
    })
  },

  updateStock: (id: number, quantity: number): Promise<ConsumableItem> => {
    return apiRequest<ConsumableItem>(`/consumables/items/${id}/stock?quantity=${quantity}`, {
      method: 'PUT',
    })
  },

  // Usage
  recordUsage: (data: CreateConsumableUsageRequest): Promise<ConsumableUsage> => {
    return apiRequest<ConsumableUsage>('/consumables/usage', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getUsageHistory: (pageable?: Pageable): Promise<Page<ConsumableUsage>> => {
    const params = new URLSearchParams()
    if (pageable?.page !== undefined) params.append('page', pageable.page.toString())
    if (pageable?.size !== undefined) params.append('size', pageable.size.toString())
    if (pageable?.sort) params.append('sort', pageable.sort)
    
    const queryString = params.toString()
    const endpoint = queryString ? `/consumables/usage?${queryString}` : '/consumables/usage'
    return apiRequest<Page<ConsumableUsage>>(endpoint)
  },

  // Reports
  getLowStockItems: (): Promise<ConsumableItem[]> => {
    return apiRequest<ConsumableItem[]>('/consumables/reports/low-stock')
  },

  getTotalStockValue: (): Promise<number> => {
    return apiRequest<number>('/consumables/reports/total-stock-value')
  },

  getTotalItemsCount: (): Promise<number> => {
    return apiRequest<number>('/consumables/reports/total-items-count')
  },

  // Restock
  recordRestock: (data: CreateConsumableRestockRequest): Promise<ConsumableRestock> => {
    return apiRequest<ConsumableRestock>('/consumables/restock', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

// Diagnosis API
export const diagnosisApi = {
  // Categories
  getAllCategories: (): Promise<DiagnosisCategory[]> => {
    return apiRequest<DiagnosisCategory[]>('/diagnoses/categories')
  },

  createCategory: (data: CreateDiagnosisCategoryRequest): Promise<DiagnosisCategory> => {
    return apiRequest<DiagnosisCategory>('/diagnoses/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getCategoryById: (id: number): Promise<DiagnosisCategory> => {
    return apiRequest<DiagnosisCategory>(`/diagnoses/categories/${id}`)
  },

  updateCategory: (id: number, data: CreateDiagnosisCategoryRequest): Promise<DiagnosisCategory> => {
    return apiRequest<DiagnosisCategory>(`/diagnoses/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  deleteCategory: (id: number): Promise<void> => {
    return apiRequest<void>(`/diagnoses/categories/${id}`, {
      method: 'DELETE',
    })
  },

  // Diagnoses
  getAllDiagnoses: (pageable?: Pageable): Promise<Page<Diagnosis>> => {
    const params = new URLSearchParams()
    if (pageable?.page !== undefined) params.append('page', pageable.page.toString())
    if (pageable?.size !== undefined) params.append('size', pageable.size.toString())
    if (pageable?.sort) params.append('sort', pageable.sort)
    
    const queryString = params.toString()
    const endpoint = queryString ? `/diagnoses?${queryString}` : '/diagnoses'
    return apiRequest<Page<Diagnosis>>(endpoint)
  },

  getDiagnosesByCategory: (categoryId: number): Promise<Diagnosis[]> => {
    return apiRequest<Diagnosis[]>(`/diagnoses/category/${categoryId}`)
  },

  createDiagnosis: (data: CreateDiagnosisRequest): Promise<Diagnosis> => {
    return apiRequest<Diagnosis>('/diagnoses', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getDiagnosisById: (id: number): Promise<Diagnosis> => {
    return apiRequest<Diagnosis>(`/diagnoses/${id}`)
  },

  updateDiagnosis: (id: number, data: CreateDiagnosisRequest): Promise<Diagnosis> => {
    return apiRequest<Diagnosis>(`/diagnoses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  deleteDiagnosis: (id: number): Promise<void> => {
    return apiRequest<void>(`/diagnoses/${id}`, {
      method: 'DELETE',
    })
  },

  searchDiagnoses: (query: string): Promise<Diagnosis[]> => {
    return apiRequest<Diagnosis[]>(`/diagnoses/search?query=${encodeURIComponent(query)}`)
  }
}

// Patient Diagnosis API
export const patientDiagnosisApi = {
  getByVisitSession: (visitSessionId: number): Promise<PatientDiagnosis[]> => {
    return apiRequest<PatientDiagnosis[]>(`/patient-diagnoses/visit-session/${visitSessionId}`)
  },

  getByPatient: (patientId: number): Promise<PatientDiagnosis[]> => {
    return apiRequest<PatientDiagnosis[]>(`/patient-diagnoses/patient/${patientId}`)
  },

  create: (data: CreatePatientDiagnosisRequest): Promise<PatientDiagnosis> => {
    return apiRequest<PatientDiagnosis>('/patient-diagnoses', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: (id: number, data: CreatePatientDiagnosisRequest): Promise<PatientDiagnosis> => {
    return apiRequest<PatientDiagnosis>(`/patient-diagnoses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: (id: number): Promise<void> => {
    return apiRequest<void>(`/patient-diagnoses/${id}`, {
      method: 'DELETE',
    })
  },

  getById: (id: number): Promise<PatientDiagnosis> => {
    return apiRequest<PatientDiagnosis>(`/patient-diagnoses/${id}`)
  },

  getPrimaryByVisitSession: (visitSessionId: number): Promise<PatientDiagnosis[]> => {
    return apiRequest<PatientDiagnosis[]>(`/patient-diagnoses/visit-session/${visitSessionId}/primary`)
  },

  getConfirmedByVisitSession: (visitSessionId: number): Promise<PatientDiagnosis[]> => {
    return apiRequest<PatientDiagnosis[]>(`/patient-diagnoses/visit-session/${visitSessionId}/confirmed`)
  }
}

// Procedure API
export const procedureApi = {
  getAllProcedures: (): Promise<Procedure[]> => {
    return apiRequest<Procedure[]>('/procedures')
  },

  getProceduresByCategory: (category: string): Promise<Procedure[]> => {
    return apiRequest<Procedure[]>(`/procedures/category/${encodeURIComponent(category)}`)
  },

  getAllCategories: (): Promise<string[]> => {
    return apiRequest<string[]>('/procedures/categories')
  },

  getProcedureById: (id: number): Promise<Procedure> => {
    return apiRequest<Procedure>(`/procedures/${id}`)
  },

  createProcedure: (data: any): Promise<Procedure> => {
    return apiRequest<Procedure>('/procedures', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateProcedure: (id: number, data: any): Promise<Procedure> => {
    return apiRequest<Procedure>(`/procedures/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  deleteProcedure: (id: number): Promise<void> => {
    return apiRequest<void>(`/procedures/${id}`, {
      method: 'DELETE',
    })
  }
}

// Patient Procedure API
export const patientProcedureApi = {
  getPending: (): Promise<PatientProcedure[]> => {
    return apiRequest<PatientProcedure[]>('/patient-procedures/pending')
  },

  getByVisitSession: (visitSessionId: number): Promise<PatientProcedure[]> => {
    return apiRequest<PatientProcedure[]>(`/patient-procedures/visit-session/${visitSessionId}`)
  },

  create: (data: CreatePatientProcedureRequest): Promise<PatientProcedure> => {
    return apiRequest<PatientProcedure>('/patient-procedures', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: (id: number, data: CreatePatientProcedureRequest): Promise<PatientProcedure> => {
    return apiRequest<PatientProcedure>(`/patient-procedures/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: (id: number): Promise<void> => {
    return apiRequest<void>(`/patient-procedures/${id}`, {
      method: 'DELETE',
    })
  },

  getById: (id: number): Promise<PatientProcedure> => {
    return apiRequest<PatientProcedure>(`/patient-procedures/${id}`)
  },

  getAll: (): Promise<PatientProcedure[]> => {
    return apiRequest<PatientProcedure[]>('/patient-procedures')
  }
}

// Patient Treatment API
export const patientTreatmentApi = {
  getByVisitSession: (visitSessionId: number) => {
    return apiRequest(`/patient-treatments/visit-session/${visitSessionId}`) as Promise<{
      id: number
      visitSessionId: number
      inventoryItemId: number
      itemName: string
      sku?: string
      quantity: number
      unitPrice: number
      notes?: string
      dosage?: string
      administrationRoute?: string
    }[]>
  },

  create: (data: {
    visitSessionId: number
    inventoryItemId: number
    quantity: number
    unitPrice?: number
    notes?: string
    dosage?: string
    administrationRoute?: string
  }) => {
    return apiRequest(`/patient-treatments`, {
      method: 'POST',
      body: JSON.stringify(data)
    }) as Promise<{
      id: number
      visitSessionId: number
      inventoryItemId: number
      itemName: string
      sku?: string
      quantity: number
      unitPrice: number
      notes?: string
      dosage?: string
      administrationRoute?: string
    }>
  },

  delete: (id: number) => {
    return apiRequest(`/patient-treatments/${id}`, { method: 'DELETE' }) as Promise<void>
  }
}

// Investigation API
export const investigationApi = {
  getTypes: (): Promise<InvestigationType[]> => apiRequest('/investigation-types'),
  getTypeById: (id: number): Promise<InvestigationType> => apiRequest(`/investigation-types/${id}`),
  createType: (data: Partial<InvestigationType>): Promise<InvestigationType> => apiRequest('/investigation-types', { method: 'POST', body: JSON.stringify(data) }),
  updateType: (id: number, data: Partial<InvestigationType>): Promise<InvestigationType> => apiRequest(`/investigation-types/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteType: (id: number): Promise<void> => apiRequest(`/investigation-types/${id}`, { method: 'DELETE' }),

  getByVisitSession: (visitSessionId: number, includeBilled = true) => apiRequest(`/patient-investigations/visit-session/${visitSessionId}?includeBilled=${includeBilled ? 'true' : 'false'}`),
  create: (payload: any) => apiRequest('/patient-investigations', { method: 'POST', body: JSON.stringify(payload) }),
  delete: (id: number) => apiRequest(`/patient-investigations/${id}`, { method: 'DELETE' }),
}

// Theater Requisition API
export const theaterRequisitionApi = {
  create: (data: CreateTheaterRequisitionRequest): Promise<TheaterRequisition> => {
    return apiRequest<TheaterRequisition>('/theater-requisitions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  submit: (id: number): Promise<TheaterRequisition> => {
    return apiRequest<TheaterRequisition>(`/theater-requisitions/${id}/submit`, {
      method: 'POST',
    })
  },

  approve: (id: number, data: ApproveTheaterRequisitionRequest): Promise<TheaterRequisition> => {
    return apiRequest<TheaterRequisition>(`/theater-requisitions/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getAll: (pageable?: Pageable): Promise<Page<TheaterRequisition>> => {
    const params = new URLSearchParams()
    if (pageable?.page !== undefined) params.append('page', pageable.page.toString())
    if (pageable?.size !== undefined) params.append('size', pageable.size.toString())
    if (pageable?.sort) params.append('sort', pageable.sort)
    
    const queryString = params.toString()
    const endpoint = queryString ? `/theater-requisitions?${queryString}` : '/theater-requisitions'
    return apiRequest<Page<TheaterRequisition>>(endpoint)
  },

  getByStatus: (status: string): Promise<TheaterRequisition[]> => {
    return apiRequest<TheaterRequisition[]>(`/theater-requisitions/status/${status}`)
  },

  getPendingApprovals: (): Promise<TheaterRequisition[]> => {
    return apiRequest<TheaterRequisition[]>('/theater-requisitions/pending-approvals')
  },

  getById: (id: number): Promise<TheaterRequisition> => {
    return apiRequest<TheaterRequisition>(`/theater-requisitions/${id}`)
  },

  update: (id: number, data: CreateTheaterRequisitionRequest): Promise<TheaterRequisition> => {
    return apiRequest<TheaterRequisition>(`/theater-requisitions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: (id: number): Promise<void> => {
    return apiRequest<void>(`/theater-requisitions/${id}`, {
      method: 'DELETE',
    })
  }
}

// Theater Procedure Usage API
export const theaterProcedureUsageApi = {
  recordUsage: (data: CreateTheaterProcedureUsageRequest): Promise<TheaterProcedureUsage[]> => {
    return apiRequest<TheaterProcedureUsage[]>('/theater-procedure-usage', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getByProcedure: (procedureId: number): Promise<TheaterProcedureUsage[]> => {
    return apiRequest<TheaterProcedureUsage[]>(`/theater-procedure-usage/procedure/${procedureId}`)
  },

  getByConsumableItem: (consumableItemId: number): Promise<TheaterProcedureUsage[]> => {
    return apiRequest<TheaterProcedureUsage[]>(`/theater-procedure-usage/consumable/${consumableItemId}`)
  },

  getByUser: (userId: number): Promise<TheaterProcedureUsage[]> => {
    return apiRequest<TheaterProcedureUsage[]>(`/theater-procedure-usage/user/${userId}`)
  },

  getByDateRange: (startDate: string, endDate: string): Promise<TheaterProcedureUsage[]> => {
    return apiRequest<TheaterProcedureUsage[]>(`/theater-procedure-usage/date-range?startDate=${startDate}&endDate=${endDate}`)
  },

  getByTheaterStore: (storeId: number): Promise<TheaterProcedureUsage[]> => {
    return apiRequest<TheaterProcedureUsage[]>(`/theater-procedure-usage/store/${storeId}`)
  },

  getAll: (): Promise<TheaterProcedureUsage[]> => {
    return apiRequest<TheaterProcedureUsage[]>('/theater-procedure-usage')
  }
}

// Surgery Report API
export const surgeryReportApi = {
  create: (data: CreateSurgeryReportRequest): Promise<SurgeryReport> => {
    return apiRequest<SurgeryReport>('/surgery-reports', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  getByProcedure: (patientProcedureId: number): Promise<SurgeryReport[]> => {
    return apiRequest<SurgeryReport[]>(`/surgery-reports/procedure/${patientProcedureId}`)
  },
  update: (id: number, data: UpdateSurgeryReportRequest): Promise<SurgeryReport> => {
    return apiRequest<SurgeryReport>(`/surgery-reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
  getById: (id: number): Promise<SurgeryReport> => {
    return apiRequest<SurgeryReport>(`/surgery-reports/${id}`)
  },
}

// Theater Store API
export const theaterStoreApi = {
  create: (data: CreateTheaterStoreRequest): Promise<TheaterStore> => {
    return apiRequest<TheaterStore>('/theater-stores', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getAll: (pageable?: Pageable): Promise<Page<TheaterStore>> => {
    const params = new URLSearchParams()
    if (pageable?.page !== undefined) params.append('page', pageable.page.toString())
    if (pageable?.size !== undefined) params.append('size', pageable.size.toString())
    if (pageable?.sort) params.append('sort', pageable.sort)
    
    const queryString = params.toString()
    const endpoint = queryString ? `/theater-stores?${queryString}` : '/theater-stores'
    return apiRequest<Page<TheaterStore>>(endpoint)
  },

  getAllActive: (): Promise<TheaterStore[]> => {
    return apiRequest<TheaterStore[]>('/theater-stores/active')
  },

  getById: (id: number): Promise<TheaterStore> => {
    return apiRequest<TheaterStore>(`/theater-stores/${id}`)
  },

  update: (id: number, data: CreateTheaterStoreRequest): Promise<TheaterStore> => {
    return apiRequest<TheaterStore>(`/theater-stores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: (id: number): Promise<void> => {
    return apiRequest<void>(`/theater-stores/${id}`, {
      method: 'DELETE',
    })
  },

  getByType: (storeType: string): Promise<TheaterStore[]> => {
    return apiRequest<TheaterStore[]>(`/theater-stores/type/${storeType}`)
  },

  getByLocation: (location: string): Promise<TheaterStore[]> => {
    return apiRequest<TheaterStore[]>(`/theater-stores/location/${location}`)
  },

  getByManager: (userId: number): Promise<TheaterStore[]> => {
    return apiRequest<TheaterStore[]>(`/theater-stores/manager/${userId}`)
  },

  getItems: (): Promise<TheaterStoreItem[]> => {
    return apiRequest<TheaterStoreItem[]>('/theater-stores/items')
  },

  deleteItem: (id: number): Promise<void> => {
    return apiRequest<void>(`/theater-stores/items/${id}`, {
      method: 'DELETE',
    })
  }
}