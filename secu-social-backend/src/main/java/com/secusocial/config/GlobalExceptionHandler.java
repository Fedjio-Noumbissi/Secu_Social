package com.secusocial.config;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<Map<String, Object>> handleJsonParseError(HttpMessageNotReadableException ex) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("message", "Format de données invalide. Vérifiez que tous les champs sont correctement remplis.");
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<Map<String, Object>> handleDataIntegrity(DataIntegrityViolationException ex) {
    Map<String, Object> body = new LinkedHashMap<>();
    String cause = ex.getMostSpecificCause().getMessage();
    String message;
    if (cause.contains("null") && (cause.contains("column") || cause.contains("NOT NULL"))) {
      message = "Un ou plusieurs champs obligatoires sont manquants. Remplissez tous les champs requis.";
    } else if (cause.contains("unique") || cause.contains("duplicate")) {
      message = "Cette valeur existe déjà. Utilisez une valeur différente.";
    } else {
      message = "Erreur de base de données : " + cause;
    }
    body.put("message", message);
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
  }

  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
    Map<String, Object> body = new LinkedHashMap<>();
    String name = ex.getName();
    String requiredType = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "correct";
    body.put("message", "Le champ '" + name + "' doit être de type " + requiredType + ".");
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("message", ex.getMessage());
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("message", "Erreur interne : " + (ex.getMessage() != null ? ex.getMessage() : "Une erreur inattendue s'est produite."));
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
  }
}
