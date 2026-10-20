package com.amine.pfemanager.repository;

import com.amine.pfemanager.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByOfferId(Long offerId);

    List<Application> findByStudentEmail(String studentEmail);

    List<Application> findByStatus(Application.Status status);
}
