package com.btps.service;

import com.btps.model.Enquiry;
import java.util.List;

public interface EnquiryService {
    Enquiry createEnquiry(Enquiry enquiry);
    List<Enquiry> getAllEnquiries();
    void deleteEnquiry(Long id);
}
