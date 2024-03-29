import * as Jobregistryserviceinterface from "./jobregistry.service-interface";
import * as Models from "../core/Models";
import * as Shared from "../core/Jobs/FFXIV/shared";
import * as Index from "../core/Jobs/SWTOR/index";

export class SWTORJobRegistryService implements Jobregistryserviceinterface.IJobRegistryService {
  private jobs: Models.IJob[];


  public getJobs(): Models.IJob[] {
    return this.jobs = (this.jobs = [
      Index.Sith_Assassin_Darkness,
      Index.Sith_Assassin_Deception,
      Index.Sith_Assassin_Hatred,
      Index.Sith_Juggernaut_Immortal,
      Index.Sith_Juggernaut_Rage,
      Index.Sith_Juggernaut_Vengeance,
      Index.Powertech_ShieldTech,
      Index.Powertech_AdvancedPrototype,
      Index.Powertech_Pyrotech,
      Index.Mercenary_Arsenal,
      Index.Mercenary_Bodyguard,
      Index.Mercenary_InnovativeOrdnance,
      Index.Operative_Concealment,
      Index.Operative_Lethality,
      Index.Operative_Medicine,
      Index.Sith_Marauder_Annihilation,
      Index.Sith_Marauder_Carnage,
      Index.Sith_Marauder_Fury,
      Index.Sith_Sorcerer_Lightning,
      Index.Sith_Sorcerer_Corruption,
      Index.Sith_Sorcerer_Madness,
      Index.Sniper_Engineering,
      Index.Sniper_Marksmanship,
      Index.Sniper_Virulence
    ].map(j => this.build(j)));
  }

  private build(job: Models.IJob): Models.IJob {
    return <Models.IJob>{
      name: job.name,
      icon: this.getIcon(job.icon),
      defaultPet: job.defaultPet,
      baseClass: job.baseClass,
      role: job.role,
      fraction: job.fraction,
      abilities: job.abilities.map(a => this.buildAbility(a)).sort(Shared.abilitySortFn)
    };
  }

  private getIcon(id: string) {
    return `/assets/swtor/images/${id}${id.endsWith(".jpg") || id.endsWith(".png")?"":".jpg"}`;
  }

  private buildAbility(a: Models.IAbility): Models.IAbility {
    return <Models.IAbility>{
      name: a.name,
      abilityType: a.abilityType,
      cooldown: a.cooldown,
      duration: a.duration,
      icon: this.getIcon(a.icon),
      requiresBossTarget: a.requiresBossTarget,
      extendDurationOnNextAbility: a.extendDurationOnNextAbility,
      relatedAbilities: a.relatedAbilities,
      settings: a.settings,
      detectStrategy: a.detectStrategy || Models.byName([a.xivDbId], [a.name]),
      overlapStrategy: a.overlapStrategy || new Models.BaseOverlapStrategy()
    }
  }

  getJob(jobName: string): Models.IJob {
    const job = this.jobs.find((j: Models.IJob) => j.name === jobName) as Models.IJob;
    return job;
  }

  getAbilityForJob(jobName: string, abilityName: string): Models.IAbility {
    const job = this.getJob(jobName);
    return job.abilities.find((a: Models.IAbility) => a.name === abilityName) as Models.IAbility;
  }

  getStanceAbilityForJob(jobName: string, abilityName: string): Models.IAbility {
    const job = this.getJob(jobName);
    return job.stances.find((a: Models.IStance) => a.ability.name === abilityName).ability as Models.IAbility;
  }
}


