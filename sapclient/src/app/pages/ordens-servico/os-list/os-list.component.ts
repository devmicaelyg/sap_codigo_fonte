import { OrdemServico } from './../../../models/ordem-servico.model';
import { MessageService,Table} from 'primeng';
import { Projeto } from './../../../models/projeto.model';
import { SituacaoService } from './../../../services/situacao.service';
import { ProjetoService } from './../../../services/projeto.service';
import { Component, OnInit,ViewChild } from '@angular/core';

import { Observable } from 'rxjs';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { OrdemServicoService } from './../../../services/ordem-servico.service';

import { finalize, map } from 'rxjs/operators';
import {ConfirmationService, SelectItem } from 'primeng/api';
import {Message} from 'primeng/api';


@Component({
  selector: 'app-os-list',
  templateUrl: './os-list.component.html',
  styleUrls: ['./os-list.component.css']
})
export class OsListComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI;
  
  @ViewChild('dt') table: Table;


  titulo: string = 'Lista de Ordens de Serviço'
  listaOrdemServico$: Observable<any>;
  listaOrdemServico: any[]=[];
  situacoes: any = [];
  projetos: any = [];
  status: any = [];
  display: boolean = false;
  projeto: Projeto;
  msgs: Message[] = [];
  projetosSelecionaveis: SelectItem[] = [];
  situacoesSelecionaveis: SelectItem[] = [];
  osFiltradas: OrdemServico[];
  new:OrdemServico[];
  osItemFiltro:any[];
  situacaoItemFiltro:any[];
  ordemServico: any[]=[];
  
  colunas: any = [
    { field: 'nome' , header: 'Nome' },
    { field: 'chave' , header : 'Chave OS'},
    { field: 'proximaEntrega', header: 'Próxima Entrega' },
    { field: 'prazo' , header: 'Prazo' },
    { field: 'qtdDefeitosCliente' , header: 'Defeitos do Cliente' },
    { field: 'qtdDefeitosInterno' , header: 'Defeitos Internos' },
    { field: 'pontosFuncao' , header: 'Pontos de Função' },
    { field: 'fabrica' , header: 'Fábrica' },
    { field: 'idProjeto' , header: 'Projeto' },
    { field: 'idSituacao' , header: 'Situação' },
    { field: 'acoes' , header: 'Ações' },

  ];

  

  constructor(
    private ordemServicoService: OrdemServicoService,
    private projetoService: ProjetoService,
    private situacaoService: SituacaoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.obterSituacoes();
    this.obterProjetos();
    this.obterTodos();
    this.carregarFiltroLider();
    this.carregarFiltroSituacao();
    this.carregarOs();
  }

  obterTodos() {
    this.blockUI.start();
    this.listaOrdemServico$= this.ordemServicoService.obterTodos().pipe(
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

  onDateSelect(value) {
    this.table.filter(this.formatDate(value), 'date', 'equals')
}

formatDate(date) {
    let month = date.getMonth() + 1;
    let day = date.getDate();

    if (month < 10) {
        month = '0' + month;
    }

    if (day < 10) {
        day = '0' + day;
    }

    return date.getFullYear() + '-' + month + '-' + day;
}

  carregarOs() {
    this.blockUI.start();
    this.ordemServicoService.obterTodos().pipe(
      finalize(() => this.blockUI.stop())
    ).subscribe(ordemServico => { 
      this.listaOrdemServico=ordemServico;
      this.osFiltradas =ordemServico;
   
      });
  }


  deletar(id: number) {
    this.blockUI.start();
    this.ordemServicoService.deletar(id).pipe(
      finalize(() => this.blockUI.stop())
    ).subscribe(() =>{
      this.obterTodos()
      this.messageService.add({ severity: 'success', summary: 'Ordem de serviço deletado com sucesso' });
      }, error => {
        this.messageService.add({ severity: 'error', summary: 'Erro ao deletar ordem de serviço' })
      }
    );
  }
  confirm2(id) {
    this.confirmationService.confirm({
        message: 'Você deseja excluir a ordem de serviço?',
        header: 'Confirmação de exclusão',
        icon: 'pi pi-info-circle',
        accept: () => {
            this.msgs = [{severity:'info', summary:'Confirmed', detail:'Ordem de serviço excluída'}];
            this.deletar(id);
        },
        reject: () => {

        },
        key:"confirm"
    });
}

  obterSituacoes() {
    this.blockUI.start();
    this.situacaoService.obterTodos().pipe(
      finalize(() => this.blockUI.stop())
    ).subscribe(
      situacoes => this.situacoes = situacoes
    );
  }

  obterProjetos() {
    this.blockUI.start();
    this.projetoService.obterTodos().pipe(
      finalize(() => this.blockUI.stop())
    ).subscribe(
      projetos => this.projetos = projetos
    );
  }


  obterNomeSituacao(id: number) {
    return this.situacoes.find(situacao => situacao.id == id).descricao
  }

  obterNomeProjeto(id: number) {
    this.projeto=this.projetos.find(projeto => projeto.id == id);
    return this.projeto?.nome
  }
  filtrarPorProjeto(event?){
    this.osItemFiltro = event["value"];
    this.filtrar();  
  }
  filtrarPorSituacao(event?){
    this.situacaoItemFiltro = event["value"];
    this.filtrar();  
  }

  filtrar() {
    this.osFiltradas = this.listaOrdemServico.filter(pf => !!(this.osItemFiltro?.length ? this.osItemFiltro.find(lif => lif === pf.idProjeto ) : true));
    this.osFiltradas = this.osFiltradas.filter(pf => !!(this.situacaoItemFiltro?.length ? this.situacaoItemFiltro.find(lif => lif === pf.idSituacao) : true));
    
  }

  showDialog() {
    this.display = !this.display;
  }
  carregarFiltroLider() {
    this.blockUI.start();
    this.projetoService.obterTodos().pipe(
      finalize(() => this.blockUI.stop())
    ).subscribe(res => {
      this.projetosSelecionaveis = res.map(item => {
        return {
          label: item.nome,
          value: item.id
        }
      })
    })
  }
  carregarFiltroSituacao() {
    this.blockUI.start();
    this.situacaoService.obterTodos().pipe(
      finalize(() => this.blockUI.stop())
    ).subscribe(res => {
      this.situacoesSelecionaveis = res.map(item => {
        return {
          label: item.descricao,
          value: item.id
        }
      })
    })
  }

}
