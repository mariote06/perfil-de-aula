# Perfil de Aula — Aula ao Vivo (versão 2: bikes ligadas, turma e corrida)

## O que fazem os ficheiros

- `perfil-de-aula.html` — app do instrutor: construtor de blocos, biblioteca de aulas, histórico e modo de projeção. É esta que abres no PC ligado ao projetor.
- `aula-ao-vivo.html` — app dos alunos. Abrem-na no telemóvel, ligam a Schwinn por Bluetooth e aparecem no ecrã da sala.
- `manifest.json` e `sw.js` — tornam `aula-ao-vivo.html` instalável como app (PWA).
- `icon-192.png` / `icon-512.png` — ícones da app dos alunos.

Todos têm de ficar na **mesma pasta** no GitHub Pages, com estes nomes exatos.

## O que há de novo

**No ecrã da sala (instrutor)**
- Perfil da aula grande no topo, com a parte já feita destacada e o marcador a avançar.
- Três vistas, com botões em baixo à esquerda ou teclas **1 / 2 / 3**:
  - **Aula**: só o bloco e o cronómetro, como antes.
  - **Turma**: cartão de cada aluno com watts, %FTP, RPM e FC. A cor do cartão é a zona onde o aluno está; o contorno acende quando está na zona pedida.
  - **Corrida**: barras de classificação ao vivo, ao estilo do RACETRACK da MOWL.
- A vista muda sozinha para **Turma** quando o primeiro aluno liga a bike.
- **Ranking: Pontos / kJ** (tecla **M**):
  - **Pontos** é justo para todos os níveis: conta o esforço relativo ao FTP de cada um (1 ponto por segundo a 100% FTP).
  - **kJ** é energia absoluta, por isso favorece quem tem mais potência.
- Bip nos últimos 3 segundos de cada bloco (🔔 para ligar/desligar).
- No fim da aula aparece um pódio e uma tabela por aluno: pontos, kJ, watts médios e máximos, %FTP médio e % do tempo na zona. Pode exportar-se em CSV (abre no Excel).
- O QR code aparece ao abrir a projeção e esconde-se quando carregas em play. Para o voltares a mostrar, toca no PIN ou carrega na tecla **Q**.
- O ecrã do projetor não adormece durante a aula.

**Na biblioteca**
- Procurar, duplicar, exportar (.json) e importar aulas. Também há "Guardar como cópia".
- Serve para fazer cópia de segurança das aulas ou passá-las aos outros instrutores (Penafiel ↔ Lousada).
- **Histórico de aulas dadas**: cada aula com alunos ligados fica guardada com o resumo, e podes reabri-la ou exportar o CSV.

**No telemóvel do aluno**
1. PIN (ou scan ao QR code).
2. Nome, FTP e **Ligar bike**: aparece a lista de bikes por Bluetooth, e o aluno escolhe a da sua bike. Pode ligar também uma cinta de FC (opcional).
3. Na aula vê:
   - os watts e o %FTP;
   - uma barra com a zona alvo e a indicação "↑ Mais carga / ✓ Na zona / ↓ Alivia";
   - o alvo em watts calculado com o seu FTP;
   - a cadência comparada com a pedida;
   - os kJ, os pontos e a sua posição no ranking.
4. No fim tem o seu resumo pessoal.

Se recarregar a página a meio da aula, continua de onde estava.

## Antes da primeira aula: testar numa Z Bike

1. Na consola Zone, confirma que o Bluetooth está ativo. A consola tem de estar a emitir; normalmente basta pedalar para a acordar.
2. Num Android, abre `aula-ao-vivo.html` no Chrome e carrega em **Ligar bike**.
3. Na lista que aparece, a bike costuma surgir com um nome do tipo "Schwinn…", "4iiii…" ou com o número da bike. Se houver várias bikes ligadas na sala, confirma qual é pelo número.
4. A app lê primeiro o serviço de potência padrão (Cycling Power). Se a consola só enviar FTMS, a app usa esse.

Se a bike não aparecer na lista, ou ligar mas mostrar sempre 0 W, diz-me o que aparece e eu ajusto.

**Importante: cada bike só aceita uma ligação Bluetooth de cada vez.** Se alguém tiver a bike ligada ao Zwift/Peloton, desliga primeiro.

## iPhone

O Safari do iPhone **não permite Bluetooth em páginas web**. Quem tem iPhone deve:
1. Instalar a app gratuita **Bluefy – Web BLE Browser** (App Store).
2. Abrir o link da aula dentro da Bluefy (copiar e colar o link, ou escrever o PIN).

Sem a Bluefy, o aluno com iPhone pode entrar na aula na mesma, mas fica só a acompanhar (vê o bloco e o cronómetro, sem dados da bike).

Todos podem experimentar em casa com o botão **"Experimentar sem bike (modo teste)"**, que gera valores simulados.

## Passo 1 — Criar o Firebase (grátis, ~5 minutos)

1. Vai a [console.firebase.google.com](https://console.firebase.google.com) e cria um projeto novo.
2. **Build → Realtime Database → Criar base de dados**. Escolhe a região Europa.
3. Em **Regras**, cola isto:
   ```json
   {
     "rules": {
       "sessions": {
         ".read": true,
         ".write": true
       }
     }
   }
   ```
   A app só usa o nó `sessions`. Durante a aula fica lá a aula, o estado do timer e, por aluno, o nome que escolheu, o FTP e os dados de pedalada. Tudo isto é apagado quando sais da projeção; o resumo fica só guardado no teu PC (histórico).
4. **Definições do projeto** (engrenagem) → **Geral** → "As tuas apps" → ícone `</>`. Regista uma app Web e copia o bloco `firebaseConfig`.

## Passo 2 — Colar a configuração nos dois ficheiros

Em `perfil-de-aula.html` **e** em `aula-ao-vivo.html`, procura `firebaseConfig` e substitui os `"COLA_AQUI"` pelo bloco que copiaste. Tem de ser a mesma configuração nos dois.

## Passo 3 — Publicar no GitHub Pages

Envia os ficheiros todos para a mesma pasta do repositório. Os alunos que já tinham a app instalada recebem a versão nova automaticamente.

## Como funciona por dentro

- **Timer:** o instrutor só grava o estado quando há play, pausa, avanço ou recuo. Cada telemóvel calcula o countdown sozinho, sincronizado com a hora do servidor Firebase.
- **Dados dos alunos:** cada telemóvel envia os seus dados a cada 2 segundos para `sessions/{PIN}/riders/{id}`. O ecrã da sala lê-os e atualiza 1× por segundo.
- **Ranking:** de 4 em 4 segundos o instrutor envia a cada aluno a sua posição.
- **Aluno sem sinal:** se um telemóvel deixar de enviar durante 15 s, o cartão desse aluno fica cinzento.

## Limites a saber

- **Firebase gratuito:** 1 GB de transferência por mês. Uma aula de 45 min com 20 bikes gasta perto de 5–8 MB, o que dá mais de 100 aulas por mês.
- **Telemóvel durante a aula:** deve ficar com a app aberta e o ecrã ligado. A app pede ao telemóvel para não adormecer, mas se o aluno bloquear o ecrã, o Bluetooth pode parar.
- **Internet:** é preciso wifi ou dados móveis na sala.
