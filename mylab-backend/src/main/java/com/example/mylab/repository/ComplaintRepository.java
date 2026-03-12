package com.example.mylab.repository;

import com.example.mylab.model.Complaint;
import com.example.mylab.model.PC;
import com.example.mylab.model.ProblemType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByPc(PC pc);
    
    @Query("SELECT c.problemType, COUNT(c) FROM Complaint c GROUP BY c.problemType ORDER BY COUNT(c) DESC")
    List<Object[]> findMostCommonProblems();
    
    @Query("SELECT c.pc, COUNT(c) FROM Complaint c GROUP BY c.pc ORDER BY COUNT(c) DESC")
    List<Object[]> findMostProblematicPCs();
    
    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.reportedAt BETWEEN :start AND :end")
    Long countByDateRange(LocalDateTime start, LocalDateTime end);
    
    @Query(value = "SELECT AVG(TIMESTAMPDIFF(MINUTE, reported_at, resolved_at)) FROM complaints WHERE resolved_at IS NOT NULL", nativeQuery = true)
    Double findAverageRepairTime();

    long countByStatus(com.example.mylab.model.ComplaintStatus status);
}
