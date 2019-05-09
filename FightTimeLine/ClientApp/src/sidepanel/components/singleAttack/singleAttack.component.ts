import { Component, OnInit, OnDestroy } from "@angular/core";
import { ISidePanelComponent } from "../ISidePanelComponent"
import * as M from "../../../core/Models"
import * as H from "../../../core/DataHolders"
import * as S from "../../../services/index"
import { Utils } from "../../../core/Utils"

@Component({
  selector: "singleAttack",
  templateUrl: "./singleAttack.component.html",
  styleUrls: ["./singleAttack.component.css"],
})
export class SingleAttackComponent implements OnInit, OnDestroy, ISidePanelComponent {

  defs: any[] = null;
  similar: any[] = null;

  items: any[];
  holders: H.Holders;

  constructor(private dispatcher: S.DispatcherService) {

  }

  get it(): H.BossAttackMap {
    return this.items[0];
  }

  getType(id: number): string {
    return M.DamageType[id];
  }

  setItems(items: any[], holders: H.Holders): void {
    this.items = items;
    this.holders = holders;
    this.defs = this.calculateDefs();
    this.similar = this.holders.bossAttacks.filter(it => it.attack.name === this.it.attack.name && it.id !== this.it.id);
    
    
  }

  calculateDefs() {
    const bossAttackItems = this.holders.bossAttacks.get(this.it.id);

    const defAbilities = this.holders.itemUsages.filter((it) => {
      const ab = it.ability;
      return ab.isDef;
    });

    const intersected = defAbilities.filter((it) => {
      const end = new Date(it.startAsNumber + it.calculatedDuration * 1000);
      return it.start <= bossAttackItems.start && end >= bossAttackItems.start;
    });

    const values = intersected.map((it) => {
      const jobMap = it.ability.job;
      return { jobId: jobMap.id, jobName: jobMap.job.name, ability: it.ability.ability, id: it.id };
    });

    const grouped = Utils.groupBy(values, x => x.jobId);

    return Object.keys(grouped).map((value) => {
      return {
        job: this.holders.jobs.get(value).job,
        abilities: grouped[value]
      };
    }).sort((a, b) => a.job.role - b.job.role);

  }

  similarClick(attack: H.BossAttackMap) {
    this.dispatcher.dispatch({
      name: "SidePanel Similar Click",
      payload: attack.id
    });
  }

  similarAllClick() {
    this.dispatcher.dispatch({
      name: "SidePanel Similar All Click",
      payload: this.similar.map(it => it.id).concat([this.it.id])
    });
  }

  defenseClick(val: any) {
    this.dispatcher.dispatch({
      name: "SidePanel Defense Click",
      payload: val.id
    });
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }

}
