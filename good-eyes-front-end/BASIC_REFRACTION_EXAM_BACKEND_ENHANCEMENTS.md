# Basic Refraction Exam Backend Enhancements

## Overview
This document outlines the necessary backend enhancements for the Basic Refraction Exam API to support a comprehensive optometric examination system.

## Current Status
- ✅ Basic CRUD operations implemented
- ✅ Core refraction fields present
- ✅ Patient details integration
- ✅ Workflow integration

## Required Enhancements

### 1. Keratometry Fields (HIGH PRIORITY)

#### Database Schema Changes
```sql
-- Add keratometry columns to basic_refraction_exam table
ALTER TABLE basic_refraction_exam 
ADD COLUMN keratometry_right_k1 DECIMAL(5,2),
ADD COLUMN keratometry_right_k2 DECIMAL(5,2),
ADD COLUMN keratometry_right_axis INTEGER,
ADD COLUMN keratometry_left_k1 DECIMAL(5,2),
ADD COLUMN keratometry_left_k2 DECIMAL(5,2),
ADD COLUMN keratometry_left_axis INTEGER;
```

#### Entity Updates
```java
@Entity
@Table(name = "basic_refraction_exam")
public class BasicRefractionExam {
    // ... existing fields ...
    
    @Column(name = "keratometry_right_k1", precision = 5, scale = 2)
    private Double keratometryRightK1;
    
    @Column(name = "keratometry_right_k2", precision = 5, scale = 2)
    private Double keratometryRightK2;
    
    @Column(name = "keratometry_right_axis")
    private Integer keratometryRightAxis;
    
    @Column(name = "keratometry_left_k1", precision = 5, scale = 2)
    private Double keratometryLeftK1;
    
    @Column(name = "keratometry_left_k2", precision = 5, scale = 2)
    private Double keratometryLeftK2;
    
    @Column(name = "keratometry_left_axis")
    private Integer keratometryLeftAxis;
}
```

### 2. Pupil Measurements (MEDIUM PRIORITY)

#### Database Schema Changes
```sql
-- Add pupil measurement columns
ALTER TABLE basic_refraction_exam 
ADD COLUMN pupil_size_right DECIMAL(4,1),
ADD COLUMN pupil_size_left DECIMAL(4,1),
ADD COLUMN pupil_size_unit VARCHAR(10) DEFAULT 'mm';
```

### 3. Intraocular Pressure (MEDIUM PRIORITY)

#### Database Schema Changes
```sql
-- Add IOP measurement columns
ALTER TABLE basic_refraction_exam 
ADD COLUMN iop_right INTEGER,
ADD COLUMN iop_left INTEGER,
ADD COLUMN iop_method VARCHAR(50);
```

### 4. Color Vision Testing (MEDIUM PRIORITY)

#### Database Schema Changes
```sql
-- Add color vision columns
ALTER TABLE basic_refraction_exam 
ADD COLUMN color_vision_right VARCHAR(20),
ADD COLUMN color_vision_left VARCHAR(20),
ADD COLUMN color_vision_test VARCHAR(30);
```

### 5. Stereopsis Measurement (MEDIUM PRIORITY)

#### Database Schema Changes
```sql
-- Add stereopsis columns
ALTER TABLE basic_refraction_exam 
ADD COLUMN stereopsis INTEGER,
ADD COLUMN stereopsis_unit VARCHAR(20) DEFAULT 'arcseconds';
```

## Implementation Priority

### 🔴 HIGH PRIORITY (Immediate Implementation)
1. **Keratometry Fields** - Essential for corneal measurements
2. **Examination Date** - Make optional in request body

### 🟡 MEDIUM PRIORITY (Next Sprint)
3. **Pupil Measurements** - Important for comprehensive exam
4. **Intraocular Pressure** - Standard in optometry
5. **Color Vision Testing** - Basic screening
6. **Stereopsis Measurement** - Depth perception

### 🟢 LOW PRIORITY (Future Releases)
7. **Cycloplegic Refraction** - Advanced technique
8. **Near Addition** - Presbyopia management
9. **Clinical Assessment** - Diagnosis and treatment
10. **Equipment Tracking** - Quality assurance

