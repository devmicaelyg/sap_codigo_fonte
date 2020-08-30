import { ClienteService } from 'src/app/services/cliente.service';
import { StatusService } from './../../services/status.service';
import { Sprint } from './../../models/sprint.model';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { LiderService } from './../../services/lider.service';
import { SprintService } from './../../services/sprint.service';

import { ProjetoService } from './../../services/projeto.service';
import { OrdemServicoService } from './../../services/ordem-servico.service';
import { SituacaoService } from './../../services/situacao.service';
import { Observable, forkJoin } from 'rxjs';

import { finalize, map, tap } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';

import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { SelectItem } from 'primeng';

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

  titulo: string = 'Dashboard'
  listaOrdemServico$: Observable<any>;
  listaOrdemServico: any = [];
  listaProjeto$: Observable<any>;
  listaProjeto: any = [];
  listaOsProjeto: SelectItem[] = [];
  situacoes: any = [];
  projetos: any = [];
  sprints: any = [];
  sprintsFiltradas: any = [];
  lideres: any = [];
  status: any = [];
  testeExibe: boolean;

  lista: any = [];
  // listaFiltrada: any = [];
  listaLideres: SelectItem[] = [];
  listaProjetos: SelectItem[] = [];
  listaCliente: SelectItem[] = [];
  filtroLider: any = [];
  filtroCliente: any = [];
  filtroProjeto: any = [];
  filtroOs: any = [];


  colunas: any[] = [
    { header: 'OS' },
    { header: 'Status da OS' },
    { header: 'Próxima Entrega' },
    { header: 'Prazo' },
    { header: 'PF' },
    { header: 'Fábrica(s)' },
  ];

  colunaSprint: any[] = [
    { header: 'Sprint' },
    { header: 'Início' },
    { header: 'Término' },
    { header: 'PF' },
    { header: 'Impedimento?' },
    { header: 'No Prazo?' },
    { header: 'Status' },
  ];


  listaFiltrada = [
    this.listaLideres,
    this.listaOrdemServico,
    this.listaProjeto
  ];

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
    this.obterStatus();
    this.obterProjetosCliente();
    this.carregarLideres();
    this.carregarCliente();
    this.carregarProjeto();
  }

  obterTodos() {
    // this.blockUI.start();
    this.listaOrdemServico$ = this.ordemServicoService.obterTodos().pipe(
      map(res => {
        res.forEach(item => {
          item.dataProximaEntrega = new Date(`${item.dataProximaEntrega}T00:00:00`);
          item.prazo = new Date(`${item.prazo}T00:00:00`);
        })
        return res;
      }),
      finalize(() => this.blockUI.stop())
    )
  }

  obterProjetos() {
    this.blockUI.start();
    this.projetoService.obterTodos().pipe(
      finalize(() => this.blockUI.stop())
    ).subscribe(
      projetos => this.projetos = projetos
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

  obterSprint() {
    this.blockUI.start();
    this.sprintService.obterTodos().pipe(
      finalize(() => this.blockUI.stop())
    ).subscribe(
      sprints => this.sprints = sprints
    );
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

  obterOsPorProjeto(id) {
    this.blockUI.start();
    this.ordemServicoService.obterPorIdProjeto(id)
      .pipe(
        finalize(() => this.blockUI.stop()),
        tap(console.log)
      ).subscribe(osProjeto => this.listaOsProjeto = osProjeto)
  }

  obterProjetosCliente() {
    this.blockUI.start();
    forkJoin(
        this.projetoService.obterTodos(),
        this.clienteService.obterTodos()
    ).pipe(
        finalize(() => this.blockUI.stop()),
        map(this.mapearClienteProjeto)
    ).subscribe(res => {
        this.lista = res;
        this.listaFiltrada = this.lista;
        this.listaProjetos = res.map(item => {
          return {
              label: item.nome,
              value: item.id
          }
      });
    })
}
// listaFiltrada = listaCompleta.filter(projeto => clientesSelecionados.some(cliente => projeto.idCliente == cliente))

  carregarProjeto(){
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
    ).subscribe(cliente => this.listaCliente = cliente);
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
    console.log(this.listaFiltrada)
  }


  obterNomeStatus(id: number) {
    return this.status.find(status => status.id == id).descricao
  }

  obterNomeLider(id: number) {
    return this.lideres.find(lider => lider.id == id).nome
  }

  obterSituacaoSprint(id: number) {
    return this.sprints.find(sprint => sprint.idOrdemServico == id).prazo
  }

  obterImpedimentoSprint(id: number) {
    return this.sprints.find(sprint => sprint.idOrdemServico == id).impedimento
  }

  obterNomeSituacao(id: number) {
    return this.situacoes.find(situacao => situacao.id == id).descricao
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

//   private mapearClienteProjeto(array) {
//     return array[0].map(projeto => {
//       console.log(projeto.nome)
//       projeto.nome = projeto.descricao;
//       // console.log(projeto.descricao + ' descricao')
//       projeto.descricao = array[1].find(cliente => cliente.id === projeto.idCliente).descricao + ' - ' + projeto.descricao;
//       return projeto;
//     });
// }

private mapearClienteProjeto(array) {
  return array[0].map(projeto => {
    projeto.nome = array[1].find(cliente => cliente.id === projeto.idCliente).descricao + ' - ' + projeto.nome;
    return projeto;
  });
}



}
