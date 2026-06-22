import { GlobalStyles } from '@mui/material';

const printStyles = {
  '@media print': {
    /* Hide UI chrome */
    '.MuiAppBar-root, .MuiDrawer-root, .MuiDrawer-docked, footer, .MuiToolbar-root': {
      display: 'none !important',
    },
    'header, footer, nav, .MuiPaper-root:not(.print-receipt *)': {
      boxShadow: 'none !important',
    },
    /* Reset body */
    '@page': {
      margin: '15mm',
    },
    body: {
      backgroundColor: '#fff !important',
      margin: 0,
      padding: 0,
    },
    '#root': {
      padding: '0 !important',
    },
    /* Main content full width */
    'main.MuiBox-root': {
      marginLeft: '0 !important',
      padding: '0 !important',
      minHeight: 'auto !important',
    },
    /* Hide MUI grid responsiveness */
    '.MuiGrid-item': {
      padding: '8px !important',
    },
    /* Table styles */
    '.MuiTable-root': {
      borderCollapse: 'collapse',
      width: '100%',
    },
    '.MuiTableCell-root': {
      border: '1px solid #333 !important',
      padding: '6px 8px !important',
      fontSize: '10pt !important',
      color: '#000 !important',
    },
    '.MuiTableHead-root .MuiTableCell-root': {
      backgroundColor: '#f0ebe6 !important',
      WebkitPrintColorAdjust: 'exact',
      printColorAdjust: 'exact',
      fontWeight: 'bold !important',
      borderBottom: '2px solid #8B4513 !important',
    },
    /* Paper / card backgrounds */
    '.MuiPaper-root': {
      backgroundColor: '#fff !important',
      boxShadow: 'none !important',
      border: 'none !important',
      WebkitPrintColorAdjust: 'exact',
      printColorAdjust: 'exact',
      pageBreakInside: 'avoid',
    },
    /* KPI cards */
    '.MuiPaper-root .MuiTypography-h5, .MuiPaper-root .MuiTypography-h4, .MuiPaper-root .MuiTypography-h3': {
      color: '#000 !important',
    },
    /* Recharts responsive container */
    '.recharts-responsive-container': {
      width: '100% !important',
      height: 'auto !important',
      minHeight: '250px',
    },
    '.recharts-surface': {
      width: '100%',
      height: 'auto',
    },
    /* Buttons hidden */
    '.MuiButton-root, .MuiIconButton-root': {
      display: 'none !important',
    },
    /* Text fields hidden */
    '.MuiTextField-root, .MuiInputBase-root': {
      display: 'none !important',
    },
    /* Alerts hidden */
    '.MuiAlert-root': {
      display: 'none !important',
    },
    /* Page breaks */
    '.page-break': {
      pageBreakBefore: 'always',
    },
    /* Print receipt specific styles */
    '.print-receipt': {
      fontFamily: '"Garamond", "Centray", serif !important',
    },
    '.print-receipt .MuiTable-root .MuiTableCell-root': {
      border: 'none !important',
      padding: '4px 8px !important',
    },
    /* When printing a receipt overlay */
    '.receipt-print-wrapper': {
      display: 'block !important',
      position: 'static !important', /* Better for printing to avoid cutoff */
      width: '100% !important',
      minHeight: 'auto !important',
      zIndex: '99999 !important',
      backgroundColor: '#fff !important',
      padding: '0 !important', /* Reset padding for print */
      boxSizing: 'border-box !important',
      margin: '0 !important',
    },

    /* Print header/footer */
    '.no-print': {
      display: 'none !important',
    },
    '.print-header': {
      display: 'block !important',
    },
    /* Ensure charts have dark colors on print */
    '.recharts-text': {
      fill: '#333 !important',
    },
    '.recharts-cartesian-grid-horizontal line, .recharts-cartesian-grid-vertical line': {
      stroke: '#ccc !important',
    },
    '.recharts-legend-item-text': {
      color: '#333 !important',
    },
  },
};

const PrintStyles = () => {
  return <GlobalStyles styles={printStyles} />;
};

export default PrintStyles;
