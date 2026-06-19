package com.secusocial.model;

import jakarta.persistence.*;

@Entity
@Table(name = "remboursements")
public class Remboursement {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "feuille_maladie_id", nullable = false)
  private String feuilleMaladieId;

  @Column(name = "assure_id", nullable = false)
  private String assureId;

  @Column(name = "consultation_id", nullable = false)
  private String consultationId;

  @Column(name = "montant_total", nullable = false)
  private int montantTotal;

  @Column(nullable = false)
  private int taux;

  @Column(name = "montant_rembourse", nullable = false)
  private int montantRembourse;

  @Column(name = "mode_paiement", nullable = false)
  private String modePaiement;

  private String rib;

  @Column(nullable = false)
  private String date;

  @Column(nullable = false)
  private String horodatage;

  @Column(nullable = false)
  private boolean imprime;

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public String getFeuilleMaladieId() { return feuilleMaladieId; }
  public void setFeuilleMaladieId(String feuilleMaladieId) { this.feuilleMaladieId = feuilleMaladieId; }
  public String getAssureId() { return assureId; }
  public void setAssureId(String assureId) { this.assureId = assureId; }
  public String getConsultationId() { return consultationId; }
  public void setConsultationId(String consultationId) { this.consultationId = consultationId; }
  public int getMontantTotal() { return montantTotal; }
  public void setMontantTotal(int montantTotal) { this.montantTotal = montantTotal; }
  public int getTaux() { return taux; }
  public void setTaux(int taux) { this.taux = taux; }
  public int getMontantRembourse() { return montantRembourse; }
  public void setMontantRembourse(int montantRembourse) { this.montantRembourse = montantRembourse; }
  public String getModePaiement() { return modePaiement; }
  public void setModePaiement(String modePaiement) { this.modePaiement = modePaiement; }
  public String getRib() { return rib; }
  public void setRib(String rib) { this.rib = rib; }
  public String getDate() { return date; }
  public void setDate(String date) { this.date = date; }
  public String getHorodatage() { return horodatage; }
  public void setHorodatage(String horodatage) { this.horodatage = horodatage; }
  public boolean isImprime() { return imprime; }
  public void setImprime(boolean imprime) { this.imprime = imprime; }
}
