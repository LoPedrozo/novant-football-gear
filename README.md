# NOVANT — Every Minute Counts

Novant é uma loja virtual de artigos esportivos de futebol, oferecendo chuteiras, acessórios e equipamentos das principais marcas do mercado. O projeto foi construído com foco em design minimalista, performance e experiência do usuário.

## Status

**Em produção** — [novant-football-gear.vercel.app](https://novant-football-gear.vercel.app/)

## Tech Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 18, TypeScript |
| Estilização | Tailwind CSS, Shadcn/UI |
| Animações | Framer Motion |
| Banco de Dados | Supabase (PostgreSQL) |
| Build | Vite |
| Deploy | Vercel |

## Funcionalidades

- Catálogo com produtos (chuteiras campo, futsal, society, caneleiras, meias, bolsa)
- Página individual de produto com seleção de tamanho e cor
- Filtros por categoria e marca com ordenação por preço e avaliação
- Avaliações de produtos com submissão, edição e exclusão
- Produtos em destaque na página inicial
- Barra de busca com pesquisa em tempo real
- Carrinho de compras com drawer lateral
- Lista de favoritos (wishlist)
- Autenticação de usuário (login, cadastro e OAuth via Google)
- Página de perfil com edição de informações e upload de avatar
- Páginas institucionais: Contato, Política de Privacidade, Termos de Uso e Trocas & Devoluções
- Integração com banco de dados Supabase
- Design responsivo (mobile-first)
- Marcas: Nike, Adidas, Puma, New Balance

## Em Desenvolvimento

- ⏳ Redes sociais fictícias
- ⏳ Checkout completo
- ⏳ Meus Pedidos

## Rodando Localmente

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Preencher com suas credenciais do Supabase:
#   VITE_SUPABASE_PROJECT_ID
#   VITE_SUPABASE_PUBLISHABLE_KEY
#   VITE_SUPABASE_URL

# Iniciar servidor de desenvolvimento
npm run dev
```

O servidor será iniciado em `http://localhost:8080`.

## Repositório

[github.com/LoPedrozo/novant-football-gear](https://github.com/LoPedrozo/novant-football-gear)

## Licença

Projeto privado — todos os direitos reservados.
