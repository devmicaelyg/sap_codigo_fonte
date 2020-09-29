import { ProjetoService } from './../../../services/projeto.service';
import { Projeto } from './../../../models/projeto.model';
import { Component, OnInit } from '@angular/core';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ConfirmationService} from 'primeng/api';


import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { SelectItem ,MessageService } from 'primeng';


import { LiderService } from './../../../services/lider.service';

@Component({
  selector: 'app-lider-list',
  templateUrl: './lider-list.component.html',
  styleUrls: ['./lider-list.component.css']
})

export class LiderListComponent implements OnInit {
    titulo: string = 'Lista de líderes';
    @BlockUI() blockUI: NgBlockUI;
    listaLideres$: Observable<any>;
    listaLideres: any = [];
    projetos  : Projeto;
    projetosFiltrados: Projeto[]=[];
    id : any;

    colunas: any = [
        { header: 'Nome' },
        { header: 'Contato(s)' },
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

  deletar(id: number) {
    
    this.projetos=this.projetosFiltrados.find(projeto=>projeto.idLider==id)
    if(this.projetos?.idLider==id){
      this.messageService.add({ severity: 'error', summary: 'Erro ao Deletar,Existem projetos vinculadas ao lider' })
    } else if(this.projetos==undefined){
      this.liderService.deletar(id).pipe(
        finalize(() => this.blockUI.stop())
    ).subscribe(
        () => this.obterTodos()
    );
    this.messageService.add({ severity: 'info', summary: 'Deletado Com Sucesso!' })
    }
  }

}
