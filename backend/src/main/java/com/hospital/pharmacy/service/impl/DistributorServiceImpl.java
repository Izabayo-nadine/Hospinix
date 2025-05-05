package com.hospital.pharmacy.service.impl;

import com.hospital.pharmacy.dto.DistributorDTO;
import com.hospital.pharmacy.model.Distributor;
import com.hospital.pharmacy.repository.DistributorRepository;
import com.hospital.pharmacy.service.DistributorService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class DistributorServiceImpl implements DistributorService {

    private final DistributorRepository distributorRepository;

    @Autowired
    public DistributorServiceImpl(DistributorRepository distributorRepository) {
        this.distributorRepository = distributorRepository;
    }

    @Override
    public List<Distributor> findAllDistributors() {
        return distributorRepository.findAll();
    }

    @Override
    public Distributor findDistributorById(Long id) {
        return distributorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Distributor not found with id: " + id));
    }

    @Override
    public Distributor findDistributorByDistributorId(String distributorId) {
        return distributorRepository.findByDistributorId(distributorId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Distributor not found with distributorId: " + distributorId));
    }

    @Override
    public Distributor createDistributor(DistributorDTO distributorDTO) {
        Distributor distributor = mapDtoToEntity(distributorDTO);

        // Generate a unique distributor ID if not provided
        if (distributor.getDistributorId() == null || distributor.getDistributorId().isEmpty()) {
            distributor.setDistributorId("DIST-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }

        // Set default values if not provided
        if (distributor.getRelationshipSince() == null) {
            distributor.setRelationshipSince(LocalDate.now());
        }

        if (distributor.getContractStatus() == null || distributor.getContractStatus().isEmpty()) {
            distributor.setContractStatus("Active");
        }

        return distributorRepository.save(distributor);
    }

    @Override
    public Distributor updateDistributor(Long id, DistributorDTO distributorDTO) {
        Distributor existingDistributor = findDistributorById(id);

        // Update fields while preserving the ID and distributorId
        Distributor updatedDistributor = mapDtoToEntity(distributorDTO);
        updatedDistributor.setId(existingDistributor.getId());
        updatedDistributor.setDistributorId(existingDistributor.getDistributorId());

        return distributorRepository.save(updatedDistributor);
    }

    @Override
    public void deleteDistributor(Long id) {
        Distributor distributor = findDistributorById(id);
        distributorRepository.delete(distributor);
    }

    @Override
    public List<Distributor> searchDistributors(String keyword) {
        return distributorRepository.searchDistributors(keyword);
    }

    @Override
    public List<Distributor> findByServiceArea(String area) {
        return distributorRepository.findByServiceArea(area);
    }

    @Override
    public List<Distributor> findWithFilters(String region, String contractStatus) {
        return distributorRepository.findWithFilters(region, contractStatus);
    }

    private Distributor mapDtoToEntity(DistributorDTO dto) {
        Distributor distributor = new Distributor();
        distributor.setId(dto.getId());
        distributor.setDistributorId(dto.getDistributorId());
        distributor.setName(dto.getName());
        distributor.setLogoUrl(dto.getLogoUrl());
        distributor.setRegion(dto.getRegion());
        distributor.setHeadquarters(dto.getHeadquarters());
        distributor.setAreas(dto.getAreas());
        distributor.setContactName(dto.getContactName());
        distributor.setContactTitle(dto.getContactTitle());
        distributor.setPhone(dto.getPhone());
        distributor.setEmail(dto.getEmail());
        distributor.setWebsite(dto.getWebsite());
        distributor.setRelationshipSince(dto.getRelationshipSince());
        distributor.setContractStatus(dto.getContractStatus());
        distributor.setContractRenewal(dto.getContractRenewal());
        distributor.setDeliveryTime(dto.getDeliveryTime());
        distributor.setRating(dto.getRating());
        distributor.setReliability(dto.getReliability());
        distributor.setLastDelivery(dto.getLastDelivery());
        distributor.setPaymentTerms(dto.getPaymentTerms());
        distributor.setSpecialties(dto.getSpecialties());

        return distributor;
    }
}