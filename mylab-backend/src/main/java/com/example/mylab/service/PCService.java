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
    private com.example.mylab.repository.ComplaintRepository complaintRepository;

    @Autowired
    private com.example.mylab.repository.DefectHistoryRepository defectHistoryRepository;
    
    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    public PCDTO createPC(PCDTO pcDTO) {
        Lab lab = null;
        if (pcDTO.getLabId() != null) {
            lab = labRepository.findById(pcDTO.getLabId())
                .orElseThrow(() -> new RuntimeException("Lab not found"));
        }

        String pcNumber = pcDTO.getPcNumber();
        if (pcNumber == null || pcNumber.trim().isEmpty()) {
            if (lab != null) {
                int maxNum = getMaxPcNumberForLab(lab);
                String prefix = getPcPrefixForLab(lab);
                pcNumber = String.format("%s%02d", prefix, maxNum + 1);
            } else {
                pcNumber = null;
            }
        } else {
            if (lab != null && pcRepository.findByLabAndPcNumber(lab, pcNumber).isPresent()) {
                throw new RuntimeException("PC number already exists in this lab");
            }
        }

        PC pc = new PC();
        pc.setPcNumber(pcNumber);
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
            // Increment the total quantity by the new PCs being added
            pcType.setTotalQuantity(pcType.getTotalQuantity() + request.getQuantity());
            pcType = pcTypeRepository.save(pcType);
        }

        int toCreate = request.getQuantity() != null ? request.getQuantity() : 0;

        Lab lab = null;
        if (request.getLabId() != null) {
            lab = labRepository.findById(request.getLabId())
                .orElseThrow(() -> new RuntimeException("Lab not found"));
        }

        int maxNum = getMaxPcNumberForLab(lab);
        String prefix = getPcPrefixForLab(lab);

        List<PCDTO> created = new ArrayList<>();
        for (int i = 0; i < toCreate; i++) {
            PC pc = new PC();
            if (lab != null) {
                maxNum++;
                pc.setPcNumber(String.format("%s%02d", prefix, maxNum));
            } else {
                pc.setPcNumber(null);
            }
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

        if (pcDTO.getStatus() != null && pcDTO.getStatus() != pc.getStatus()) {
            pc.setStatus(pcDTO.getStatus());
            
            if (pcDTO.getStatus() == PCStatus.WORKING) {
                // Resolve complaints
                complaintRepository.findByPc(pc).stream()
                    .filter(c -> c.getStatus() != com.example.mylab.model.ComplaintStatus.RESOLVED)
                    .forEach(c -> {
                        c.setStatus(com.example.mylab.model.ComplaintStatus.RESOLVED);
                        c.setResolvedAt(java.time.LocalDateTime.now());
                        complaintRepository.save(c);
                    });
                
                // Resolve defect history
                defectHistoryRepository.findByPc(pc).stream()
                    .filter(dh -> dh.getStatus() != com.example.mylab.model.ComplaintStatus.RESOLVED)
                    .forEach(dh -> {
                        dh.setStatus(com.example.mylab.model.ComplaintStatus.RESOLVED);
                        dh.setResolvedAt(java.time.LocalDateTime.now());
                        dh.setTechnicianRemarks("Auto-resolved via PC status update");
                        defectHistoryRepository.save(dh);
                    });
            }
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

    public List<PCDTO> getPCsByStatus(PCStatus status) {
        return pcRepository.findByStatus(status).stream()
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
                .filter(c -> c.getStatus() != null && !c.getStatus().equals(com.example.mylab.model.ComplaintStatus.RESOLVED))
                .sorted((a, b) -> {
                    if (a.getReportedAt() == null && b.getReportedAt() == null) return 0;
                    if (a.getReportedAt() == null) return 1;
                    if (b.getReportedAt() == null) return -1;
                    return b.getReportedAt().compareTo(a.getReportedAt());
                })
                .map(c -> c.getProblemType() != null ? c.getProblemType().name() : null)
                .filter(java.util.Objects::nonNull)
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

    private int getMaxPcNumberForLab(Lab lab) {
        if (lab == null) return 0;
        int maxNum = 0;
        String prefix = getPcPrefixForLab(lab);
        List<PC> existingPcs = pcRepository.findByLab(lab);
        for (PC existingPc : existingPcs) {
            String numStr = existingPc.getPcNumber();
            if (numStr != null) {
                try {
                    if (numStr.startsWith(prefix)) {
                        int num = Integer.parseInt(numStr.substring(prefix.length()));
                        if (num > maxNum) maxNum = num;
                    } else if (numStr.matches(".*PC-\\d+")) {
                        int num = Integer.parseInt(numStr.substring(numStr.lastIndexOf("PC-") + 3));
                        if (num > maxNum) maxNum = num;
                    }
                } catch (Exception ignored) {}
            }
        }
        return maxNum;
    }

    private String getPcPrefixForLab(Lab lab) {
        if (lab == null) return "PC-";
        String labNum = lab.getName() != null ? lab.getName().replaceAll("[^0-9]", "") : "";
        return (lab.getDepartment() != null ? lab.getDepartment() + "-" : "") + 
               (labNum.isEmpty() ? "" : labNum + "-") + "PC-";
    }
}

