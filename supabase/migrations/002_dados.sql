-- ============================================================
-- PARTE 2: DADOS INICIAIS (CONFIG, DIMENSÕES, PERGUNTAS, PERFIS)
-- ============================================================

-- 1. Configuração da Plataforma
INSERT INTO platform_settings (platform_name, subtitle, welcome_message)
VALUES (
  'Mapa dos Bloqueios',
  'Diagnóstico de mentalidade, comportamento e prosperidade',
  'Descubra quais padrões de pensamento, comportamento e escolhas podem estar impedindo você de construir a vida que deseja.'
);

-- 2. Faixas de Pontuação
INSERT INTO score_ranges (min_score, max_score, label, description, color, order_num) VALUES
(0, 24, 'Poucos sinais', 'Poucos sinais identificados nas respostas.', '#4CAF50', 1),
(25, 49, 'Sinais leves', 'Sinais leves ou ocasionais.', '#8BC34A', 2),
(50, 69, 'Merece atenção', 'Padrão presente e que merece atenção.', '#FFC107', 3),
(70, 84, 'Bastante recorrente', 'Padrão bastante recorrente.', '#FF9800', 4),
(85, 100, 'Muito recorrente', 'Padrão muito recorrente nas respostas.', '#F44336', 5);

-- 3. As 7 Dimensões
INSERT INTO dimensions (name, description, order_num) VALUES
('Crenças e programação mental', 'Pensamentos repetidos e crenças que influenciam escolhas.', 1),
('Merecimento e relação com a prosperidade', 'Relação com receber, cobrar, aceitar oportunidades e prosperidade.', 2),
('Clareza e direcionamento', 'Prioridades, objetivos e direção.', 3),
('Ação e consistência', 'Execução, continuidade e hábitos.', 4),
('Procrastinação e autossabotagem', 'Adiamentos, justificativas e interrupções.', 5),
('Emocional e manifestação', 'Emoções, expectativas e relação entre intenção e ação.', 6),
('Ambiente e relacionamentos', 'Influências, apoio, limites e ambiente.', 7);

-- 4. As 56 Perguntas
-- Dimensão 1
INSERT INTO questions (dimension_id, text, order_num) VALUES
((SELECT id FROM dimensions WHERE order_num = 1), 'Costumo pensar que não sou capaz de conquistar algo maior do que tenho hoje.', 1),
((SELECT id FROM dimensions WHERE order_num = 1), 'Quando surge uma oportunidade, minha primeira reação costuma ser imaginar por que pode não dar certo.', 2),
((SELECT id FROM dimensions WHERE order_num = 1), 'Tenho dificuldade de acreditar que posso mudar minha realidade de forma consistente.', 3),
((SELECT id FROM dimensions WHERE order_num = 1), 'Repito pensamentos negativos sobre mim, mesmo quando existem evidências de que sou capaz.', 4),
((SELECT id FROM dimensions WHERE order_num = 1), 'Costumo associar sucesso a algo distante ou reservado para outras pessoas.', 5),
((SELECT id FROM dimensions WHERE order_num = 1), 'Tenho medo de tentar algo novo e confirmar uma crença negativa sobre mim.', 6),
((SELECT id FROM dimensions WHERE order_num = 1), 'Percebo que minhas decisões são influenciadas por ideias que aprendi no passado e nunca questionei.', 7),
((SELECT id FROM dimensions WHERE order_num = 1), 'Quando penso em crescer, aparecem pensamentos que diminuem minhas possibilidades.', 8);

