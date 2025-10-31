-- Create procedures table if it doesn't exist
CREATE TABLE IF NOT EXISTS procedures (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255),
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    updated_by VARCHAR(100)
);

-- Add price and is_active columns to procedures table if they don't exist
ALTER TABLE procedures 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Create patient_procedures table
CREATE TABLE IF NOT EXISTS patient_procedures (
    id BIGSERIAL PRIMARY KEY,
    visit_session_id BIGINT NOT NULL,
    procedure_id BIGINT NOT NULL,
    eye_side VARCHAR(10) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    performed BOOLEAN NOT NULL DEFAULT false,
    performed_by VARCHAR(255),
    performed_date TIMESTAMP NULL,
    staff_fee DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    updated_by VARCHAR(100),
    
    FOREIGN KEY (visit_session_id) REFERENCES patient_visit_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (procedure_id) REFERENCES procedures(id) ON DELETE CASCADE
);

-- Add some sample procedures with pricing (only if table is empty)
INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Eye Clinic: Cataract, single eye (>12 years; Adult)', 'Cataract surgery for single eye in adults', 'Eye Clinic', 500000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Eye Clinic: Cataract, bilateral (>12 years; Adult)', 'Cataract surgery for both eyes in adults', 'Eye Clinic', 900000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Eye Clinic: Cataract, single eye (<=12 years; Child)', 'Cataract surgery for single eye in children', 'Eye Clinic', 400000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Eye Clinic: Cataract, bilateral (<=12 years; Child)', 'Cataract surgery for both eyes in children', 'Eye Clinic', 700000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Eye Clinic: Refraction (>12 years; Adult)', 'Refraction examination for adults', 'Eye Clinic', 50000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Eye Clinic: Refraction (<=12 years; Child)', 'Refraction examination for children', 'Eye Clinic', 40000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Eye Clinic: Intra-ocular Pressure (>12 years; Adult)', 'IOP measurement for adults', 'Eye Clinic', 30000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Eye Clinic: Intra-ocular Pressure (<=12 years; Child)', 'IOP measurement for children', 'Eye Clinic', 25000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Eye Clinic: Corneal Foreign Bodies (>12 years; Adult)', 'Corneal foreign body removal for adults', 'Eye Clinic', 80000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Eye Clinic: Corneal Foreign Bodies (<=12 years; Child)', 'Corneal foreign body removal for children', 'Eye Clinic', 70000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Eye Clinic: Conjunctival Surgery, single eye (>12 years; Adult)', 'Conjunctival surgery for single eye in adults', 'Eye Clinic', 120000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Eye Clinic: Conjunctival Surgery, bilateral (>12 years; Adult)', 'Conjunctival surgery for both eyes in adults', 'Eye Clinic', 200000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Eye Clinic: Trabeculectomy, single eye (>12 years; Adult)', 'Trabeculectomy for single eye in adults', 'Eye Clinic', 300000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Eye Clinic: Trabeculectomy, bilateral (>12 years; Adult)', 'Trabeculectomy for both eyes in adults', 'Eye Clinic', 500000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Eye Clinic: Vitrectomy, single eye (>12 years; Adult)', 'Vitrectomy for single eye in adults', 'Eye Clinic', 400000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Eye Clinic: Vitrectomy, bilateral (>12 years; Adult)', 'Vitrectomy for both eyes in adults', 'Eye Clinic', 700000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Slit Lamp Examination', 'Slit lamp examination of the eye', 'Examination', 25000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Fundus Examination', 'Fundus examination with ophthalmoscope', 'Examination', 35000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Visual Field Test', 'Automated visual field testing', 'Examination', 45000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Color Vision Test', 'Color vision testing (Ishihara)', 'Examination', 15000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Tonometry', 'Intraocular pressure measurement', 'Examination', 20000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Biometry', 'Eye measurements for IOL calculation', 'Examination', 60000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'A-Scan Ultrasound', 'A-scan ultrasound for eye measurements', 'Examination', 40000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'B-Scan Ultrasound', 'B-scan ultrasound for eye imaging', 'Examination', 80000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Optical Coherence Tomography (OCT)', 'OCT scan of retina and optic nerve', 'Examination', 150000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Fluorescein Angiography', 'Fluorescein angiography for retinal imaging', 'Examination', 200000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Laser Photocoagulation', 'Laser treatment for retinal conditions', 'Treatment', 250000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'YAG Laser Capsulotomy', 'YAG laser for posterior capsular opacification', 'Treatment', 100000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Argon Laser Trabeculoplasty', 'Laser treatment for glaucoma', 'Treatment', 150000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Intravitreal Injection', 'Intravitreal medication injection', 'Treatment', 120000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Pterygium Excision', 'Surgical removal of pterygium', 'Surgery', 180000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Chalazion Excision', 'Surgical removal of chalazion', 'Surgery', 80000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Eyelid Surgery', 'Eyelid surgery for various conditions', 'Surgery', 200000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Dacryocystorhinostomy (DCR)', 'Surgery for blocked tear ducts', 'Surgery', 300000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Glasses Prescription', 'Prescription for corrective glasses', 'Prescription', 10000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Contact Lens Fitting', 'Contact lens fitting and training', 'Prescription', 50000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Low Vision Assessment', 'Assessment for low vision aids', 'Assessment', 75000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Pediatric Eye Assessment', 'Comprehensive eye assessment for children', 'Assessment', 60000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Diabetic Eye Screening', 'Screening for diabetic retinopathy', 'Screening', 40000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);

INSERT INTO procedures (name, description, category, price, is_active, created_by) 
SELECT 'Glaucoma Screening', 'Screening for glaucoma', 'Screening', 35000.00, true, 'system'
WHERE NOT EXISTS (SELECT 1 FROM procedures LIMIT 1);
