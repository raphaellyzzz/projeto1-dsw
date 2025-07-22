const { createApp } = Vue;

createApp({
  data() {
    return {
      logado: false,
      nomeUsuario: '',
      senha: '',
      erroLogin: '',
      secaoAtual: 'clientes',
      listaClientes: [],
      novoClienteForm: {
        nome: '',
        cpfCnpj: '',
        email: '',
        endereco: ''
      },
      filtroNomeCliente: '',
      filtroCpfCnpjCliente: '',
      listaEncomendas: [],
      novaEncomendaForm: {
        codigo: '',
        conteudo: '',
        status: 'Pendente',
        dataPostagem: '',
        previsaoEntrega: '',
        remetenteCpfCnpj: '',
        destinatarioCpfCnpj: ''
      },
      filtroCodigoEncomenda: '',
      filtroStatusEncomenda: ''
    };
  },
  computed: {
    clientesFiltradosC() {
      return this.listaClientes.filter(cliente =>
        cliente.nome.toLowerCase().includes(this.filtroNomeCliente.toLowerCase()) &&
        cliente.cpfCnpj.toLowerCase().includes(this.filtroCpfCnpjCliente.toLowerCase())
      );
    },
    encomendasFiltradasC() {
      return this.listaEncomendas.filter(encomenda =>
        encomenda.codigo.toLowerCase().includes(this.filtroCodigoEncomenda.toLowerCase()) &&
        encomenda.status.toLowerCase().includes(this.filtroStatusEncomenda.toLowerCase())
      );
    }
  },
  methods: {
    realizarLogin() {
      if (this.nomeUsuario === 'admin' && this.senha === '123') {
        this.logado = true;
        this.erroLogin = '';
        this.nomeUsuario = '';
        this.senha = '';
      } else {
        this.erroLogin = 'Usuário ou senha est~ao inválidos.';
      }
    },
    realizarLogout() {
      this.logado = false;
      this.secaoAtual = 'clientes';
      this.listaClientes = [];
      this.listaEncomendas = [];
    },
    adicionarCliente() {
      this.listaClientes.push({ ...this.novoClienteForm });
      this.novoClienteForm = { nome: '', cpfCnpj: '', email: '', endereco: '' };
    },
    adicionarEncomenda() {
        this.listaEncomendas.push({ ...this.novaEncomendaForm });
        this.novaEncomendaForm = {
            codigo: '',
            conteudo: '',
            status: 'Pendente',
            dataPostagem: '',
            previsaoEntrega: '',
            remetenteCpfCnpj: '',
            destinatarioCpfCnpj: ''
        };
    },
    trocarSecao(secao) {
      this.secaoAtual = secao;
    }
  }
}).mount('main');