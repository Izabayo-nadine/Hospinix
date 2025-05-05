package com.hospital.pharmacy.service;

import com.hospital.pharmacy.dto.DistributorDTO;
import com.hospital.pharmacy.model.Distributor;

import java.util.List;

public interface DistributorService {
    List<Distributor> findAllDistributors();

    Distributor findDistributorById(Long id);

    Distributor findDistributorByDistributorId(String distributorId);

    Distributor createDistributor(DistributorDTO distributorDTO);

    Distributor updateDistributor(Long id, DistributorDTO distributorDTO);

    void deleteDistributor(Long id);

    List<Distributor> searchDistributors(String keyword);
    
    List<Distributor> findByServiceArea(String area);
    
    List<Distributor> findWithFilters(String region, String contractStatus);
} 