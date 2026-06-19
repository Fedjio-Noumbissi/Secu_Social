package com.secusocial.controller;

import com.secusocial.model.*;
import com.secusocial.repository.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/medecins")
public class MedecinController {
  private final MedecinRepository repo;
  public MedecinController(MedecinRepository repo) { this.repo = repo; }

  @GetMapping
  public List<Medecin> getAll() { return repo.findAll(); }

  @GetMapping("/{id}")
  public ResponseEntity<Medecin> getById(@PathVariable Long id) {
    return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
  }

  @PostMapping
  public ResponseEntity<Medecin> create(@RequestBody Medecin m) {
    return ResponseEntity.status(201).body(repo.save(m));
  }

  @PutMapping("/{id}")
  public ResponseEntity<Medecin> update(@PathVariable Long id, @RequestBody Medecin m) {
    if (!repo.existsById(id)) return ResponseEntity.notFound().build();
    m.setId(id);
    return ResponseEntity.ok(repo.save(m));
  }

  @PatchMapping("/{id}")
  public ResponseEntity<Medecin> patch(@PathVariable Long id, @RequestBody Map<String, Object> u) {
    return repo.findById(id).map(existing -> {
      if (u.containsKey("userId")) existing.setUserId((String) u.get("userId"));
      if (u.containsKey("matricule")) existing.setMatricule((String) u.get("matricule"));
      if (u.containsKey("nom")) existing.setNom((String) u.get("nom"));
      if (u.containsKey("prenom")) existing.setPrenom((String) u.get("prenom"));
      if (u.containsKey("specialite")) existing.setSpecialite((String) u.get("specialite"));
      if (u.containsKey("email")) existing.setEmail((String) u.get("email"));
      if (u.containsKey("telephone")) existing.setTelephone((String) u.get("telephone"));
      if (u.containsKey("adresse")) existing.setAdresse((String) u.get("adresse"));
      if (u.containsKey("estAussiAssure")) existing.setEstAussiAssure((Boolean) u.get("estAussiAssure"));
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
