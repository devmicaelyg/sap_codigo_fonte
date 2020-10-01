import { Sprint } from './../../models/sprint.model';
import { Lider } from './../../models/lider.model';
import { ClienteService } from 'src/app/services/cliente.service';
import { StatusService } from './../../services/status.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { LiderService } from './../../services/lider.service';
import { SprintService } from './../../services/sprint.service';

import { ProjetoService } from './../../services/projeto.service';
import { OrdemServicoService } from './../../services/ordem-servico.service';
import { SituacaoService } from './../../services/situacao.service';

import { Observable } from 'rxjs';

import { finalize, map } from 'rxjs/operators';
import { Output, EventEmitter,Component, OnInit, ViewChild } from '@angular/core';

import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { SelectItem, Table } from 'primeng';
import { Projeto } from 'src/app/models/projeto.model';





@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [
    trigger('rowExpansionTrigger', [
      state('void', style({
        transform: 'translateX(-10%)',
        opacity: 0
      })),
      state('active', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      transition('* <=> *', animate('600ms cubic-bezier(0.86, 0, 0.07, 1)'))
    ])
  ]
})

export class DashboardComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI;
  @Output() salvarSprint = new EventEmitter();

  titulo: string = 'Dashboard'
  listaOrdemServico$: Observable<any>;
  listaOrdemServico: any = [];
  listaProjeto$: Observable<any>;
  listaProjeto: any = [];
  listaOsProjeto: SelectItem[] = [];
  situacoes: any = [];
  situacaoDropdown: SelectItem[] = [];
  statusDropdown: SelectItem[] = [];

  

  projetos: Projeto [] = [];
  projetosFiltrados: Projeto [] = [];
  clienteItensFiltro: any [] = [];
  projetoItensFiltro: any [] = [];
  liderItensFiltro: any [] = [];

  lider : any;
  
  sprints: Sprint[] = [];
  sprintsFiltradas: any = [];
  lideres: Lider[] = [];
  status: any = [];
  testeExibe: boolean;

  x :any []=[];
  lid : Lider;

  lista: any = [];
  listaLideres: SelectItem[] = [];
  listaClientes: SelectItem[] = [];
  filtroLider: any = [];
  filtroCliente: any = [];
  filtroProjeto: any = [];
  filtroOs: any = [];
  display : boolean =false;


  colunas: any[] = [
    { header: 'OS' },
    { header: 'Chave'},
    { header: 'Status da OS' },
    { header: 'Próxima Entrega' },
    { header: 'Prazo' },
    { header: 'PF' },
    { header: 'Fábrica(s)' },
    { header: 'Ação' },
  ];

  colunaSprint: any[] = [
    { header: 'Sprint' },
    { header: 'Início' },
    { header: 'Término' },
    { header: 'PF' },
    { header: 'Impedimento' },
    { header: 'Descrição' },
    { header: 'Prazo' },
    { header: 'Status' },
    { header: 'Ação' },
  ];

  dataBr = {
    firstDayOfWeek: 1,
    dayNames: ["Domingo", "Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira", "Sábado"],
    dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
    dayNamesMin: ["D", "S", "T", "Q", "Q", "S", "S"],
    monthNames: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
    monthNamesShort: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
    today: 'Hoje',
    clear: 'Limpar'
  };

  simNaoDropDown: any = [
    { label: 'SIM', value: true},
    { label: 'NÃO', value: false}
]

  listaFiltrada = [
    this.listaLideres,
    this.listaOrdemServico,
    this.listaProjeto
  ];

  @ViewChild('dt') table: Table;

  constructor(
    private ordemServicoService: OrdemServicoService,
    private projetoService: ProjetoService,
    private situacaoService: SituacaoService,
    private liderService: LiderService,
    private sprintService: SprintService,
    private statusService: StatusService,
    private clienteService: ClienteService
  ) { }

  ngOnInit(): void {

    this.obterSituacoes();
    this.obterProjetos();
    this.obterTodos();
    this.obterSprint();
    this.obterLideres();
    this.obterNomeLider;
    this.obterStatus();
    this.carregarLideres();
    this.carregarProjetos();
    this.carregarCliente();
    this.carregarDropdownSituacao();
    this.carregarDropdownStatus();
  }

  obterTodos() {
    // this.blockUI.start();
    this.listaOrdemServico$ = this.ordemServicoService.obterTodos().pipe(
      map(this.converterDatas),
      finalize(() => this.blockUI.stop())
    )
  }

  private converterDatas(res) {
    return res.map(item => {
      console.log(item)
      item.dataProximaEntrega = new Date(`${item.dataProximaEntrega}T00:00:00`);
      item.prazo = new Date(`${item.prazo}T00:00:00`);
      return item;
    })
  }

  obterProjetos() {
    this.blockUI.start();
    this.projetoService.obterTodos().pipe(
      finalize(() => this.blockUI.stop())
    ).subscribe(
      projetos => {
        this.projetos = projetos;
        this.projetosFiltrados = projetos;
      }
    );
  }
  
  obterOrdemServico() {
    this.blockUI.start();
    this.ordemServicoService.obterTodos().pipe(
      finalize(() => this.blockUI.stop())
    ).subscribe(
      ordemServico => this.listaOrdemServico = ordemServico
    );
  }

  enviarFormOs(OrdemServico) {
    this.ordemServicoService.salvar(OrdemServico).pipe(
      finalize(() => this.blockUI.stop())
  ).subscribe(res => OrdemServico.edit = false);
  }

  enviarFormSprint(sprint) {
    this.sprintService.atualizar(sprint).pipe(
      finalize(() => this.blockUI.stop())
  ).subscribe(res => sprint.edit = false);
  }

  obterLideres() {
    this.blockUI.start();
    this.liderService.obterTodos().pipe(
      finalize(() => this.blockUI.stop())
    ).subscribe(
      lideres => this.lideres = lideres
    );
  }

  obterSituacoes() {
    this.blockUI.start();
    this.situacaoService.obterTodos().pipe(
      finalize(() => this.blockUI.stop())
    ).subscribe(
      situacoes => this.situacoes = situacoes
    );

  }

  obterStatus() {
    this.blockUI.start();
    this.statusService.obterTodos().pipe(
      finalize(() => this.blockUI.stop())
    ).subscribe(
      status => this.status = status
    );

  }

  obterSprint() {
    this.blockUI.start();
    this.sprintService.obterTodos().pipe(
      finalize(() => this.blockUI.stop())
    ).subscribe( sprints => {
      this.sprints = sprints;
      sprints.forEach(element => {
        element.dataInicio = new Date (`${element.dataInicio}T00:00:00`);
        element.dataTermino = new Date(`${element.dataTermino}T00:00:00`);
      })
      console.log(this.sprints);
      this.sprints = this.sprints.slice().sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime());
      console.log(this.sprints);
      // sprints.forEach(element => {
      //   element.dataInicio = new Date (`${element.dataInicio}T00:00:00`);
      //   element.dataTermino = new Date(`${element.dataTermino}T00:00:00`);
      //   console.log(this.sprints)
      // })
    }
    );
  }

  obterOsPorProjeto(projeto) {
    this.blockUI.start();
    this.ordemServicoService.obterPorIdProjeto(projeto.id)
      .pipe(
        finalize(() => this.blockUI.stop()),
      ).subscribe(osProjeto => {
        projeto.listaOs = osProjeto;
        projeto.listaOs.forEach(e => {
          e.dataProximaEntrega = new Date (`${e.dataProximaEntrega}T00:00:00`);
          e.prazo = new Date(`${e.prazo}T00:00:00`);

        });
      })
  }

  carregarProjetos(){
    this.blockUI.start();
    this.projetoService.obterTodos().pipe(
        finalize(() => this.blockUI.stop()),
        map(this.converterDropDownProjeto)
    ).subscribe(projeto => this.listaProjeto = projeto);
  }

  carregarCliente() {
    this.blockUI.start();
    this.clienteService.obterTodos().pipe(
        finalize(() => this.blockUI.stop()),
        map(this.converterDropDownCliente)
    ).subscribe(cliente => this.listaClientes = cliente);
  }

  carregarLideres() {
    this.blockUI.start();
    this.liderService.obterTodos().pipe(
      finalize(() => this.blockUI.stop()),
      map(this.converterDropDownLider)
    ).subscribe(lider => this.listaLideres = lider);
  }

  preencherFiltros() {
    this.listaFiltrada = this.lista.filter(item => {
        if (!this.filtroCliente.length && !this.filtroLider.length && !this.filtroProjeto.length) {
            return true;
        }
        return (this.filtroLider && this.filtroLider.some(sel => sel == item.idLider)) ||
            (this.filtroCliente && this.filtroCliente.some(sel => sel == item.idCliente)) ||
            (this.filtroProjeto && this.filtroProjeto.some(sel => sel == item.idProjeto));
    });

  }

  habilitarBotao(e, projeto) {
    if (!projeto.edit)
      projeto['edit'] = true;
}

  obterSimNao(value): string {
    return this.simNaoDropDown.find(item => item.value == value).label;
  }

  obterNomeStatus(id: number) {
    return this.status.find(status => status.id == id).descricao
  }

  obterSituacaoSprint(id: number) {
    return this.sprints.find(sprint => sprint.idOrdemServico == id).prazo
  }

  obterDescricaocaoSprint(id: number) {
    return this.sprints.find(sprint => sprint.idOrdemServico == id).descricao
  }



  obterImpedimentoSprint(id: number) {
    return this.sprints.find(sprint => sprint.idOrdemServico == id).impedimento
  }

  obterNomeSituacao(id: number) {
    return this.situacoes.find(situacao => situacao.id == id).descricao
  }

  obterNomeLider(id: number){
    this.lid=this.lideres.find(lider => lider.id == id)
    return this.lid?.nome
    }

  obterNomeProjeto(id: number) {
    return this.projetos.find(projeto => projeto.id == id).nome
  }

  obterNomeGerente(id: number) {
    return this.projetos.find(projeto => projeto.id == id).gerente
  }

  obterNomeTestador(id: number) {
    return this.projetos.find(projeto => projeto.id == id).testador
  }

  obterNomeRevisor(id: number) {
    return this.projetos.find(projeto => projeto.id == id).revisor
  }

  obterCliente(id: number) {
    return this.projetos.find(projeto => projeto.id == id).idCliente
  }

  obterSprints(id: number) {
    this.sprintsFiltradas = this.sprints.find(sprints => sprints.idOrdemServico == id);
  }

  obterBoolean(ar: boolean) {
    if (ar == true) {
      return "Sim"
    } else {
      return "Não"
    }
  }

  carregarDropdownSituacao() {
    this.blockUI.start();
    this.situacaoService.obterTodos().pipe(
      finalize(() => this.blockUI.stop())
    ).subscribe(res => {
      this.situacaoDropdown = res.map(item => {
        return {
          label: item.descricao,
          value: item.id
        }
      })
    })
  }

  carregarDropdownStatus() {
    this.blockUI.start();
    this.statusService.obterTodos().pipe(
      finalize(() => this.blockUI.stop())
    ).subscribe(res => {
      this.statusDropdown = res.map(item => {
        return {
          label: item.descricao,
          value: item.id
        }
      })
    })
  }

  private converterDropDownCliente(lista) {
    return lista.map(item => {
        return {
            label: item['descricao'].toUpperCase(),
            value: item['id']
        }
    })
  }

  private converterDropDownLider(lista) {
    return lista.map(item => {
        return {
            label: item['nome'].toUpperCase(),
            value: item['id']
        }
    })
  }

  private converterDropDownProjeto (lista){
    return lista.map(item => {
      return {
        label: item['nome'].toUpperCase(),
        value: item['id']
      }
    })
  }

  prepararFiltroLider(event){
    this.liderItensFiltro = event["value"];
    this.filtrar();
  }

  prepararFiltroProjeto(event){
    this.projetoItensFiltro = event["value"];
    this.filtrar();
  }

  prepararFiltroCliente(event){
    this.clienteItensFiltro = event["value"];
    this.filtrar();
  }

  filtrar(){
    this.projetosFiltrados = this.projetos.filter(pf => !!(this.liderItensFiltro.length ? this.liderItensFiltro.find(lif => lif === pf.idLider) : true));
    this.projetosFiltrados = this.projetosFiltrados.filter(pf => !!(this.projetoItensFiltro.length ? this.projetoItensFiltro.find(lif => lif === pf.id) : true));
    this.projetosFiltrados = this.projetosFiltrados.filter(pf => !!(this.clienteItensFiltro.length ? this.clienteItensFiltro.find(lif => lif === pf.idCliente) : true));

  }

  showDialog() {
    this.display = !this.display;
  }

}
