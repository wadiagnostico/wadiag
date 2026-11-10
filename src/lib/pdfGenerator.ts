import { jsPDF } from 'jspdf';
import { Assessment, AssessmentResult, Dimension, Profile, DimensionScore } from '../types';

interface GeneratePdfOptions {
  assessment: Assessment;
  result: AssessmentResult;
  dimensions: Dimension[];
  primaryProfile: Profile;
  secondaryProfiles: Profile[];
  platformName?: string;
}

export async function generateAssessmentPDF({
  assessment,
  result,
  dimensions,
  primaryProfile,
  secondaryProfiles,
  platformName = 'Mapa dos Bloqueios',
}: GeneratePdfOptions): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Palette
  const brownDark = [92, 74, 50] as const;
  const brown = [139, 115, 85] as const;
  const gold = [201, 169, 110] as const;
  const cream = [250, 248, 245] as const;
  const textDark = [61, 46, 31] as const;
  const textMuted = [155, 139, 125] as const;

  const addHeader = (pageNum: number) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...brown);
    doc.text(platformName.toUpperCase(), margin, 12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textMuted);
    doc.text(`Participante: ${assessment.participant_name}`, pageWidth - margin, 12, { align: 'right' });
    doc.setDrawColor(212, 197, 169);
    doc.setLineWidth(0.3);
    doc.line(margin, 14, pageWidth - margin, 14);
  };

  const addFooter = (pageNum: number, totalPages: number) => {
    doc.setDrawColor(212, 197, 169);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text('Relatório individual confidencial e educativo — Não substitui orientação médica ou psicológica.', margin, pageHeight - 9);
    doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - margin, pageHeight - 9, { align: 'right' });
  };

  // ==========================================
  // PÁGINA 1: CAPA EDITORIAL & ABERTURA
  // ==========================================
  // Fundo bege suave no topo
  doc.setFillColor(...cream);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Decorative border
  doc.setDrawColor(...gold);
  doc.setLineWidth(1);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  y = 45;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...brownDark);
  doc.text(platformName, pageWidth / 2, y, { align: 'center' });

  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(...brown);
  doc.text('Diagnóstico de Mentalidade, Comportamento e Prosperidade', pageWidth / 2, y, { align: 'center' });

  y += 15;
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.8);
  doc.line(pageWidth / 2 - 30, y, pageWidth / 2 + 30, y);

  y += 25;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin + 10, y, contentWidth - 20, 50, 4, 4, 'F');
  doc.setDrawColor(212, 197, 169);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin + 10, y, contentWidth - 20, 50, 4, 4, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...brownDark);
  doc.text('DADOS DA AVALIAÇÃO', pageWidth / 2, y + 12, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...textDark);
  doc.text(`Participante: ${assessment.participant_name}`, pageWidth / 2, y + 23, { align: 'center' });

  const dateFormatted = new Date(assessment.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  doc.setFontSize(10);
  doc.setTextColor(...textMuted);
  doc.text(`Data de Realização: ${dateFormatted}`, pageWidth / 2, y + 33, { align: 'center' });
  doc.text(`Tempo de Conclusão: ${assessment.duration_seconds ? Math.round(assessment.duration_seconds / 60) + ' minutos' : '30-45 minutos'}`, pageWidth / 2, y + 41, { align: 'center' });

  y += 70;
  // Mensagem da Larissa
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...brownDark);
  doc.text('Mensagem de Abertura da Larissa Maykot', margin + 10, y);

  y += 8;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(...textDark);
  const introMsg =
    'Este mapa é uma bússola para o seu momento presente, refletindo com carinho e clareza os pontos onde sua energia pode estar sendo retida. Não se trata de um rótulo imutável ou sentença, mas de um convite consciente para escolher novas rotas, alinhar sua mentalidade e permitir que a prosperidade flua com leveza e sustentabilidade na sua vida.';
  const splitIntro = doc.splitTextToSize(introMsg, contentWidth - 20);
  doc.text(splitIntro, margin + 10, y);

  y += splitIntro.length * 6 + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...brownDark);
  doc.text('Como ler este relatório:', margin + 10, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...textDark);
  const rulesText = [
    '• Pontuações representam a frequência autorrelatada de comportamentos, e não sua identidade.',
    '• Seu Perfil Predominante aponta o maior padrão de atenção no momento atual.',
    '• O Plano de 21 Dias traz microações desenhadas para destravar pontos-chave com gentileza.',
  ];
  rulesText.forEach((rule) => {
    doc.text(rule, margin + 10, y);
    y += 5.5;
  });

  // ==========================================
  // PÁGINA 2: RESULTADOS & PERFIS
  // ==========================================
  doc.addPage();
  addHeader(2);
  y = 25;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...brownDark);
  doc.text('Seu Perfil Diagnóstico', margin, y);

  y += 8;
  // Card Perfil Predominante
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, y, contentWidth, 55, 3, 3, 'F');
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, y, contentWidth, 55, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...gold);
  doc.text('PERFIL PREDOMINANTE', margin + 8, y + 10);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...brownDark);
  doc.text(primaryProfile.name, margin + 8, y + 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...textDark);
  const profileDesc = doc.splitTextToSize(primaryProfile.phrase || primaryProfile.description, contentWidth - 16);
  doc.text(profileDesc, margin + 8, y + 28);

  y += 65;

  // Perfis Secundários
  if (secondaryProfiles.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...brownDark);
    doc.text('Perfis Secundários Identificados', margin, y);
    y += 6;

    secondaryProfiles.forEach((sec) => {
      doc.setFillColor(245, 241, 235);
      doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...brownDark);
      doc.text(sec.name, margin + 6, y + 8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...textDark);
      const secDesc = doc.splitTextToSize(sec.description, contentWidth - 12);
      doc.text(secDesc, margin + 6, y + 14);
      y += 28;
    });
  }

  // Gráfico / Quadro das 7 Dimensões
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...brownDark);
  doc.text('Pontuação nas Sete Dimensões (0 a 100)', margin, y);
  y += 8;

  dimensions.forEach((dim, idx) => {
    const scoreData: DimensionScore | undefined = result.dimension_scores[dim.id];
    const score = scoreData ? scoreData.normalized_score : 0;
    const label = scoreData ? scoreData.range_label : 'Poucos sinais';

    // Label da dimensão
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...textDark);
    doc.text(`${dim.order_num}. ${dim.name}`, margin, y);

    // Score text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...brownDark);
    doc.text(`${score}% (${label})`, pageWidth - margin, y, { align: 'right' });

    y += 3;
    // Barra de progresso fundo
    doc.setFillColor(235, 230, 222);
    doc.roundedRect(margin, y, contentWidth, 4.5, 2, 2, 'F');

    // Barra de progresso ativa
    let barColor: [number, number, number] = [76, 175, 80];
    if (score >= 70) barColor = [229, 57, 53];
    else if (score >= 50) barColor = [251, 140, 0];
    else if (score >= 25) barColor = [139, 195, 74];

    doc.setFillColor(...barColor);
    const fillW = Math.max(2, (contentWidth * score) / 100);
    doc.roundedRect(margin, y, fillW, 4.5, 2, 2, 'F');

    y += 8;
  });

  // ==========================================
  // PÁGINA 3: LEITURA DETALHADA E ORIENTAÇÕES
  // ==========================================
  doc.addPage();
  addHeader(3);
  y = 25;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...brownDark);
  doc.text('Orientações e Recomendações Práticas', margin, y);
  y += 8;

  // Orientações do Perfil Principal
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, y, contentWidth, 40, 3, 3, 'F');
  doc.setDrawColor(212, 197, 169);
  doc.roundedRect(margin, y, contentWidth, 40, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...brownDark);
  doc.text('Diretriz Central:', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...textDark);
  const guideText = doc.splitTextToSize(primaryProfile.guidance || 'Foque em pequenas ações diárias e proteja seu espaço.', contentWidth - 12);
  doc.text(guideText, margin + 6, y + 17);

  y += 48;

  // 3 Prioridades Sugeridas
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...brownDark);
  doc.text('Três Prioridades Sugeridas para Começar:', margin, y);
  y += 7;

  const priorities = [
    '1. Consciência Diária: Registrar gatilhos sem autocrítica severa nos primeiros 7 dias.',
    '2. Redução de Sobrecarga: Dizer um "não" consciente para abrir espaço para o seu objetivo principal.',
    '3. Ação Imperfeita: Executar a menor versão possível de um plano antes de buscar validação externa.',
  ];

  priorities.forEach((p) => {
    doc.setFillColor(248, 245, 240);
    doc.roundedRect(margin, y, contentWidth, 11, 2, 2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...textDark);
    doc.text(p, margin + 5, y + 7.5);
    y += 14;
  });

  y += 5;
  // Plano de 21 Dias Introdução
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...brownDark);
  doc.text('Estrutura do Seu Plano de 21 Dias', margin, y);
  y += 7;

  const planWeeks = [
    {
      week: 'Semana 1 (Dias 1 a 7) — Consciência',
      desc: 'Observar gatilhos emocionais, registrar linguagem interna, mapear o ambiente físico e digital e selecionar uma única prioridade inegociável.',
    },
    {
      week: 'Semana 2 (Dias 8 a 14) — Ajuste',
      desc: 'Testar a ação mínima viável de 5 minutos, exercitar limites saudáveis, desapegar da perfeição e reestruturar crenças sobre merecimento e prosperidade.',
    },
    {
      week: 'Semana 3 (Dias 15 a 21) — Consistência',
      desc: 'Proteger blocos de foco pleno, auditar energias, acolher o tempo do processo e consolidar 3 hábitos sustentáveis para levar para a vida.',
    },
  ];

  planWeeks.forEach((w) => {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'F');
    doc.setDrawColor(212, 197, 169);
    doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...brown);
    doc.text(w.week, margin + 5, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...textDark);
    const wDesc = doc.splitTextToSize(w.desc, contentWidth - 10);
    doc.text(wDesc, margin + 5, y + 13);
    y += 26;
  });

  // Mensagem Final
  y += 5;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(...brown);
  const finalMsg =
    '“Lembre-se: o resultado que você tem hoje é o ponto de partida mais potente para a transformação que você escolhe viver amanhã. Confie na sua jornada.” — Larissa Maykot';
  const splitFinal = doc.splitTextToSize(finalMsg, contentWidth);
  doc.text(splitFinal, margin, y);

  // Numeração de páginas no rodapé
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i, totalPages);
  }

  // Baixar PDF
  const filename = `Mapa-dos-Bloqueios-${assessment.participant_name.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}
