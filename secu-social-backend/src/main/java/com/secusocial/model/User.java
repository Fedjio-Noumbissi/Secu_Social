package com.secusocial.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String email;

  @Column(nullable = false)
  private String password;

  @Column(nullable = false)
  private String role;

  @Column(name = "profil_id")
  private String profilId;

  @Column(name = "failed_attempts")
  private int failedAttempts = 0;

  @Column(name = "account_locked")
  private boolean accountLocked = false;

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }
  public String getPassword() { return password; }
  public void setPassword(String password) { this.password = password; }
  public String getRole() { return role; }
  public void setRole(String role) { this.role = role; }
  public String getProfilId() { return profilId; }
  public void setProfilId(String profilId) { this.profilId = profilId; }
  public int getFailedAttempts() { return failedAttempts; }
  public void setFailedAttempts(int failedAttempts) { this.failedAttempts = failedAttempts; }
  public boolean isAccountLocked() { return accountLocked; }
  public void setAccountLocked(boolean accountLocked) { this.accountLocked = accountLocked; }
}
