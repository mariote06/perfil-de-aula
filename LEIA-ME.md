# Perfil de Aula — Aula ao Vivo (ligação por PIN)

## O que fazem os 5 ficheiros

- `perfil-de-aula.html` — a tua app de instrutor (construtor de blocos + modo de projeção). É esta que abres na sala.
- `aula-ao-vivo.html` — a app dos alunos. Abrem-na no telemóvel e instalam no ecrã principal.
- `manifest.json` e `sw.js` — tornam `aula-ao-vivo.html` instalável como app (PWA).
- `icon-192.png` / `icon-512.png` — ícones da app dos alunos.

Todos têm de ficar na **mesma pasta** no GitHub Pages, com esses nomes exatos — o botão "Projetar aula" gera o QR code a apontar para `aula-ao-vivo.html` ao lado dele.

## Passo 1 — Criar o Firebase (grátis, ~5 minutos)

1. Vai a [console.firebase.google.com](https://console.firebase.google.com) e cria um projeto novo (podes usar a tua conta Google).
2. No menu lateral, vai a **Build → Realtime Database** e clica em **Criar base de dados**. Escolhe a região mais próxima (ex: Europa).
3. Em **Regras**, começa em modo de teste (aberto) — para uma app pequena para os teus alunos isto é aceitável, mas se quiseres mais segurança, usa isto:
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
   (Isto limita a leitura/escrita ao nó `sessions`, que é tudo o que a app usa. Não há dados pessoais dos alunos guardados — só o treino e o estado do timer.)
4. Volta às **Definições do projeto** (ícone de engrenagem) → aba **Geral** → em "As tuas apps", clica no ícone `</>` para adicionar uma app Web. Dá-lhe um nome (ex: "Perfil de Aula") e regista.
5. O Firebase mostra-te um objeto `firebaseConfig` parecido com:
   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "o-teu-projeto.firebaseapp.com",
     databaseURL: "https://o-teu-projeto-default-rtdb.europe-west1.firebasedatabase.app",
     projectId: "o-teu-projeto",
     storageBucket: "o-teu-projeto.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```
   Copia este bloco inteiro.

## Passo 2 — Colar a configuração nos dois ficheiros

Abre `perfil-de-aula.html` num editor de texto, procura por `firebaseConfig` perto do fim do ficheiro, e substitui pelo bloco que copiaste.

Faz exatamente o mesmo em `aula-ao-vivo.html` (procura `firebaseConfig` lá também). **Tem de ser a mesma configuração nos dois ficheiros**, para falarem com a mesma base de dados.

## Passo 3 — Publicar no GitHub Pages

Envia os 5 ficheiros para o teu repositório do GitHub Pages, todos na mesma pasta. Depois de publicado:

- Tu abres `perfil-de-aula.html` no PC/tablet ligado ao projetor.
- Os alunos abrem `aula-ao-vivo.html` no telemóvel (link direto, ou fazem scan ao QR code que aparece no ecrã quando carregas em "Projetar aula").
- No iPhone: abrir no Safari → botão Partilhar → "Adicionar ao Ecrã Principal".
- No Android: abrir no Chrome → deve aparecer um aviso "Instalar app", ou usar o menu (⋮) → "Instalar app" / "Adicionar ao ecrã principal".

## Como funciona por dentro

Quando carregas em "Projetar aula", a app gera um PIN de 4 dígitos e grava o treino + o estado do timer no Firebase, em `sessions/{PIN}`. Não grava tick a tick — só quando dás play, pausa, avanças ou recuas um bloco — e cada telemóvel calcula o resto do countdown localmente a partir da hora em que o bloco começou. Isto mantém a app rápida e dentro do limite gratuito do Firebase mesmo com uma sala cheia. Quando saíres do modo de projeção, a sessão é apagada.

## Limites a saber

- O plano gratuito do Firebase (Spark) tem limite de 1 GB de dados transferidos por mês — para o tamanho de dados desta app (só texto, sem tick a tick), isso dá para muitas centenas de aulas por mês sem problema.
- Sem internet no local, o PIN não funciona — precisas de wifi ou dados móveis na sala.
