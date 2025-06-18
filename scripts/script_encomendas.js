let encomendas = [];

async function carregarEncomendas() {
  const res = await fetch('../dados/encomendas.json');
  encomendas = await res.json();
  mostrarEncomendas(encomendas);
}

function mostrarEncomendas(lista) {
  const container = document.getElementById('lista-encomendas');
  container.innerHTML = '';

  lista.forEach(e => {
    const div = document.createElement('div');
    div.className = 'encomenda';
    div.innerHTML = `
      <strong>Código:</strong> ${e.codigo} <br />
      <strong>Origem:</strong> ${e.origem} → <strong>Destino:</strong> ${e.destino}<br />
      <strong>Status:</strong> ${e.status} <br />
      <strong>Data de envio:</strong> ${e.dataEnvio}
      <hr/>
    `;
    container.appendChild(div);
  });
}

function aplicarFiltros() {
  const busca = document.getElementById('buscar').value.toLowerCase();
  const status = document.getElementById('filtro-status').value;

  const filtradas = encomendas.filter(e => {
    const condBusca = e.codigo.toLowerCase().includes(busca) || e.destino.toLowerCase().includes(busca);
    const condStatus = !status || e.status === status;
    return condBusca && condStatus;
  });

  mostrarEncomendas(filtradas);
}

document.getElementById('buscar').addEventListener('input', aplicarFiltros);

document.getElementById('filtro-status').addEventListener('change', aplicarFiltros);

carregarEncomendas();

// TENTAR APLICAR COM VUE.JS