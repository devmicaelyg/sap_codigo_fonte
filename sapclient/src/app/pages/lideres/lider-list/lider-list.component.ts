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
    colunas: any = [
        { header: 'Nome' },
        { header: 'Contato(s)' },
        { header: 'Ações' },
    ];

  constructor(
      private liderService: LiderService,
      private confirmationService: ConfirmationService,
      private messageService: MessageService
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
    this.liderService.deletar(id).pipe(
        finalize(() => this.blockUI.stop())
    ).subscribe(
        () => this.obterTodos()
    );
    this.messageService.add({ severity: 'info', summary: 'Deletado Com Sucesso!' })
  }

}
