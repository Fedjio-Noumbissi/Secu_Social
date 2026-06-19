package com.secusocial.controller;

import com.secusocial.model.*;
import com.secusocial.repository.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/prescriptionsMedicaments")
public class PrescriptionMedicamentController {
  private final PrescriptionMedicamentRepository repo;
  public PrescriptionMedicamentController(PrescriptionMedicamentRepository repo) { this.repo = repo; }

  @GetMapping
  public List<PrescriptionMedicament> getAll() { return repo.findAll(); }

  @GetMapping("/{id}")
  public ResponseEntity<PrescriptionMedicament> getById(@PathVariable Long id) {
    return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
  }

  @PostMapping
  public ResponseEntity<PrescriptionMedicament> create(@RequestBody PrescriptionMedicament p) {
    return ResponseEntity.status(201).body(repo.save(p));
  }

  @PutMapping("/{id}")
  public ResponseEntity<PrescriptionMedicament> update(@PathVariable Long id, @RequestBody PrescriptionMedicament p) {
    if (!repo.existsById(id)) return ResponseEntity.notFound().build();
    p.setId(id);
    return ResponseEntity.ok(repo.save(p));
  }

  @PatchMapping("/{id}")
  public ResponseEntity<PrescriptionMedicament> patch(@PathVariable Long id, @RequestBody Map<String, Object> u) {
    return repo.findById(id).map(existing -> {
      if (u.containsKey("assureId")) existing.setAssureId((String) u.get("assureId"));
      if (u.containsKey("medecinId")) existing.setMedecinId((String) u.get("medecinId"));
      if (u.containsKey("medicament")) existing.setMedicament((String) u.get("medicament"));
      if (u.containsKey("posologie")) existing.setPosologie((String) u.get("posologie"));
      if (u.containsKey("duree")) existing.setDuree((String) u.get("duree"));
      if (u.containsKey("date")) existing.setDate((String) u.get("date"));
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