-- Dimensão 2
INSERT INTO questions (dimension_id, text, order_num) VALUES
((SELECT id FROM dimensions WHERE order_num = 2), 'Sinto desconforto quando preciso cobrar um valor justo pelo meu trabalho.', 1),
((SELECT id FROM dimensions WHERE order_num = 2), 'Tenho dificuldade de receber elogios, dinheiro ou ajuda sem sentir que preciso compensar de alguma forma.', 2),
((SELECT id FROM dimensions WHERE order_num = 2), 'Às vezes sinto que ainda não mereço viver a realidade que desejo.', 3),
((SELECT id FROM dimensions WHERE order_num = 2), 'Quando algo bom acontece, espero que logo apareça um problema para equilibrar a situação.', 4),
((SELECT id FROM dimensions WHERE order_num = 2), 'Tenho receio de desejar mais por medo de parecer ambiciosa ou ingrata.', 5),
((SELECT id FROM dimensions WHERE order_num = 2), 'Costumo diminuir minhas conquistas ou achar que foi apenas sorte.', 6),
((SELECT id FROM dimensions WHERE order_num = 2), 'Tenho dificuldade de me permitir investir em mim ou priorizar meus objetivos.', 7),
((SELECT id FROM dimensions WHERE order_num = 2), 'Quando penso em prosperar, sinto culpa, medo ou desconforto.', 8);

-- Dimensão 3
INSERT INTO questions (dimension_id, text, order_num) VALUES
((SELECT id FROM dimensions WHERE order_num = 3), 'Tenho dificuldade de definir com clareza o que quero construir nos próximos meses.', 1),
((SELECT id FROM dimensions WHERE order_num = 3), 'Mudo de objetivo com frequência antes de dar tempo para uma estratégia amadurecer.', 2),
((SELECT id FROM dimensions WHERE order_num = 3), 'Começo o dia sem saber quais são as prioridades que realmente importam.', 3),
((SELECT id FROM dimensions WHERE order_num = 3), 'Tenho muitas ideias, mas dificuldade de escolher uma direção e sustentá-la.', 4),
((SELECT id FROM dimensions WHERE order_num = 3), 'Costumo confundir estar ocupada com estar avançando.', 5),
((SELECT id FROM dimensions WHERE order_num = 3), 'Adio decisões importantes por não ter certeza de qual caminho escolher.', 6),
((SELECT id FROM dimensions WHERE order_num = 3), 'Meus objetivos ficam mais no campo da vontade do que em um plano concreto.', 7),
((SELECT id FROM dimensions WHERE order_num = 3), 'Tenho dificuldade de perceber quais ações aproximam meus resultados do que desejo.', 8);

-- Dimensão 4
INSERT INTO questions (dimension_id, text, order_num) VALUES
((SELECT id FROM dimensions WHERE order_num = 4), 'Começo projetos com entusiasmo, mas tenho dificuldade de manter o ritmo.', 1),
((SELECT id FROM dimensions WHERE order_num = 4), 'Espero sentir motivação para fazer tarefas que já sei que são importantes.', 2),
((SELECT id FROM dimensions WHERE order_num = 4), 'Tenho dificuldade de manter hábitos mesmo quando reconheço que fazem bem para mim.', 3),
((SELECT id FROM dimensions WHERE order_num = 4), 'Deixo de executar ações importantes quando os resultados demoram a aparecer.', 4),
((SELECT id FROM dimensions WHERE order_num = 4), 'Costumo abandonar uma estratégia antes de avaliar se dei tempo suficiente para ela funcionar.', 5),
((SELECT id FROM dimensions WHERE order_num = 4), 'Tenho dificuldade de transformar planos em pequenas ações realizadas com frequência.', 6),
((SELECT id FROM dimensions WHERE order_num = 4), 'Quando minha rotina muda, perco a consistência com facilidade.', 7),
((SELECT id FROM dimensions WHERE order_num = 4), 'Se não consigo fazer tudo como planejei, acabo fazendo menos do que poderia.', 8);

-- Dimensão 5
INSERT INTO questions (dimension_id, text, order_num) VALUES
((SELECT id FROM dimensions WHERE order_num = 5), 'Adio tarefas importantes mesmo sabendo que isso pode me prejudicar.', 1),
((SELECT id FROM dimensions WHERE order_num = 5), 'Encontro justificativas para não começar algo que desejo muito.', 2),
((SELECT id FROM dimensions WHERE order_num = 5), 'Quando estou perto de avançar, acabo criando outras prioridades ou distrações.', 3),
((SELECT id FROM dimensions WHERE order_num = 5), 'Espero o momento ideal para começar, mesmo sabendo que ele talvez não exista.', 4),
((SELECT id FROM dimensions WHERE order_num = 5), 'Deixo decisões importantes para depois por medo de errar.', 5),
((SELECT id FROM dimensions WHERE order_num = 5), 'Tenho dificuldade de concluir o que começo.', 6),
((SELECT id FROM dimensions WHERE order_num = 5), 'Às vezes faço escolhas que aliviam o desconforto imediato, mas me afastam dos meus objetivos.', 7),
((SELECT id FROM dimensions WHERE order_num = 5), 'Percebo que repito comportamentos que já identifiquei como pouco úteis.', 8);

