package com.secusocial.model;

import jakarta.persistence.*;
import java.util.*;

@Entity
@Table(name = "consultations")
public class Consultation {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "assure_id", nullable = false)
  private String assureId;

  @Column(name = "medecin_id", nullable = false)
  private String medecinId;

  @Column(nullable = false)
  private String date;

  @Column(nullable = false)
  private String heure;

  @Column(nullable = false)
  private String motif;

  @Column(columnDefinition = "TEXT")
  private String observations;

  @ElementCollection
  @CollectionTable(name = "consultation_prescriptions", joinColumns = @JoinColumn(name = "consultation_id"))
  @Column(name = "prescription_id")
  private List<String> prescriptionMedicamentsIds = new ArrayList<>();

  @Column(name = "prescription_specialiste_id")
  private String prescriptionSpecialisteId;

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public String getAssureId() { return assureId; }
  public void setAssureId(String assureId) { this.assureId = assureId; }
  public String getMedecinId() { return medecinId; }
  public void setMedecinId(String medecinId) { this.medecinId = medecinId; }
  public String getDate() { return date; }
  public void setDate(String date) { this.date = date; }
  public String getHeure() { return heure; }
  public void setHeure(String heure) { this.heure = heure; }
  public String getMotif() { return motif; }
  public void setMotif(String motif) { this.motif = motif; }
  public String getObservations() { return observations; }
  public void setObservations(String observations) { this.observations = observations; }
  public List<String> getPrescriptionMedicamentsIds() { return prescriptionMedicamentsIds; }
  public void setPrescriptionMedicamentsIds(List<String> prescriptionMedicamentsIds) { this.prescriptionMedicamentsIds = prescriptionMedicamentsIds; }
  public String getPrescriptionSpecialisteId() { return prescriptionSpecialisteId; }
  public void setPrescriptionSpecialisteId(String prescriptionSpecialisteId) { this.prescriptionSpecialisteId = prescriptionSpecialisteId; }
}
