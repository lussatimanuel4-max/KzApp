// src/utils/pdfGenerator.js
// Gera o PDF do relatório mensal (com nome personalizado)

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { formatarKz, formatarData, formatarMesAno } from './format';
import { CATEGORIES } from './categories';

export async function gerarRelatorioMensal({
  transactions,
  year,
  monthIndex,
  totalIn,
  totalOut,
  balance,
  topCategories,
}) {
  // Filtrar transações do mês
  const transacoesDoMes = transactions.filter((tx) => {
    const data = new Date(tx.date || tx.createdAt);
    return data.getFullYear() === year && data.getMonth() === monthIndex;
  });

  transacoesDoMes.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  // HTML das categorias
  const htmlCategorias = topCategories
    .map(
      (cat) => `
    <div class="category-row">
      <div class="category-dot" style="background-color: ${cat.color};"></div>
      <span class="category-name">${cat.label}</span>
      <span class="category-value">${formatarKz(cat.value)}</span>
    </div>
  `
    )
    .join('');

  // HTML das transações
  const htmlTransacoes = transacoesDoMes
    .map((tx) => {
      const eEntrada = tx.type === 'in';
      const dadosCat = CATEGORIES.find((c) => c.id === tx.category);
      const rotulo = tx.note || (eEntrada ? 'Recebi' : dadosCat ? dadosCat.label : 'Gastei');
      const dataStr = formatarData(tx.date || tx.createdAt);
      const sinal = eEntrada ? '+' : '-';
      const cor = eEntrada ? '#00D2A0' : '#FF8A8A';

      return `
      <div class="transaction-row">
        <div class="transaction-left">
          <span class="transaction-label">${rotulo}</span>
          <span class="transaction-date">${dataStr}</span>
        </div>
        <span class="transaction-value" style="color: ${cor};">
          ${sinal} ${formatarKz(tx.amount)}
        </span>
      </div>
    `;
    })
    .join('');

  // Estrutura HTML do PDF
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background-color: #000000 !important; font-family: 'Inter', sans-serif; color: #FFFFFF; }
        body { padding: 40px 30px; }
        .header { background: linear-gradient(135deg, #7E57C2, #5E35B1); padding: 30px; border-radius: 20px; margin-bottom: 24px; }
        .header h1 { font-size: 28px; font-weight: 800; margin-bottom: 4px; color: #FFFFFF; }
        .header p { color: rgba(255,255,255,0.7); font-size: 14px; text-transform: capitalize; }
        .header .balance { font-size: 36px; font-weight: 800; margin-top: 20px; letter-spacing: -1px; }
        .header .balance-label { font-size: 12px; font-weight: 700; letter-spacing: 1.5px; color: rgba(255,255,255,0.6); margin-bottom: 4px; }
        .summary { display: flex; gap: 16px; margin-bottom: 24px; }
        .summary-card { flex: 1; background-color: #1C1C1E; padding: 20px; border-radius: 16px; }
        .summary-card .label { font-size: 12px; color: #A1A1A6; margin-bottom: 4px; }
        .summary-card .value { font-size: 20px; font-weight: 800; }
        .in { color: #00D2A0; }
        .out { color: #FF8A8A; }
        .section-title { font-size: 18px; font-weight: 800; margin-bottom: 16px; margin-top: 32px; }
        .category-row { display: flex; align-items: center; padding: 12px 16px; background-color: #1C1C1E; border-radius: 12px; margin-bottom: 8px; }
        .category-dot { width: 12px; height: 12px; border-radius: 6px; margin-right: 12px; }
        .category-name { flex: 1; font-weight: 600; color: #FFFFFF; }
        .category-value { font-weight: 700; color: #A1A1A6; }
        .transaction-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid #2C2C2E; }
        .transaction-left { display: flex; flex-direction: column; gap: 4px; }
        .transaction-label { font-weight: 700; color: #FFFFFF; }
        .transaction-date { font-size: 12px; color: #A1A1A6; }
        .transaction-value { font-weight: 700; font-size: 15px; }
        .footer { margin-top: 40px; text-align: center; color: #636366; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Kwanza App</h1>
        <p>Relatório de ${formatarMesAno(year, monthIndex)}</p>
        <div class="balance-label">SALDO FINAL</div>
        <div class="balance">${formatarKz(balance)}</div>
      </div>
      <div class="summary">
        <div class="summary-card">
          <div class="label">Recebi</div>
          <div class="value in">${formatarKz(totalIn)}</div>
        </div>
        <div class="summary-card">
          <div class="label">Gastei</div>
          <div class="value out">${formatarKz(totalOut)}</div>
        </div>
      </div>
      <h2 class="section-title">Top Categorias</h2>
      ${htmlCategorias || '<p style="color: #A1A1A6;">Sem gastos por categoria.</p>'}
      <h2 class="section-title">Todas as Transações</h2>
      ${htmlTransacoes || '<p style="color: #A1A1A6;">Sem transações neste mês.</p>'}
      <div class="footer">
        Gerado pelo Kwanza App • ${formatarData(new Date())}
      </div>
    </body>
    </html>
  `;

  try {
    // 1. Gerar o PDF (margens 0, fundo preto)
    const { uri } = await Print.printToFileAsync({
      html,
      width: 595,
      height: 842,
      margins: { left: 0, right: 0, top: 0, bottom: 0 },
      backgroundColor: '#000000',
    });

    // 2. Criar o nome bonito para o ficheiro
    const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const mesStr = nomesMeses[monthIndex];
    const nomeFicheiro = `KwanzaApp_Relatorio_${mesStr}_${year}.pdf`;
    
    // 3. Copiar para o novo caminho com o nome bonito (API Legacy)
    const novoUri = `${FileSystem.cacheDirectory}${nomeFicheiro}`;
    await FileSystem.copyAsync({ from: uri, to: novoUri });

    // 4. Abrir a folha de partilha
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(novoUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Partilhar Relatório',
        UTI: 'com.adobe.pdf',
      });
    }

    return novoUri;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return null;
  }
}