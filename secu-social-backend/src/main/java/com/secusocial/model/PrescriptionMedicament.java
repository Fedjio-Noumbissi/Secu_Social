package com.secusocial.model;

import jakarta.persistence.*;

@Entity
@Table(name = "prescriptions_medicaments")
public class PrescriptionMedicament {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "assure_id", nullable = false)
  private String assureId;

  @Column(name = "medecin_id", nullable = false)
  private String medecinId;

  @Column(nullable = false)
  private String medicament;

  @Column(nullable = false)
  private String posologie;

  @Column(nullable = false)
  private String duree;

  @Column(nullable = false)
  private String date;

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public String getAssureId() { return assureId; }
  public void setAssureId(String assureId) { this.assureId = assureId; }
  public String getMedecinId() { return medecinId; }
  public void setMedecinId(String medecinId) { this.medecinId = medecinId; }
  public String getMedicament() { return medicament; }
  public void setMedicament(String medicament) { this.medicament = medicament; }
  public String getPosologie() { return posologie; }
  public void setPosologie(String posologie) { this.posologie = posologie; }
  public String getDuree() { return duree; }
  public void setDuree(String duree) { this.duree = duree; }
  public String getDate() { return date; }
  public void setDate(String date) { this.date = date; }
}
