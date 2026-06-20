package com.secusocial.controller;

import com.secusocial.model.User;
import com.secusocial.repository.UserRepository;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/users")
public class UserController {
  private final UserRepository repo;

  public UserController(UserRepository repo) { this.repo = repo; }

  @GetMapping
  public List<User> getAll() { return repo.findAll(); }

  @GetMapping("/{id}")
  public ResponseEntity<User> getById(@PathVariable Long id) {
    return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
  }

  @PostMapping
  public ResponseEntity<User> create(@RequestBody User user) {
    user.setId(null);
    return ResponseEntity.status(201).body(repo.save(user));
  }

  @PutMapping("/{id}")
  public ResponseEntity<User> update(@PathVariable Long id, @RequestBody User user) {
    return repo.findById(id).map(existing -> {
      user.setId(id);
      return ResponseEntity.ok(repo.save(user));
    }).orElse(ResponseEntity.notFound().build());
  }

  @PatchMapping("/{id}")
  public ResponseEntity<User> patch(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
    return repo.findById(id).map(existing -> {
      if (updates.containsKey("email")) existing.setEmail((String) updates.get("email"));
      if (updates.containsKey("password")) existing.setPassword((String) updates.get("password"));
      if (updates.containsKey("role")) existing.setRole((String) updates.get("role"));
      if (updates.containsKey("profilId")) existing.setProfilId((String) updates.get("profilId"));
      return ResponseEntity.ok(repo.save(existing));
    }).orElse(ResponseEntity.notFound().build());
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    if (repo.existsById(id)) { repo.deleteById(id); return ResponseEntity.noContent().build(); }
    return ResponseEntity.notFound().build();
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
    String email = body.get("email");
    String password = body.get("password");
    return repo.findByEmail(email)
        .filter(u -> u.getPassword().equals(password))
        .map(u -> ResponseEntity.ok((Object) u))
        .orElse(ResponseEntity.status(401).body(Map.of("error", "Email ou mot de passe incorrect")));
  }
}
