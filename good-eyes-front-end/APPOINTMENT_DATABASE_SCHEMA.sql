-- =====================================================
-- APPOINTMENT SYSTEM DATABASE SCHEMA
-- Eyesante Healthcare Management System
-- =====================================================

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS appointment_reminders;
DROP TABLE IF EXISTS doctor_schedules;
DROP TABLE IF EXISTS appointments;

-- =====================================================
-- 1. APPOINTMENTS TABLE
-- =====================================================
CREATE TABLE appointments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    -- Patient Information
    patient_id BIGINT NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    patient_phone VARCHAR(20),
    patient_email VARCHAR(255),
    
    -- Doctor Information
    doctor_id BIGINT NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    doctor_specialty VARCHAR(50),
    
    -- Appointment Details
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration INT NOT NULL COMMENT 'Duration in minutes',
    
    -- Appointment Classification
    appointment_type VARCHAR(50) NOT NULL COMMENT 'ROUTINE_EXAMINATION, FOLLOW_UP, EMERGENCY, etc.',
    reason TEXT,
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL' COMMENT 'LOW, NORMAL, HIGH, URGENT, EMERGENCY',
    notes TEXT,
    
    -- Status Management
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED' COMMENT 'SCHEDULED, CONFIRMED, CHECKED_IN, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW, RESCHEDULED, WAITING, READY',
    
    -- Audit Information
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Cancellation Information
    cancelled_at TIMESTAMP NULL,
    cancelled_by VARCHAR(100) NULL,
    cancellation_reason TEXT NULL,
    
    -- Reminder Information
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMP NULL,
    
    -- Check-in/Check-out Information
    check_in_time TIMESTAMP NULL,
    check_out_time TIMESTAMP NULL,
    actual_duration INT NULL COMMENT 'Actual duration in minutes',
    
    -- Follow-up Information
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE NULL,
    
    -- Insurance Information
    insurance_provider VARCHAR(100) NULL,
    insurance_number VARCHAR(100) NULL,
    
    -- Payment Information
    cost DECIMAL(10,2) NULL COMMENT 'Cost in Uganda Shillings',
    payment_status VARCHAR(20) DEFAULT 'PENDING' COMMENT 'PENDING, PAID, PARTIAL, REFUNDED',
    payment_method VARCHAR(20) NULL COMMENT 'CASH, MOBILE_MONEY, BANK_TRANSFER, CARD',
    
    -- Foreign Keys
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes for Performance
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_doctor_date (doctor_id, appointment_date),
    INDEX idx_patient_date (patient_id, appointment_date),
    INDEX idx_status (status),
    INDEX idx_appointment_type (appointment_type),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at),
    INDEX idx_check_in_time (check_in_time),
    INDEX idx_payment_status (payment_status),
    
    -- Constraints
    CONSTRAINT chk_duration CHECK (duration > 0 AND duration <= 480), -- Max 8 hours
    CONSTRAINT chk_priority CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT', 'EMERGENCY')),
    CONSTRAINT chk_status CHECK (status IN ('SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED', 'WAITING', 'READY')),
    CONSTRAINT chk_payment_status CHECK (payment_status IN ('PENDING', 'PAID', 'PARTIAL', 'REFUNDED')),
    CONSTRAINT chk_payment_method CHECK (payment_method IN ('CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CARD', 'INSURANCE') OR payment_method IS NULL),
    CONSTRAINT chk_appointment_type CHECK (appointment_type IN (
        'ROUTINE_EXAMINATION', 'FOLLOW_UP', 'EMERGENCY', 'SURGERY_CONSULTATION',
        'PRESCRIPTION_RENEWAL', 'DIAGNOSTIC_TEST', 'PRE_OPERATIVE_ASSESSMENT',
        'POST_OPERATIVE_FOLLOW_UP', 'VISION_THERAPY', 'CONTACT_LENS_FITTING',
        'GLASSES_FITTING', 'GLAUCOMA_SCREENING', 'CATARACT_EVALUATION',
        'RETINAL_EXAMINATION', 'PEDIATRIC_EXAMINATION'
    )),
    CONSTRAINT chk_end_time CHECK (end_time > appointment_time),
    CONSTRAINT chk_follow_up_date CHECK (follow_up_date IS NULL OR follow_up_date >= appointment_date)
);

