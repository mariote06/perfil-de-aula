# Perfil de Aula / Aula ao Vivo

© 2026 Mário Teixeira. Todos os direitos reservados. Repositório privado.

## Como funciona a publicação

- O código legível vive **só neste repositório (privado)**.
- Sempre que alteras um ficheiro no ramo `main`, o GitHub corre a ação **"Publicar no Firebase Hosting"**:
  1. instala a ferramenta de ofuscação;
  2. cria a pasta `dist/` com o JavaScript das páginas ofuscado (`build/build.mjs`);
  3. publica `dist/` em **https://perfil-de-aula.web.app**.
- Vês o resultado em **Actions** no GitHub (círculo verde = publicado).

Endereços:
- Professores: https://perfil-de-aula.web.app/perfil-de-aula.html
- Alunos: https://perfil-de-aula.web.app/aula-ao-vivo.html (ou pelo QR code da projeção)

## Ficheiros

| Ficheiro | Para quê |
|---|---|
| `perfil-de-aula.html` | app do professor |
| `aula-ao-vivo.html` | app do aluno |
| `index.html` | página de entrada (encaminha para a app certa) |
| `sw.js`, `manifest.json`, `icon-*.png` | instalar a app dos alunos no telemóvel |
| `logo-sala.png`, `logo-parceiro.png` | (opcional) logótipos na projeção |
| `firebase.json`, `.firebaserc` | configuração do Firebase Hosting |
| `package.json`, `build/build.mjs` | ofuscação do código antes de publicar |
| `.github/workflows/publicar.yml` | publicação automática |

## Configuração única (já feita / a fazer)

1. **Chave da conta de serviço no GitHub** — segredo `FIREBASE_SERVICE_ACCOUNT` (Settings → Secrets and variables → Actions).
2. **App Check** — feito: chave reCAPTCHA Enterprise `6LdzDQUu…` nos dois HTML e app registada em Firebase → App Check. Falta "Impor" para Realtime Database e Authentication depois do site novo estar a funcionar.
3. **Repositório privado** — Settings → General → Danger Zone → Change visibility → Private (só depois de o site novo estar a funcionar).

## Firebase

- Projeto: `perfil-de-aula` (plano Spark, gratuito).
- Realtime Database (Bélgica) com regras por conta: professores aprovados, alunos só veem os seus treinos.
- Administrador: o nó `admins/{uid}` = true.
