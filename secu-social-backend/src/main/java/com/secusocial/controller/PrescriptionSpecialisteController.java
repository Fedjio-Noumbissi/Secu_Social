package com.secusocial.controller;

import com.secusocial.model.*;
import com.secusocial.repository.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/prescriptionsSpecialistes")
public class PrescriptionSpecialisteController {
  private final PrescriptionSpecialisteRepository repo;
  public PrescriptionSpecialisteController(PrescriptionSpecialisteRepository repo) { this.repo = repo; }

  @GetMapping
  public List<PrescriptionSpecialiste> getAll() { return repo.findAll(); }

  @GetMapping("/{id}")
  public ResponseEntity<PrescriptionSpecialiste> getById(@PathVariable Long id) {
    return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
  }

  @PostMapping
  public ResponseEntity<PrescriptionSpecialiste> create(@RequestBody PrescriptionSpecialiste p) {
    p.setId(null);
    return ResponseEntity.status(201).body(repo.save(p));
  }

  @PutMapping("/{id}")
  public ResponseEntity<PrescriptionSpecialiste> update(@PathVariable Long id, @RequestBody PrescriptionSpecialiste p) {
    if (!repo.existsById(id)) return ResponseEntity.notFound().build();
    p.setId(id);
    return ResponseEntity.ok(repo.save(p));
  }

  @PatchMapping("/{id}")
  public ResponseEntity<PrescriptionSpecialiste> patch(@PathVariable Long id, @RequestBody Map<String, Object> u) {
    return repo.findById(id).map(existing -> {
      if (u.containsKey("assureId")) existing.setAssureId((String) u.get("assureId"));
      if (u.containsKey("medecinIdGeneraliste")) existing.setMedecinIdGeneraliste((String) u.get("medecinIdGeneraliste"));
      if (u.containsKey("specialisteId")) existing.setSpecialisteId((String) u.get("specialisteId"));
      if (u.containsKey("motif")) existing.setMotif((String) u.get("motif"));
      if (u.containsKey("justificatif")) existing.setJustificatif((String) u.get("justificatif"));
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
