import { Directive, HostListener, ElementRef, Renderer2, Input, Output, EventEmitter  } from '@angular/core';
import { DragDropService, DragData } from '../drag-drop.service';
import { take } from 'rxjs/operators';

@Directive({
  selector: '[app-droppable][dropTags]'
})
export class DropDirective {
  private _isDroppable = false;
  private dragEnterClass: string;
  @Input('app-droppable')
  set isDraggable(value: boolean){
    this._isDroppable = value;
    this.rd.setAttribute(this.el.nativeElement, 'draggable', `${value}`);
  }
  get isDraggable(){
    return this._isDroppable;
  }
  @Input()
  dropTags: string[] = [];
  @Output()
  dropped = new EventEmitter<DragData>();
  private data;
  constructor(
    private el: ElementRef,
    private rd: Renderer2,
    private service: DragDropService
  ){
    this.data = this.service.getDragData().pipe( take(1));
  }
  @HostListener('dragenter', ['$event'])
  onDragEnter(ev: DragEvent){
    if (this.el.nativeElement === ev.target){

      this.data.subscribe(dragData => {
        if (this.dropTags.indexOf(dragData.tag) > -1){
          this.dragEnterClass = ev.offsetY > this.el.nativeElement.clientHeight / 2 ? 'drag-over-gap-bottom' : 'drag-over-gap-top';
          this.rd.addClass(this.el.nativeElement, this.dragEnterClass); // 往el上增加一个class
        }
      });
    }
  }
  @HostListener('dragover', ['$event'])
  onDragOver(ev: DragEvent){
    ev.preventDefault();
    ev.stopPropagation();
    if (this.el.nativeElement === ev.target){
      this.data.subscribe(dragData => {
        if (this.dropTags.indexOf(dragData.tag) > -1){
          this.rd.removeClass(this.el.nativeElement, this.dragEnterClass);
          this.dragEnterClass = ev.offsetY > this.el.nativeElement.clientHeight / 2 ? 'drag-over-gap-bottom' : 'drag-over-gap-top';
          this.rd.addClass(this.el.nativeElement, this.dragEnterClass);
          this.rd.setProperty(ev, 'dataTransfer.effectAllowed', 'all');
          this.rd.setProperty(ev, 'dataTransfer.fropEffect', 'move');
        }else{
          this.rd.setProperty(ev, 'dataTransfer.effectAllowed', 'none');
          this.rd.setProperty(ev, 'dataTransfer.dropEffect', 'none');
        }
      });
    }
  }
  @HostListener('dragleave', ['$event'])
  onDragLeave(ev: Event){
    ev.preventDefault();
    ev.stopPropagation();
    if (this.el.nativeElement === ev.target){
      this.data.subscribe(dragData => {
        if (this.dropTags.indexOf(dragData.tag) > -1){
          this.rd.removeClass(this.el.nativeElement, this.dragEnterClass);
        }
      });
    }
  }
  @HostListener('drop', ['$event'])
  onDrop(ev: DragEvent){
    if (this.el.nativeElement === ev.target){
      this.data.subscribe(dragData => {
        if (this.dropTags.indexOf(dragData.tag) > -1){
          this.rd.removeClass(this.el.nativeElement, this.dragEnterClass);
          dragData.top = ev.offsetY > this.el.nativeElement.clientHeight / 2 ? false : true;
          this.dropped.emit(dragData); // drop的时候把dragData发射出去
          this.service.clearDragData(); // drop的时候把data clear掉，否则会影响下一次拖拽
        }
      });
    }
  }
}