-- =====================================================
-- 2. DOCTOR SCHEDULES TABLE
-- =====================================================
CREATE TABLE doctor_schedules (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    -- Doctor Information
    doctor_id BIGINT NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    
    -- Schedule Information
    day_of_week INT NOT NULL COMMENT '1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday, 7=Sunday',
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_start TIME NULL,
    break_end TIME NULL,
    
    -- Availability
    is_available BOOLEAN DEFAULT TRUE,
    
    -- Audit Information
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_doctor_day (doctor_id, day_of_week),
    INDEX idx_doctor_available (doctor_id, is_available),
    
    -- Constraints
    CONSTRAINT chk_day_of_week CHECK (day_of_week >= 1 AND day_of_week <= 7),
    CONSTRAINT chk_schedule_times CHECK (end_time > start_time),
    CONSTRAINT chk_break_times CHECK (
        (break_start IS NULL AND break_end IS NULL) OR
        (break_start IS NOT NULL AND break_end IS NOT NULL AND break_end > break_start)
    ),
    CONSTRAINT chk_break_within_schedule CHECK (
        break_start IS NULL OR 
        (break_start >= start_time AND break_end <= end_time)
    ),
    
    -- Unique constraint to prevent duplicate schedules for same doctor on same day
    UNIQUE KEY unique_doctor_day (doctor_id, day_of_week)
);

-- =====================================================
-- 3. APPOINTMENT REMINDERS TABLE
-- =====================================================
CREATE TABLE appointment_reminders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    -- Appointment Reference
    appointment_id BIGINT NOT NULL,
    
    -- Reminder Details
    reminder_type VARCHAR(20) NOT NULL COMMENT 'SMS, EMAIL, PUSH',
    message TEXT NOT NULL,
    
    -- Status Information
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT 'PENDING, SENT, FAILED, DELIVERED',
    
    -- Timing Information
    scheduled_at TIMESTAMP NOT NULL COMMENT 'When reminder should be sent',
    sent_at TIMESTAMP NULL COMMENT 'When reminder was actually sent',
    
    -- Delivery Information
    delivery_status VARCHAR(50) NULL COMMENT 'Delivered, Failed, Pending',
    delivery_message TEXT NULL COMMENT 'Response from SMS/Email service',
    
    -- Audit Information
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_appointment_id (appointment_id),
    INDEX idx_reminder_type (reminder_type),
    INDEX idx_status (status),
    INDEX idx_scheduled_at (scheduled_at),
    INDEX idx_sent_at (sent_at),
    
    -- Constraints
    CONSTRAINT chk_reminder_type CHECK (reminder_type IN ('SMS', 'EMAIL', 'PUSH')),
    CONSTRAINT chk_reminder_status CHECK (status IN ('PENDING', 'SENT', 'FAILED', 'DELIVERED')),
    CONSTRAINT chk_scheduled_at CHECK (scheduled_at > created_at)
);

-- =====================================================
-- 4. APPOINTMENT TYPES CONFIGURATION TABLE
-- =====================================================
CREATE TABLE appointment_types (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    -- Type Information
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    
    -- Default Settings
    default_duration INT NOT NULL COMMENT 'Default duration in minutes',
    default_cost DECIMAL(10,2) NOT NULL COMMENT 'Default cost in Uganda Shillings',
    
    -- Requirements
    requires_insurance BOOLEAN DEFAULT FALSE,
    requires_prepayment BOOLEAN DEFAULT FALSE,
    requires_consultation BOOLEAN DEFAULT FALSE,
    
    -- Scheduling Rules
    max_advance_booking_days INT DEFAULT 30 COMMENT 'Maximum days in advance for booking',
    min_notice_hours INT DEFAULT 24 COMMENT 'Minimum notice in hours for cancellation',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit Information
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_name (name),
    INDEX idx_is_active (is_active),
    
    -- Constraints
    CONSTRAINT chk_default_duration CHECK (default_duration > 0 AND default_duration <= 480),
    CONSTRAINT chk_default_cost CHECK (default_cost >= 0),
    CONSTRAINT chk_max_advance_booking CHECK (max_advance_booking_days >= 0 AND max_advance_booking_days <= 365),
    CONSTRAINT chk_min_notice_hours CHECK (min_notice_hours >= 0 AND min_notice_hours <= 168) -- Max 1 week
);

