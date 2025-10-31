package com.rossumtechsystems.eyesante_backend.service;

import com.rossumtechsystems.eyesante_backend.entity.Department;
import com.rossumtechsystems.eyesante_backend.repository.DepartmentRepository;
import com.rossumtechsystems.eyesante_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;


@Service
public class DepartmentService {
    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private UserRepository userRepository;

    // @PostConstruct
    public void initDefaultDepartments() {
        createIfNotExists("Reception", "Handles new and returning patients, general registration");
        createIfNotExists("Optometry", "Handles eye examinations and vision testing");
        createIfNotExists("Ophthalmology", "Handles medical eye care and treatments");
        createIfNotExists("Contact Lens", "Handles contact lens fitting and management");
        createIfNotExists("Optical", "Handles eyeglass dispensing and frame selection");
        createIfNotExists("Surgery", "Handles eye surgeries and procedures");
        createIfNotExists("Emergency", "Handles emergency eye care and urgent cases");
        createIfNotExists("Administration", "Handles administrative tasks and management");
    }

    private void createIfNotExists(String name, String description) {
        if (!departmentRepository.existsByName(name)) {
            Department dept = new Department();
            dept.setName(name);
            dept.setDescription(description);
            dept.setEnabled(true);
            departmentRepository.save(dept);
        }
    }

    public Page<Department> getAllDepartments(Pageable pageable) {
        return departmentRepository.findAll(pageable);
    }

    public Department createDepartment(Department department) {
        return departmentRepository.save(department);
    }

    public Department updateDepartment(Long id, Department department) {
        Department existingDepartment = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));
        
        existingDepartment.setName(department.getName());
        existingDepartment.setDescription(department.getDescription());
        existingDepartment.setEnabled(department.isEnabled());
        
        return departmentRepository.save(existingDepartment);
    }

    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));
        
        // Check if department has any users assigned to it
        long userCount = userRepository.countByDepartment(department);
        if (userCount > 0) {
            throw new RuntimeException("Cannot delete department as it has " + userCount + " user(s) assigned to it");
        }
        
        departmentRepository.deleteById(id);
    }

    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));
    }
} 