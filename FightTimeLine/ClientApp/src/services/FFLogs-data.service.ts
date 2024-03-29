import { HttpClient } from "@angular/common/http"
import { tap, debounceTime, flatMap, map, merge, concatMap } from "rxjs/operators";
import { Observable, of } from "rxjs"
import { SettingsService } from "./SettingsService"
import { LocalStorageService } from "./LocalStorageService"
import "rxjs/add/observable/from";
import "rxjs/add/observable/of";
import { Event, ReportEventsResponse, ReportFightsResponse, IJobInfo, Events, Zone, ReportFightsResponse as IReportFightsResponse,
  ReportEventsResponse as IReportEventsResponse,
  ReportFightsResponse as IReportFightsResponse1,
  IJobInfo as IJobInfo1,
} from "../core/FFLogs"
import * as _ from "lodash"
import * as Dataserviceinterface from "./data.service-interface";
import * as Jobregistryserviceinterface from "./jobregistry.service-interface";

export class FFLogsService implements Dataserviceinterface.IDataService {

  constructor(
    private jobRegistry: Jobregistryserviceinterface.IJobRegistryService,
    private httpClient: HttpClient,
    //@Inject("FFLogs_URL")
    private fflogsUrl: string,
    //@Inject("FFLogs_API_KEY")
    private apiKey: string,
    private settings: SettingsService,
    private storage: LocalStorageService) {

  }

  async getFight(code: string): Promise<IReportFightsResponse> {

    const cache = this.storage.getObject<ICacheItem[]>("fights_cache");
    if (cache) {
      const item = cache.find(it => it.key === code);
      if (item) {
        item.timestamp = new Date();
        return Promise.resolve(item.data);
      }
    }

    return this.httpClient.get(this.fflogsUrl + "v1/report/fights/" + code + "?translate=true&api_key=" + this.apiKey).pipe(
      tap((val: ReportFightsResponse) => {
        const fcache = this.storage.getObject<ICacheItem[]>("fights_cache") || [];
        const item = { key: code, timestamp: new Date(), data: val };
        fcache.push(item);
        if (fcache.length > 15)
          fcache.splice(0, fcache.length - 15);
        this.storage.setObject("fights_cache", fcache);
      })).toPromise();
  }

  private loadFightChunk(code: string, instance: number, start: number, end: number, filter: string): Observable<ReportEventsResponse> {
    return this.httpClient.get<ReportEventsResponse>(`${this.fflogsUrl}v1/report/events/${code}?translate=true&api_key=${this.apiKey}&start=${start}&end=${end}&actorinstance=${instance}&filter=${filter}`).pipe(tap(() => { }));
  }

  async getEvents(code: string, instance: number, callBack: (percentage: number) => void): Promise<Events> {

    let cache = this.storage.getObject<ICacheItem[]>("events_cache");
    if (cache) {
      const item = cache.find(it => it.key === code + instance);
      if (item) {
        item.timestamp = new Date();
        return Promise.resolve(item.data);
      }
    }

    const fight = await this.getFight(code);

    const foundFight = fight.fights.find((it: any) => it.id === instance);
    if (!foundFight) return Promise.resolve(null);

    const jobs =
      fight.friendlies
        .filter((it) => it.fights.some(((it1) => it1.id === instance) as any))
        .map((it) => {
          const ji = this.mapJob(it.type);
          return <IJobInfo>{
            id: [it.id, ...fight.friendlyPets.filter((it1) => it1.petOwner === it.id).map((it1) => it1.id)],
            job: ji && ji.jobName,
            actorName: it.name.substring(0, 16),
            role: ji && ji.order,
            guid: [it.guid, ...fight.friendlyPets.filter((it1) => it1.petOwner === it.id).map((it1) => it1.guid)]
          };
        })
        .filter((it) => it.job != null);

    const filter = this.createFilter(fight, jobs);
    const events: Event[] = [];
    let a: ReportEventsResponse = null;
    do {
      a = await this
        .loadFightChunk(code, instance, (a && a.nextPageTimestamp) || foundFight.start_time, foundFight.end_time, filter)
        .pipe(debounceTime(500))
        .toPromise()
        .then((value: ReportEventsResponse) => value);
      const percentage = ((a.nextPageTimestamp || foundFight.end_time) - foundFight.start_time) / (foundFight.end_time - foundFight.start_time);
      events.push(...a.events);
      callBack(percentage);
    } while (a && a.nextPageTimestamp);

    const result = { events: events, jobs: jobs, start_time: foundFight.start_time, name: foundFight.zoneName + " " + foundFight.name };

    cache = cache || [];
    const item = { key: code + instance, timestamp: new Date(), data: result };
    cache.push(item);
    if (cache.length > 10)
      cache.splice(0, cache.length - 10);
    this.storage.setObject("events_cache", cache);

    return Promise.resolve(result);
  }

