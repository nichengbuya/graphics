import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Command, CommandService } from 'src/app/service/command/command.service';

@Component({
  selector: 'app-logger',
  templateUrl: './logger.component.html',
  styleUrls: ['./logger.component.scss']
})
export class LoggerComponent implements OnInit, OnDestroy {
  undos: Command[];
  redos: Command[];
  subs: Subscription[] = [];
  constructor(
    private commandService: CommandService,

  ) { }

  ngOnInit(): void {
    this.formatData();
    this.subs.push(this.commandService.commandEmit.subscribe(() => {
      this.formatData();
    }));
  }
  ngOnDestroy(){
    this.subs.forEach(s => s.unsubscribe());
  }
  private formatData(){
    this.undos = this.commandService.undos;
    this.redos = this.commandService.redos.slice().reverse();
  }
  public onClick(i){
    this.commandService.selectCommond(i);
  }
}
