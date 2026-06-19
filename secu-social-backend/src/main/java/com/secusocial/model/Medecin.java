package com.secusocial.model;

import jakarta.persistence.*;

@Entity
@Table(name = "medecins")
public class Medecin {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id")
  private String userId;

  @Column(nullable = false)
  private String matricule;

  @Column(nullable = false)
  private String nom;

  @Column(nullable = false)
  private String prenom;

  @Column(nullable = false)
  private String specialite;

  @Column(nullable = false)
  private String email;

  @Column(nullable = false)
  private String telephone;

  @Column(nullable = false)
  private String adresse;

  @Column(name = "est_aussi_assure")
  private boolean estAussiAssure;

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public String getUserId() { return userId; }
  public void setUserId(String userId) { this.userId = userId; }
  public String getMatricule() { return matricule; }
  public void setMatricule(String matricule) { this.matricule = matricule; }
  public String getNom() { return nom; }
  public void setNom(String nom) { this.nom = nom; }
  public String getPrenom() { return prenom; }
  public void setPrenom(String prenom) { this.prenom = prenom; }
  public String getSpecialite() { return specialite; }
  public void setSpecialite(String specialite) { this.specialite = specialite; }
  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }
  public String getTelephone() { return telephone; }
  public void setTelephone(String telephone) { this.telephone = telephone; }
  public String getAdresse() { return adresse; }
  public void setAdresse(String adresse) { this.adresse = adresse; }
  public boolean isEstAussiAssure() { return estAussiAssure; }
  public void setEstAussiAssure(boolean estAussiAssure) { this.estAussiAssure = estAussiAssure; }
}
