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
    List<PC> findByLab(Lab lab);
    List<PC> findByLabAndStatus(Lab lab, PCStatus status);
    Optional<PC> findByLabAndPcNumber(Lab lab, String pcNumber);
    long countByPcType(PCType pcType);
    List<PC> findByPcType(PCType pcType);
    List<PC> findByLabIsNull();
}
