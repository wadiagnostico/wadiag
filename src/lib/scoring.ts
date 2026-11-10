import { Dimension, Question, Profile, ScoreRange, DimensionScore, AssessmentResult, ActionPlanItem } from '../types';
import { INITIAL_SCORE_RANGES } from '../data/initialData';

export function calculateDimensionScores(
  dimensions: Dimension[],
  questions: Question[],
  responses: Record<string, number>,
  scoreRanges: ScoreRange[] = INITIAL_SCORE_RANGES
): Record<string, DimensionScore> {
  const result: Record<string, DimensionScore> = {};

  dimensions.forEach((dim) => {
    const dimQuestions = questions.filter((q) => q.dimension_id === dim.id);
    let rawScore = 0;
    const maxScore = dimQuestions.length * 4; // usually 8 * 4 = 32

    dimQuestions.forEach((q) => {
      const val = responses[q.id];
      if (typeof val === 'number') {
        rawScore += val;
      }
    });

    const normalized = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0;

    // Find matching range
    const range = scoreRanges.find((r) => normalized >= r.min_score && normalized <= r.max_score) || {
      label: 'Indefinido',
      color: '#8B7355',
    };

    result[dim.id] = {
      dimension_id: dim.id,
      dimension_name: dim.name,
      raw_score: rawScore,
      max_score: maxScore,
      normalized_score: normalized,
      range_label: range.label,
      range_color: range.color,
    };
  });

  return result;
}

