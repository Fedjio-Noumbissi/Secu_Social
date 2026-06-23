package com.secusocial.controller;

import com.secusocial.model.*;
import com.secusocial.repository.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/assures")
public class AssureController {
  private final AssureRepository repo;
  public AssureController(AssureRepository repo) { this.repo = repo; }

  @GetMapping
  public List<Assure> getAll() { return repo.findAll(); }

  @GetMapping("/{id}")
  public ResponseEntity<Assure> getById(@PathVariable Long id) {
    return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
  }

  @PostMapping
  public ResponseEntity<Assure> create(@RequestBody Assure a) {
    a.setId(null);
    return ResponseEntity.status(201).body(repo.save(a));
  }

  @PutMapping("/{id}")
  public ResponseEntity<Assure> update(@PathVariable Long id, @RequestBody Assure a) {
    if (!repo.existsById(id)) return ResponseEntity.notFound().build();
    a.setId(id);
    return ResponseEntity.ok(repo.save(a));
  }

  @PatchMapping("/{id}")
  public ResponseEntity<Assure> patch(@PathVariable Long id, @RequestBody Map<String, Object> u) {
    return repo.findById(id).map(existing -> {
      if (u.containsKey("nom")) existing.setNom((String) u.get("nom"));
      if (u.containsKey("prenom")) existing.setPrenom((String) u.get("prenom"));
      if (u.containsKey("dateNaissance")) existing.setDateNaissance((String) u.get("dateNaissance"));
      if (u.containsKey("sexe")) existing.setSexe((String) u.get("sexe"));
      if (u.containsKey("numSecu")) existing.setNumSecu((String) u.get("numSecu"));
      if (u.containsKey("adresse")) existing.setAdresse((String) u.get("adresse"));
      if (u.containsKey("telephone")) existing.setTelephone((String) u.get("telephone"));
      if (u.containsKey("email")) existing.setEmail((String) u.get("email"));
      if (u.containsKey("rib")) existing.setRib(u.get("rib") != null ? (String) u.get("rib") : null);
      if (u.containsKey("medecinTraitantId")) {
        Object val = u.get("medecinTraitantId");
        existing.setMedecinTraitantId(val != null ? String.valueOf(val) : null);
      }
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
