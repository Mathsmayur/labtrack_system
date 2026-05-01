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
    
    @Query("SELECT c.pc.id, COUNT(c) FROM Complaint c GROUP BY c.pc.id ORDER BY COUNT(c) DESC")
    List<Object[]> findMostProblematicPCs();
    
    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.reportedAt BETWEEN :start AND :end")
    Long countByDateRange(@org.springframework.data.repository.query.Param("start") LocalDateTime start, @org.springframework.data.repository.query.Param("end") LocalDateTime end);
    
    @Query("SELECT c.reportedAt, c.resolvedAt FROM Complaint c WHERE c.resolvedAt IS NOT NULL")
    List<Object[]> findResolvedTimes();

    long countByStatus(com.example.mylab.model.ComplaintStatus status);
}
