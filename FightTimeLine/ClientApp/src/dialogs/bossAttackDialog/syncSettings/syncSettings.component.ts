import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { Observable, of } from "rxjs";
import * as M from "../../../core/Models";
import { NzTreeNodeOptions, NzTreeComponent, NzFormatEmitEvent, NzFormatBeforeDropEvent } from "ng-zorro-antd";

@Component({
  selector: "syncSettings",
  templateUrl: "./syncSettings.component.html",
  styleUrls: ["./syncSettings.component.css"]
})

export class SyncSettingsComponent implements OnInit {

  @Input("data") data: M.IBossAbility;
  @ViewChild("tree") tree: NzTreeComponent;
  settings: any;
  uniqueIndex: number = 0;
  expression: string;

  formatterPercent = (value: number) => `${value || 0} %`;
  parserPercent = (value: string) => value.replace(' %', '');

  get selected(): NzTreeNodeOptions {
    const s = this.tree.getSelectedNodeList();
    if (s)
      return s[0];
    else
      return null;
  }

  convertToNodes(data: M.Combined): NzTreeNodeOptions {
    if (!data) return <NzTreeNodeOptions>{
      title: "AND",
      key: (this.uniqueIndex++).toString(),
      children: [],
      isLeaf: false,
      data: <M.ISyncSettingGroup>{
        operation: M.SyncOperation.And
      },
      expanded: true
    };
    if (M.isSettingGroup(data)) {
      return <NzTreeNodeOptions>{
        title: data.operation.toString().toUpperCase(),
        key: (this.uniqueIndex++).toString(),
        children: data.operands.map(d => this.convertToNodes(d)),
        isLeaf: false,
        data: data,
        expanded: true
      };
    }
    if (M.isSetting(data)) {
      return <NzTreeNodeOptions>{
        title: data.description,
        key: (this.uniqueIndex++).toString(),
        isLeaf: true,
        data: data,
        expanded: true
      };
    }
    return null;
  }

  formatExpression(input: NzTreeNodeOptions): string {
    let result: string = "";
    if (input) {
      if (!input.isLeaf) {
        if (!input.children || input.children.length === 0)
          result = "";
        else {
          result = input.children.map(c => this.formatExpression(c)).filter(a => !!a).join(" " + input.title + " ");
          if (input.children.length > 1) {
            result = "(" + result + ")";
          }
        }
      } else {
        result = input.title;
      }
    }
    return result;
  }

  updateExpression() {
    this.expression = this.formatExpression(this.tree.getTreeNodes()[0]);
  }

  ngOnInit() {
    this.settings = [this.convertToNodes(this.data.syncSettings && JSON.parse(this.data.syncSettings))];
    setTimeout(() => this.updateExpression());
  }

  updateResult(): void {

    this.data.syncSettings = JSON.stringify(this.buildSyncSettings());
    console.log(this.data.syncSettings);
  }

  addAnd() {
    const selected = this.selected;
    if (selected) {
      const index = this.uniqueIndex++;
      selected.addChildren([<NzTreeNodeOptions>{
        title: "AND",
        key: (index).toString(),
        isLeaf: false,
        data: <M.ISyncSettingGroup>{
          operation: M.SyncOperation.And,
          operands: []
        },
        expanded: true
      }]);
      this.updateExpression();
    }
  }

  addOr() {
    const selected = this.selected;
    if (selected) {
      const index = this.uniqueIndex++;
      selected.addChildren([<NzTreeNodeOptions>{
        title: "OR",
        key: (index).toString(),
        isLeaf: false,
        data: <M.ISyncSettingGroup>{
          operation: M.SyncOperation.Or,
          operands: []
        },
        expanded: true
      }]);
      this.updateExpression();
    }
  }

  addCondition() {
    const selected = this.selected;
    if (selected) {
      const index = this.uniqueIndex++;
      selected.addChildren([<NzTreeNodeOptions>{
        title: "Condition " + index,
        key: (index).toString(),
        isLeaf: true,
        data: <M.ISyncSetting>{
          description: "Condition " + index,
          type: "name",
          payload: {

          }
        },
        expanded: true
      }]);
      this.updateExpression();
    }
  }

  remove() {
    const selected = this.selected;
    if (selected && selected.getParentNode()) {
      selected.remove();
      this.updateExpression();
    }
  }

  nzDrop(event: NzFormatEmitEvent) {
    this.updateExpression();
  }

  beforeDrop(arg: NzFormatBeforeDropEvent): Observable<boolean> {
    if (!arg.node.getParentNode() && (arg.pos === -1 || arg.pos === 1))
      return of(false);
    return of(true);
  }

  typeChange() {
    const selected = this.selected;
    if (selected) {
      selected.title = selected.origin.data.operation.toString().toUpperCase();
      selected.origin.title = selected.origin.data.operation.toString().toUpperCase();
      this.updateExpression();
    }
  }

  buildSyncSettings(): string {
    const root = this.tree.getTreeNodes()[0];
    if (root.children.length === 0)
      return null;
    return JSON.stringify(this.build(root));
  }

  build(node: NzTreeNodeOptions): M.Combined {
    if (node.isLeaf) {
      const data = node.origin.data as M.ISyncSetting;
      data.description = node.title;
      return data;
    } else {
      const r = node.origin.data as M.ISyncSettingGroup;
      r.operands = node.children.map(c => this.build(c));
      return r;
    }
  }

  simplify() {
    const root = this.tree.getTreeNodes()[0];
    if (root.children.length === 0)
      return null;
    this.simplifyNode(root, null);
  }

  simplifyNode(node: NzTreeNodeOptions, parent: NzTreeNodeOptions): M.Combined {
    if (node.isLeaf) {
    } else {
      const r = node.origin.data as M.ISyncSettingGroup;
      if (parent && parent.title === node.title) {
        node.children.forEach(n => {
          parent.children.push(n);
        });
      }
      
      return r;
    }
  }
}

