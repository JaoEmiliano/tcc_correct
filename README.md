# 📅 Sistema de Agendamento Sandra-Nails

Este é um sistema completo de agendamento de serviços, desenvolvido para permitir que clientes marquem seus próprios horários e que a administradora gerenciem a agenda em tempo real, incluindo a funcionalidade de inserção manual de clientes não cadastrados

---

## 🚀 Funcionalidades Principais

* **📱 Área do Cliente:**
    * Autenticação (Login e Cadastro).
    * Visualização de serviços disponíveis com preço e duração.
    * Seleção de data e horários livres (com bloqueio automático de horários passados e períodos de intervalo).
    * Escolha da forma de pagamento (PIX, Cartão, Dinheiro) e tela de confirmação.
    * Histórico em "Meus Agendamentos".

* **⚡ Painel Administrativo:**
    * Visualização dos agendamentos do dia selecionado.
    * Ações rápidas para **Concluir** ou **Cancelar** (com justificativa) agendamentos.
    * Gerenciamento completo dos dias e horários de funcionamento (janelas de atendimento e pausa para almoço/intervalo).
    * **Agendamento:** Fluxo inteligente onde o administrador pode iniciar um agendamento direto pelo painel, selecionar o serviço/horário e digitar o nome de um cliente avulso.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
* **React.js** (com TypeScript)
* **React Router Dom** (Gerenciamento de rotas e estados de navegação)
* **Axios** (Consumo da API do Backend)
* **CSS Variables** (Temas e tokens visuais padronizados)

### Backend (Recomendado/Utilizado)
* **Node.js** / **Express**
* **Database:** PostgreSQL / MySQL / SQLite (via Prisma ou Sequelize)
* **Autenticação:** JWT (JSON Web Tokens) e Criptografia com BCrypt

---