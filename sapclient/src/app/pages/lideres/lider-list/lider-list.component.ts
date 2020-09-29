import { ProjetoService } from './../../../services/projeto.service';
import { Component, OnInit } from '@angular/core';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ConfirmationService} from 'primeng/api';


import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { SelectItem ,MessageService } from 'primeng';

import {Message} from 'primeng/api';
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
    msgs: Message[] = [];
    colunas: any = [
        { header: 'Nome' },
        { header: 'Contato(s)' },
        { header: 'Ações' },
    ];

  constructor(
      private liderService: LiderService,
      private confirmationService: ConfirmationService,
      private messageService: MessageService,
      private projetoService: ProjetoService
      ) { }
  ngOnInit(): void {
      this.obterTodos();
  }
  
  obterTodos() {
    this.blockUI.start();
    this.listaLideres$ = this.liderService.obterTodos().pipe(
        finalize(() => this.blockUI.stop())
    )
  }

  deletar(id: number) {
    this.blockUI.start();
    this.projetoService.obterPorLider(id)
    .pipe(
        finalize(() => this.blockUI.stop()),
    ).subscribe(resultado => {
      if (resultado.length != 0) {
        this.messageService.add({ severity: 'error', summary: 'Erro ao deletar! Existem OS vinculadas ao projeto' });
      } else {
        this.deletadoSucesso(id);
        
      }
      console.log(resultado);
    });}
  
  // deletar(id: number) {
  //   this.blockUI.start();
  //   this.projetoService.obterPorLider(id)
  //     .pipe(
  //       finalize(() => this.blockUI.stop()),
  //     ).subscribe(resultado => {
  //       if (resultado.length != 0) {
  //         this.messageService.add({ severity: 'error', summary: 'Erro ao deletar! Existem OS vinculadas ao projeto' });
  //       } else {
  //         this.deletadoSucesso(id);
  //       }
  //     });

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
  this.projetoService.obterPorLider(id).pipe(
    finalize(() => this.blockUI.stop())
  ).subscribe(
    () => this.obterTodos()
  );
  this.messageService.add({ severity: 'info', summary: 'Deletado Com Sucesso!' })
}
}
