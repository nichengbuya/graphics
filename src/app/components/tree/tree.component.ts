import {
  AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges,
  ViewChild, ViewChildren
} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss']
})
export class TreeComponent implements OnInit, OnChanges {

  @Input() rawData: any = [];            // 原始绑定数据：树状结构
  @Input() isRoot = true;     // 是否是根节点
  @Input() treeData: any = [];           // 当前绑定数据：树状结构
  @Input() collapse: boolean;            // 是否展开子节点
  @Output() onNodeSelect = new EventEmitter<any>();  // 选择节点事件

  @ViewChildren('childTree') childTree: QueryList<TreeComponent>;

  constructor() {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.treeData){
      if (this.isRoot){
        this.rawData = changes.treeData.currentValue;
      }
    }
  }

  ngOnInit() {
  }
  select(node){
    node.expand = !node.expand;
    this.rawData.forEach( item => {
      this.setChildrenActive(item);
    });
    node.active = true;
    this.onNodeSelect.emit(node);
  }
  setChildrenActive(node){
    node.active = false;
    if (node.children){
      node.children.forEach( item => {
        this.setChildrenActive(item);
      });
    }
  }

}
