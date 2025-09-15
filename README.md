# API Encurtador de URLs

Uma API RESTful para encurtamento de URLs construída com Node.js, Express e PostgreSQL. Oferece autenticação JWT, tracking de cliques e operações CRUD para URLs encurtadas.

## 📋 Funcionalidades

- ✅ Encurtamento de URLs (até 6 caracteres)
- ✅ Autenticação de usuários com JWT
- ✅ Listagem de URLs encurtadas por usuário via API
- ✅ Contagem de cliques em tempo real
- ✅ Soft delete de URLs
- ✅ API documentada com Swagger
- ✅ Validação de entrada robusta
- ✅ Variáveis de ambiente configuráveis
- ✅ Testes unitários e de integração com Jest

## 🚀 Como executar

### Pré-requisitos

- Node.js 18 ou superior
- PostgreSQL 13 ou superior (para execução local)
- npm ou yarn
- Docker e Docker Compose (opcional, para execução em containers)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/iannavarro01/api-url-shortener.git
cd api-url-shortener
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas configurações.

4. Inicie o servidor:
```bash
npm run dev
```

### Variáveis de Ambiente

| Variável     | Descrição                     | Valor Padrão            |
|--------------|-------------------------------|-------------------------|
| NODE_ENV     | Ambiente de execução          | development            |
| PORT         | Porta da aplicação            | 3000                   |
| DB_HOST      | Host do PostgreSQL            | localhost              |
| DB_PORT      | Porta do PostgreSQL           | 5432                   |
| DB_NAME      | Nome do banco de dados        | url_shortener          |
| DB_USER      | Usuário do PostgreSQL         | postgres               |
| DB_PASS      | Senha do PostgreSQL           | -                      |
| JWT_SECRET   | Secret para JWT              | -                      |
| BASE_URL     | URL base para encurtamento    | http://localhost:3000  |

**Nota**: O `JWT_SECRET` deve ser uma string aleatória e segura (mínimo de 32 caracteres). Nunca a exponha no repositório.

## 📊 Estrutura do Banco de Dados

O projeto utiliza as seguintes tabelas:

- **users**: Armazena informações dos usuários
- **shortened_urls**: Armazena as URLs encurtadas
- **url_accesses**: Registra cada acesso às URLs encurtadas

As tabelas são criadas automaticamente quando a aplicação inicia em ambiente de desenvolvimento.

## 📡 Endpoints da API

### Autenticação
- **POST /api/auth/register** - Registrar novo usuário
- **POST /api/auth/login** - Autenticar usuário

### URLs
- **POST /api/urls/shorten** - Encurtar URL (público ou autenticado)
- **GET /:short_code** - Redirecionar para URL original
- **GET /api/urls** - Listar URLs do usuário (autenticado)
- **PUT /api/urls/:id** - Atualizar URL (autenticado)
- **DELETE /api/urls/:id** - Excluir URL (autenticado)

### Sistema
- **GET /api/health** - Health check da API
- **GET /api-docs** - Documentação interativa Swagger

## 📚 Documentação da API

Acesse `http://localhost:3000/api-docs` para visualizar a documentação interativa gerada pelo Swagger.

## 🧪 Testes

Execute os testes unitários com:
```bash
npm test
```

Para testes com cobertura:
```bash
npm run test:coverage
```

## 🐳 Execução com Docker

Para executar o projeto com Docker:

1. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```
Edite o arquivo .env com suas configurações (por exemplo, POSTGRES_PASSWORD, JWT_SECRET).

2. Execute:
```bash
docker-compose up -d
```

A aplicação estará disponível em `http://localhost:3000`


## 🔧 Melhorias Futuras

### Performance
- Implementar cache com Redis
- Adicionar métricas de performance com Prometheus
### Segurança
- Adicionar rate limiting
- Adicionar mais provedores de autenticação (OAuth2)
### Funcionalidades
- Implementar filas para processamento assíncrono
- Implementar dashboard administrativo
- Adicionar expiração automática de URLs
- Implementar customização de URLs encurtadas
### DevOps
- Implementar CI/CD com GitHub Actions

## 🤝 Contribuição

1. Faça o fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/new-feature`)
3. Commit suas mudanças (`git commit -m 'Mudanças sugeridas'`)
4. Push para a branch (`git push origin feature/new-feature`)
5. Abra um Pull Request


## 👨‍💻 Autor

Ian Navarro - [iannavarro01](https://github.com/iannavarro01) - iannavarro.r01@gmail.com

## Nota
Este projeto foi desenvolvido como parte de um teste técnico para avaliação de habilidades em Node.js e desenvolvimento de APIs RESTful.