const { createApp } = Vue;
const API_URL = 'http://200.133.17.234:5000';

// 'http://172.16.36.31:5000' dentro do IF

createApp({
  data() {
    return {
      logado: false,
      nomeUsuario: '',
      senha: '',
      erroLogin: '',
      secaoAtual: 'clientes',
      listaClientes: [],
      listaRotas: [],
      listaEntregas: [],
      listaCentros: [],
      listaEncomendas: [],

      novoClienteForm: { 
        nome: '', 
        cpfCnpj: '', 
        email: '', 
        endereco: '' },
      filtroNomeCliente: '',
      filtroCpfCnpjCliente: '',

      novaEncomendaForm: {
        peso: null,
        tipo: '',
        descricao: '',
        endereco_entrega: '',
      },
      filtroTipoEncomenda: '',
      filtroPesoMinEncomenda: '',
      filtroPesoMaxEncomenda: '',

      novaEntregaForm: {
        clienteId: null, 
        encomendaId: null,
        rotaId: '', 
        data_estimada: '', 
        status: 'em_preparo', 
        codigo_rastreamento: '',
        historico: [] 
      },
      filtroClienteEntrega: '',
      filtroRotaEntrega: '',
      filtroDataEntrega: '',
      filtroStatusEntrega: '',

      novaRotaForm: {
        origem: '',
        destino: '',
        centros: '',
        distancia: '',
        tempo: ''
      },
      filtroOrigemRota: '', 
      filtroDestinoRota: '',
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
      const filtroTipo = this.filtroTipoEncomenda?.toLowerCase() || '';
      const filtroPesoMin = parseFloat(this.filtroPesoMinEncomenda) || null;
      const filtroPesoMax = parseFloat(this.filtroPesoMaxEncomenda) || null;

      return this.listaEncomendas.filter(e => {
        let condTipo = true;
        let condPeso = true;

        if (filtroTipo) {
          condTipo = (e.tipo || '').toLowerCase().includes(filtroTipo);
        }

        if (filtroPesoMin !== null) {
          condPeso = condPeso && (parseFloat(e.peso) >= filtroPesoMin);
        }

        if (filtroPesoMax !== null) {
          condPeso = condPeso && (parseFloat(e.peso) <= filtroPesoMax);
        }

        return condTipo && condPeso;
      });
    },
    
    entregasFiltradasC() {
      const filtroCliente = this.filtroClienteEntrega ? String(this.filtroClienteEntrega) : '';
      const filtroRota = this.filtroRotaEntrega ? String(this.filtroRotaEntrega) : '';
      const filtroData = this.filtroDataEntrega; 
      const filtroStatus = this.filtroStatusEntrega?.toLowerCase() || '';

      return this.listaEntregas.filter(entrega => {
        let condCliente = true;
        let condRota = true;
        let condData = true;
        let condStatus = true;

        if (filtroCliente) {
          const clienteIdEntrega = String(entrega.clienteId || entrega.cliente);
          condCliente = clienteIdEntrega === filtroCliente;
        }

        if (filtroRota) {
          const rotaIdEntrega = String(entrega.rotaId || entrega.rota);
          condRota = rotaIdEntrega === filtroRota;
        }

        if (filtroData) {
          const dataEntregaFormatada = this.formatarDataParaComparacao(entrega.data_estimada || entrega.data);
          condData = dataEntregaFormatada === filtroData;
        }
                
        if (filtroStatus) {
          condStatus = (entrega.status || '').toLowerCase().includes(filtroStatus);
        }

        return condCliente && condRota && condData && condStatus;
      });
    },

    rotasFiltradasC() {
      const filtroOrigem = this.filtroOrigemRota.toLowerCase();
      const filtroDestino = this.filtroDestinoRota.toLowerCase();

      return this.listaRotas.filter(rota => {
        let condOrigem = true;
        let condDestino = true;

        if (filtroOrigem) {
          condOrigem = (rota.origem || '').toLowerCase().includes(filtroOrigem);
        }

        if (filtroDestino) {
          condDestino = (rota.destino || '').toLowerCase().includes(filtroDestino);
        }

        return condOrigem && condDestino;
      });
    }

  },
  
  methods: {
    formatarDataParaComparacao(isoData) {
      if (!isoData) return '';
      const data = new Date(isoData);
      if (isNaN(data)) return isoData;
      const ano = data.getFullYear();
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const dia = String(data.getDate()).padStart(2, '0');
      return `${ano}-${mes}-${dia}`; 
    },

    traduzirStatus(status) {
      const mapa = {
        em_transito: 'Em trânsito',
        entregue: 'Entregue',
        em_preparo: 'Em preparo',
        a_caminho: 'A caminho',
        pendente: 'Pendente',
        extraviada: 'Extraviada',
        atrasada: 'Atrasada'
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
        if (!this.listaClientes || this.listaClientes.length === 0) return id; 
        const cliente = this.listaClientes.find(c => String(c.id) === String(id) || String(c.cpfCnpj) === String(id));
        return cliente ? cliente.nome : id;
    },

    obterCodigoEncomenda(id) {
      if (!this.listaEncomendas || this.listaEncomendas.length === 0) return id;
      const encomenda = this.listaEncomendas.find(e => String(e.id) === String(id) || String(e.codigo) === String(id));
      if (!encomenda) return id;
      return encomenda.codigo || encomenda.descricao || id;
    },

    obterDescricaoRota(id) {
        if (!this.listaRotas || this.listaRotas.length === 0) return id;
        const rota = this.listaRotas.find(r => String(r.id) === String(id));
        if (!rota) return id;
        return `${rota.origem} → ${rota.destino}`;
    },

    async realizarLogin() { 
        if (this.nomeUsuario === 'admin' && this.senha === '123') {
            this.logado = true;
            this.erroLogin = '';
            this.nomeUsuario = '';
            this.senha = '';

            await this.carregarCentros(); 
            await this.carregarClientes();
            await this.carregarEncomendas();
            await this.carregarRotas(); 
            await this.carregarEntregas(); 
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

    //CLIENTESS

    async carregarClientes() {
      try {
        const res = await fetch(`${API_URL}/clientes`);
        this.listaClientes = await res.json();
        //console.log("Clientes carregados:", this.listaClientes); 
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

    //ENCOMENDAS

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
      const payload = {
        peso: parseFloat(this.novaEncomendaForm.peso),
        tipo: this.novaEncomendaForm.tipo,
        descricao: this.novaEncomendaForm.descricao,
        endereco_entrega: this.novaEncomendaForm.endereco_entrega,
      };

      //console.log("Enviando encomenda:", payload);

      const res = await fetch(`${API_URL}/encomendas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        this.novaEncomendaForm = {
          peso: null,
          tipo: '',
          descricao: '',
          endereco_entrega: '',
        };
        this.carregarEncomendas();

        } else {
          console.error('Erro ao adicionar encomenda:', res.statusText);
        }
    },

    //ENTREGASS
      
    async carregarEntregas() {
        try {
            const response = await fetch(`${API_URL}/entregas`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            //console.log("Dados brutos das entregas:", data);

            this.listaEntregas = data.map(entrega => {
                const nomeCliente = this.obterNomeCliente(entrega.clienteId || entrega.cliente);
                const codigoEncomenda = this.obterCodigoEncomenda(entrega.encomendaId || entrega.encomenda);
                const descricaoRota = this.obterDescricaoRota(entrega.rotaId || entrega.rota);

                return {
                    ...entrega, 
                    cliente: nomeCliente, 
                    encomenda: codigoEncomenda, 
                    rota: descricaoRota, 

                    data: entrega.data || entrega.data_estimada 
                };
            });
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

    //ROTASS

    async carregarRotas() {
      try {
        const response = await fetch(`${API_URL}/rotas`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        this.listaRotas = data.map(rota => {
          let nomeOrigem = rota.origem; 
          const origemCentroObj = this.listaCentros.find(c => String(c.id) === String(rota.origem));

          if (origemCentroObj) { 
            nomeOrigem = origemCentroObj.nome;
          }

          let nomeDestino = rota.destino; 

          const destinoCentroObj = this.listaCentros.find(c => String(c.id) === String(rota.destino));

          if (destinoCentroObj) { 
            nomeDestino = destinoCentroObj.nome;
          }

          const centrosRetornados = rota.centros || rota.centros_intermediarios || []; 

          return {
            id: rota.id,
            origem: nomeOrigem, 
            destino: nomeDestino, 
            centros: centrosRetornados, 
            distancia: rota.distancia || rota.distancia_km || 0,
            tempo: rota.tempo || rota.tempo_estimado_h || 0
          };
        });

      } catch (error) {
        console.error("Erro ao carregar rotas:", error);
      }
    },

    async adicionarRota() {
      const origemValue = this.novaRotaForm.origem; 

      const destinoCentro = this.listaCentros.find(c => c.nome === this.novaRotaForm.destino);
      const destinoValue = destinoCentro ? destinoCentro.id : this.novaRotaForm.destino;

      const centrosIntermediariosNomes = this.novaRotaForm.centros
        .split(',')
        .map(c => c.trim())
        .filter(name => name); 

      const payload = {
        origem: origemValue, 
        destino: destinoValue, 
        centros: centrosIntermediariosNomes, 
        distancia: parseFloat(this.novaRotaForm.distancia),
        tempo: parseFloat(this.novaRotaForm.tempo)
      };

      //console.log('Payload sendo enviado:', payload);

      try {
        const res = await fetch(`${API_URL}/rotas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          this.novaRotaForm = { origem: '', destino: '', centros: '', distancia: '', tempo: '' };
          this.carregarRotas(); 
          console.log('Rota adicionada com sucesso!');
        } else {
          const errorData = await res.json(); 
          console.error('Erro ao adicionar rota:', res.status, res.statusText, errorData);
          alert(`Erro ao adicionar rota: ${errorData.message || res.statusText}`);
        }
      } catch (error) {
        console.error('Erro na requisição de adicionar rota:', error);
        alert('Ocorreu um erro ao tentar adicionar a rota. Verifique sua conexão ou tente novamente.');
      }
    },
    
    //CENTROSSS

    async carregarCentros() {
      try {
        const response = await fetch(`${API_URL}/centros`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        this.listaCentros = data;
      } catch (error) {
        console.error("Erro ao carregar centros:", error);
      }
    },

    trocarSecao(secao) {
      this.secaoAtual = secao;
    },

    async carregarDadosIniciais() {
      await this.carregarCentros();
      await this.carregarClientes();
      await this.carregarEncomendas();
      await this.carregarRotas();
      await this.carregarEntregas();
    }
  },

  mounted() {
    this.carregarDadosIniciais();
  }
}).mount('main.principal-adm');
