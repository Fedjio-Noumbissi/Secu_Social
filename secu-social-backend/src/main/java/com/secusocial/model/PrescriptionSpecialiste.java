package com.secusocial.model;

import jakarta.persistence.*;

@Entity
@Table(name = "prescriptions_specialistes")
public class PrescriptionSpecialiste {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "assure_id", nullable = false)
  private String assureId;

  @Column(name = "medecin_id_generaliste", nullable = false)
  private String medecinIdGeneraliste;

  @Column(name = "specialiste_id", nullable = false)
  private String specialisteId;

  @Column(nullable = false)
  private String motif;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String justificatif;

  @Column(nullable = false)
  private String date;

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public String getAssureId() { return assureId; }
  public void setAssureId(String assureId) { this.assureId = assureId; }
  public String getMedecinIdGeneraliste() { return medecinIdGeneraliste; }
  public void setMedecinIdGeneraliste(String medecinIdGeneraliste) { this.medecinIdGeneraliste = medecinIdGeneraliste; }
  public String getSpecialisteId() { return specialisteId; }
  public void setSpecialisteId(String specialisteId) { this.specialisteId = specialisteId; }
  public String getMotif() { return motif; }
  public void setMotif(String motif) { this.motif = motif; }
  public String getJustificatif() { return justificatif; }
  public void setJustificatif(String justificatif) { this.justificatif = justificatif; }
  public String getDate() { return date; }
  public void setDate(String date) { this.date = date; }
}
