package com.example.mylab.service;

import com.example.mylab.dto.ComplaintDTO;
import com.example.mylab.model.*;
import com.example.mylab.repository.ComplaintRepository;
import com.example.mylab.repository.PCRepository;
import com.example.mylab.repository.UserRepository;
import com.example.mylab.repository.DefectHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;
import com.example.mylab.service.NotificationService;
import com.example.mylab.model.Role;

@Service
public class ComplaintService {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private PCRepository pcRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DefectHistoryRepository defectHistoryRepository;
    
    @Autowired
    private NotificationService notificationService;

    @Transactional
    public ComplaintDTO createComplaint(ComplaintDTO complaintDTO) {
        PC pc = pcRepository.findById(complaintDTO.getPcId())
            .orElseThrow(() -> new RuntimeException("PC not found"));

        User user = userRepository.findById(complaintDTO.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        Complaint complaint = new Complaint();
        complaint.setPc(pc);
        complaint.setUser(user);
        complaint.setProblemType(complaintDTO.getProblemType());
        complaint.setDescription(complaintDTO.getDescription());
        complaint.setReportedAt(LocalDateTime.now());
        complaint.setStatus(ComplaintStatus.PENDING);

        // Update PC status to NON_WORKING when a complaint is reported
        // Only change if currently WORKING (don't change if already NON_WORKING or REPAIR_IN_PROGRESS)
        if (pc.getStatus() == PCStatus.WORKING) {
            pc.setStatus(PCStatus.NON_WORKING);
            pcRepository.save(pc);
        }

        Complaint savedComplaint = complaintRepository.save(complaint);

        // Create defect history entry
        DefectHistory defectHistory = new DefectHistory();
        defectHistory.setPc(pc);
        defectHistory.setProblemType(complaintDTO.getProblemType());
        defectHistory.setDescription(complaintDTO.getDescription());
        defectHistory.setOccurredAt(LocalDateTime.now());
        defectHistory.setStatus(ComplaintStatus.PENDING);
        defectHistoryRepository.save(defectHistory);
        // Notify all technicians
        userRepository.findByRole(Role.TECHNICIAN).forEach(tech -> {
            String msg = String.format("New report: PC %s - %s", pc.getPcNumber(), complaintDTO.getProblemType());
            notificationService.createNotification(tech, msg);
        });

        return convertToDTO(savedComplaint);
    }

    public ComplaintDTO updateComplaintStatus(Long id, ComplaintStatus status, String technicianRemarks) {
        Complaint complaint = complaintRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Complaint not found"));

        complaint.setStatus(status);

        if (status == ComplaintStatus.RESOLVED) {
            complaint.setResolvedAt(LocalDateTime.now());
            
            // Update defect history
            DefectHistory defectHistory = defectHistoryRepository.findByPc(complaint.getPc()).stream()
                .filter(dh -> dh.getStatus() != ComplaintStatus.RESOLVED && 
                              dh.getProblemType() == complaint.getProblemType())
                .findFirst()
                .orElse(null);
            
            if (defectHistory != null) {
                defectHistory.setResolvedAt(LocalDateTime.now());
                defectHistory.setStatus(ComplaintStatus.RESOLVED);
                if (technicianRemarks != null && !technicianRemarks.isEmpty()) {
                    defectHistory.setTechnicianRemarks(technicianRemarks);
                }
                defectHistoryRepository.save(defectHistory);
            }

            // Check if all complaints for this PC are resolved
            boolean allResolved = complaintRepository.findByPc(complaint.getPc()).stream()
                .allMatch(c -> c.getStatus() == ComplaintStatus.RESOLVED);
            
            if (allResolved) {
                complaint.getPc().setStatus(PCStatus.WORKING);
                pcRepository.save(complaint.getPc());
            } else {
                complaint.getPc().setStatus(PCStatus.REPAIR_IN_PROGRESS);
                pcRepository.save(complaint.getPc());
            }
        } else if (status == ComplaintStatus.IN_PROGRESS) {
            complaint.getPc().setStatus(PCStatus.REPAIR_IN_PROGRESS);
            pcRepository.save(complaint.getPc());
        }

        Complaint updatedComplaint = complaintRepository.save(complaint);
        return convertToDTO(updatedComplaint);
    }

    public List<ComplaintDTO> getComplaintsByPC(Long pcId) {
        PC pc = pcRepository.findById(pcId)
            .orElseThrow(() -> new RuntimeException("PC not found"));
        return complaintRepository.findByPc(pc).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public List<ComplaintDTO> getAllComplaints() {
        return complaintRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public ComplaintDTO convertToDTO(Complaint complaint) {
        int days = 0;
        if (complaint.getReportedAt() != null) {
            days = (int) ChronoUnit.DAYS.between(complaint.getReportedAt(), LocalDateTime.now());
        }
        return new ComplaintDTO(
            complaint.getId(),
            complaint.getPc().getId(),
            complaint.getPc().getPcNumber(),
            complaint.getPc().getLab() != null ? complaint.getPc().getLab().getName() : null,
            complaint.getUser().getId(),
            complaint.getUser().getName(),
            complaint.getProblemType(),
            complaint.getDescription(),
            complaint.getReportedAt(),
            complaint.getResolvedAt(),
            complaint.getStatus(),
            days
        );
    }
}
