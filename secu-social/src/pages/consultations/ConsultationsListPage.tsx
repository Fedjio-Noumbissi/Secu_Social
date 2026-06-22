import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Chip, IconButton, Tooltip,
} from '@mui/material';
import { Add as AddIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { apiService } from '../../services/api';
import { setConsultations } from '../../features/consultations/consultationsSlice';
import type { Consultation, Assure } from '../../types';
import { formatDate } from '../../utils/dateHelpers';
import type { RootState } from '../../store';
import { selectUser } from '../../features/auth/authSlice';

const ConsultationsListPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const consultations = useSelector((state: RootState) => state.consultations.consultations);
  const [assures, setAssures] = useState<Assure[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [consultData, assuresData] = await Promise.all([
          apiService.get<Consultation[]>('/consultations'),
          apiService.get<Assure[]>('/assures'),
        ]);
        dispatch(setConsultations(consultData));
        setAssures(assuresData);
      } catch (err) {
        console.error('Erreur chargement', err);
      }
    };
    fetchData();
  }, [dispatch]);

  const getAssureName = (id: string) => {
    const a = assures.find((a) => String(a.id) === String(id));
    return a ? `${a.nom} ${a.prenom}` : id;
  };

  const filteredConsultations = consultations.filter((c) => {
    if (user?.role === 'medecin' && c.medecinId !== user.profilId) {
      return false;
    }
    return true;
  });

  const sorted = [...filteredConsultations].sort((a, b) => b.date.localeCompare(a.date));
  const paginated = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B4513' }}>
          Consultations
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => navigate('/consultations/new')}>
          Nouvelle consultation
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Motif</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Observations</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  Aucune consultation.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>{formatDate(c.date)}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{getAssureName(c.assureId)}</TableCell>
                  <TableCell>{c.motif}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, maxWidth: { xs: 120, sm: 300 }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.observations}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Voir détails">
                      <IconButton size="small" onClick={() => navigate(`/consultations/${c.id}`)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredConsultations.length}
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

export default ConsultationsListPage;
