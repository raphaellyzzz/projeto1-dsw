# Projeto1 DSW - Sistema de Rastreamento de Entregas

## Descrição
Este projeto é uma aplicação web para rastreamento de entregas, desenvolvido para a disciplina de Desenvolvimento de Sistemas Web (DSW). O sistema permite que os usuários consultem suas encomendas, visualizem o status atual e o histórico completo de movimentações de cada entrega.

A aplicação consome dados de uma API REST, enviada pelo professor, que fornece informações sobre entregas, clientes, rotas e histórico de movimentações.

## Funcionalidades
- **Listagem de entregas:** Exibe o código de rastreamento, nome do cliente, origem e destino da rota, status atual e data estimada de entrega.
- **Filtros dinâmicos:** Permite buscar entregas por código de rastreamento, nome do cliente ou status da entrega (ex: em preparo, a caminho, entregue, atrasada).
- **Histórico de movimentações:** Para cada entrega, mostra uma lista cronológica com data/hora, status e local das movimentações, facilitando o acompanhamento detalhado.

## Estrutura do Projeto
- **index.html:** Página simples de início com as opções de seguir para Administrador e Verificar as encomendas.
- **admin.html:** Página Admin que tem login e permite cadastrar encomenda, cliente e rota. Bem como a visualização desses dados.
- **app_admin.js:** Toda lógica com Vue da página admin. Metódos, Computed, etc
- **rastreamento.html:** Página principal de rastreamento com a interface do usuário, onde são aplicados os filtros e exibidos os dados.
- **style.css:** Arquivo de estilos responsável pela aparência das páginas.
- **script_encomendas.js:** Script JavaScript que utiliza Vue.js para gerenciar os dados da parte de encomendas.
- **API:** Serviço backend REST acessado via HTTP no endereço `http://200.133.17.234:5000` (fora do IFPE), que disponibiliza os endpoints para clientes, rotas, entregas e histórico.

## Tecnologias Utilizadas
- HTML5 e CSS3 para estrutura e estilos.
- Vue.js 3 (via CDN) para reatividade e gerenciamento da interface.
- JavaScript moderno (ES6+) para lógica e requisições assíncronas (fetch).
- API REST para backend de dados.

## Como Utilizar
1. **Pré-requisitos:** Navegador moderno com suporte a JavaScript.
2. **Execução local:**
   - Clone ou baixe este repositório.
   - Garanta que você tenha acesso à API em `http://200.133.17.234:5000`. Caso contrário, as informações não serão carregadas.
   - Abra o arquivo `index.html` em seu navegador.

## Pontos Importantes
- A aplicação depende da disponibilidade da API externa. Se a API estiver fora do ar ou inacessível, a página exibirá mensagens de erro ou listagens vazias.
- A estrutura dos dados da API deve seguir o formato esperado para que as informações sejam exibidas corretamente.
- Para melhorar a experiência, a aplicação exibe mensagens de carregamento enquanto busca os dados e mensagens amigáveis caso não encontre resultados.

## Autora
@raphaellyzzz

---
