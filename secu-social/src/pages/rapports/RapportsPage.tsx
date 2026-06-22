import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, MenuItem, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import PrintIcon from '@mui/icons-material/Print';
import { apiService } from '../../services/api';
import type { Remboursement, Assure } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateHelpers';
import { exportCSV, exportJSON, exportPDF } from '../../utils/exportHelpers';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const COLORS = ['#8B4513', '#A0522D', '#D2691E', '#C62828', '#2E7D32', '#1565C0'];

const RapportsPage = () => {
  const [remboursements, setRemboursements] = useState<Remboursement[]>([]);
  const [period, setPeriod] = useState<'mois' | 'trimestre' | 'annee'>('mois');
  const [filteredData, setFilteredData] = useState<Remboursement[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rData = await apiService.get<Remboursement[]>('/remboursements');
        setRemboursements(rData);
      } catch (err) {
        console.error('Erreur chargement', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case 'mois':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'trimestre':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'annee':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }
    setFilteredData(
      remboursements.filter((r) => new Date(r.date) >= startDate!)
    );
  }, [remboursements, period]);

  const totalRembourse = filteredData.reduce((sum, r) => sum + r.montantRembourse, 0);
  const nbConsultations = filteredData.length;

  const barData = [
    { name: 'Généraliste (100%)', montant: filteredData.filter((r) => r.taux === 100).reduce((s, r) => s + r.montantRembourse, 0) },
    { name: 'Spécialiste (80%)', montant: filteredData.filter((r) => r.taux === 80).reduce((s, r) => s + r.montantRembourse, 0) },
  ];

  const pieData = [
    { name: 'Virement', value: filteredData.filter((r) => r.modePaiement === 'virement').length },
    { name: 'Espèces', value: filteredData.filter((r) => r.modePaiement === 'especes').length },
  ];

  const pendingAlertes = remboursements.filter((r) => {
    const days = (new Date().getTime() - new Date(r.date).getTime()) / (1000 * 60 * 60 * 24);
    return days > 30;
  });

  const handleExport = (format: 'csv' | 'json') => {
    const exportData = filteredData.map((r) => ({
      Date: formatDate(r.date),
      Montant: r.montantRembourse,
      Taux: `${r.taux}%`,
      Mode: r.modePaiement === 'virement' ? 'Virement' : 'Espèces',
    }));
    if (format === 'csv') exportCSV(exportData, 'rapport_remboursements');
    else exportJSON(exportData, 'rapport_remboursements');
  };

  const handleExportPDF = () => {
    const content = filteredData.map((r) =>
      `${formatDate(r.date)} - ${formatCurrency(r.montantRembourse)} (Taux: ${r.taux}%) - ${r.modePaiement === 'virement' ? 'Virement' : 'Espèces'}`
    ).join('\n');
    exportPDF('Rapport des remboursements', content);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B4513' }}>
          Rapports et statistiques
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handlePrint}
          startIcon={<PrintIcon />}
        >
          Imprimer
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              select
              label="Période"
              value={period}
              onChange={(e) => setPeriod(e.target.value as 'mois' | 'trimestre' | 'annee')}
              size="small"
            >
              <MenuItem value="mois">Ce mois</MenuItem>
              <MenuItem value="trimestre">Ce trimestre</MenuItem>
              <MenuItem value="annee">Cette année</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 8 }}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button size="small" variant="outlined" color="primary" startIcon={<FileDownloadIcon />} onClick={() => handleExport('csv')}>
                CSV
              </Button>
              <Button size="small" variant="outlined" color="primary" startIcon={<FileDownloadIcon />} onClick={() => handleExport('json')}>
                JSON
              </Button>
              <Button size="small" variant="contained" color="primary" onClick={handleExportPDF}>
                PDF
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Print header – visible only during print */}
      <Box className="print-header" sx={{ display: 'none', textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B4513', letterSpacing: 2 }}>
          SECU SOCIALE
        </Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>
          Rapport des remboursements – Période : {
            period === 'mois' ? 'Ce mois' : period === 'trimestre' ? 'Ce trimestre' : 'Cette année'
          }
        </Typography>
        <Typography variant="caption" sx={{ color: '#999' }}>
          Généré le {new Date().toLocaleDateString('fr-FR')}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Total remboursé</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#8B4513' }}>
              {formatCurrency(totalRembourse)}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Nb consultations</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#8B4513' }}>
              {nbConsultations}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Moyen remboursement</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#8B4513' }}>
              {nbConsultations > 0 ? formatCurrency(Math.round(totalRembourse / nbConsultations)) : '0 FCFA'}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Alertes (&gt;30j)</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#C62828' }}>
              {pendingAlertes.length}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#8B4513' }}>
              Remboursements par type
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="montant" fill="#8B4513" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#8B4513' }}>
              Mode de paiement
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#8B4513' }}>
              Liste des remboursements en attente (plus de 30 jours)
            </Typography>
            {pendingAlertes.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Aucun remboursement en attente. Tout est à jour.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Montant</TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Mode</TableCell>
                      <TableCell>Statut</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingAlertes.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{formatDate(r.date)}</TableCell>
                        <TableCell>{formatCurrency(r.montantRembourse)}</TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{r.modePaiement === 'virement' ? 'Virement' : 'Espèces'}</TableCell>
                        <TableCell>
                          <Chip label="En attente" color="warning" size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RapportsPage;
