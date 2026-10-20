package com.amine.pfemanager.repository;

import com.amine.pfemanager.model.InternshipOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InternshipOfferRepository extends JpaRepository<InternshipOffer, Long> {

    List<InternshipOffer> findByCompanyContainingIgnoreCase(String company);

    List<InternshipOffer> findByLocationContainingIgnoreCase(String location);
}