-- Dimensão 6
INSERT INTO questions (dimension_id, text, order_num) VALUES
((SELECT id FROM dimensions WHERE order_num = 6), 'Minha confiança muda muito de acordo com o que acontece ao meu redor.', 1),
((SELECT id FROM dimensions WHERE order_num = 6), 'Quando algo não sai como espero, tenho dificuldade de recuperar o foco.', 2),
((SELECT id FROM dimensions WHERE order_num = 6), 'Fico tão preocupada com o resultado que tenho dificuldade de aproveitar o processo.', 3),
((SELECT id FROM dimensions WHERE order_num = 6), 'Tenho dificuldade de sustentar pensamentos construtivos quando enfrento incertezas.', 4),
((SELECT id FROM dimensions WHERE order_num = 6), 'Costumo interpretar obstáculos como sinais de que não devo continuar.', 5),
((SELECT id FROM dimensions WHERE order_num = 6), 'Tenho dificuldade de reconhecer emoções sem deixar que elas decidam todas as minhas ações.', 6),
((SELECT id FROM dimensions WHERE order_num = 6), 'Às vezes espero que as coisas mudem sem ajustar atitudes práticas.', 7),
((SELECT id FROM dimensions WHERE order_num = 6), 'Tenho dificuldade de conciliar esperança, confiança e ação concreta.', 8);

-- Dimensão 7
INSERT INTO questions (dimension_id, text, order_num) VALUES
((SELECT id FROM dimensions WHERE order_num = 7), 'Convivo com pessoas que frequentemente desestimulam meus planos.', 1),
((SELECT id FROM dimensions WHERE order_num = 7), 'Tenho dificuldade de estabelecer limites para proteger meu tempo e energia.', 2),
((SELECT id FROM dimensions WHERE order_num = 7), 'Permito que opiniões externas influenciem decisões que são importantes para mim.', 3),
((SELECT id FROM dimensions WHERE order_num = 7), 'Meu ambiente físico ou digital costuma favorecer distrações e falta de foco.', 4),
((SELECT id FROM dimensions WHERE order_num = 7), 'Tenho dificuldade de pedir apoio quando preciso.', 5),
((SELECT id FROM dimensions WHERE order_num = 7), 'Assumo responsabilidades demais e deixo pouco espaço para meus próprios objetivos.', 6),
((SELECT id FROM dimensions WHERE order_num = 7), 'Comparo meu caminho com o de pessoas que vivem realidades diferentes da minha.', 7),
((SELECT id FROM dimensions WHERE order_num = 7), 'Percebo que alguns hábitos ou relações reforçam comportamentos que desejo mudar.', 8);

-- 5. Os 10 Perfis
INSERT INTO profiles (name, description, phrase, guidance, recommendations, priority_dimensions, combination_rules, order_num) VALUES
('A Sonhadora', 
 'Tem desejos e visualiza possibilidades, mas pode encontrar dificuldade em transformar intenção em ações concretas.',
 'Suas respostas sugerem que você tem muitos desejos e visualiza possibilidades, mas pode encontrar dificuldade em transformar essas intenções em ações concretas.',
 'Considere definir um único objetivo prioritário para as próximas semanas e criar pequenos passos diários.',
 'Comece pequeno. Escolha uma ação que pode fazer hoje e faça.',
 '["Clareza e direcionamento", "Ação e consistência"]',
 '{"primary_dimensions": [3, 4], "min_score": 50}',
 1),

