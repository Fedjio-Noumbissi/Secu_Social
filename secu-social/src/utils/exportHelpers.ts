import jsPDF from 'jspdf';
import Papa from 'papaparse';

// ─── PDF Export ────────────────────────────────────────────────────────────────
export interface PdfRow {
  [key: string]: string | number;
}

export const exportPDF = (
  title: string,
  content: string,
  options?: {
    rows?: PdfRow[];
    columns?: string[];
    subtitle?: string;
    periodLabel?: string;
    totals?: { label: string; value: string }[];
  }
): void => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentW = pageW - margin * 2;

  // ── Header band ────────────────────────────────────────────────────────────
  doc.setFillColor(139, 69, 19);          // #8B4513 brown
  doc.rect(0, 0, pageW, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SÉCURITÉ SOCIALE', margin, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Système de gestion des remboursements médicaux', margin, 20);
  doc.text(`Généré le : ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 27);

  if (options?.periodLabel) {
    doc.setFont('helvetica', 'bold');
    doc.text(`Période : ${options.periodLabel}`, pageW - margin, 20, { align: 'right' });
  }

  // ── Separator line ─────────────────────────────────────────────────────────
  doc.setDrawColor(210, 105, 30);
  doc.setLineWidth(0.8);
  doc.line(margin, 36, pageW - margin, 36);

  // ── Document title ─────────────────────────────────────────────────────────
  doc.setTextColor(139, 69, 19);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(title.toUpperCase(), margin, 46);

  if (options?.subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(options.subtitle, margin, 53);
  }

  let cursorY = options?.subtitle ? 60 : 54;

  // ── Totals summary boxes ───────────────────────────────────────────────────
  if (options?.totals && options.totals.length > 0) {
    const boxW = (contentW - (options.totals.length - 1) * 4) / options.totals.length;
    options.totals.forEach((t, i) => {
      const bx = margin + i * (boxW + 4);
      doc.setFillColor(255, 248, 240);
      doc.setDrawColor(210, 105, 30);
      doc.setLineWidth(0.3);
      doc.roundedRect(bx, cursorY, boxW, 14, 2, 2, 'FD');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(120, 80, 40);
      doc.text(t.label, bx + boxW / 2, cursorY + 4.5, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(139, 69, 19);
      doc.text(t.value, bx + boxW / 2, cursorY + 10, { align: 'center' });
    });
    cursorY += 20;
  }

  // ── Table ─────────────────────────────────────────────────────────────────
  if (options?.rows && options?.columns && options.rows.length > 0) {
    const cols = options.columns;
    const colW = contentW / cols.length;
    const rowH = 7;
    const headerH = 9;

    // Table header
    doc.setFillColor(139, 69, 19);
    doc.rect(margin, cursorY, contentW, headerH, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    cols.forEach((col, i) => {
      doc.text(col, margin + i * colW + colW / 2, cursorY + 6, { align: 'center' });
    });
    cursorY += headerH;

    // Table rows
    options.rows.forEach((row, rowIdx) => {
      if (cursorY + rowH > pageH - 25) {
        doc.addPage();
        cursorY = 20;
        // repeat header
        doc.setFillColor(139, 69, 19);
        doc.rect(margin, cursorY, contentW, headerH, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        cols.forEach((col, i) => doc.text(col, margin + i * colW + colW / 2, cursorY + 6, { align: 'center' }));
        cursorY += headerH;
      }

      // Alternating row background
      if (rowIdx % 2 === 0) {
        doc.setFillColor(255, 248, 240);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.rect(margin, cursorY, contentW, rowH, 'F');

      // Cell border bottom
      doc.setDrawColor(220, 180, 150);
      doc.setLineWidth(0.1);
      doc.line(margin, cursorY + rowH, margin + contentW, cursorY + rowH);

      // Cell text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(50, 50, 50);
      cols.forEach((col, i) => {
        const cellVal = String(row[col] ?? '');
        doc.text(cellVal, margin + i * colW + colW / 2, cursorY + 4.8, { align: 'center' });
      });
      cursorY += rowH;
    });

    // Table outer border
    doc.setDrawColor(139, 69, 19);
    doc.setLineWidth(0.4);
    doc.rect(margin, cursorY - options.rows.length * rowH - headerH, contentW, options.rows.length * rowH + headerH);

  } else if (content) {
    // Fallback plain text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    const lines = doc.splitTextToSize(content, contentW);
    doc.text(lines, margin, cursorY);
  }

  // ── Footer ─────────────────────────────────────────────────────────────────
  const totalPages = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(245, 235, 225);
    doc.rect(0, pageH - 12, pageW, 12, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(139, 69, 19);
    doc.text('Sécurité Sociale — Document confidentiel — Usage interne uniquement', margin, pageH - 5);
    doc.text(`Page ${p} / ${totalPages}`, pageW - margin, pageH - 5, { align: 'right' });
  }

  doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.pdf`);
};

// ─── CSV Export ────────────────────────────────────────────────────────────────
export const exportCSV = (data: Record<string, unknown>[], filename: string): void => {
  // BOM for Excel UTF-8 support
  const BOM = '\uFEFF';
  const csv = Papa.unparse(data, {
    delimiter: ';',    // semicolon for French Excel locale
    header: true,
    quotes: true,      // quote all fields for safety
  });
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${dateStr}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

// ─── JSON Export ───────────────────────────────────────────────────────────────
export const exportJSON = (
  data: unknown,
  filename: string,
  meta?: { titre?: string; periode?: string; total?: number | string }
): void => {
  const dateStr = new Date().toISOString();
  const enriched = {
    meta: {
      application: 'Système de Sécurité Sociale',
      titre: meta?.titre || filename,
      periode: meta?.periode || 'Non spécifiée',
      dateGeneration: dateStr,
      totalEnregistrements: Array.isArray(data) ? (data as unknown[]).length : undefined,
      ...(meta?.total !== undefined ? { totalMontant: meta.total } : {}),
    },
    donnees: data,
  };
  const json = JSON.stringify(enriched, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${dateStr.slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const printContent = (): void => {
  window.print();
};
