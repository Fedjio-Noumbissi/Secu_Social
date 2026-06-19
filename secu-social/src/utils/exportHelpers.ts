import jsPDF from 'jspdf';
import Papa from 'papaparse';

export const exportPDF = (title: string, content: string): void => {
  const doc = new jsPDF();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(title, 20, 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const lines = doc.splitTextToSize(content, 170);
  doc.text(lines, 20, 35);
  doc.save(`${title.replace(/\s/g, '_')}.pdf`);
};

export const exportCSV = (data: Record<string, unknown>[], filename: string): void => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const exportJSON = (data: unknown, filename: string): void => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const printContent = (): void => {
  window.print();
};
