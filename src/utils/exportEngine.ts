/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */


import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { Node } from '../data/corpus';
import { blocksToString } from './voidUtils';

export type ExportFormat = 'json' | 'csv' | 'md' | 'txt' | 'pdf' | 'docx';

export const exportEngine = {
  export: async (nodes: Node[], format: ExportFormat) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `void_corpus_${timestamp}.${format}`;

    switch (format) {
      case 'json':
        exportToJSON(nodes, filename);
        break;
      case 'csv':
        exportToCSV(nodes, filename);
        break;
      case 'md':
        exportToMD(nodes, filename);
        break;
      case 'txt':
        exportToTXT(nodes, filename);
        break;
      case 'pdf':
        exportToPDF(nodes, filename);
        break;
      case 'docx':
        await exportToDOCX(nodes, filename);
        break;
    }
  }
};

const exportToJSON = (nodes: Node[], filename: string) => {
  const data = JSON.stringify(nodes, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  saveAs(blob, filename);
};

const exportToCSV = (nodes: Node[], filename: string) => {
  const headers = ['ID', 'Label', 'Type', 'Status', 'Content', 'Tags', 'Date Added'];
  const rows = nodes.map(node => [
    node.id,
    `"${node.label.replace(/"/g, '""')}"`,
    node.type,
    node.status || '',
    `"${(blocksToString(node.blocks) || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
    `"${(node.metadata?.tags || []).join(', ')}"`,
    node.metadata?.date_added || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename);
};

const exportToMD = (nodes: Node[], filename: string) => {
  const content = nodes.map(node => {
    return `# ${node.label}\n\n**Type:** ${node.type} | **Status:** ${node.status}\n**Tags:** ${(node.metadata?.tags || []).join(', ')}\n\n${blocksToString(node.blocks) || ''}\n\n---\n`;
  }).join('\n');

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  saveAs(blob, filename);
};

const exportToTXT = (nodes: Node[], filename: string) => {
  const content = nodes.map(node => {
    return `TITLE: ${node.label}\nTYPE: ${node.type}\nSTATUS: ${node.status}\nTAGS: ${(node.metadata?.tags || []).join(', ')}\n\n${blocksToString(node.blocks) || ''}\n\n========================================\n`;
  }).join('\n');

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  saveAs(blob, filename);
};

const exportToPDF = (nodes: Node[], filename: string) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('The Void Knowledgebase', 14, 22);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

  const tableData = nodes.map(node => [
    node.label,
    node.type,
    node.status || '-',
    (node.metadata?.tags || []).join(', ')
  ]);

  autoTable(doc, {
    startY: 40,
    head: [['Title', 'Type', 'Status', 'Tags']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [249, 115, 22] }, // Orange-500
  });

  doc.save(filename);
};

const exportToDOCX = async (nodes: Node[], filename: string) => {
  const children = [
    new Paragraph({
      text: "The Void Knowledgebase",
      heading: HeadingLevel.TITLE,
    }),
    new Paragraph({
      text: `Generated: ${new Date().toLocaleDateString()}`,
      spacing: { after: 400 },
    }),
  ];

  nodes.forEach(node => {
    children.push(
      new Paragraph({
        text: node.label,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Type: ${node.type} | Status: ${node.status}`, bold: true, size: 20 }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: blocksToString(node.blocks) || '',
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: "---",
        spacing: { after: 200 },
      })
    );
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children: children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
};
