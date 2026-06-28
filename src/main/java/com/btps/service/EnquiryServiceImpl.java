package com.btps.service;

import com.btps.exception.ResourceNotFoundException;
import com.btps.model.Enquiry;
import com.btps.repository.EnquiryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EnquiryServiceImpl implements EnquiryService {

    @Autowired
    private EnquiryRepository enquiryRepository;

    @Override
    public Enquiry createEnquiry(Enquiry enquiry) {
        enquiry.setTimestamp(LocalDateTime.now());
        if (enquiry.getStatus() == null || enquiry.getStatus().isBlank()) {
            enquiry.setStatus("NEW");
        }
        return enquiryRepository.save(enquiry);
    }

    @Override
    public List<Enquiry> getAllEnquiries() {
        return enquiryRepository.findAll();
    }

    @Override
    public Enquiry updateEnquiry(Long id, Enquiry enquiryDetails) {
        Enquiry existing = enquiryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enquiry not found with ID: " + id));
        
        if (enquiryDetails.getName() != null) existing.setName(enquiryDetails.getName());
        if (enquiryDetails.getPhone() != null) existing.setPhone(enquiryDetails.getPhone());
        if (enquiryDetails.getEmail() != null) existing.setEmail(enquiryDetails.getEmail());
        if (enquiryDetails.getCourse() != null) existing.setCourse(enquiryDetails.getCourse());
        if (enquiryDetails.getStatus() != null) existing.setStatus(enquiryDetails.getStatus());
        if (enquiryDetails.getNotes() != null) existing.setNotes(enquiryDetails.getNotes());
        
        return enquiryRepository.save(existing);
    }

    @Override
    public void deleteEnquiry(Long id) {
        if (!enquiryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Enquiry not found with ID: " + id);
        }
        enquiryRepository.deleteById(id);
    }
}
