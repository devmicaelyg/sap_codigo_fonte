import { Lider } from './../../../models/lider.model';
import { Cliente } from './../../../models/cliente.model';
import { OrdemServicoService } from './../../../services/ordem-servico.service';
import { Projeto } from 'src/app/models/projeto.model';
import { MessageService } from 'primeng';
import { LiderService } from './../../../services/lider.service';
import { ClienteService } from './../../../services/cliente.service';
import { Component, OnInit } from '@angular/core';

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
  listaProjetos: any[] = [];

  listaClientes: any[] = [];
  listaLideres: any[] = [];
  projeto: Projeto;

  cliente: Cliente;
  lider: Lider;



  colunas: any = [
    { field: 'nome', header: 'Nome' },
    { field: 'cliente', header: 'Cliente' },
    { field: 'lider', header: 'Lider' },
    { field: 'testador', header: 'Testador' },
    { field: 'revisor', header: 'Revisor' },
    { field: 'gerente', header: 'Gerente' },
    { field: 'ações', header: 'Ações' }
  ];
  constructor(
    private projetoService: ProjetoService,
    private clienteService: ClienteService,
    private liderService: LiderService,
    private messageService: MessageService,
    private ordemServicoService: OrdemServicoService
  ) { }

  ngOnInit(): void {
    this.listarClientes();
    this.listarLideres();
    this.obterTodos();
  }

  obterTodos() {
    this.blockUI.start();
    this.listaProjetos$ = this.projetoService.obterTodos().pipe(
      finalize(() => this.blockUI.stop())
    )
  }

  // deletar(id: number) {
  //   this.blockUI.start();
  //   this.projetoService.deletar(id).pipe(
  //     finalize(() => this.blockUI.stop())
  //   ).subscribe(
  //     () => {this.obterTodos()
  //       this.messageService.add({ severity: 'success', summary: 'Projeto deletado com sucesso' }); 
  //     }
  //   );
  // }

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
    return this.cliente?.descricao;
  }

  filtrarLiderPorId(id: number) {
    this.lider = this.listaLideres.find(lider => lider.id == id);
    return this.lider?.nome
  }



  private deletadoSucesso(id) {
    this.projetoService.deletar(id).pipe(
      finalize(() => this.blockUI.stop())
    ).subscribe(
      () => this.obterTodos()
    );
    this.messageService.add({ severity: 'info', summary: 'Deletado Com Sucesso!' })
  }
}
