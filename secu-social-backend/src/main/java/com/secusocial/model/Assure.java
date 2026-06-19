package com.secusocial.model;

import jakarta.persistence.*;

@Entity
@Table(name = "assures")
public class Assure {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String nom;

  @Column(nullable = false)
  private String prenom;

  @Column(name = "date_naissance", nullable = false)
  private String dateNaissance;

  @Column(nullable = false, length = 1)
  private String sexe;

  @Column(name = "num_secu", nullable = false, unique = true, length = 13)
  private String numSecu;

  @Column(nullable = false)
  private String adresse;

  @Column(nullable = false)
  private String telephone;

  @Column(nullable = false)
  private String email;

  @Column(name = "medecin_traitant_id")
  private String medecinTraitantId;

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public String getNom() { return nom; }
  public void setNom(String nom) { this.nom = nom; }
  public String getPrenom() { return prenom; }
  public void setPrenom(String prenom) { this.prenom = prenom; }
  public String getDateNaissance() { return dateNaissance; }
  public void setDateNaissance(String dateNaissance) { this.dateNaissance = dateNaissance; }
  public String getSexe() { return sexe; }
  public void setSexe(String sexe) { this.sexe = sexe; }
  public String getNumSecu() { return numSecu; }
  public void setNumSecu(String numSecu) { this.numSecu = numSecu; }
  public String getAdresse() { return adresse; }
  public void setAdresse(String adresse) { this.adresse = adresse; }
  public String getTelephone() { return telephone; }
  public void setTelephone(String telephone) { this.telephone = telephone; }
  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }
  public String getMedecinTraitantId() { return medecinTraitantId; }
  public void setMedecinTraitantId(String medecinTraitantId) { this.medecinTraitantId = medecinTraitantId; }
}
