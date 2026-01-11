import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MillingScenario, CalculationResults } from '../types';
import { getOutTurnRate } from '../calculations';

export function exportToExcel(
  scenario: MillingScenario,
  results: CalculationResults
) {
  const workbook = XLSX.utils.book_new();

  const summaryData: any[][] = [
    ['CMR RICE MILL - FINANCIAL REPORT'],
    ['Generated on:', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })],
    [''],
    ['═══════════════════════════════════════════════════════════════════'],
    ['SECTION 1: INPUT PARAMETERS'],
    ['═══════════════════════════════════════════════════════════════════'],
    ['Parameter', 'Value', 'Unit'],
    ['Paddy Quantity', scenario.paddyQuantity, 'Qtl'],
    ['Bag Weight Type', scenario.use41KgBags ? '41 kg (with 2.5% excess)' : '40 kg (standard)', ''],
    ['Rice Type', scenario.riceType === 'raw' ? 'Raw Rice' : 'Boiled Rice', ''],
    ['Out-turn Rate', `${(getOutTurnRate(scenario.riceType) * 100).toFixed(0)}%`, ''],
    ['Rice Purchase Rate', scenario.ricePurchaseRate, '₹/Qtl'],
    [''],
    ['═══════════════════════════════════════════════════════════════════'],
    ['SECTION 2: YIELD STRUCTURE'],
    ['═══════════════════════════════════════════════════════════════════'],
    ['Component', 'Yield %', 'Actual Quantity (Qtl)'],
    ['Head Rice', scenario.yields.headRice.toFixed(2), results.actualHeadRice.toFixed(2)],
    ['Broken Rice', scenario.yields.brokenRice.toFixed(2), results.byProducts.find(p => p.name === 'Broken Rice')?.quantity.toFixed(2) || '0'],
    ['Bran', scenario.yields.bran.toFixed(2), results.byProducts.find(p => p.name === 'Bran')?.quantity.toFixed(2) || '0'],
    ['Param (Short Broken)', scenario.yields.param.toFixed(2), results.byProducts.find(p => p.name === 'Param')?.quantity.toFixed(2) || '0'],
    ['Rejection Rice', scenario.yields.rejectionRice.toFixed(2), results.byProducts.find(p => p.name === 'Rejection Rice')?.quantity.toFixed(2) || '0'],
    ['Husk', scenario.yields.husk.toFixed(2), results.byProducts.find(p => p.name === 'Husk')?.quantity.toFixed(2) || '0'],
    ['TOTAL', results.yieldTotal.toFixed(2), ''],
    [''],
    ['═══════════════════════════════════════════════════════════════════'],
    ['SECTION 3: WEIGHT CALCULATIONS'],
    ['═══════════════════════════════════════════════════════════════════'],
    ['Description', 'Quantity', 'Unit'],
    ['Standard Paddy (for CMR)', results.standardPaddy.toFixed(2), 'Qtl'],
    ['Actual Paddy (for by-products)', results.actualPaddy.toFixed(2), 'Qtl'],
    ['Required Rice (CMR obligation)', results.requiredRice.toFixed(2), 'Qtl'],
    ['Actual Head Rice Produced', results.actualHeadRice.toFixed(2), 'Qtl'],
    ['Rice Shortfall', results.riceShortfall.toFixed(2), 'Qtl'],
    [''],
    ['═══════════════════════════════════════════════════════════════════'],
    ['SECTION 4: BY-PRODUCT REVENUE DETAILS'],
    ['═══════════════════════════════════════════════════════════════════'],
    ['By-Product', 'Yield %', 'Quantity (Qtl)', 'Rate (₹/Qtl)', 'Total Value (₹)'],
  ];

  results.byProducts.forEach((product) => {
    summaryData.push([
      product.name,
      product.yieldPercent.toFixed(2),
      product.quantity.toFixed(2),
      product.rate.toFixed(2),
      product.value.toFixed(2),
    ]);
  });

  summaryData.push(
    ['TOTAL BY-PRODUCT REVENUE', '', '', '', results.totalByProductRevenue.toFixed(2)],
    [''],
    ['═══════════════════════════════════════════════════════════════════'],
    ['SECTION 5: WORKING COSTS BREAKDOWN'],
    ['═══════════════════════════════════════════════════════════════════'],
    ['Cost Item', 'Amount (₹)', 'Per Qtl (₹)'],
    ['Electricity', scenario.workingCosts.electricity.toFixed(2), (scenario.workingCosts.electricity / results.actualPaddy).toFixed(2)],
    ['Labour', scenario.workingCosts.labour.toFixed(2), (scenario.workingCosts.labour / results.actualPaddy).toFixed(2)],
    ['Salaries', scenario.workingCosts.salaries.toFixed(2), (scenario.workingCosts.salaries / results.actualPaddy).toFixed(2)],
    ['Hamali (Loading/Unloading)', scenario.workingCosts.hamali.toFixed(2), (scenario.workingCosts.hamali / results.actualPaddy).toFixed(2)],
    ['Spares & Maintenance', scenario.workingCosts.spares.toFixed(2), (scenario.workingCosts.spares / results.actualPaddy).toFixed(2)],
    ['FCI Expenses', scenario.workingCosts.fciExpenses.toFixed(2), (scenario.workingCosts.fciExpenses / results.actualPaddy).toFixed(2)],
    ['Other Expenses', scenario.workingCosts.others.toFixed(2), (scenario.workingCosts.others / results.actualPaddy).toFixed(2)],
    ['TOTAL WORKING COSTS', results.totalWorkingCosts.toFixed(2), (results.totalWorkingCosts / results.actualPaddy).toFixed(2)],
    [''],
    ['═══════════════════════════════════════════════════════════════════'],
    ['SECTION 6: FINANCIAL SUMMARY'],
    ['═══════════════════════════════════════════════════════════════════'],
    ['Description', 'Amount (₹)', 'Notes'],
    ['Total By-Product Revenue', results.totalByProductRevenue.toFixed(2), 'Income from selling by-products'],
    ['Rice Shortfall Cost', results.riceShortfallCost.toFixed(2), 'Cost to purchase rice deficit'],
    ['Total Working Costs', results.totalWorkingCosts.toFixed(2), 'All operational expenses'],
    [''],
    ['NET BALANCE', results.netBalance.toFixed(2), results.netBalance >= 0 ? '✓ PROFIT' : '✗ LOSS'],
    ['Profit Margin', ((results.netBalance / results.totalByProductRevenue) * 100).toFixed(2) + '%', 'Net Balance / Revenue'],
    ['Per Qtl Profit/Loss', (results.netBalance / results.actualPaddy).toFixed(2), '₹ per quintal paddy processed']
  );

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

  summarySheet['!cols'] = [
    { wch: 35 },
    { wch: 20 },
    { wch: 25 },
  ];

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary Report');

  const detailData: any[][] = [
    ['DETAILED BY-PRODUCT ANALYSIS'],
    [''],
    ['By-Product', 'Yield %', 'Quantity', 'Rate', 'Value', 'Revenue %'],
  ];

  results.byProducts.forEach((product) => {
    const revenuePercent = ((product.value / results.totalByProductRevenue) * 100).toFixed(2);
    detailData.push([
      product.name,
      product.yieldPercent.toFixed(2) + '%',
      product.quantity.toFixed(2) + ' Qtl',
      '₹' + product.rate.toFixed(2),
      '₹' + product.value.toFixed(2),
      revenuePercent + '%'
    ]);
  });

  const detailSheet = XLSX.utils.aoa_to_sheet(detailData);
  detailSheet['!cols'] = [
    { wch: 20 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
    { wch: 18 },
    { wch: 15 },
  ];

  XLSX.utils.book_append_sheet(workbook, detailSheet, 'By-Product Details');

  XLSX.writeFile(workbook, `CMR_Financial_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportToPDF(
  scenario: MillingScenario,
  results: CalculationResults
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('CMR RICE MILL', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Financial Analysis Report', pageWidth / 2, 23, { align: 'center' });

  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`, pageWidth / 2, 30, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  let yPosition = 45;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text('1. INPUT PARAMETERS', 14, yPosition);
  yPosition += 7;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  const inputData = [
    ['Paddy Quantity', `${scenario.paddyQuantity.toFixed(2)} Qtl`],
    ['Bag Weight', scenario.use41KgBags ? '41 kg (with 2.5% excess)' : '40 kg (standard)'],
    ['Rice Type', scenario.riceType === 'raw' ? 'Raw Rice (67%)' : 'Boiled Rice (68%)'],
    ['Rice Purchase Rate', `₹${scenario.ricePurchaseRate.toFixed(2)}/Qtl`],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: inputData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 70 },
      1: { cellWidth: 110 }
    }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 12;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text('2. YIELD STRUCTURE', 14, yPosition);
  yPosition += 7;

  const yieldData = [
    ['Component', 'Yield %', 'Quantity (Qtl)'],
    ['Head Rice', `${scenario.yields.headRice.toFixed(2)}%`, results.actualHeadRice.toFixed(2)],
    ['Broken Rice', `${scenario.yields.brokenRice.toFixed(2)}%`, (results.byProducts.find(p => p.name === 'Broken Rice')?.quantity || 0).toFixed(2)],
    ['Bran', `${scenario.yields.bran.toFixed(2)}%`, (results.byProducts.find(p => p.name === 'Bran')?.quantity || 0).toFixed(2)],
    ['Param (Short Broken)', `${scenario.yields.param.toFixed(2)}%`, (results.byProducts.find(p => p.name === 'Param')?.quantity || 0).toFixed(2)],
    ['Rejection Rice', `${scenario.yields.rejectionRice.toFixed(2)}%`, (results.byProducts.find(p => p.name === 'Rejection Rice')?.quantity || 0).toFixed(2)],
    ['Husk', `${scenario.yields.husk.toFixed(2)}%`, (results.byProducts.find(p => p.name === 'Husk')?.quantity || 0).toFixed(2)],
    ['TOTAL', `${results.yieldTotal.toFixed(2)}%`, ''],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [yieldData[0]],
    body: yieldData.slice(1),
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [243, 244, 246], fontStyle: 'bold' }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 12;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text('3. BY-PRODUCT REVENUE', 14, yPosition);
  yPosition += 7;

  const byProductData = results.byProducts.map((p) => [
    p.name,
    `${p.yieldPercent.toFixed(2)}%`,
    `${p.quantity.toFixed(2)}`,
    `₹${p.rate.toFixed(2)}`,
    `₹${p.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
  ]);

  byProductData.push([
    { content: 'TOTAL REVENUE', colSpan: 4, styles: { fontStyle: 'bold', halign: 'right' } },
    { content: `₹${results.totalByProductRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, styles: { fontStyle: 'bold', fillColor: [243, 244, 246] } }
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['By-Product', 'Yield %', 'Qty (Qtl)', 'Rate (₹/Qtl)', 'Value (₹)']],
    body: byProductData,
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      4: { halign: 'right' }
    }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 12;

  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text('4. WORKING COSTS BREAKDOWN', 14, yPosition);
  yPosition += 7;

  const costData = [
    ['Electricity', `₹${scenario.workingCosts.electricity.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, `₹${(scenario.workingCosts.electricity / results.actualPaddy).toFixed(2)}/Qtl`],
    ['Labour', `₹${scenario.workingCosts.labour.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, `₹${(scenario.workingCosts.labour / results.actualPaddy).toFixed(2)}/Qtl`],
    ['Salaries', `₹${scenario.workingCosts.salaries.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, `₹${(scenario.workingCosts.salaries / results.actualPaddy).toFixed(2)}/Qtl`],
    ['Hamali', `₹${scenario.workingCosts.hamali.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, `₹${(scenario.workingCosts.hamali / results.actualPaddy).toFixed(2)}/Qtl`],
    ['Spares & Maintenance', `₹${scenario.workingCosts.spares.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, `₹${(scenario.workingCosts.spares / results.actualPaddy).toFixed(2)}/Qtl`],
    ['FCI Expenses', `₹${scenario.workingCosts.fciExpenses.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, `₹${(scenario.workingCosts.fciExpenses / results.actualPaddy).toFixed(2)}/Qtl`],
    ['Other Expenses', `₹${scenario.workingCosts.others.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, `₹${(scenario.workingCosts.others / results.actualPaddy).toFixed(2)}/Qtl`],
  ];

  costData.push([
    { content: 'TOTAL COSTS', styles: { fontStyle: 'bold' } },
    { content: `₹${results.totalWorkingCosts.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, styles: { fontStyle: 'bold', fillColor: [243, 244, 246] } },
    { content: `₹${(results.totalWorkingCosts / results.actualPaddy).toFixed(2)}/Qtl`, styles: { fontStyle: 'bold', fillColor: [243, 244, 246] } }
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Cost Item', 'Total Amount', 'Per Qtl']],
    body: costData,
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' }
    }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 12;

  if (yPosition > 230) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text('5. FINANCIAL SUMMARY', 14, yPosition);
  yPosition += 7;

  const summaryData = [
    ['Total By-Product Revenue', `₹${results.totalByProductRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`],
    ['Rice Shortfall Cost', `₹${results.riceShortfallCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`],
    ['Total Working Costs', `₹${results.totalWorkingCosts.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: summaryData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 90 },
      1: { halign: 'right', cellWidth: 100 }
    }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  const isProfit = results.netBalance >= 0;
  const profitMargin = ((results.netBalance / results.totalByProductRevenue) * 100).toFixed(2);
  const perQtl = (results.netBalance / results.actualPaddy).toFixed(2);

  doc.setFillColor(isProfit ? 16 : 220, isProfit ? 185 : 38, isProfit ? 129 : 38);
  doc.rect(14, yPosition, pageWidth - 28, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('NET BALANCE', pageWidth / 2, yPosition + 10, { align: 'center' });
  doc.setFontSize(20);
  doc.text(`₹${results.netBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, pageWidth / 2, yPosition + 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text(isProfit ? '✓ PROFIT' : '✗ LOSS', pageWidth / 2, yPosition + 27, { align: 'center' });

  yPosition += 38;

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Profit Margin: ${profitMargin}% | Per Qtl: ₹${perQtl}`, pageWidth / 2, yPosition, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('CMR Rice Mill Financial Simulator', pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });

  doc.save(`CMR_Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}
