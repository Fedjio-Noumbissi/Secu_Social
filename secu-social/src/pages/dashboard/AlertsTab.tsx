import { Box, Paper, Typography, Alert, AlertTitle, List, ListItem, ListItemText, Chip } from '@mui/material';
import type { Remboursement, Assure, Medecin } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, daysBetween } from '../../utils/dateHelpers';

interface AlertsTabProps {
  remboursements: Remboursement[];
  assures: Assure[];
  medecins: Medecin[];
}

const AlertsTab = ({ remboursements, assures, medecins }: AlertsTabProps) => {
  const pendingRemboursements = remboursements.filter((r) => {
    const days = daysBetween(r.date, new Date().toISOString().split('T')[0]);
    return days > 30;
  });

  const assuresSansMedecin = assures.filter(a => !a.medecinTraitantId);

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#C62828' }}>
          Remboursements en attente (&gt;30 jours)
        </Typography>
        {pendingRemboursements.length === 0 ? (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            <AlertTitle>Aucune alerte</AlertTitle>
            Tous les remboursements sont à jour.
          </Alert>
        ) : (
          pendingRemboursements.map((r) => (
            <Alert severity="warning" key={r.id} sx={{ mb: 1, borderRadius: 2 }}>
              <AlertTitle>Remboursement en attente</AlertTitle>
              {formatCurrency(r.montantRembourse)} - {formatDate(r.date)} (plus de 30 jours)
            </Alert>
          ))
        )}
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#D2691E' }}>
          Assurés sans médecin traitant
        </Typography>
        {assuresSansMedecin.length === 0 ? (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            <AlertTitle>Complet</AlertTitle>
            Tous les assurés ont un médecin traitant.
          </Alert>
        ) : (
          <List dense>
            {assuresSansMedecin.map((a) => (
              <ListItem key={a.id} divider>
                <ListItemText
                  primary={`${a.prenom} ${a.nom}`}
                  secondary={`N° sécu: ${a.numSecu.slice(-4)}`}
                />
                <Chip label="Non assigné" color="error" size="small" />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#8B4513' }}>
          Récapitulatif
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText
              primary="Remboursements en attente"
              secondary={`${pendingRemboursements.length} remboursement(s) dépassant 30 jours`}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Assurés sans médecin traitant"
              secondary={`${assuresSansMedecin.length} assuré(s) concerné(s)`}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Total remboursements"
              secondary={`${remboursements.length} remboursement(s) au total`}
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default AlertsTab;