-- =====================================================
-- 5. APPOINTMENT CONFLICTS LOG TABLE
-- =====================================================
CREATE TABLE appointment_conflicts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    -- Conflict Information
    appointment_id BIGINT NOT NULL,
    conflict_type VARCHAR(50) NOT NULL COMMENT 'TIME_SLOT_CONFLICT, DOCTOR_UNAVAILABLE, etc.',
    conflict_details TEXT NOT NULL,
    
    -- Resolution Information
    resolved BOOLEAN DEFAULT FALSE,
    resolution_method VARCHAR(50) NULL COMMENT 'RESCHEDULED, CANCELLED, OVERRIDE',
    resolved_by VARCHAR(100) NULL,
    resolved_at TIMESTAMP NULL,
    
    -- Audit Information
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_appointment_id (appointment_id),
    INDEX idx_conflict_type (conflict_type),
    INDEX idx_resolved (resolved),
    INDEX idx_created_at (created_at),
    
    -- Constraints
    CONSTRAINT chk_conflict_type CHECK (conflict_type IN (
        'TIME_SLOT_CONFLICT', 'DOCTOR_UNAVAILABLE', 'PATIENT_UNAVAILABLE',
        'EQUIPMENT_UNAVAILABLE', 'ROOM_UNAVAILABLE', 'INSURANCE_ISSUE'
    )),
    CONSTRAINT chk_resolution_method CHECK (resolution_method IN (
        'RESCHEDULED', 'CANCELLED', 'OVERRIDE', 'WAIT_LIST', 'REFERRED'
    ) OR resolution_method IS NULL)
);

-- =====================================================
-- 6. APPOINTMENT AUDIT LOG TABLE
-- =====================================================
CREATE TABLE appointment_audit_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    -- Appointment Reference
    appointment_id BIGINT NOT NULL,
    
    -- Action Information
    action VARCHAR(50) NOT NULL COMMENT 'CREATED, UPDATED, CANCELLED, CHECKED_IN, etc.',
    field_name VARCHAR(100) NULL COMMENT 'Field that was changed',
    old_value TEXT NULL,
    new_value TEXT NULL,
    
    -- User Information
    performed_by VARCHAR(100) NOT NULL,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Additional Information
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    
    -- Foreign Keys
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_appointment_id (appointment_id),
    INDEX idx_action (action),
    INDEX idx_performed_by (performed_by),
    INDEX idx_performed_at (performed_at),
    
    -- Constraints
    CONSTRAINT chk_action CHECK (action IN (
        'CREATED', 'UPDATED', 'CANCELLED', 'CHECKED_IN', 'CHECKED_OUT',
        'STATUS_CHANGED', 'RESCHEDULED', 'REMINDER_SENT', 'PAYMENT_RECEIVED'
    ))
);

-- =====================================================
-- INSERT DEFAULT APPOINTMENT TYPES
-- =====================================================
INSERT INTO appointment_types (name, description, default_duration, default_cost, requires_insurance, requires_prepayment, requires_consultation, max_advance_booking_days, min_notice_hours) VALUES
('ROUTINE_EXAMINATION', 'Regular eye examination for vision assessment', 30, 50000, FALSE, FALSE, FALSE, 30, 24),
('FOLLOW_UP', 'Follow-up examination for existing conditions', 45, 75000, TRUE, FALSE, TRUE, 30, 24),
('EMERGENCY', 'Urgent eye care for immediate issues', 60, 100000, FALSE, FALSE, FALSE, 1, 0),
('SURGERY_CONSULTATION', 'Consultation for surgical procedures', 60, 120000, TRUE, TRUE, TRUE, 30, 48),
('PRESCRIPTION_RENEWAL', 'Update glasses or contact lens prescription', 30, 45000, FALSE, FALSE, FALSE, 30, 24),
('DIAGNOSTIC_TEST', 'Specialized diagnostic testing', 45, 80000, TRUE, FALSE, TRUE, 30, 24),
('PRE_OPERATIVE_ASSESSMENT', 'Assessment before surgical procedures', 60, 90000, TRUE, TRUE, TRUE, 30, 48),
('POST_OPERATIVE_FOLLOW_UP', 'Follow-up after surgical procedures', 30, 60000, TRUE, FALSE, TRUE, 30, 24),
('VISION_THERAPY', 'Vision therapy sessions', 45, 70000, TRUE, FALSE, TRUE, 30, 24),
('CONTACT_LENS_FITTING', 'Contact lens fitting and training', 30, 60000, FALSE, FALSE, FALSE, 30, 24),
('GLASSES_FITTING', 'Glasses fitting and adjustment', 20, 25000, FALSE, FALSE, FALSE, 30, 24),
('GLAUCOMA_SCREENING', 'Glaucoma screening and monitoring', 45, 75000, TRUE, FALSE, TRUE, 30, 24),
('CATARACT_EVALUATION', 'Cataract assessment and consultation', 45, 85000, TRUE, FALSE, TRUE, 30, 24),
('RETINAL_EXAMINATION', 'Retinal examination and imaging', 45, 90000, TRUE, FALSE, TRUE, 30, 24),
('PEDIATRIC_EXAMINATION', 'Eye examination for children', 30, 55000, FALSE, FALSE, FALSE, 30, 24);

