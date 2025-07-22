const { createApp } = Vue;
const API_URL = 'http://200.133.17.234:5000';

createApp({
  data() {
    return {
      logado: false,
      nomeUsuario: '',
      senha: '',
      erroLogin: '',
      secaoAtual: 'clientes',
      listaClientes: [],
      novoClienteForm: { nome: '', cpfCnpj: '', email: '', endereco: '' },
      filtroNomeCliente: '',
      filtroCpfCnpjCliente: '',
      novaEncomendaForm: {
        codigo: '', conteudo: '', status: 'Pendente',
        dataPostagem: '', previsaoEntrega: '',
        remetenteCpfCnpj: '', destinatarioCpfCnpj: ''
      },
      filtroCodigoEncomenda: '',
      listaRotas: [],
      listaEntregas: [],
      listaCentros: [],
      listaEncomendas: [],
      novaRotaForm: {
        origem: '',
        destino: '',
        centros: '',
        distancia: '',
        tempo: ''
      },
      novaEntregaForm: {
        clienteId: null, // Alterado para ID numérico
        encomendaId: null, // Alterado para ID numérico
        rotaId: '', // Mantido como string de ID
        data_estimada: '', // Novo campo
        status: 'em_preparo', // Novo campo com valor padrão
        codigo_rastreamento: '', // Novo campo
        historico: [] // Novo campo para histórico
      },
      filtroStatusEncomenda: ''
    };
  },
  computed: {
    clientesFiltradosC() {
      return this.listaClientes.filter(c =>
        c.nome.toLowerCase().includes(this.filtroNomeCliente.toLowerCase()) &&
        c.cpfCnpj.toLowerCase().includes(this.filtroCpfCnpjCliente.toLowerCase())
      );
    },
    encomendasFiltradasC() {
      const filtroCodigo = this.filtroCodigoEncomenda.toLowerCase();
      const filtroStatus = this.filtroStatusEncomenda.toLowerCase();

      return this.listaEncomendas.filter(e => {
        const condCodigo = !filtroCodigo || (
          (e.codigo || '').toLowerCase().includes(filtroCodigo) ||
          (e.descricao || '').toLowerCase().includes(filtroCodigo) ||
          (e.conteudo || '').toLowerCase().includes(filtroCodigo)
        );
        const condStatus = !filtroStatus || (e.status || '').toLowerCase().includes(filtroStatus);
        return condCodigo && condStatus;
      });
    }
  },
  methods: {
    traduzirStatus(status) {
      const mapa = {
        em_transito: 'Em trânsito',
        entregue: 'Entregue',
        em_preparo: 'Em preparo',
        a_caminho: 'A caminho',
        pendente: 'Pendente',
        extraviada: 'Extraviada'
      };
      return mapa[status] || status || 'Status desconhecido';
    },
    formatarData(isoData) {
      if (!isoData) return '';
      const data = new Date(isoData);
      if (isNaN(data)) return isoData;
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      return `${dia}/${mes}/${ano}`;
    },
    obterNomeCliente(id) {
      const cliente = this.listaClientes.find(c => String(c.id) === String(id) || String(c.cpfCnpj) === String(id));
      return cliente ? cliente.nome : id;
    },
    obterCodigoEncomenda(id) {
      const encomenda = this.listaEncomendas.find(e => String(e.id) === String(id) || String(e.codigo) === String(id));
      if (!encomenda) return id;
      return encomenda.codigo || encomenda.descricao || id;
    },
    obterDescricaoRota(id) {
      const rota = this.listaRotas.find(r => String(r.id) === String(id));
      if (!rota) return id;
      return `${rota.origem} → ${rota.destino}`;
    },

    realizarLogin() {
      if (this.nomeUsuario === 'admin' && this.senha === '123') {
        this.logado = true;
        this.erroLogin = '';
        this.nomeUsuario = '';
        this.senha = '';
        this.carregarClientes();
        this.carregarEncomendas();
        this.carregarRotas();
        this.carregarEntregas();
        this.carregarCentros(); // Adicionado para carregar centros no login
      } else {
        this.erroLogin = 'Usuário ou senha estão inválidos.';
      }
    },

    realizarLogout() {
      this.logado = false;
      this.secaoAtual = 'clientes';
      this.listaClientes = [];
      this.listaEncomendas = [];
      this.listaRotas = [];
      this.listaEntregas = [];
      this.listaCentros = [];
    },

    async carregarClientes() {
      try {
        const res = await fetch(`${API_URL}/clientes`);
        this.listaClientes = await res.json();
      } catch (e) {
        console.error('Erro ao carregar clientes:', e);
      }
    },

    async adicionarCliente() {
      const payload = { ...this.novoClienteForm };
      const res = await fetch(`${API_URL}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        this.novoClienteForm = { nome: '', cpfCnpj: '', email: '', endereco: '' };
        this.carregarClientes();
      } else {
        console.error('Erro ao adicionar cliente:', res.statusText);
      }
    },

    async carregarEncomendas() {
      try {
        const res = await fetch(`${API_URL}/encomendas`);
        const data = await res.json();
        this.listaEncomendas = data;
      } catch (e) {
        console.error('Erro ao carregar encomendas:', e);
      }
    },

    async adicionarEncomenda() {
      const payload = { ...this.novaEncomendaForm };
      console.log("Enviando encomenda:", payload); 
      const res = await fetch(`${API_URL}/encomendas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        this.novaEncomendaForm = {
          codigo: '', conteudo: '', status: 'Pendente',
          dataPostagem: '', previsaoEntrega: '',
          remetenteCpfCnpj: '', destinatarioCpfCnpj: ''
        };
        this.carregarEncomendas();

      } else {
        console.error('Erro ao adicionar encomenda:', res.statusText);
      }
    },

    async carregarEntregas() {
      try {
        const response = await fetch(`${API_URL}/entregas`);
        const data = await response.json();
        this.listaEntregas = data;
      } catch (error) {
        console.error("Erro ao carregar entregas:", error);
      }
    },

    async adicionarEntrega() {
      const payload = {
        clienteId: this.novaEntregaForm.clienteId,
        encomendaId: this.novaEntregaForm.encomendaId,
        rotaId: this.novaEntregaForm.rotaId,
        codigo_rastreamento: this.novaEntregaForm.codigo_rastreamento,
        data_estimada: this.novaEntregaForm.data_estimada,
        status: this.novaEntregaForm.status,
        historico: [{
          data: new Date().toISOString(),
          status: this.novaEntregaForm.status,
          local: 'Entrega criada'
        }]
      };
      try {
        const res = await fetch(`${API_URL}/entregas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          this.novaEntregaForm = {
            clienteId: null,
            encomendaId: null,
            rotaId: '',
            data_estimada: '',
            status: 'em_preparo',
            codigo_rastreamento: '',
            historico: []
          };
          await this.carregarEntregas(); 
        } else {
          console.error('Erro ao adicionar entrega:', res.statusText);
        }
      } catch (error) {
        console.error('Erro na requisição de adicionar entrega:', error);
      }
    },

    carregarRotas() {
      fetch(`${API_URL}/rotas`)
        .then(response => response.json())
        .then(data => {
          this.listaRotas = data.map(rota => {
            return {
              id: rota.id,
              origem: rota.origem,
              destino: rota.destino,
              centros: rota.centros || rota.centros_intermediarios || [],
              distancia: rota.distancia || rota.distancia_km || 0,
              tempo: rota.tempo || rota.tempo_estimado_h || 0
            };
          });
        })
      .catch(error => console.error("Erro ao carregar rotas:", error));
    },

    carregarCentros() {
      fetch(`${API_URL}/centros`)
        .then(response => response.json())
        .then(data => {
          this.listaCentros = data;
        })
        .catch(error => console.error("Erro ao carregar centros:", error));
    },
    async adicionarRota() {
      const payload = {
        origem: this.novaRotaForm.origem,
        destino: this.novaRotaForm.destino,
        centros: this.novaRotaForm.centros.split(',').map(c => c.trim()),
        distancia: parseFloat(this.novaRotaForm.distancia),
        tempo: parseFloat(this.novaRotaForm.tempo)
      };
      const res = await fetch(`${API_URL}/rotas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        this.novaRotaForm = { origem: '', destino: '', centros: '', distancia: '', tempo: '' };
        this.carregarRotas();
      } else {
        console.error('Erro ao adicionar rota:', res.statusText);
      }
    },
  
    trocarSecao(secao) {
      this.secaoAtual = secao;
    }
  },
  mounted() {
    this.carregarClientes();
    this.carregarRotas();
    this.carregarEntregas();
    this.carregarCentros();
    this.carregarEncomendas();
  }
}).mount('main.principal-adm');