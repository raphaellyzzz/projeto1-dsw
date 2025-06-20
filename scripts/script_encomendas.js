let encomendas = [];

async function carregarEncomendas() {
  const res = await fetch('../dados/encomendas.json');
  encomendas = await res.json();
  mostrarEncomendas(encomendas);
}

async function mostrarEncomendas(lista) {
  const container = document.getElementById('lista-encomendas');
  container.innerHTML = '';

  const res = await fetch('../dados/historico.json');
  const historico = await res.json();

  lista.forEach(e => {
    const div = document.createElement('div');
    div.className = 'encomenda';

    const historicoHtml = historico[e.codigo]
      ? 
      `<div class="historico">
        <br>
        <h3 id="h3-rastreamento">Histórico:</h3>
        <ul>
          ${
              historico[e.codigo].map(h => `<li class="lista-rastreamento"> <strong> Na data: </strong> ${h.data} - <strong> Status: </strong> ${h.status}</li>`).join('')
            }
        </ul>
      </div>`
      : '<div class="historico"><em>Sem histórico disponível</em></div>';

    div.innerHTML = `
      <strong>Código:</strong> ${e.codigo} <br />
      <strong>Cliente:</strong> ${e.cliente} <br />
      <strong>Origem:</strong> ${e.origem} → <strong>Destino:</strong> ${e.destino}<br />
      <strong>Status:</strong> ${e.status} <br />
      <strong>Data de envio:</strong> ${e.dataEnvio}
      ${historicoHtml}
      <hr/>
    `;

    container.appendChild(div);
  });
}


function aplicarFiltros() {
  const busca = document.getElementById('buscar').value.toLowerCase();
  const cliente = document.getElementById('buscar-cliente').value.toLowerCase();
  const status = document.getElementById('filtro-status').value;

  const filtradas = encomendas.filter(e => {
    const condBusca = e.codigo.toLowerCase().includes(busca) || e.destino.toLowerCase().includes(busca);
    const condCliente = e.cliente.toLowerCase().includes(cliente);
    const condStatus = !status || e.status === status;
    return condBusca && condCliente && condStatus;
  });

  mostrarEncomendas(filtradas);
}

document.getElementById('buscar').addEventListener('input', aplicarFiltros);
document.getElementById('buscar-cliente').addEventListener('input', aplicarFiltros);
document.getElementById('filtro-status').addEventListener('change', aplicarFiltros);

carregarEncomendas();

// TENTAR APLICAR COM VUE.JS