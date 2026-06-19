import { maskSSN } from '../../utils/maskSSN';
import { Typography } from '@mui/material';

interface MaskedSSNProps {
  value: string;
}

const MaskedSSN = ({ value }: MaskedSSNProps) => {
  return (
    <Typography
      component="span"
      sx={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}
      aria-label={`Numéro de sécurité sociale terminant par ${value.slice(-4)}`}
    >
      {maskSSN(value)}
    </Typography>
  );
};

export default MaskedSSN;
