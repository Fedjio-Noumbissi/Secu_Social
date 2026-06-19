import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, Chip,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { apiService } from '../../services/api';
import type { FeuilleMaladie, Assure } from '../../types';
import { formatDate } from '../../utils/dateHelpers';

const FeuillesListPage = () => {
  const navigate = useNavigate();
  const [feuilles, setFeuilles] = useState<FeuilleMaladie[]>([]);
  const [assures, setAssures] = useState<Assure[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fData, aData] = await Promise.all([
          apiService.get<FeuilleMaladie[]>('/feuillesMaladie'),
          apiService.get<Assure[]>('/assures'),
        ]);
        setFeuilles(fData);
        setAssures(aData);
      } catch (err) {
        console.error('Erreur chargement', err);
      }
    };
    fetchData();
  }, []);

  const getAssureName = (id: string) => {
    const a = assures.find((a) => a.id === id);
    return a ? `${a.nom} ${a.prenom}` : id;
  };

  const paginated = feuilles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B4513' }}>
          Feuilles de maladie
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => navigate('/feuilles-maladie/new')}>
          Nouvelle feuille
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Détails</TableCell>
              <TableCell align="center">Validée</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  Aucune feuille de maladie.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((f) => (
                <TableRow key={f.id} hover>
                  <TableCell>{formatDate(f.date)}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{getAssureName(f.assureId)}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, maxWidth: { xs: 150, sm: 400 }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.details}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={f.validee ? 'Validée' : 'En attente'}
                      color={f.validee ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={feuilles.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Lignes par page"
        />
      </TableContainer>
    </Box>
  );
};

export default FeuillesListPage;
