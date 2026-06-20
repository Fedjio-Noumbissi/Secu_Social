package com.secusocial.controller;

import com.secusocial.model.*;
import com.secusocial.repository.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/remboursements")
public class RemboursementController {
  private final RemboursementRepository repo;
  public RemboursementController(RemboursementRepository repo) { this.repo = repo; }

  @GetMapping
  public List<Remboursement> getAll() { return repo.findAll(); }

  @GetMapping("/{id}")
  public ResponseEntity<Remboursement> getById(@PathVariable Long id) {
    return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
  }

  @PostMapping
  public ResponseEntity<Remboursement> create(@RequestBody Remboursement r) {
    r.setId(null);
    return ResponseEntity.status(201).body(repo.save(r));
  }

  @PutMapping("/{id}")
  public ResponseEntity<Remboursement> update(@PathVariable Long id, @RequestBody Remboursement r) {
    if (!repo.existsById(id)) return ResponseEntity.notFound().build();
    r.setId(id);
    return ResponseEntity.ok(repo.save(r));
  }

  @PatchMapping("/{id}")
  public ResponseEntity<Remboursement> patch(@PathVariable Long id, @RequestBody Map<String, Object> u) {
    return repo.findById(id).map(existing -> {
      if (u.containsKey("feuilleMaladieId")) existing.setFeuilleMaladieId((String) u.get("feuilleMaladieId"));
      if (u.containsKey("assureId")) existing.setAssureId((String) u.get("assureId"));
      if (u.containsKey("consultationId")) existing.setConsultationId((String) u.get("consultationId"));
      if (u.containsKey("montantTotal")) existing.setMontantTotal((Integer) u.get("montantTotal"));
      if (u.containsKey("taux")) existing.setTaux((Integer) u.get("taux"));
      if (u.containsKey("montantRembourse")) existing.setMontantRembourse((Integer) u.get("montantRembourse"));
      if (u.containsKey("modePaiement")) existing.setModePaiement((String) u.get("modePaiement"));
      if (u.containsKey("rib")) existing.setRib((String) u.get("rib"));
      if (u.containsKey("date")) existing.setDate((String) u.get("date"));
      if (u.containsKey("horodatage")) existing.setHorodatage((String) u.get("horodatage"));
      if (u.containsKey("imprime")) existing.setImprime((Boolean) u.get("imprime"));
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
