import { useMemo } from 'react';
import { Box, Grid, Paper, Typography, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Payments as PaymentsIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import type { Remboursement } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateHelpers';

interface RemboursementsTabProps {
  remboursements: Remboursement[];
}

const RemboursementsTab = ({ remboursements }: RemboursementsTabProps) => {
  const stats = useMemo(() => {
    const total = remboursements.reduce((s, r) => s + r.montantRembourse, 0);
    const totalGeneraliste = remboursements.filter(r => r.taux === 100).reduce((s, r) => s + r.montantRembourse, 0);
    const totalSpecialiste = remboursements.filter(r => r.taux === 80).reduce((s, r) => s + r.montantRembourse, 0);
    const parMode = {
      virement: remboursements.filter(r => r.modePaiement === 'virement').length,
      especes: remboursements.filter(r => r.modePaiement === 'especes').length,
    };
    return { total, totalGeneraliste, totalSpecialiste, parMode, count: remboursements.length };
  }, [remboursements]);

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center', borderTop: '4px solid #8B4513' }}>
            <PaymentsIcon sx={{ fontSize: { xs: 24, md: 32 }, color: '#8B4513', mb: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{formatCurrency(stats.total)}</Typography>
            <Typography variant="body2" color="text.secondary">Total remboursé</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center', borderTop: '4px solid #2E7D32' }}>
            <TrendingUpIcon sx={{ fontSize: { xs: 24, md: 32 }, color: '#2E7D32', mb: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{formatCurrency(stats.totalGeneraliste)}</Typography>
            <Typography variant="body2" color="text.secondary">Généralistes (100%)</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center', borderTop: '4px solid #D2691E' }}>
            <TrendingUpIcon sx={{ fontSize: { xs: 24, md: 32 }, color: '#D2691E', mb: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{formatCurrency(stats.totalSpecialiste)}</Typography>
            <Typography variant="body2" color="text.secondary">Spécialistes (80%)</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center', borderTop: '4px solid #C62828' }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.count}</Typography>
            <Typography variant="body2" color="text.secondary">
              {stats.parMode.virement} virement{stats.parMode.virement > 1 ? 's' : ''} / {stats.parMode.especes} espèce{stats.parMode.especes > 1 ? 's' : ''}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#8B4513' }}>
          Historique des remboursements
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Montant total</TableCell>
                <TableCell>Taux</TableCell>
                <TableCell>Remboursé</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Mode</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Imprimé</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {remboursements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">Aucun remboursement.</TableCell>
                </TableRow>
              ) : (
                remboursements.slice().reverse().map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{formatDate(r.date)}</TableCell>
                    <TableCell>{formatCurrency(r.montantTotal)}</TableCell>
                    <TableCell>
                      <Chip label={`${r.taux}%`} size="small" color={r.taux === 100 ? 'success' : 'warning'} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(r.montantRembourse)}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{r.modePaiement === 'virement' ? 'Virement' : 'Espèces'}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{r.imprime ? 'Oui' : 'Non'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default RemboursementsTab;
