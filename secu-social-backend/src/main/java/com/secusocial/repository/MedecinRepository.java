package com.secusocial.repository;

import com.secusocial.model.Medecin;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MedecinRepository extends JpaRepository<Medecin, Long> {
  Optional<Medecin> findByUserId(String userId);
}
