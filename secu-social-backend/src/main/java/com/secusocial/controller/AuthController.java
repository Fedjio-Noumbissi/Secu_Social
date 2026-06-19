package com.secusocial.controller;

import com.secusocial.model.User;
import com.secusocial.repository.UserRepository;
import com.secusocial.repository.MedecinRepository;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
  private final UserRepository userRepo;
  private final MedecinRepository medecinRepo;

  public AuthController(UserRepository userRepo, MedecinRepository medecinRepo) {
    this.userRepo = userRepo;
    this.medecinRepo = medecinRepo;
  }

  @PostMapping("/login")
  public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
    String email = body.get("email");
    String password = body.get("password");

    Optional<User> optUser = userRepo.findByEmail(email);
    if (optUser.isEmpty()) {
      return ResponseEntity.status(401).body(Map.of("error", "Email ou mot de passe incorrect"));
    }

    User user = optUser.get();
    if (!user.getPassword().equals(password)) {
      return ResponseEntity.status(401).body(Map.of("error", "Email ou mot de passe incorrect"));
    }

    String token = UUID.randomUUID().toString();
    String nom = "";
    String prenom = "";

    if ("medecin".equals(user.getRole()) && user.getProfilId() != null && !user.getProfilId().isEmpty()) {
      Optional<com.secusocial.model.Medecin> medecin = medecinRepo.findByUserId(String.valueOf(user.getId()));
      if (medecin.isPresent()) {
        nom = medecin.get().getNom();
        prenom = medecin.get().getPrenom();
      }
    }

    Map<String, Object> userData = new HashMap<>();
    userData.put("id", String.valueOf(user.getId()));
    userData.put("email", user.getEmail());
    userData.put("role", user.getRole());
    userData.put("profilId", user.getProfilId());
    userData.put("nom", nom);
    userData.put("prenom", prenom);

    Map<String, Object> response = new HashMap<>();
    response.put("token", token);
    response.put("user", userData);

    return ResponseEntity.ok(response);
  }
}
