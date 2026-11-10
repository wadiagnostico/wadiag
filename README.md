# 🗺️ WA Diagnóstico — Mapa dos Bloqueios

Aplicativo web completo, responsivo e profissional para diagnóstico de mentalidade, comportamento e prosperidade, baseado na metodologia da **Larissa Maykot**.

Desenvolvido com **React 18 + TypeScript + Vite + Tailwind CSS + Supabase (PostgreSQL) + jsPDF**.

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
- Node.js instalado (v18 ou superior recomendado).

### 2. Iniciar o Servidor de Desenvolvimento
No terminal, dentro da pasta do projeto (`WA Diagnóstico`):

```bash
npm run dev
```

O aplicativo estará rodando em:
👉 **http://localhost:5173**

---

## 🗄️ Conexão com o Supabase

O arquivo `.env` já está pré-configurado com as suas credenciais:

```env
VITE_SUPABASE_URL=https://pfzxtfttmpicpurvgsnf.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_cXYGVFB9STQaoiXM7lulpg_MwjMf6GU
```

### Como aplicar as tabelas no Supabase:
1. Acesse o painel do seu projeto no Supabase: https://supabase.com/dashboard/project/pfzxtfttmpicpurvgsnf
2. No menu lateral, clique em **SQL Editor**.
3. Abra o arquivo `supabase/migrations/001_schema.sql` deste projeto.
4. Copie todo o conteúdo e cole no SQL Editor do Supabase.
5. Clique em **Run** (Executar).
   - Isso criará todas as tabelas (`assessments`, `questions`, `dimensions`, `profiles`, `stage_audios`, `platform_settings`), índices, políticas de segurança RLS e já inserirá todas as **56 perguntas**, **7 dimensões**, **10 perfis** e faixas de pontuação!

> 💡 **Nota de Resiliência:** O sistema possui uma camada inteligente que funciona perfeitamente de forma local mesmo enquanto o banco estiver sendo configurado.

---

## 🔐 Área Administrativa (ADM)

- **URL de Acesso:** `http://localhost:5173/admin`
- **Senhas de Acesso Configuradas:**
  - `admin123`
  - `larissa2026`
  - Ou a própria chave secreta fornecida.

### Funcionalidades do Painel ADM:
1. **Painel Principal (Dashboard):** Métricas de total de avaliações, concluídas, taxa de término, tempo médio e tabela de avaliações recentes.
2. **Avaliações dos Participantes:** Pesquisa pelo nome, filtros, visualização das 56 respostas individuais de cada cliente e botão para baixar o PDF de qualquer participante.
3. **Gerenciamento de Áudios das Etapas:**
   - Upload de arquivos de áudio (.mp3, .m4a) ou inserção de links diretos.
   - Áudios de Boas-vindas e Como Responder.
   - Áudios de Apresentação das 7 Dimensões.
   - **Áudios de Transição / Conclusão de cada Etapa** (áudios para quando a cliente encerra aquela dimensão).
   - Áudio de Encerramento e Áudio de Leitura do Resultado.
   - Player de teste ao vivo dentro do painel.
4. **Perguntas e Etapas:** Criar, editar texto, reordenar ou excluir qualquer pergunta das 7 dimensões.
5. **Perfis e Regras:** Editar nomes, leituras acolhedoras, diretrizes centrais e recomendações práticas dos 10 perfis.
6. **Personalização Visual:** Alterar nome da plataforma, subtítulo, mensagem de acolhimento, logotipo e cores.

---

## 📄 Relatório em PDF Editorial

Ao concluir as 56 perguntas, o participante tem acesso a:
- Diagnóstico interativo com Perfil Predominante e Secundários.
- Gráficos de barras das 7 dimensões com faixas de pontuação (Poucos sinais, Sinais leves, Merece atenção, Bastante recorrente, Muito recorrente).
- Plano de Ação de 21 Dias interativo (Semana 1: Consciência, Semana 2: Ajuste, Semana 3: Consistência).
- **Download do Relatório em PDF:** Gera um documento A4 de múltiplas páginas, com capa elegante, nome do participante, data, gráficos, orientações e o plano diagramado.

---

## 🌐 Publicação na Netlify

Para publicar na Netlify:
1. Suba esta pasta para um repositório no seu GitHub.
2. No painel da Netlify, clique em **Add new site** > **Import an existing project** > Selecione o GitHub.
3. Configurações de Build:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Em **Environment variables**, adicione:
   - `VITE_SUPABASE_URL` = `https://pfzxtfttmpicpurvgsnf.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `sb_publishable_cXYGVFB9STQaoiXM7lulpg_MwjMf6GU`
5. Clique em **Deploy site**!

---

## 💳 Integração Kiwify / Hotmart (Webhook)

A estrutura de dados está preparada para receber confirmações de pagamento.
Para conectar com a Kiwify:
1. Na Kiwify, configure o Webhook para enviar para a URL da sua aplicação ou Edge Function do Supabase.
2. O webhook envia o nome e e-mail da compradora para liberar o acesso ao diagnóstico.