-- =====================================================
-- CREATE VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for today's appointments
CREATE VIEW v_today_appointments AS
SELECT 
    a.id,
    a.patient_name,
    a.patient_phone,
    a.doctor_name,
    a.appointment_time,
    a.end_time,
    a.duration,
    a.appointment_type,
    a.status,
    a.priority,
    a.check_in_time,
    a.payment_status,
    TIMESTAMPDIFF(MINUTE, a.appointment_time, NOW()) as waiting_time_minutes
FROM appointments a
WHERE a.appointment_date = CURDATE()
ORDER BY a.appointment_time;

-- View for available time slots
CREATE VIEW v_available_slots AS
SELECT 
    ds.doctor_id,
    ds.doctor_name,
    ds.day_of_week,
    ds.start_time,
    ds.end_time,
    ds.break_start,
    ds.break_end,
    ds.is_available
FROM doctor_schedules ds
WHERE ds.is_available = TRUE;

-- View for appointment statistics
CREATE VIEW v_appointment_statistics AS
SELECT 
    appointment_date,
    COUNT(*) as total_appointments,
    SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END) as confirmed_appointments,
    SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_appointments,
    SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled_appointments,
    SUM(CASE WHEN status = 'NO_SHOW' THEN 1 ELSE 0 END) as no_shows,
    SUM(CASE WHEN status = 'WAITING' THEN 1 ELSE 0 END) as waiting_appointments,
    SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress_appointments,
    AVG(duration) as average_duration,
    SUM(cost) as total_revenue
FROM appointments
WHERE appointment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY appointment_date
ORDER BY appointment_date DESC;

-- =====================================================
-- CREATE STORED PROCEDURES
-- =====================================================

DELIMITER //

-- Procedure to check for appointment conflicts
CREATE PROCEDURE CheckAppointmentConflicts(
    IN p_doctor_id BIGINT,
    IN p_appointment_date DATE,
    IN p_start_time TIME,
    IN p_end_time TIME,
    IN p_appointment_id BIGINT
)
BEGIN
    DECLARE conflict_count INT DEFAULT 0;
    
    SELECT COUNT(*) INTO conflict_count
    FROM appointments
    WHERE doctor_id = p_doctor_id
    AND appointment_date = p_appointment_date
    AND (
        (appointment_time < p_end_time AND end_time > p_start_time)
        OR (p_start_time < end_time AND p_end_time > appointment_time)
    )
    AND status NOT IN ('CANCELLED', 'NO_SHOW')
    AND (p_appointment_id IS NULL OR id != p_appointment_id);
    
    SELECT conflict_count as has_conflicts;
END //

