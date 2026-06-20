package com.secusocial.controller;

import com.secusocial.model.*;
import com.secusocial.repository.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/consultations")
public class ConsultationController {
  private final ConsultationRepository repo;
  public ConsultationController(ConsultationRepository repo) { this.repo = repo; }

  @GetMapping
  public List<Consultation> getAll() { return repo.findAll(); }

  @GetMapping("/{id}")
  public ResponseEntity<Consultation> getById(@PathVariable Long id) {
    return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
  }

  @PostMapping
  public ResponseEntity<Consultation> create(@RequestBody Consultation c) {
    c.setId(null);
    return ResponseEntity.status(201).body(repo.save(c));
  }

  @PutMapping("/{id}")
  public ResponseEntity<Consultation> update(@PathVariable Long id, @RequestBody Consultation c) {
    if (!repo.existsById(id)) return ResponseEntity.notFound().build();
    c.setId(id);
    return ResponseEntity.ok(repo.save(c));
  }

  @SuppressWarnings("unchecked")
  @PatchMapping("/{id}")
  public ResponseEntity<Consultation> patch(@PathVariable Long id, @RequestBody Map<String, Object> u) {
    return repo.findById(id).map(existing -> {
      if (u.containsKey("assureId")) existing.setAssureId((String) u.get("assureId"));
      if (u.containsKey("medecinId")) existing.setMedecinId((String) u.get("medecinId"));
      if (u.containsKey("date")) existing.setDate((String) u.get("date"));
      if (u.containsKey("heure")) existing.setHeure((String) u.get("heure"));
      if (u.containsKey("motif")) existing.setMotif((String) u.get("motif"));
      if (u.containsKey("observations")) existing.setObservations((String) u.get("observations"));
      if (u.containsKey("prescriptionMedicamentsIds"))
        existing.setPrescriptionMedicamentsIds((List<String>) u.get("prescriptionMedicamentsIds"));
      if (u.containsKey("prescriptionSpecialisteId"))
        existing.setPrescriptionSpecialisteId((String) u.get("prescriptionSpecialisteId"));
      return ResponseEntity.ok(repo.save(existing));
    }).orElse(ResponseEntity.notFound().build());
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    if (!repo.existsById(id)) return ResponseEntity.notFound().build();
    repo.deleteById(id);
    return ResponseEntity.noContent().build();
  }
}
