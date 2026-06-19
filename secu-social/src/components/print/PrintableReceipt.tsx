import { Box, Typography, Divider, Table, TableBody, TableCell, TableRow } from '@mui/material';
import type { Remboursement, Assure, Medecin, Consultation } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateHelpers';

interface PrintableReceiptProps {
  remboursement: Remboursement;
  assure?: Assure;
  medecin?: Medecin;
  consultation?: Consultation;
  feuilleMaladieId?: string;
}

const PrintableReceipt = ({ remboursement, assure, medecin }: PrintableReceiptProps) => {
  const receiptId = `REC-${remboursement.date.replace(/-/g, '')}-${remboursement.id.padStart(4, '0')}`;

  return (
    <Box className="print-receipt" sx={{ fontFamily: '"Centray", "Garamond", serif', p: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B4513', letterSpacing: 2 }}>
          SECU SOCIAL
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
          Sécurité sociale du Cameroun
        </Typography>
        <Typography variant="caption" sx={{ color: '#999' }}>
          Service des prestations sociales – Assurance maladie
        </Typography>
        <Divider sx={{ my: 2, borderColor: '#8B4513', borderWidth: 2 }} />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#333' }}>
            REÇU DE REMBOURSEMENT
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
            N° {receiptId}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" sx={{ color: '#666' }}>Date d'émission</Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, color: '#333' }}>
            {formatDate(remboursement.date)}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ border: '1px solid #D2691E', borderRadius: 1, p: 2, mb: 3, bgcolor: '#FFF8F0' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#8B4513', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
          Informations de l'assuré
        </Typography>
        <Divider sx={{ mb: 1.5, borderColor: '#D2691E' }} />
        <Table size="small" sx={{ '& .MuiTableCell-root': { border: 'none', py: 0.5, pl: 0 } }}>
          <TableBody>
            <TableRow>
              <TableCell sx={{ width: 160, color: '#666', fontWeight: 500 }}>Nom & Prénoms</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#333' }}>
                {assure ? `${assure.nom} ${assure.prenom}` : '—'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ width: 160, color: '#666', fontWeight: 500 }}>N° Sécurité sociale</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#333' }}>
                {assure ? `**** *** ${assure.numSecu.slice(-4)}` : '—'}
              </TableCell>
            </TableRow>
            {medecin && (
              <>
                <TableRow>
                  <TableCell sx={{ width: 160, color: '#666', fontWeight: 500 }}>Médecin traitant</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#333' }}>
                    Dr {medecin.nom} {medecin.prenom}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ width: 160, color: '#666', fontWeight: 500 }}>Spécialité</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#333' }}>
                    {medecin.specialite === 'generaliste' ? 'Médecin généraliste' : 'Médecin spécialiste'}
                  </TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </Box>

      <Box sx={{ border: '1px solid #D2691E', borderRadius: 1, p: 2, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#8B4513', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
          Détails du remboursement
        </Typography>
        <Divider sx={{ mb: 1.5, borderColor: '#D2691E' }} />
        <Table size="small" sx={{ '& .MuiTableCell-root': { border: 'none', py: 0.5, pl: 0 } }}>
          <TableBody>
            <TableRow>
              <TableCell sx={{ width: 200, color: '#666', fontWeight: 500 }}>Montant total des soins</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#333' }}>
                {formatCurrency(remboursement.montantTotal)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ width: 200, color: '#666', fontWeight: 500 }}>Taux de remboursement</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#333' }}>
                {remboursement.taux}%
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ width: 200, color: '#666', fontWeight: 500 }}>Base de remboursement</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#333' }}>
                {formatCurrency(Math.round(remboursement.montantTotal * remboursement.taux / 100))}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Divider sx={{ my: 1.5, borderColor: '#8B4513', borderWidth: 1.5 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#8B4513' }}>
            MONTANT REMBOURSÉ
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#2E7D32', letterSpacing: 1 }}>
            {formatCurrency(remboursement.montantRembourse)}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ border: '1px solid #D2691E', borderRadius: 1, p: 2, mb: 3, bgcolor: '#FFF8F0' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#8B4513', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
          Mode de paiement
        </Typography>
        <Divider sx={{ mb: 1.5, borderColor: '#D2691E' }} />
        <Table size="small" sx={{ '& .MuiTableCell-root': { border: 'none', py: 0.5, pl: 0 } }}>
          <TableBody>
            <TableRow>
              <TableCell sx={{ width: 200, color: '#666', fontWeight: 500 }}>Mode</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#333' }}>
                {remboursement.modePaiement === 'virement' ? 'Virement bancaire' : 'Espèces (cash)'}
              </TableCell>
            </TableRow>
            {remboursement.rib && (
              <TableRow>
                <TableCell sx={{ width: 200, color: '#666', fontWeight: 500 }}>RIB</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#333', fontFamily: 'monospace' }}>
                  {remboursement.rib}
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell sx={{ width: 200, color: '#666', fontWeight: 500 }}>Date de traitement</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#333' }}>
                {formatDate(remboursement.horodatage.split('T')[0])}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, mb: 3 }}>
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Divider sx={{ width: 200, mx: 'auto', mb: 1 }} />
          <Typography variant="caption" sx={{ color: '#666' }}>
            Cachet et signature de l'agent
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Divider sx={{ width: 200, mx: 'auto', mb: 1 }} />
          <Typography variant="caption" sx={{ color: '#666' }}>
            Signature du bénéficiaire
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 2, borderColor: '#D2691E' }} />
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: '#999', fontStyle: 'italic', display: 'block' }}>
          Document officiel – Remboursement des prestations maladie – Secu Social Cameroun
        </Typography>
        <Typography variant="caption" sx={{ color: '#999', fontStyle: 'italic', display: 'block' }}>
          Reçu n° {receiptId} – Généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
        </Typography>
      </Box>
    </Box>
  );
};

export default PrintableReceipt;
