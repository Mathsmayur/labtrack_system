package com.example.mylab.service;

import com.example.mylab.dto.BulkPCRequest;
import com.example.mylab.dto.PCDTO;
import com.example.mylab.model.Lab;
import com.example.mylab.model.PC;
import com.example.mylab.model.PCStatus;
import com.example.mylab.model.PCType;
import com.example.mylab.repository.LabRepository;
import com.example.mylab.repository.PCRepository;
import com.example.mylab.repository.PCTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PCService {

    @Autowired
    private PCRepository pcRepository;

    @Autowired
    private LabRepository labRepository;

    @Autowired
    private PCTypeRepository pcTypeRepository;
    
    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    public PCDTO createPC(PCDTO pcDTO) {
        // Validate PC number
        if (pcDTO.getPcNumber() == null || pcDTO.getPcNumber().trim().isEmpty()) {
            throw new RuntimeException("PC number is required");
        }

        Lab lab = null;
        if (pcDTO.getLabId() != null) {
            lab = labRepository.findById(pcDTO.getLabId())
                .orElseThrow(() -> new RuntimeException("Lab not found"));
        }

        if (lab != null && pcRepository.findByLabAndPcNumber(lab, pcDTO.getPcNumber()).isPresent()) {
            throw new RuntimeException("PC number already exists in this lab");
        }

        PC pc = new PC();
        pc.setPcNumber(pcDTO.getPcNumber());
        pc.setLab(lab);
        pc.setStatus(pcDTO.getStatus() != null ? pcDTO.getStatus() : PCStatus.WORKING);

        // Resolve or create PCType
        PCType pcType = null;
        // Treat null or non-positive IDs (e.g. 0) as "not provided"
        if (pcDTO.getPcTypeId() != null && pcDTO.getPcTypeId() > 0) {
            pcType = pcTypeRepository.findById(pcDTO.getPcTypeId())
                .orElseThrow(() -> new RuntimeException("PC type not found"));
        } else if (pcDTO.getBrand() != null && !pcDTO.getBrand().trim().isEmpty()) {
            // Validate that all required PC type fields are provided
            if (pcDTO.getModel() == null || pcDTO.getModel().trim().isEmpty()) {
                throw new RuntimeException("Model is required when providing PC type information");
            }
            if (pcDTO.getRam() == null || pcDTO.getRam().trim().isEmpty()) {
                throw new RuntimeException("RAM is required when providing PC type information");
            }
            if (pcDTO.getRom() == null || pcDTO.getRom().trim().isEmpty()) {
                throw new RuntimeException("ROM is required when providing PC type information");
            }
            if (pcDTO.getProcessor() == null || pcDTO.getProcessor().trim().isEmpty()) {
                throw new RuntimeException("Processor is required when providing PC type information");
            }
            
            pcType = pcTypeRepository.findByBrandAndModelAndProductionYearAndRamAndRomAndProcessor(
                pcDTO.getBrand(),
                pcDTO.getModel(),
                pcDTO.getProductionYear(),
                pcDTO.getRam(),
                pcDTO.getRom(),
                pcDTO.getProcessor()
            ).orElse(null);
            if (pcType == null) {
                pcType = new PCType();
                pcType.setBrand(pcDTO.getBrand());
                pcType.setModel(pcDTO.getModel());
                pcType.setProductionYear(pcDTO.getProductionYear());
                pcType.setRam(pcDTO.getRam());
                pcType.setRom(pcDTO.getRom());
                pcType.setProcessor(pcDTO.getProcessor());
                pcType.setTotalQuantity(1);
                pcType = pcTypeRepository.save(pcType);
            }
        } else {
            throw new RuntimeException("PC type information required. Please provide brand, model, RAM, ROM, and processor.");
        }

        pc.setPcType(pcType);

        PC savedPC = pcRepository.save(pc);
        return convertToDTO(savedPC);
    }

    public List<PCDTO> createBulkPCs(BulkPCRequest request) {
        // find or create PCType
        PCType pcType = pcTypeRepository.findByBrandAndModelAndProductionYearAndRamAndRomAndProcessor(
            request.getBrand(),
            request.getModel(),
            request.getProductionYear(),
            request.getRam(),
            request.getRom(),
            request.getProcessor()
        ).orElse(null);

        if (pcType == null) {
            pcType = new PCType();
            pcType.setBrand(request.getBrand());
            pcType.setModel(request.getModel());
            pcType.setProductionYear(request.getProductionYear());
            pcType.setRam(request.getRam());
            pcType.setRom(request.getRom());
            pcType.setProcessor(request.getProcessor());
            pcType.setTotalQuantity(request.getQuantity());
            pcType = pcTypeRepository.save(pcType);
        } else {
            // Set the total quantity to requested number (admin provides total)
            pcType.setTotalQuantity(request.getQuantity());
            pcType = pcTypeRepository.save(pcType);
        }

        long existingCount = pcRepository.countByPcType(pcType);
        int toCreate = (int) Math.max(0, request.getQuantity() - existingCount);

        Lab lab = null;
        if (request.getLabId() != null) {
            lab = labRepository.findById(request.getLabId())
                .orElseThrow(() -> new RuntimeException("Lab not found"));
        }

        List<PCDTO> created = new ArrayList<>();
        for (int i = 0; i < toCreate; i++) {
            PC pc = new PC();
            pc.setPcNumber(null); // will be assigned later by professor
            pc.setLab(lab);
            pc.setStatus(PCStatus.WORKING);
            pc.setPcType(pcType);
            PC saved = pcRepository.save(pc);
            created.add(convertToDTO(saved));
        }

        return created;
    }

    public PCDTO updatePC(Long id, PCDTO pcDTO) {
        PC pc = pcRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("PC not found"));

        if (pcDTO.getStatus() != null) {
            pc.setStatus(pcDTO.getStatus());
        }
        if (pcDTO.getLabId() != null) {
            Lab lab = labRepository.findById(pcDTO.getLabId())
                .orElseThrow(() -> new RuntimeException("Lab not found"));
            pc.setLab(lab);
        }
        if (pcDTO.getPcNumber() != null) {
            pc.setPcNumber(pcDTO.getPcNumber());
        }

        PC updatedPC = pcRepository.save(pc);
        return convertToDTO(updatedPC);
    }

    public List<PCDTO> getUnassignedPCs() {
        return pcRepository.findByLabIsNull().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public void deletePC(Long id) {
        pcRepository.deleteById(id);
    }

    public List<PCDTO> getPCsByLab(Long labId) {
        Lab lab = labRepository.findById(labId)
            .orElseThrow(() -> new RuntimeException("Lab not found"));
        return pcRepository.findByLab(lab).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public List<PCDTO> getPCsByLabAndStatus(Long labId, PCStatus status) {
        Lab lab = labRepository.findById(labId)
            .orElseThrow(() -> new RuntimeException("Lab not found"));
        return pcRepository.findByLabAndStatus(lab, status).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public PCDTO getPCById(Long id) {
        PC pc = pcRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("PC not found"));
        return convertToDTO(pc);
    }

    public PCDTO convertToDTO(PC pc) {
        Long labId = pc.getLab() != null ? pc.getLab().getId() : null;
        String labName = pc.getLab() != null ? pc.getLab().getName() : null;
        String department = pc.getLab() != null ? pc.getLab().getDepartment() : null;
        PCType type = pc.getPcType();
        return new PCDTO(
            pc.getId(),
            pc.getPcNumber(),
            labId,
            labName,
            department,
            pc.getStatus(),
            type != null ? type.getId() : null,
            type != null ? type.getBrand() : null,
            type != null ? type.getModel() : null,
            type != null ? type.getProductionYear() : null,
            type != null ? type.getRam() : null,
            type != null ? type.getRom() : null,
            type != null ? type.getProcessor() : null,
            pc.getComplaints() != null ? pc.getComplaints().stream()
                .filter(c -> !c.getStatus().equals(com.example.mylab.model.ComplaintStatus.RESOLVED))
                .sorted((a, b) -> b.getReportedAt().compareTo(a.getReportedAt()))
                .map(c -> c.getProblemType().name())
                .findFirst().orElse(null) : null
        );
    }

    public java.util.List<com.example.mylab.dto.InvalidPcTypeDTO> getPcsWithInvalidPcType() {
        String sql = "SELECT id, pc_number, pc_type_id, lab_id FROM pcs WHERE pc_type_id IS NOT NULL AND (pc_type_id <= 0 OR pc_type_id NOT IN (SELECT id FROM pc_types))";
        return jdbcTemplate.query(sql, (rs, rowNum) -> new com.example.mylab.dto.InvalidPcTypeDTO(
            rs.getLong("id"),
            rs.getString("pc_number"),
            rs.getObject("pc_type_id") != null ? rs.getLong("pc_type_id") : null,
            rs.getObject("lab_id") != null ? rs.getLong("lab_id") : null
        ));
    }

    public void cleanupPcTypeById(Long id) {
        jdbcTemplate.update("UPDATE pcs SET pc_type_id = NULL WHERE id = ?", id);
    }

    public int cleanupAllInvalidPcTypes() {
        String sql = "UPDATE pcs SET pc_type_id = NULL WHERE pc_type_id IS NOT NULL AND (pc_type_id <= 0 OR pc_type_id NOT IN (SELECT id FROM pc_types))";
        return jdbcTemplate.update(sql);
    }
}