## Service Layer Updates

### BasicRefractionExamService.java
```java
@Service
public class BasicRefractionExamService {
    
    // Update createBasicRefractionExam method
    public BasicRefractionExam createBasicRefractionExam(CreateBasicRefractionExamRequest request) {
        BasicRefractionExam exam = new BasicRefractionExam();
        
        // ... existing mappings ...
        
        // Map new fields
        exam.setKeratometryRightK1(request.getKeratometryRightK1());
        exam.setKeratometryRightK2(request.getKeratometryRightK2());
        exam.setKeratometryRightAxis(request.getKeratometryRightAxis());
        exam.setKeratometryLeftK1(request.getKeratometryLeftK1());
        exam.setKeratometryLeftK2(request.getKeratometryLeftK2());
        exam.setKeratometryLeftAxis(request.getKeratometryLeftAxis());
        
        return basicRefractionExamRepository.save(exam);
    }
}
```

## Validation Rules

### Keratometry Validation
```java
@Min(value = 30, message = "Keratometry K1 must be at least 30")
@Max(value = 50, message = "Keratometry K1 must be at most 50")
private Double keratometryRightK1;

@Min(value = 0, message = "Keratometry axis must be at least 0")
@Max(value = 180, message = "Keratometry axis must be at most 180")
private Integer keratometryRightAxis;
```

## Database Migration Script

### V2__Add_Basic_Refraction_Enhancements.sql
```sql
-- Migration script for basic refraction exam enhancements

-- Add keratometry fields
ALTER TABLE basic_refraction_exam 
ADD COLUMN keratometry_right_k1 DECIMAL(5,2),
ADD COLUMN keratometry_right_k2 DECIMAL(5,2),
ADD COLUMN keratometry_right_axis INTEGER,
ADD COLUMN keratometry_left_k1 DECIMAL(5,2),
ADD COLUMN keratometry_left_k2 DECIMAL(5,2),
ADD COLUMN keratometry_left_axis INTEGER;

-- Add pupil measurements
ALTER TABLE basic_refraction_exam 
ADD COLUMN pupil_size_right DECIMAL(4,1),
ADD COLUMN pupil_size_left DECIMAL(4,1),
ADD COLUMN pupil_size_unit VARCHAR(10) DEFAULT 'mm';

-- Add IOP measurements
ALTER TABLE basic_refraction_exam 
ADD COLUMN iop_right INTEGER,
ADD COLUMN iop_left INTEGER,
ADD COLUMN iop_method VARCHAR(50);

-- Add indexes for better performance
CREATE INDEX idx_basic_refraction_keratometry ON basic_refraction_exam(keratometry_right_k1, keratometry_left_k1);
CREATE INDEX idx_basic_refraction_iop ON basic_refraction_exam(iop_right, iop_left);
```

## Updated Request Body Example
```json
{
  "visitSessionId": 1,
  "neuroOriented": true,
  "keratometryRightK1": 43.50,
  "keratometryRightK2": 44.25,
  "keratometryRightAxis": 90,
  "keratometryLeftK1": 43.75,
  "keratometryLeftK2": 44.00,
  "keratometryLeftAxis": 85,
  "pupilSizeRight": 4.5,
  "pupilSizeLeft": 4.0,
  "pupilSizeUnit": "mm",
  "iopRight": 16,
  "iopLeft": 15,
  "iopMethod": "GOLDMANN_TONOMETRY"
}
```

## Implementation Timeline

### Phase 1 (Week 1-2): High Priority
- [ ] Database schema updates for keratometry
- [ ] Entity and DTO updates
- [ ] Service layer implementation
- [ ] Basic validation
- [ ] Unit tests

### Phase 2 (Week 3-4): Medium Priority
- [ ] Pupil measurements
- [ ] IOP measurements
- [ ] Color vision testing
- [ ] Stereopsis measurement
- [ ] Integration tests

## Conclusion

These enhancements will transform the Basic Refraction Exam API into a comprehensive optometric examination system that supports complete corneal assessment, pupil evaluation, intraocular pressure monitoring, and additional screening capabilities.
