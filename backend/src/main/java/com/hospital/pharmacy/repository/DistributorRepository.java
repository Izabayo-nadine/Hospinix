package com.hospital.pharmacy.repository;

import com.hospital.pharmacy.model.Distributor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DistributorRepository extends JpaRepository<Distributor, Long> {
    
    Optional<Distributor> findByDistributorId(String distributorId);
    
    List<Distributor> findByRegion(String region);
    
    List<Distributor> findByContractStatus(String contractStatus);
    
    @Query("SELECT d FROM Distributor d WHERE d.name LIKE %:keyword% OR d.distributorId LIKE %:keyword%")
    List<Distributor> searchDistributors(@Param("keyword") String keyword);
    
    @Query("SELECT DISTINCT d FROM Distributor d JOIN d.areas a WHERE a LIKE %:area%")
    List<Distributor> findByServiceArea(@Param("area") String area);
    
    @Query("SELECT d FROM Distributor d WHERE " +
           "(:region = 'all' OR d.region = :region) AND " +
           "(:contractStatus = 'all' OR d.contractStatus = :contractStatus)")
    List<Distributor> findWithFilters(
            @Param("region") String region, 
            @Param("contractStatus") String contractStatus);
} 