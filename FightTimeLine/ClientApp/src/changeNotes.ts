export class ChangeNotes {
  public static get changes() {
    return [
      {
        revision: 1,
        date: "8/3/2018",
        items: [
          "New 'Compact View' feature. Global level in View menu. Job level in context menu for Job. Ability level in context menu for Ability",
          "New What's New window"
        ]
      },
      {
        revision: 2,
        date: "8/28/2018",
        items: [
          "New 'Show Abilities Availability Map' under View menu. Show if one or more abilities can be used between two other usages of same ability"
        ]
      },
      {
        revision: 3,
        date: "10/10/2018",
        items: [
          "Fixed garbage boss attacks when importing from FFLogs after patch 4.4",
          "Anticipation added to tank abilities"
        ]
      },
      {
        revision: 4,
        date: "1/8/2018",
        items: [
          "Removed Dependency on XIVDB tooltips. New tooltips implementation is in-progress"
        ]
      },
      {
        revision: 5,
        date: "2/14/2019",
        items: [
          "Red Mage abilities"
        ]
      },
      {
        revision: 6,
        date: "3/4/2019",
        items: [
          "Upgrade to Angular 7",
          "Now we save Filters, View and Hidden abilities when you save fight and restore on load",
          "Time in boss attack dialog",
          "Copy/paste of boss attacks. Yeah.",
          "Side panel on items select. Still thinking what to show there. Any ideas?",
          "New Restore Hidden sub menu in job context menu to return visibility to specific hidden ability instead of restore them all",
          "Checkboxes for pets and compact view in job context menu",
          "Export to google sheets deprecated",
          "Sacred Soil for scholar"
        ]
      },
      {
        revision: 7,
        date: "3/6/2019",
        items: [
          "New Tools menu",
          "Sticky Attacks tool. When tool is on and you move boss attack, all boss attacks with time more than selected will be moved accordingly",
          "Export to Google Sheets is back",
          "Time in Boos Attack dialog can be adjusted with mouse wheel. Just mouse wheel: +/- 1 second, Ctrl+mouse wheel: +/- 1 minute",
          "Small fixes"
        ]
      },
      {
        revision: 9,
        date: "3/6/2019",
        items: [
          "Update to Ability Availability. Updated color to be not that 'blood from eyes'. Now shows exact area where ability can be used.",
          "Update to table view: improved abilities layout."
        ]
      },
      {
        revision: 10,
        date: "3/9/2019",
        items: [
          "Updated FFLogsImport dialog",
          "Improved loading time from FFLogs, Should be ~10 times faster.",
          "Fixed stances loading."
        ]
      },
      {
        revision: 13,
        date: "3/10/2019",
        items: [
          "New home page. Tell me what you think.",
          "Now Job's collapsed/expanded state saves when you save fight.",
          "Jobs are sorted by (tank, heal, dd) during Import from FFLogs. Probably exact order should be extracted to Settings. Also, looking into the way to change order of jobs manually."
        ]
      },
      {
        revision: 16,
        date: "3/14/2019",
        items: [
          "Help dialog a bit changed, but still in progress.",
          "Fixed importing of few abilities",
          "First setting in Settings: Boss Attacks Source (Cast, Damage).",
          "Second setting in Settings: Jobs sort order after import by Tank, heal, dd can be configured now.",
          "Minor fixes and improvements",
          "New settings for Default Filter and View. These settings as applied when you start new or import data from FFLogs."
        ]
      },
      {
        revision: 18,
        date: "3/15/2019",
        items: [
          "Updates to team work feature: notifications of new comrades (dis)connected. List of connected in toolbar with live updates.",
          "New tab in settings: Teamwork. You can setup your Display Name to be used in teamwork."
        ]
      },
      {
        revision: 19,
        date: "5/3/2019",
        items: [
          "Few fixes related to game patches.",
          "New abilities for healers",
          "Sidepanel implementation. Can show additional info about selection in side panel area with different actions. If you have any ideas, contact me in <a href='https://discord.gg/xRppKj4' target='_blank'>Discord</a>"
        ]
      },
      {
        revision: 20,
        date: "5/4/2019",
        items: [
          "Internal improvements.",
          "New boss attacks filters by damage type."
        ]
      },
      {
        revision: 21,
        date: "5/12/2019",
        items: [
          "We moved to ng-zorro UI framework.",
          "Added additional filters: Enmity.",
          "Some improvements for tablest. I am testing on my IPad pro.",
          "Bug fixes"
        ]
      },
      {
        revision: 22,
        date: "6/28/2019",
        items: [
          "Job changes for 5.0"
        ]
      }

    ].sort((a, b) => b.revision - a.revision);
  }
}
