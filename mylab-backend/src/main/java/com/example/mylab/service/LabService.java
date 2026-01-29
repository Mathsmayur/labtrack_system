package com.example.mylab.service;

import com.example.mylab.dto.LabDTO;
import com.example.mylab.model.Lab;
import com.example.mylab.repository.LabRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LabService {

    @Autowired
    private LabRepository labRepository;

    public List<LabDTO> getAllLabs() {
        return labRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public List<LabDTO> getLabsByDepartment(String department) {
        return labRepository.findByDepartment(department).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public LabDTO getLabById(Long id) {
        Lab lab = labRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Lab not found"));
        return convertToDTO(lab);
    }

    public LabDTO convertToDTO(Lab lab) {
        return new LabDTO(lab.getId(), lab.getName(), lab.getDepartment());
    }

    public LabDTO createLab(LabDTO labDTO) {
        Lab lab = new Lab();
        lab.setName(labDTO.getName());
        lab.setDepartment(labDTO.getDepartment());
        Lab saved = labRepository.save(lab);
        return convertToDTO(saved);
    }

    public LabDTO updateLab(Long id, LabDTO labDTO) {
        Lab lab = labRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Lab not found"));
        if (labDTO.getName() != null) lab.setName(labDTO.getName());
        if (labDTO.getDepartment() != null) lab.setDepartment(labDTO.getDepartment());
        Lab saved = labRepository.save(lab);
        return convertToDTO(saved);
    }

    public void deleteLab(Long id) {
        labRepository.deleteById(id);
    }
}
