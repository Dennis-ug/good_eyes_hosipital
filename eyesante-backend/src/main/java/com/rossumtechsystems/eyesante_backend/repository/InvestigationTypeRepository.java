package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.InvestigationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InvestigationTypeRepository extends JpaRepository<InvestigationType, Long> {
    @Query("select it from InvestigationType it where it.isActive = true order by it.name asc")
    List<InvestigationType> findAllActive();
}