  private createFilter(fight: IReportFightsResponse1, jobs: IJobInfo1[]): string {

    const enemyIds = fight.enemies.map(e => e.guid).join();

    const js = this.jobRegistry.getJobs().filter(j => jobs.some((j1 => j1.job === j.name) as any));

    const abilityIds = _.uniq(_.flattenDeep(_.concat([], js.map(j => j.abilities.map(a => a.detectStrategy.deps.abilities))))).filter(a => !!a).join();
    const abilityByBuffIds = _.concat([], js.map(j => j.abilities.map(a => a.detectStrategy.deps.buffs)));
    const stances = _.concat([], js.map(j => j.stances && j.stances.map(a => a.ability.detectStrategy.deps.buffs)));
    const buffs = _.uniq(_.flattenDeep(_.concat(stances, abilityByBuffIds))).filter(a => !!a).join();
    const partyIds = jobs.map(j => j.guid).join();

    const bossAutoAttacks =
      "1478,1479,1480,1481,6631,6882,6910,7319,7351,8535,8645,8938,9202,9375,9441,9442,9448,9654,9895,9908,9936,9989,10236,10237,10238,10239,10433,11070";
    const filter = `
    (
      (
         type in ('cast', 'damage') and ability.id in (${abilityIds}) and source.id in (${partyIds})
      )or(
        type in ('cast', 'damage') and source.id in (${enemyIds})
	    )or(
		    type in ('applybuff','removebuff') and ability.id in (${buffs})
	    )
    ) and ability.id not in (${bossAutoAttacks})`;

    return filter;
  }

  mapJob(input: string): { jobName: string, order: number } {
    switch (input) {
      case "Bard":
        return { jobName: "BRD", order: 2 };
      case "WhiteMage":
        return { jobName: "WHM", order: 1 };
      case "Summoner":
        return { jobName: "SMN", order: 2 };
      case "Ninja":
        return { jobName: "NIN", order: 2 };
      case "Dragoon":
        return { jobName: "DRG", order: 2 };
      case "Scholar":
        return { jobName: "SCH", order: 1 };
      case "Warrior":
        return { jobName: "WAR", order: 0 };
      case "DarkKnight":
        return { jobName: "DRK", order: 0 };
      case "Machinist":
        return { jobName: "MCH", order: 2 };
      case "Paladin":
        return { jobName: "PLD", order: 0 };
      case "Astrologian":
        return { jobName: "AST", order: 1 };
      case "Samurai":
        return { jobName: "SAM", order: 2 };
      case "Monk":
        return { jobName: "MNK", order: 2 };
      case "BlackMage":
        return { jobName: "BLM", order: 2 };
      case "RedMage":
        return { jobName: "RDM", order: 2 };
      case "Gunbreaker":
        return { jobName: "GNB", order: 0 };
      case "Dancer":
        return { jobName: "DNC", order: 2 };
    }
    return null;
  }

  getZones(): Observable<Zone[]> {
    const cache = this.storage.getObject<ICacheItem>("zones_cache");
    if (cache) {
      if ((new Date().valueOf() - cache.timestamp.valueOf()) < 1000 * 60 * 60 * 24) {
        return Observable.of(cache.data);
      }
    }
    const observable = this.httpClient.get<Zone[]>(`${this.fflogsUrl}v1/zones?api_key=${this.apiKey}`).pipe(tap(x => {
      this.storage.setObject("zones_cache", { key: "", data: x, timestamp: new Date() });
    }));
    return observable;
  }

}

interface ICacheItem {
  key: string,
  data: any;
  timestamp: Date;
}


