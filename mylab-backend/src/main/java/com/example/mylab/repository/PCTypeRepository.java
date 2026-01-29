package com.example.mylab.repository;

import com.example.mylab.model.PCType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PCTypeRepository extends JpaRepository<PCType, Long> {
    Optional<PCType> findByBrandAndModelAndProductionYearAndRamAndRomAndProcessor(
        String brand, String model, Integer productionYear, String ram, String rom, String processor);
}

