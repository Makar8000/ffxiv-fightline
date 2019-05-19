import { process } from "./BossAttackProcessors"
import * as FF from "./FFLogs"
import * as M from "./Models"

describe('BossAttackProcessors', () => {
  beforeEach(() => {

  });

  const event = (index: number, at: number) => {
    return {
      ability: {
        name: "a" + index,
        guid: index,
        type: FF.AbilityType.PHYSICAL_DIRECT,
        abilityIcon: ""
      },
      timestamp: at*1000,
      type: 'cast',
      sourceIsFriendly: false,
      targetIsFriendly: true,
    }
  }

  it("t1", async () => {
    const data: FF.AbilityEvent[] = [
      event(1, 1),
      event(2, 2),
      event(5, 3),
      event(6, 4),
      event(8, 5),
      event(9, 6)
    ];
    const attacks: M.IBossAbility[] = [
      {
        offset: "00:01",
        name: "a1"
      },
      {
        offset: "00:02",
        name: "a2"
      },
      {
        offset: "00:03",
        name: "a3"
      },
      {
        offset: "00:04",
        name: "a4"
      },
      {
        offset: "00:05",
        name: "a5",
        syncSettings: JSON.stringify(<M.ISyncData>{
          offset: "00:00",
          condition: <M.ISyncSettingGroup>{
            operation: M.SyncOperation.And,
            operands: [
              {
                description: "c1",
                type: 'name',
                payload: {
                  name: "a5"
                }
              },
              {
                description: "c2",
                type: 'count',
                payload: {
                  countComparer: "==",
                  count: 1
                }
              }]
          }
        })
      },
      {
        offset: "00:06",
        name: "a6"
      },
      {
        offset: "00:07",
        name: "a7"
      },
      {
        offset: "00:08",
        name: "a8",
        syncSettings: JSON.stringify(<M.ISyncData>{
          offset: "00:00",
          condition: <M.ISyncSettingGroup>{
            operation: M.SyncOperation.And,
            operands: [
              {
                description: "c1",
                type: 'name',
                payload: {
                  name: "a8"
                }
              },
              {
                description: "c2",
                type: 'count',
                payload: {
                  countComparer: "==",
                  count: 1
                }
              }]
          }
        })
      },
      {
        offset: "00:09",
        name: "a9"
      }
    ];

    const actual = process(data, 0, attacks);
    expect(actual).not.toBeNull();
    expect(actual && actual.map(t => t.name)).toEqual(["a1", "a2", "a5", "a6", "a8", "a9"]);
    expect(actual && actual.map(t => t.offset)).toEqual(["00:01", "00:02", "00:03", "00:04", "00:05", "00:06"]);
  });
});


