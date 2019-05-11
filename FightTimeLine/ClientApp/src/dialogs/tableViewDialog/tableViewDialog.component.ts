import { Component, Inject, Input, TemplateRef, ViewChild, OnInit } from "@angular/core";
import { IExportResultSet } from "../../core/BaseExportTemplate"
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms"
import { FirstTemplate } from "../../core/ExportTemplates/FirstTemplate"
import { EachRowOneSecondTemplate } from "../../core/ExportTemplates/EachRowOneSecondTemplate"
import { BossAttackDefensiveTemplate } from "../../core/ExportTemplates/BossAttackDefensiveTemplate"
import { ExportTemplate, ExportData } from "../../core/BaseExportTemplate"
import { NzModalRef } from "ng-zorro-antd"


@Component({
  selector: "tableViewDialog",
  templateUrl: "./tableViewDialog.component.html",
  styleUrls: ["./tableViewDialog.component.css"]
})

export class TableViewDialog implements OnInit {

  ngOnInit() {
  }

  @Input("data") data: ExportData;

  public exportTemplatesControl = new FormControl();
  public set: IExportResultSet;
  templates: ExportTemplate[] = [new FirstTemplate(), new EachRowOneSecondTemplate(), new BossAttackDefensiveTemplate()];

  constructor(
    public dialogRef: NzModalRef
  ) { }

  show() {
    if (!this.exportTemplatesControl.value) return;
    const d = this.templates.find(it => it.name === this.exportTemplatesControl.value).build(this.data);
    this.set = d;
  }

  getWidth(text: string, hasIcon) {
    if (hasIcon)
      return "170px";
    switch (text) {
      case "time":
        return "48px";
      case "target":
        return "90px";
    }
    return "";
  }

  onNoClick(): void {
    this.dialogRef.destroy();
  }
}
