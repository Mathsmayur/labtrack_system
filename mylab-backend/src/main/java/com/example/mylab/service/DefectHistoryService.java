package com.example.mylab.service;

import com.example.mylab.model.DefectHistory;
import com.example.mylab.model.PC;
import com.example.mylab.repository.DefectHistoryRepository;
import com.example.mylab.repository.PCRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DefectHistoryService {

    @Autowired
    private DefectHistoryRepository defectHistoryRepository;

    @Autowired
    private PCRepository pcRepository;

    public List<DefectHistory> getDefectHistoryByPC(Long pcId) {
        PC pc = pcRepository.findById(pcId)
            .orElseThrow(() -> new RuntimeException("PC not found"));
        return defectHistoryRepository.findByPcOrderByOccurredAtDesc(pc);
    }
}