('A Perfeccionista',
 'Pode esperar segurança, preparo ou condições ideais antes de se permitir começar ou avançar.',
 'Suas respostas sugerem que você pode estar esperando condições ideais para agir, buscando segurança antes de se permitir avançar.',
 'Considere que a ação imperfeita é melhor que a espera perfeita. Permita-se começar antes de se sentir 100% pronta.',
 'Defina o bom o suficiente para cada tarefa.',
 '["Procrastinação e autossabotagem", "Ação e consistência"]',
 '{"primary_dimensions": [5, 4], "min_score": 50}',
 2),

('A Autocobradora',
 'Pode exigir muito de si, minimizar conquistas e sentir que nunca fez o suficiente.',
 'Suas respostas sugerem que você pode ser muito exigente consigo mesma, minimizando suas conquistas.',
 'Pratique reconhecer o que já realizou antes de listar o que falta. Celebre cada passo dado.',
 'Faça uma lista semanal de conquistas, por menores que sejam.',
 '["Crenças e programação mental", "Emocional e manifestação"]',
 '{"primary_dimensions": [1, 6], "min_score": 50}',
 3),

('A Merecedora em Construção',
 'Pode sentir conflito ao receber, cobrar, ocupar espaços ou reconhecer o próprio valor.',
 'Suas respostas sugerem que você pode sentir conflito ao receber, cobrar ou ocupar espaços.',
 'Considere que merecimento não é algo a ser conquistado: é um ponto de partida.',
 'Observe quando surgir o pensamento de não merecimento e questione se ele é verdadeiro.',
 '["Merecimento e relação com a prosperidade", "Crenças e programação mental"]',
 '{"primary_dimensions": [2, 1], "min_score": 50}',
 4),

('A Executora sem Direção',
 'Pode fazer muitas coisas ao mesmo tempo, mas dispersar energia por falta de prioridade clara.',
 'Suas respostas sugerem que você é uma pessoa que age, mas pode estar dispersando energia.',
 'Antes de fazer mais, defina o que importa mais. Uma prioridade clara vale mais que dez tarefas.',
 'Toda manhã, escolha 3 prioridades essenciais.',
 '["Clareza e direcionamento", "Procrastinação e autossabotagem"]',
 '{"primary_dimensions": [3, 5], "min_score": 50}',
 5),

('A Desconfiada do Processo',
 'Pode perder confiança quando os resultados demoram ou quando precisa lidar com incerteza.',
 'Suas respostas sugerem que você pode perder a confiança quando os resultados demoram a aparecer.',
 'Lembre-se de que resultados consistentes levam tempo. Confie no processo.',
 'Registre seus avanços semanalmente, mesmo os pequenos.',
 '["Emocional e manifestação", "Ação e consistência"]',
 '{"primary_dimensions": [6, 4], "min_score": 50}',
 6),

('A Comparadora',
 'Pode medir seu progresso pela trajetória de outras pessoas e desconsiderar o próprio contexto.',
 'Suas respostas sugerem que você pode estar medindo seu progresso pela trajetória de outras pessoas.',
 'Cada pessoa tem seu tempo, seus recursos e suas circunstâncias. Compare-se apenas consigo mesma.',
 'Limite o tempo em redes sociais e pratique gratidão pelo que já construiu.',
 '["Ambiente e relacionamentos", "Crenças e programação mental"]',
 '{"primary_dimensions": [7, 1], "min_score": 50}',
 7),

('A Reiniciadora',
 'Pode começar com intensidade, mas ter dificuldade de sustentar hábitos e projetos.',
 'Suas respostas sugerem que você costuma começar com muita intensidade, mas tem dificuldade de sustentar.',
 'Comece com menos intensidade e mais consistência. Sustentabilidade vale mais que pressa.',
 'Reduza pela metade o que planejou fazer e mantenha por 21 dias.',
 '["Ação e consistência", "Procrastinação e autossabotagem"]',
 '{"primary_dimensions": [4, 5], "min_score": 50}',
 8),

('A Sobrecarregada',
 'Pode assumir responsabilidades demais e deixar pouco espaço para seus objetivos e necessidades.',
 'Suas respostas sugerem que você pode estar assumindo responsabilidades demais dos outros.',
 'Cuidar de si não é egoísmo. Estabeleça limites e proteja tempo para você.',
 'Pratique dizer não ou agora não pelo menos uma vez por semana.',
 '["Ambiente e relacionamentos", "Emocional e manifestação"]',
 '{"primary_dimensions": [7, 6], "min_score": 50}',
 9),

