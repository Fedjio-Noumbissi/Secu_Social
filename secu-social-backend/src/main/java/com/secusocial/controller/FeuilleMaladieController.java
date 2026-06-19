package com.secusocial.controller;

import com.secusocial.model.*;
import com.secusocial.repository.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/feuillesMaladie")
public class FeuilleMaladieController {
  private final FeuilleMaladieRepository repo;
  public FeuilleMaladieController(FeuilleMaladieRepository repo) { this.repo = repo; }

  @GetMapping
  public List<FeuilleMaladie> getAll() { return repo.findAll(); }

  @GetMapping("/{id}")
  public ResponseEntity<FeuilleMaladie> getById(@PathVariable Long id) {
    return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
  }

  @PostMapping
  public ResponseEntity<FeuilleMaladie> create(@RequestBody FeuilleMaladie f) {
    return ResponseEntity.status(201).body(repo.save(f));
  }

  @PutMapping("/{id}")
  public ResponseEntity<FeuilleMaladie> update(@PathVariable Long id, @RequestBody FeuilleMaladie f) {
    if (!repo.existsById(id)) return ResponseEntity.notFound().build();
    f.setId(id);
    return ResponseEntity.ok(repo.save(f));
  }

  @PatchMapping("/{id}")
  public ResponseEntity<FeuilleMaladie> patch(@PathVariable Long id, @RequestBody Map<String, Object> u) {
    return repo.findById(id).map(existing -> {
      if (u.containsKey("consultationId")) existing.setConsultationId((String) u.get("consultationId"));
      if (u.containsKey("assureId")) existing.setAssureId((String) u.get("assureId"));
      if (u.containsKey("medecinId")) existing.setMedecinId((String) u.get("medecinId"));
      if (u.containsKey("date")) existing.setDate((String) u.get("date"));
      if (u.containsKey("details")) existing.setDetails((String) u.get("details"));
      if (u.containsKey("medicamentsPrescrits")) existing.setMedicamentsPrescrits((String) u.get("medicamentsPrescrits"));
      if (u.containsKey("recommandationSpecialiste")) existing.setRecommandationSpecialiste((String) u.get("recommandationSpecialiste"));
      if (u.containsKey("validee")) existing.setValidee((Boolean) u.get("validee"));
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
