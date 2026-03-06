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

    public List<com.example.mylab.dto.DefectHistoryDTO> getDefectHistoryByPC(Long pcId) {
        PC pc = pcRepository.findById(pcId)
            .orElseThrow(() -> new RuntimeException("PC not found"));
        return defectHistoryRepository.findByPcOrderByOccurredAtDesc(pc).stream()
                .map(this::convertToDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    private com.example.mylab.dto.DefectHistoryDTO convertToDTO(DefectHistory history) {
        return new com.example.mylab.dto.DefectHistoryDTO(
                history.getId(),
                history.getPc().getId(),
                history.getProblemType(),
                history.getDescription(),
                history.getOccurredAt(),
                history.getResolvedAt(),
                history.getStatus(),
                history.getTechnicianRemarks()
        );
    }
}