-- Procedure to get available time slots for a doctor on a specific date
CREATE PROCEDURE GetAvailableSlots(
    IN p_doctor_id BIGINT,
    IN p_appointment_date DATE,
    IN p_duration INT
)
BEGIN
    DECLARE day_of_week INT;
    DECLARE schedule_start TIME;
    DECLARE schedule_end TIME;
    DECLARE break_start TIME;
    DECLARE break_end TIME;
    
    -- Get day of week (1=Monday, 7=Sunday)
    SET day_of_week = DAYOFWEEK(p_appointment_date);
    IF day_of_week = 1 THEN SET day_of_week = 7; ELSE SET day_of_week = day_of_week - 1; END IF;
    
    -- Get doctor's schedule for this day
    SELECT start_time, end_time, break_start, break_end
    INTO schedule_start, schedule_end, break_start, break_end
    FROM doctor_schedules
    WHERE doctor_id = p_doctor_id AND day_of_week = day_of_week AND is_available = TRUE;
    
    -- Return available slots
    SELECT 
        TIME_FORMAT(slot_time, '%H:%i') as start_time,
        TIME_FORMAT(DATE_ADD(slot_time, INTERVAL p_duration MINUTE), '%H:%i') as end_time,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM appointments 
                WHERE doctor_id = p_doctor_id 
                AND appointment_date = p_appointment_date
                AND appointment_time < DATE_ADD(slot_time, INTERVAL p_duration MINUTE)
                AND end_time > slot_time
                AND status NOT IN ('CANCELLED', 'NO_SHOW')
            ) THEN FALSE
            ELSE TRUE
        END as available
    FROM (
        SELECT 
            schedule_start + INTERVAL (seq * 15) MINUTE as slot_time
        FROM (
            SELECT 0 as seq UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30 UNION SELECT 31 UNION SELECT 32 UNION SELECT 33 UNION SELECT 34 UNION SELECT 35
        ) numbers
        WHERE schedule_start + INTERVAL (seq * 15) MINUTE < schedule_end
        AND (break_start IS NULL OR 
             schedule_start + INTERVAL (seq * 15) MINUTE < break_start OR 
             schedule_start + INTERVAL (seq * 15) MINUTE >= break_end)
    ) slots
    WHERE slot_time + INTERVAL p_duration MINUTE <= schedule_end;
END //

DELIMITER ;

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================

DELIMITER //

-- Trigger to automatically set end_time based on duration
CREATE TRIGGER before_appointment_insert
BEFORE INSERT ON appointments
FOR EACH ROW
BEGIN
    IF NEW.end_time IS NULL THEN
        SET NEW.end_time = ADDTIME(NEW.appointment_time, SEC_TO_TIME(NEW.duration * 60));
    END IF;
END //

-- Trigger to log appointment changes
CREATE TRIGGER after_appointment_update
AFTER UPDATE ON appointments
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO appointment_audit_log (appointment_id, action, field_name, old_value, new_value, performed_by)
        VALUES (NEW.id, 'STATUS_CHANGED', 'status', OLD.status, NEW.status, NEW.updated_at);
    END IF;
    
    IF OLD.appointment_date != NEW.appointment_date OR OLD.appointment_time != NEW.appointment_time THEN
        INSERT INTO appointment_audit_log (appointment_id, action, field_name, old_value, new_value, performed_by)
        VALUES (NEW.id, 'RESCHEDULED', 'appointment_time', 
                CONCAT(OLD.appointment_date, ' ', OLD.appointment_time), 
                CONCAT(NEW.appointment_date, ' ', NEW.appointment_time), 
                NEW.updated_at);
    END IF;
END //

DELIMITER ;

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Composite indexes for common query patterns
CREATE INDEX idx_appointment_doctor_date_time ON appointments(doctor_id, appointment_date, appointment_time);
CREATE INDEX idx_appointment_patient_date ON appointments(patient_id, appointment_date);
CREATE INDEX idx_appointment_status_date ON appointments(status, appointment_date);
CREATE INDEX idx_appointment_type_date ON appointments(appointment_type, appointment_date);
CREATE INDEX idx_appointment_payment_status ON appointments(payment_status, appointment_date);

-- Full-text search indexes
CREATE FULLTEXT INDEX idx_appointment_search ON appointments(patient_name, doctor_name, reason, notes);

-- =====================================================
-- GRANT PERMISSIONS (adjust as needed)
-- =====================================================

-- Grant permissions to application user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON appointments TO 'eyesante_app'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON doctor_schedules TO 'eyesante_app'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON appointment_reminders TO 'eyesante_app'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON appointment_types TO 'eyesante_app'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON appointment_conflicts TO 'eyesante_app'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON appointment_audit_log TO 'eyesante_app'@'localhost';

-- Grant permissions to views
-- GRANT SELECT ON v_today_appointments TO 'eyesante_app'@'localhost';
-- GRANT SELECT ON v_available_slots TO 'eyesante_app'@'localhost';
-- GRANT SELECT ON v_appointment_statistics TO 'eyesante_app'@'localhost';

-- Grant permissions to stored procedures
-- GRANT EXECUTE ON PROCEDURE CheckAppointmentConflicts TO 'eyesante_app'@'localhost';
-- GRANT EXECUTE ON PROCEDURE GetAvailableSlots TO 'eyesante_app'@'localhost';

-- =====================================================
-- SCHEMA COMPLETION
-- =====================================================

-- Verify schema creation
SELECT 'Appointment schema created successfully!' as status; 