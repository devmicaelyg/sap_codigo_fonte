import { Lider } from './../../../models/lider.model';
import { Cliente } from './../../../models/cliente.model';
import { OrdemServicoService } from './../../../services/ordem-servico.service';
import { Projeto } from 'src/app/models/projeto.model';
import { MessageService, Table, SelectItem } from 'primeng';
import { LiderService } from './../../../services/lider.service';
import { ClienteService } from './../../../services/cliente.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService} from 'primeng/api';
import { Message } from 'primeng/api';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ProjetoService } from '../../../services/projeto.service';

@Component({
  selector: 'app-projeto-list',
  templateUrl: './projeto-list.component.html',
  styleUrls: ['./projeto-list.component.css']
})

export class ProjetoListComponent implements OnInit {

  titulo: string = 'Lista de projetos';
  @BlockUI() blockUI: NgBlockUI;
  listaProjetos$: Observable<any>;
  msgs: Message[] = [];

  listaProjetos: any[] = [];
  projetosFiltrados: Projeto[] = [];
  
  clientesFiltrados: Cliente[] = [];
  lideresFiltrados: Lider[] = [];
  projetosSelecionaveis: Projeto[] = [];
  
  listaClientes: any[] = [];
  listaLideres: any[] = [];
  cliente: Cliente;
  lider: Lider;
  projeto: any[];

  @ViewChild('dt') table: Table;

  clienteItensFiltro: any[];
  clientesSelecionaveis: SelectItem[] = [];

  liderItensFiltro: any[];
  lideresSelecionaveis: SelectItem[] = [];
  projetoItensFiltro: any[] = [];

  colunas: any = [
    { field: 'nome', header: 'Nome' },
    { field: 'cliente', header: 'Cliente' },
    { field: 'lider', header: 'Líder' },
    { field: 'testador', header: 'Testador' },
    { field: 'revisor', header: 'Revisor' },
    { field: 'gerente', header: 'Gerente' },
    { field: 'a��es', header: 'Ações' }
  ];
  constructor(
    private projetoService: ProjetoService,
    private clienteService: ClienteService,
    private liderService: LiderService,
    private messageService: MessageService,
    private ordemServicoService: OrdemServicoService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.listarClientes();
    this.listarLideres();
    this.obterTodos();
    this.carregarProjetos();
    this.carregarFiltroCliente();
    this.carregarFiltroLider();
    this.carregarFiltroProjeto();
  }

  obterTodos() {
    this.blockUI.start();
    this.listaProjetos$ = this.projetoService.obterTodos().pipe(
      finalize(() => this.blockUI.stop())
    )
  }

  carregarProjetos() {
    this.blockUI.start();
    this.projetoService.obterTodos().pipe(
      finalize(() => this.blockUI.stop())
    ).subscribe(projeto => { 
      this.listaProjetos = projeto
      this.projetosFiltrados = this.listaProjetos;
      
    });
  }

  deletar(id: number) {
    this.blockUI.start();
    this.ordemServicoService.obterPorIdProjeto(id)
      .pipe(
        finalize(() => this.blockUI.stop()),
      ).subscribe(resultado => {
        if (resultado.length != 0) {
          this.messageService.add({ severity: 'error', summary: 'Erro ao deletar! Existem OS vinculadas ao projeto' });
        } else {
          this.deletadoSucesso(id);
        }
      });
  }

  confirm2(id) {
    this.confirmationService.confirm({
      message: 'Você deseja excluir o Projeto?',
      header: 'Confirmação de exclusão',
      icon: 'pi pi-info-circle',
      accept: () => {
        this.msgs = [{ severity: 'info', summary: 'Confirmed', detail: 'Projeto excluído' }];
        this.deletar(id);
      },
      reject: () => {

      },
      key: "confirm"
    });
  }

  listarLideres() {
    this.blockUI.start();
    this.liderService.obterTodos().pipe(
      finalize(() => this.blockUI.stop())
    ).subscribe(lideres => this.listaLideres = lideres);
  }

  listarClientes() {
    this.blockUI.start();
    this.clienteService.obterTodos().pipe(
      finalize(() => this.blockUI.stop())
    ).subscribe(clientes => this.listaClientes = clientes);
  }

  filtrarClientePorId(id: number) {
    this.cliente = this.listaClientes.find(cliente => cliente.id == id);
    return this.cliente;
  }

  filtrarLiderPorId(id: number) {
    this.lider = this.listaLideres.find(lider => lider.id == id);
    return this.lider;
  }
  

  private deletadoSucesso(id) {
    this.projetoService.deletar(id).pipe(
      finalize(() => this.blockUI.stop())
    ).subscribe(
      () => this.obterTodos()
    );
    this.messageService.add({ severity: 'info', summary: 'Deletado Com Sucesso!' })
  }

  filtrar(){
    console.log("Olhe aqui:" + this.listaProjetos, this.liderItensFiltro + "Mosquitos");
    this.projetosFiltrados = this.listaProjetos.filter(pf => !!(this.projetoItensFiltro?.length ? this.projetoItensFiltro.find(lif => lif === pf.id) : true));
    this.projetosFiltrados = this.projetosFiltrados.filter(pf => !!(this.liderItensFiltro?.length ? this.liderItensFiltro.find(lif => lif === pf.idLider) : true));
    this.projetosFiltrados = this.projetosFiltrados.filter(pf => !!(this.clienteItensFiltro?.length ? this.clienteItensFiltro.find(lif => lif === pf.idCliente) : true));
  }

  prepararFiltroProjeto(event){
    this.projetoItensFiltro = event["value"];
    this.filtrar();
  }

  prepararFiltroCliente(event){
    this.clienteItensFiltro = event["value"];
    this.filtrar();
  }

  prepararFiltroLider(event){
    this.liderItensFiltro = event["value"];
    this.filtrar();
  }

  carregarFiltroCliente() {
    this.blockUI.start();
    this.clienteService.obterTodos().pipe(
      finalize(() => this.blockUI.stop())
    ).subscribe(res => {
      this.clientesSelecionaveis = res.map(item => {
        return {
          label: item.descricao,
          value: item.id
        }
        
      })
    })
  }

  carregarFiltroProjeto() {
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

  carregarFiltroLider() {
    this.blockUI.start();
    this.liderService.obterTodos().pipe(
      finalize(() => this.blockUI.stop())
    ).subscribe(res => {
      this.lideresSelecionaveis = res.map(item => {
        return {
          label: item.nome,
          value: item.id
        }
      })
    })
  }

}
