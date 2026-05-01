package com.example.mylab.repository;

import com.example.mylab.model.Lab;
import com.example.mylab.model.PC;
import com.example.mylab.model.PCStatus;
import com.example.mylab.model.PCType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PCRepository extends JpaRepository<PC, Long> {
    
    @org.springframework.data.jpa.repository.Query("SELECT p.lab.id, p.pcType.id, COUNT(p) " +
           "FROM PC p WHERE p.lab IS NOT NULL " +
           "GROUP BY p.lab.id, p.pcType.id")
    List<Object[]> findInventorySummary();

    @org.springframework.data.jpa.repository.Query("SELECT p.pcType.id, COUNT(p) " +
           "FROM PC p WHERE p.lab = :lab " +
           "GROUP BY p.pcType.id")
    List<Object[]> findInventorySummaryByLab(@org.springframework.data.repository.query.Param("lab") Lab lab);

    @org.springframework.data.jpa.repository.Query("SELECT p.pcType.id, p.status, COUNT(p) " +
           "FROM PC p WHERE p.lab = :lab " +
           "GROUP BY p.pcType.id, p.status")
    List<Object[]> findDetailedInventorySummaryByLab(@org.springframework.data.repository.query.Param("lab") Lab lab);

    List<PC> findByLab(Lab lab);
    List<PC> findByLabAndStatus(Lab lab, PCStatus status);
    Optional<PC> findByLabAndPcNumber(Lab lab, String pcNumber);
    long countByPcType(PCType pcType);
    List<PC> findByPcType(PCType pcType);
    List<PC> findByLabIsNull();
    List<PC> findByStatus(PCStatus status);
}
