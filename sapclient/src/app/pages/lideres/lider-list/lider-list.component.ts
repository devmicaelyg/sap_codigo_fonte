import { ProjetoService } from './../../../services/projeto.service';
import { Projeto } from './../../../models/projeto.model';
import { Component, OnInit } from '@angular/core';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import {ConfirmationService} from 'primeng/api';

import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { MessageService, SelectItem } from 'primeng';

import {Message} from 'primeng/api';
import { LiderService } from './../../../services/lider.service';
import { Lider } from 'src/app/models/lider.model';

@Component({
  selector: 'app-lider-list',
  templateUrl: './lider-list.component.html',
  styleUrls: ['./lider-list.component.css']
})

export class LiderListComponent implements OnInit {
    titulo: string = 'Lista de líderes';
    @BlockUI() blockUI: NgBlockUI;

    lista: any = [];
    filtroLider: any = [];
    filtroCliente: any = [];
    liderItensFiltro: any [] = [];
    lideres: Lider [] = [];
    lideresFiltrados: any = [];

    listaLideres$: Observable<any>;
    listaLideres: SelectItem[];
    msgs: Message[] = [];
    projetos  : Projeto;
    projetosFiltrados: Projeto[]=[];
    id : any;

    colunas: any = [
        { header: 'Nome', field:'nome', sort:'nome' },
        { header: 'Contato(s)', field:'contato', sort:'contato' },
        { header: 'Ações' },
    ];

  constructor(
      private liderService: LiderService,
      private confirmationService: ConfirmationService,
      private messageService: MessageService,
      private projetoservice : ProjetoService
      ) { }
  ngOnInit(): void {
      this.obterTodos();
      this.obterTodosProjetos();
      this.carregarLideres();
  }
  
  obterTodos() {
    this.blockUI.start();
    this.listaLideres$ = this.liderService.obterTodos().pipe(
        finalize(() => this.blockUI.stop())
    )
  }
  
  obterTodosProjetos(){
    this.blockUI.start();
    this.projetoservice.obterTodos().pipe(
      finalize(() => this.blockUI.stop())
    ).subscribe(
      projetos => {
        this.projetos = projetos;
        this.projetosFiltrados = projetos;
      }
    );
  }

  obterLider() {
    this.blockUI.start();
    this.liderService.obterTodos().pipe(
      finalize(() => this.blockUI.stop())
    ).subscribe(
      lideres => {
        this.lideres = lideres;
      }
    );
  }

  deletar(id: number) {
    
    this.projetos=this.projetosFiltrados.find(projeto=>projeto.idLider==id)
    if(this.projetos?.idLider==id){
      this.messageService.add({ severity: 'error', summary: 'Erro ao Deletar,Existem projetos vinculadas ao lider' })
    } else if(this.projetos==undefined){
      this.liderService.deletar(id).pipe(
        finalize(() => this.blockUI.stop())
    ).subscribe(() => {
      this.obterTodos()
      this.messageService.add({ severity: 'success', summary: 'Lider deletado com sucesso' });
    }, error => {
      this.messageService.add({ severity: 'error', summary: 'Erro ao deletar lider. Existem projetos vinculados a ele.' })
    }
    );
    }
  }
  
  confirm2(id) {
    this.confirmationService.confirm({
        message: 'Você deseja excluir o Lider?',
        header: 'Confirmação de exclusão',
        icon: 'pi pi-info-circle',
        accept: () => {
            this.msgs = [{severity:'info', summary:'Confirmed', detail:'Lider excluído'}];
            this.deletar(id);
        },
        reject: () => {
        },
        key:"confirm"
    });
}

private deletadoSucesso(id) {
  this.liderService.deletar(id).pipe(
    finalize(() => this.blockUI.stop())
  ).subscribe(
    () => this.obterTodos()
  );
  this.messageService.add({ severity: 'info', summary: 'Deletado Com Sucesso!' })
}

carregarLideres() {
  this.blockUI.start();
  this.liderService.obterTodos().pipe(
    finalize(() => this.blockUI.stop()),
    map(this.converterDropDownLider)
  ).subscribe(lider => {
    this.listaLideres = lider;
    this.lideresFiltrados = this.listaLideres;
    console.log(this.lideresFiltrados)
  });
}

private converterDropDownLider(lista) {
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

// preencherFiltros() {
//   this.listaFiltrada = this.lista.filter(item => {
//       if (!this.filtroLider.length) {
//           return true;
//       }
//       return (this.filtroLider && this.filtroLider.some(sel => sel == item.idLider))
//   });
// }

filtrar(){
  this.lideresFiltrados = this.lideres.filter(pf => !!(this.liderItensFiltro.length ? this.liderItensFiltro.find(lif => lif === pf.id) : true));
}

}