('A Construtora em Potencial',
 'Pode apresentar recursos e atitudes consistentes, com pontos específicos que ainda merecem atenção.',
 'Suas respostas refletem equilíbrio e maturidade, com uma base sólida pronta para alavancar.',
 'Você já tem uma base sólida. Foque nos pontos de atenção identificados para potencializar.',
 'Identifique as dimensões com maior pontuação e aplique o plano de 21 dias com foco laser.',
 '[]',
 '{"defaultProfile": true}',
 10);

-- 6. Áudios das Etapas
INSERT INTO stage_audios (stage_key, stage_label, description, order_num) VALUES
('welcome', 'Boas-vindas', 'Explicar propósito, desacelerar e incentivar sinceridade.', 1),
('instructions', 'Como responder', 'Explicar escala, autorrelato, ausência de resposta certa.', 2);

INSERT INTO stage_audios (stage_key, stage_label, dimension_id, description, order_num) VALUES
('dim-1-intro', 'Dimensão 1 - Introdução', (SELECT id FROM dimensions WHERE order_num = 1), 'Introduzir pensamentos repetidos e crenças.', 3),
('dim-1-transition', 'Dimensão 1 - Conclusão da Etapa', (SELECT id FROM dimensions WHERE order_num = 1), 'Mensagem de transição informando que a Dimensão 1 terminou.', 4),
('dim-2-intro', 'Dimensão 2 - Introdução', (SELECT id FROM dimensions WHERE order_num = 2), 'Refletir sobre receber, cobrar e prosperidade.', 5),
('dim-2-transition', 'Dimensão 2 - Conclusão da Etapa', (SELECT id FROM dimensions WHERE order_num = 2), 'Mensagem de transição informando que a Dimensão 2 terminou.', 6),
('dim-3-intro', 'Dimensão 3 - Introdução', (SELECT id FROM dimensions WHERE order_num = 3), 'Explorar prioridades, objetivos e direção.', 7),
('dim-3-transition', 'Dimensão 3 - Conclusão da Etapa', (SELECT id FROM dimensions WHERE order_num = 3), 'Mensagem de transição informando que a Dimensão 3 terminou.', 8),
('dim-4-intro', 'Dimensão 4 - Introdução', (SELECT id FROM dimensions WHERE order_num = 4), 'Observar execução, continuidade e hábitos.', 9),
('dim-4-transition', 'Dimensão 4 - Conclusão da Etapa', (SELECT id FROM dimensions WHERE order_num = 4), 'Mensagem de transição informando que a Dimensão 4 terminou.', 10),
('dim-5-intro', 'Dimensão 5 - Introdução', (SELECT id FROM dimensions WHERE order_num = 5), 'Observar adiamentos, justificativas e interrupções.', 11),
('dim-5-transition', 'Dimensão 5 - Conclusão da Etapa', (SELECT id FROM dimensions WHERE order_num = 5), 'Mensagem de transição informando que a Dimensão 5 terminou.', 12),
('dim-6-intro', 'Dimensão 6 - Introdução', (SELECT id FROM dimensions WHERE order_num = 6), 'Explorar emoções, expectativas e intenção.', 13),
('dim-6-transition', 'Dimensão 6 - Conclusão da Etapa', (SELECT id FROM dimensions WHERE order_num = 6), 'Mensagem de transição informando que a Dimensão 6 terminou.', 14),
('dim-7-intro', 'Dimensão 7 - Introdução', (SELECT id FROM dimensions WHERE order_num = 7), 'Refletir sobre influências, apoio e limites.', 15),
('dim-7-transition', 'Dimensão 7 - Conclusão da Etapa', (SELECT id FROM dimensions WHERE order_num = 7), 'Mensagem de transição informando que todas as 7 etapas foram concluídas.', 16),
('closing', 'Encerramento', NULL, 'Agradecer e lembrar que resultado é ponto de partida.', 17),
('results', 'Leitura do resultado', NULL, 'Explicar como interpretar pontuações e perfis.', 18);