export function determineProfiles(
  dimensionScores: Record<string, DimensionScore>,
  profiles: Profile[],
  dimensions: Dimension[]
): { primaryProfile: Profile; secondaryProfiles: Profile[] } {
  // Sort dimensions by highest normalized score
  const sortedDims = Object.values(dimensionScores).sort(
    (a, b) => b.normalized_score - a.normalized_score
  );

  // Map dimension name/order to its normalized score
  const dimOrderToScore: Record<number, number> = {};
  dimensions.forEach((d) => {
    const scoreObj = dimensionScores[d.id];
    dimOrderToScore[d.order_num] = scoreObj ? scoreObj.normalized_score : 0;
  });

  // Score each profile based on matching dimensions
  const profileRankings = profiles
    .filter((p) => !p.combination_rules?.defaultProfile)
    .map((profile) => {
      let matchScore = 0;
      const targetIndices: number[] = profile.combination_rules?.primaryDimensionIndices || [];

      if (targetIndices.length > 0) {
        const scores = targetIndices.map((idx) => dimOrderToScore[idx] || 0);
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        matchScore = avg * (profile.combination_rules?.weight || 1.0);
      }

      return { profile, matchScore };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  // Fallback to "A Construtora em Potencial" if all scores are low (< 40)
  const highestDimensionScore = sortedDims[0]?.normalized_score || 0;
  const defaultProfile = profiles.find((p) => p.combination_rules?.defaultProfile) || profiles[0];

  if (highestDimensionScore < 35 && defaultProfile) {
    return {
      primaryProfile: defaultProfile,
      secondaryProfiles: profileRankings.slice(0, 2).map((r) => r.profile),
    };
  }

  const primaryProfile = profileRankings[0]?.profile || defaultProfile;
  const secondaryProfiles = profileRankings
    .slice(1, 3)
    .filter((r) => r.matchScore >= 40)
    .map((r) => r.profile);

  return { primaryProfile, secondaryProfiles };
}

export function generate21DayPlan(
  primaryProfile: Profile,
  topDimension: DimensionScore | undefined
): ActionPlanItem[] {
  const dimName = topDimension ? topDimension.dimension_name : 'Foco Geral';

  const baseTasks = [
    // Semana 1 - Consciência (Dias 1 a 7)
    {
      week: 1,
      day_num: 1,
      title: 'Mapeamento de Gatilhos',
      instruction: `Dedique 10 minutos hoje para anotar 2 momentos do seu dia em que percebeu pensamentos ligados a "${dimName}". Apenas observe, sem autocrítica.`,
      reflection_prompt: 'O que você sentiu no corpo quando esse pensamento surgiu?',
      estimated_time: '10 min',
    },
    {
      week: 1,
      day_num: 2,
      title: 'Registro de Linguagem Interna',
      instruction: 'Observe as palavras que você usa consigo mesma ao errar ou adiar algo. Anote se você costuma usar termos severos ou de encorajamento.',
      reflection_prompt: 'Como mudaria a frase se estivesse falando com alguém que você ama?',
      estimated_time: '10 min',
    },
    {
      week: 1,
      day_num: 3,
      title: 'Identificação de Evidências Reais',
      instruction: 'Escreva 3 fatos e realizações reais dos últimos 12 meses que provam que você é competente, contrariando a autocrítica.',
      reflection_prompt: 'Por que é tão fácil esquecer essas evidências no dia a dia?',
      estimated_time: '15 min',
    },
    {
      week: 1,
      day_num: 4,
      title: 'Escolha de uma Única Prioridade',
      instruction: `Em sintonia com seu perfil "${primaryProfile.name}", selecione UM objetivo inegociável para as próximas semanas. Descarte as distrações periféricas.`,
      reflection_prompt: 'Qual é o maior medo ao dizer "não" para outras coisas?',
      estimated_time: '15 min',
    },
    {
      week: 1,
      day_num: 5,
      title: 'Mapeamento do Ambiente',
      instruction: 'Identifique 1 elemento físico ou digital (como notificações de redes ou mesa bagunçada) que drena seu foco e planeje como ajustá-lo.',
      reflection_prompt: 'Como o ambiente ao seu redor reflete o seu estado de mente?',
      estimated_time: '10 min',
    },
    {
      week: 1,
      day_num: 6,
      title: 'Pausa de Não-Julgamento',
      instruction: 'Tire 15 minutos para fazer algo sem utilidade produtiva: caminhar, respirar ou tomar um chá sem celular.',
      reflection_prompt: 'Surgiu alguma culpa ao descansar? De onde ela vem?',
      estimated_time: '15 min',
    },
    {
      week: 1,
      day_num: 7,
      title: 'Fechamento da Semana de Consciência',
      instruction: 'Revise suas anotações da semana 1 e selecione o aprendizado mais libertador sobre si mesma até aqui.',
      reflection_prompt: 'Qual foi o padrão mais evidente que você notou em si?',
      estimated_time: '20 min',
    },

    // Semana 2 - Ajuste (Dias 8 a 14)
    {
      week: 2,
      day_num: 8,
      title: 'Ação Mínima Viável',
      instruction: 'Execute hoje a menor versão possível de uma tarefa que você vinha adiando. Faça por apenas 5 minutos cronometrados.',
      reflection_prompt: 'Como você se sentiu após dar o primeiro passo?',
      estimated_time: '10 min',
    },
    {
      week: 2,
      day_num: 9,
      title: 'O Poder do Limite Consciente',
      instruction: 'Diga "não" ou "agora não posso" para uma demanda que não é sua prioridade ou delegue algo que sobrecarrega você.',
      reflection_prompt: 'O mundo desabou por você ter protegido seu tempo?',
      estimated_time: '10 min',
    },
    {
      week: 2,
      day_num: 10,
      title: 'Ajuste de Relação com a Prosperidade',
      instruction: 'Agradeça conscientemente por uma quantia de dinheiro ou recurso que chegou a você, e reconheça o valor que você entregou para merecê-lo.',
      reflection_prompt: 'Você se permite receber com facilidade ou sempre sente que está em dívida?',
      estimated_time: '10 min',
    },
    {
      week: 2,
      day_num: 11,
      title: 'Regra dos Dois Minutos',
      instruction: 'Resolva de imediato tudo o que levar menos de 2 minutos para ser feito, liberando espaço na memória de trabalho.',
      reflection_prompt: 'Quantas pequenas coisas estavam roubando sua paz mental?',
      estimated_time: '15 min',
    },
    {
      week: 2,
      day_num: 12,
      title: 'Desapego da Perfeição',
      instruction: 'Entregue ou conclua uma atividade hoje no padrão "suficientemente bom", sem passar 30 minutos revisando detalhes imperceptíveis.',
      reflection_prompt: 'O que acontece quando você troca o perfeccionismo pelo feito?',
      estimated_time: '15 min',
    },
    {
      week: 2,
      day_num: 13,
      title: 'Reestruturação de Pensamento',
      instruction: 'Quando surgir a frase "e se não der certo?", responda imediatamente com: "e se der certo e eu aprender no caminho?".',
      reflection_prompt: 'Como muda a sua energia quando você abre espaço para a possibilidade positiva?',
      estimated_time: '10 min',
    },
    {
      week: 2,
      day_num: 14,
      title: 'Fechamento da Semana de Ajuste',
      instruction: 'Celebre 2 mudanças práticas de comportamento que você conseguiu implementar nos últimos 7 dias.',
      reflection_prompt: 'Qual barreira parece menos assustadora agora do que há duas semanas?',
      estimated_time: '15 min',
    },

    // Semana 3 - Consistência (Dias 15 a 21)
    {
      week: 3,
      day_num: 15,
      title: 'Bloco de Foco Protegido',
      instruction: 'Defina um bloco de 45 minutos no dia de hoje com celular no silencioso em outro cômodo para avançar no seu objetivo principal.',
      reflection_prompt: 'Qual a sensação de produzir com foco pleno?',
      estimated_time: '45 min',
    },
    {
      week: 3,
      day_num: 16,
      title: 'Auditoria de Energia',
      instruction: 'Liste as 3 atividades que mais aumentam sua energia e as 3 que mais drenam. Aumente o tempo das primeiras e reduza as segundas.',
      reflection_prompt: 'O que você precisa cortar da sua rotina para respirar melhor?',
      estimated_time: '15 min',
    },
    {
      week: 3,
      day_num: 17,
      title: 'Acolhimento da Incerteza',
      instruction: 'Escreva um compromisso com você mesma: focar 100% no esforço de hoje e soltar a ansiedade sobre o resultado de longo prazo.',
      reflection_prompt: 'Você consegue confiar no tempo do seu próprio processo?',
      estimated_time: '10 min',
    },
    {
      week: 3,
      day_num: 18,
      title: 'Celebrando o Valor do Seu Trabalho',
      instruction: 'Revise o valor que você entrega nas suas atividades profissionais e estabeleça uma intenção clara de prosperar.',
      reflection_prompt: 'Qual é o maior impacto positivo que você gera na vida de outras pessoas?',
      estimated_time: '15 min',
    },
    {
      week: 3,
      day_num: 19,
      title: 'Blindagem do Círculo Social',
      instruction: 'Converse com alguém que apoia genuinamente seus sonhos ou ouça um podcast/conteúdo que eleve sua visão de futuro.',
      reflection_prompt: 'Com quem você precisa passar mais tempo para se tornar quem deseja ser?',
      estimated_time: '20 min',
    },
    {
      week: 3,
      day_num: 20,
      title: 'Consolidação de Hábitos',
      instruction: 'Escreva uma rotina simples e sustentável de 3 hábitos-chave que você levará adiante mesmo após o término dos 21 dias.',
      reflection_prompt: 'Como manter esses hábitos simples para que nunca se tornem um peso?',
      estimated_time: '20 min',
    },
    {
      week: 3,
      day_num: 21,
      title: 'Consagração e Próximos Passos',
      instruction: 'Parabéns por completar os 21 dias! Escreva uma carta curta de agradecimento para a versão de você mesma que iniciou este diagnóstico.',
      reflection_prompt: 'Qual é a maior transformação que você experimentou em si mesma nestes 21 dias?',
      estimated_time: '25 min',
    },
  ];

  return baseTasks.map((task, idx) => ({
    id: `plan-day-${task.day_num}`,
    profile_id: primaryProfile.id,
    dimension_id: topDimension ? topDimension.dimension_id : null,
    week: task.week,
    day_num: task.day_num,
    title: task.title,
    description: task.instruction,
    estimated_time: task.estimated_time,
    instruction: task.instruction,
    reflection_prompt: task.reflection_prompt,
    order_num: idx + 1,
    active: true,
  }));
}
