package com.secusocial.model;

import jakarta.persistence.*;

@Entity
@Table(name = "feuilles_maladie")
public class FeuilleMaladie {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "consultation_id", nullable = false)
  private String consultationId;

  @Column(name = "assure_id", nullable = false)
  private String assureId;

  @Column(name = "medecin_id", nullable = false)
  private String medecinId;

  @Column(nullable = false)
  private String date;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String details;

  @Column(name = "medicaments_prescrits", columnDefinition = "TEXT")
  private String medicamentsPrescrits;

  @Column(name = "recommandation_specialiste", columnDefinition = "TEXT")
  private String recommandationSpecialiste;

  @Column(nullable = false)
  private boolean validee;

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public String getConsultationId() { return consultationId; }
  public void setConsultationId(String consultationId) { this.consultationId = consultationId; }
  public String getAssureId() { return assureId; }
  public void setAssureId(String assureId) { this.assureId = assureId; }
  public String getMedecinId() { return medecinId; }
  public void setMedecinId(String medecinId) { this.medecinId = medecinId; }
  public String getDate() { return date; }
  public void setDate(String date) { this.date = date; }
  public String getDetails() { return details; }
  public void setDetails(String details) { this.details = details; }
  public String getMedicamentsPrescrits() { return medicamentsPrescrits; }
  public void setMedicamentsPrescrits(String medicamentsPrescrits) { this.medicamentsPrescrits = medicamentsPrescrits; }
  public String getRecommandationSpecialiste() { return recommandationSpecialiste; }
  public void setRecommandationSpecialiste(String recommandationSpecialiste) { this.recommandationSpecialiste = recommandationSpecialiste; }
  public boolean isValidee() { return validee; }
  public void setValidee(boolean validee) { this.validee = validee; }
}
