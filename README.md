# Documentação do Projeto Aurora Ateliê

## Visão Geral
O **Aurora Ateliê** é uma aplicação web completa para uma loja de joias artesanais. O sistema é composto por uma vitrine virtual para clientes e um painel administrativo para gerenciamento do catálogo de produtos. A arquitetura utiliza tecnologias modernas e serverless para garantir escalabilidade e baixo custo.

## Estrutura do Projeto

### Backend (`/AuroraAtelieWeb/backend`)
O backend é construído sobre a plataforma **Cloudflare Workers**, oferecendo uma API RESTful rápida e segura.

*   **Tecnologias:** Cloudflare Workers, D1 (Banco de Dados SQLite), R2 (Armazenamento de Imagens).
*   **Autenticação:** Integração com Google OAuth 2.0 para proteger rotas administrativas. Apenas emails autorizados podem realizar alterações.
*   **Banco de Dados:** O esquema (`schema.sql`) define a tabela `products` com campos para nome, descrição, preço, categoria e URL da imagem.

### Frontend (`/AuroraAtelieWeb/frontend`)
O frontend é desenvolvido com HTML5, CSS3 e JavaScript puro (Vanilla JS), garantindo leveza e compatibilidade.

*   **Vitrine (`index.html`):** Página principal onde os clientes visualizam os produtos.
*   **Painel Admin (`admin.html`):** Área restrita para gerenciamento de produtos (CRUD).
*   **Estilização:** CSS customizado em `css/style.css`.

---

## Funcionalidades e Funções

### 1. Backend (`src/index.js`)

O arquivo principal do Worker gerencia as requisições HTTP.

*   **`fetch(request, env, ctx)`**: Função principal de entrada. Gerencia o roteamento, CORS e despacha as requisições para a lógica apropriada.
*   **`verifyAuth(request)`**: Middleware de segurança. Verifica se o token Bearer no cabeçalho `Authorization` é um token válido do Google e se o email pertence à lista de administradores permitidos (`ALLOWED_EMAILS`).
*   **`jsonResponse(data, status)`**: Utilitário para padronizar as respostas da API em formato JSON.

**Endpoints da API:**
*   `GET /images/:key`: Serve imagens armazenadas no bucket R2 com cache otimizado.
*   `POST /api/upload`: Realiza o upload de imagens para o R2 (Requer Auth).
*   `GET /api/products`: Retorna a lista de todos os produtos.
*   `POST /api/products`: Cria um novo produto no banco D1 (Requer Auth).
*   `PUT /api/products/:id`: Atualiza um produto existente (Requer Auth).
*   `DELETE /api/products/:id`: Remove um produto do banco (Requer Auth).
*   `GET /auth/check`: Verifica se o token atual é válido.

### 2. Frontend - Cliente (`js/script.js`)

Responsável pela interatividade da loja virtual.

*   **`loadProducts(category)`**: Busca os produtos na API. Aceita um parâmetro opcional de categoria para filtragem no cliente.
*   **`displayProducts(products)`**: Recebe a lista de produtos e gera o HTML dos cards dinamicamente, inserindo-os no DOM. Trata casos de lista vazia ou imagens ausentes.
*   **`setupFilters()`**: Adiciona ouvintes de evento aos botões de categoria (Brincos, Colares, Conjuntos) para filtrar a exibição sem recarregar a página.
*   **`setupNewsletter()`**: Gerencia o formulário de inscrição na newsletter (atualmente exibe um alerta de confirmação).

### 3. Frontend - Admin (`js/admin.js`)

Gerencia a lógica do painel administrativo.

*   **`handleCredentialResponse(response)`**: Callback do Login Google. Envia o token para o backend validar e, se sucesso, salva no `localStorage`.
*   **`checkAuth()`**: Verifica se existe um token salvo e alterna a interface entre tela de login e painel de controle.
*   **`loadAdminProducts()`**: Busca produtos e preenche a tabela de gerenciamento com botões de editar e excluir.
*   **`setupForm()`**: Configura o formulário de produtos para lidar com criação e edição. Gerencia o upload de imagem (se houver) e envia os dados para a API correta (`POST` ou `PUT`).
*   **`deleteProduct(id)`**: Envia uma requisição `DELETE` para remover um produto após confirmação.
*   **`editProduct(id)`**: Preenche o formulário com os dados do produto selecionado para edição.

## Resumo

O projeto **Aurora Ateliê** é uma solução full-stack eficiente. O **Frontend** consome uma API para exibir produtos de forma dinâmica e permite que administradores gerenciem o conteúdo através de uma interface segura. O **Backend** no Cloudflare Workers orquestra o acesso aos dados (D1) e arquivos (R2), garantindo que apenas usuários autenticados via Google possam modificar o catálogo, enquanto o acesso público é otimizado para leitura e performance.
