package com.rossumtechsystems.eyesante_backend.repository;

import com.rossumtechsystems.eyesante_backend.entity.eye_exmination.MainExamination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MainExaminationRepository extends JpaRepository<MainExamination, Long> {

    @Query("select distinct me from MainExamination me left join fetch me.slitLampObservations where me.id = :id")
    Optional<MainExamination> findByIdWithObservations(@Param("id") Long id);

    @Query("select distinct me from MainExamination me left join fetch me.slitLampObservations where me.visitSession.id = :vsId")
    Optional<MainExamination> findByVisitSessionIdWithObservations(@Param("vsId") Long visitSessionId);
}

