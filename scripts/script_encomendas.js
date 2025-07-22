const { createApp } = Vue;
const API_URL = 'http://200.133.17.234:5000';

createApp({
  data() {
    return {
      entregas: [],
      clientes: [],
      rotas: [],
      filtroCodigo: '',
      filtroCliente: '',
      filtroStatus: '',
      carregando: true,
    };
  },
  computed: {
    entregasFiltradas() {
      const filtroCodigoLower = this.filtroCodigo.toLowerCase();
      const filtroClienteLower = this.filtroCliente.toLowerCase();
      const filtroStatusLower = this.filtroStatus.toLowerCase();

      return this.entregas.filter(entrega => {
        const condCodigo = !filtroCodigoLower || (entrega.codigo_rastreamento || '').toLowerCase().includes(filtroCodigoLower);
        
        const clienteNome = this.obterNomeCliente(entrega.clienteId || entrega.cliente).toLowerCase();
        const condCliente = !filtroClienteLower || clienteNome.includes(filtroClienteLower);

        const condStatus = !filtroStatusLower || (entrega.status || '').toLowerCase() === filtroStatusLower;

        return condCodigo && condCliente && condStatus;
      });
    },
  },
  methods: {
    async carregarClientes() {
      try {
        const res = await fetch(`${API_URL}/clientes`);
        this.clientes = await res.json();
      } catch (e) {
        console.error('Erro ao carregar clientes:', e);
      }
    },
    async carregarRotas() {
      try {
        const res = await fetch(`${API_URL}/rotas`);
        this.rotas = await res.json();
      } catch (e) {
        console.error('Erro ao carregar rotas:', e);
      }
    },
    async carregarEntregas() {
      this.carregando = true;
      try {
        const res = await fetch(`${API_URL}/entregas`);
        let entregasData = await res.json();
        
        const entregasComHistorico = await Promise.all(entregasData.map(async entrega => {
          try {
            const historicoRes = await fetch(`${API_URL}/entregas/${entrega.id}/historico`);
            entrega.historico = await historicoRes.json();
          } catch (e) {
            console.warn(`Erro ao carregar histórico para entrega ${entrega.id}:`, e);
            entrega.historico = []; 
          }
          return entrega;
        }));

        this.entregas = entregasComHistorico;
      } catch (e) {
        console.error('Erro ao carregar entregas:', e);
      } finally {
        this.carregando = false;
      }
    },
    obterNomeCliente(id) {
      const cliente = this.clientes.find(c => String(c.id) === String(id));
      return cliente ? cliente.nome : `Cliente ${id}`;
    },
    obterOrigemRota(id) {
      const rota = this.rotas.find(r => String(r.id) === String(id));
      return rota ? rota.origem : 'N/A';
    },
    obterDestinoRota(id) {
      const rota = this.rotas.find(r => String(r.id) === String(id));
      return rota ? rota.destino : 'N/A';
    },
    traduzirStatus(status) {
      const mapa = {
        em_transito: 'Em trânsito',
        entregue: 'Entregue',
        em_preparo: 'Em preparo',
        a_caminho: 'A caminho',
        pendente: 'Pendente',
        extraviada: 'Extraviada',
        atrasada: 'Atrasada',
      };
      return mapa[status] || status || 'Status desconhecido';
    },
    formatarData(isoData) {
      if (!isoData) return 'N/A';
      const data = new Date(isoData);
      if (isNaN(data)) return isoData;
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      return `${dia}/${mes}/${ano}`;
    },
    formatarDataHora(isoData) {
      if (!isoData) return 'N/A';
      const data = new Date(isoData);
      if (isNaN(data)) return isoData;
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      const horas = String(data.getHours()).padStart(2, '0');
      const minutos = String(data.getMinutes()).padStart(2, '0');
      return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
    },
  },
  async mounted() {
    await this.carregarClientes();
    await this.carregarRotas();
    await this.carregarEntregas();
  },
}).mount('#app-rastreamento');

//aplicar com resolução de erros