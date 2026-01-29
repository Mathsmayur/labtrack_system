package com.example.mylab.repository;

import com.example.mylab.model.DefectHistory;
import com.example.mylab.model.PC;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DefectHistoryRepository extends JpaRepository<DefectHistory, Long> {
    List<DefectHistory> findByPc(PC pc);
    List<DefectHistory> findByPcOrderByOccurredAtDesc(PC pc);
}
