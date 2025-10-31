-- Drop existing tables if they exist
DROP TABLE IF EXISTS diagnoses CASCADE;
DROP TABLE IF EXISTS diagnosis_categories CASCADE;

-- Create diagnosis categories table with proper audit fields
CREATE TABLE diagnosis_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by VARCHAR(255)
);

-- Create diagnoses table with proper audit fields
CREATE TABLE diagnoses (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id BIGINT REFERENCES diagnosis_categories(id),
    created_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by VARCHAR(255),
    UNIQUE(name, category_id)
);

-- Seed diagnosis categories based on the reference modal
INSERT INTO diagnosis_categories (name, description, created_at, updated_at) VALUES
('Eye Lids', 'Conditions and abnormalities affecting the eyelids', NOW(), NOW()),
('Normal Eyes', 'Normal eye examination findings', NOW(), NOW()),
('Sclera', 'Conditions affecting the white outer layer of the eye', NOW(), NOW()),
('Choroid', 'Conditions affecting the choroid layer of the eye', NOW(), NOW()),
('Retina', 'Conditions affecting the retina and retinal blood vessels', NOW(), NOW()),
('Vitreous', 'Conditions affecting the vitreous humor', NOW(), NOW()),
('Eye Ball Deformity', 'Structural abnormalities of the eyeball', NOW(), NOW()),
('Optic Nerve', 'Conditions affecting the optic nerve', NOW(), NOW()),
('Glaucoma', 'Glaucoma and related conditions', NOW(), NOW()),
('Strabismus or ocular motility', 'Eye movement disorders and strabismus', NOW(), NOW()),
('Nystagmus', 'Involuntary eye movement disorders', NOW(), NOW()),
('Visual field Defect', 'Visual field abnormalities and defects', NOW(), NOW()),
('Colour vision deficiency', 'Color vision disorders and deficiencies', NOW(), NOW()),
('Refraction', 'Refractive errors and correction', NOW(), NOW()),
('Lens', 'Conditions affecting the crystalline lens', NOW(), NOW()),
('Pupils', 'Pupillary abnormalities and conditions', NOW(), NOW()),
('Anterior Uveitis', 'Inflammation of the anterior uvea', NOW(), NOW()),
('Iris', 'Conditions affecting the iris', NOW(), NOW()),
('Conjunctiva', 'Conditions affecting the conjunctiva', NOW(), NOW()),
('Cornea', 'Conditions affecting the cornea', NOW(), NOW()),
('Lacrimal system', 'Conditions affecting tear production and drainage', NOW(), NOW()),
('Orbit', 'Conditions affecting the eye socket and surrounding structures', NOW(), NOW());
