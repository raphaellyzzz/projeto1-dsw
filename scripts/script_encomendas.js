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
      const cod = this.filtroCodigo.toLowerCase();
      const cliente = this.filtroCliente.toLowerCase();
      const status = this.filtroStatus.toLowerCase();

      return this.entregas.filter(entrega => {
        const condCodigo = !cod || (entrega.codigo_rastreamento || '').toLowerCase().includes(cod);
        
        const nomeCliente = (this.obterNomeCliente(entrega.clienteId || entrega.cliente) || '').toLowerCase();
        const condCliente = !cliente || nomeCliente.includes(cliente);

        const condStatus = !status || (entrega.status || '').toLowerCase() === status;

        return condCodigo && condCliente && condStatus;
      });
    }
  },
  methods: {
    async carregarClientes() {
      try {
        const res = await fetch(`${API_URL}/clientes`);
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        this.clientes = await res.json();
      } catch (e) {
        console.error('Erro ao carregar clientes:', e);
        this.clientes = [];
      }
    },
    async carregarRotas() {
      try {
        const res = await fetch(`${API_URL}/rotas`);
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        this.rotas = await res.json();
      } catch (e) {
        console.error('Erro ao carregar rotas:', e);
        this.rotas = [];
      }
    },
    async carregarEntregas() {
      this.carregando = true;
      try {
        const res = await fetch(`${API_URL}/entregas`);
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const entregasBase = await res.json();
        console.log('Entregas raw:', entregasBase);
    
        const entregasComHistorico = await Promise.all(entregasBase.map(async entrega => {
          try {
            const historicoRes = await fetch(`${API_URL}/entregas/${entrega.id}/historico`);
            if (historicoRes.ok) {
              entrega.historico = await historicoRes.json();
            } else {
              entrega.historico = [];
            }
          } catch (e) {
            console.warn(`Erro ao carregar histórico da entrega ${entrega.id}`, e);
            entrega.historico = [];
          }
          return entrega;
        }));
    
        console.log('Entregas com histórico:', entregasComHistorico);
    
        this.entregas = entregasComHistorico;
      } catch (e) {
        console.error('Erro ao carregar entregas:', e);
        this.entregas = [];
      } finally {
        this.carregando = false;
      }
    },
    obterNomeCliente(id) {
      const cliente = this.clientes.find(c => String(c.id) === String(id));
      return cliente ? cliente.nome : 'Cliente não identificado';
    },
    obterOrigemRota(id) {
      const rota = this.rotas.find(r => String(r.id) === String(id));
      return rota ? rota.origem : 'Origem não disponível';
    },
    obterDestinoRota(id) {
      const rota = this.rotas.find(r => String(r.id) === String(id));
      return rota ? rota.destino : 'Destino não disponível';
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
      return mapa[status] || status || 'Desconhecido';
    },
    formatarData(isoData) {
      if (!isoData) return 'N/A';
      const d = new Date(isoData);
      if (isNaN(d)) return isoData;
      return d.toLocaleDateString('pt-BR');
    },
    formatarDataHora(isoData) {
      if (!isoData) return 'N/A';
      const d = new Date(isoData);
      if (isNaN(d)) return isoData;
      return d.toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    },
  },
  async mounted() {
    await Promise.all([
      this.carregarClientes(),
      this.carregarRotas(),
      this.carregarEntregas()
    ]);
  }
}).mount('#app-rastreamento');
