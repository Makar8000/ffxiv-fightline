using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Threading.Tasks;
using FightTimeLine.DataLayer;
using FightTimeLine.DataModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FightTimeLine.Controllers
{
     [Route("api/[controller]")]
     public class DataController : Controller
     {
          private readonly FightTimelineDataContext _dataContext;

          private string CurrentUserName
          {
               get
               {
                    return HttpContext.User.Claims.FirstOrDefault(claim => claim.Type == JwtRegisteredClaimNames.Sub)?.Value;
               }
          }

          public DataController(FightTimelineDataContext dataContext)
          {
               _dataContext = dataContext ?? throw new ArgumentNullException(nameof(dataContext));
          }

          [HttpGet("[action]/{reference}/{game}/{value?}")]
          public async Task<IEnumerable<BossSearchResult>> Bosses([FromRoute]long reference, [FromRoute]string value, [FromQuery]bool privateOnly, [FromRoute]string game)
          {
               var name = CurrentUserName;

               return await _dataContext.Bosses
                    .Where(s => (string.IsNullOrEmpty(value) || EF.Functions.Like(s.Name,value)) && s.Reference == reference && s.Game == game && (!s.IsPrivate && !privateOnly || s.IsPrivate && s.UserName == name))
                    .Select(s => new BossSearchResult()
                    {
                         Id = s.Identifier.ToString("N"),
                         Name = s.Name,
                         Owner = s.UserName,
                         CanRemove = !string.IsNullOrWhiteSpace(name) && string.Equals(name, s.UserName,StringComparison.OrdinalIgnoreCase),
                         CreateDate = s.CreateDate.GetValueOrDefault(),
                         ModifiedDate = s.ModifiedDate.GetValueOrDefault()
                    }).ToArrayAsync();
          }

          [HttpGet("[action]/{id?}")]
          public async Task<IActionResult> Boss(string id)
          {
               if (!Guid.TryParse(id, out var guid) && !Guid.TryParseExact(id, "N", out guid))
                    return BadRequest("Boss id is not provided");

               var data = await _dataContext.Bosses.FirstOrDefaultAsync(entity => entity.Identifier == guid);
               if (data == null) return StatusCode(404);

               var name = CurrentUserName;

               if (data.IsPrivate && data.UserName != name)
                    return StatusCode(403);

               return Json(new BossData()
               {
                    Id = data.Identifier.ToString("N"),
                    Name = data.Name,
                    UserName = name,
                    Data = data.Data,
                    Reference = data.Reference ?? 0,
                    IsPrivate = data.IsPrivate,
               });
          }

          [HttpPost("[action]")]
          public async Task<IActionResult> SaveBoss([FromBody]BossData request)
          {
               var nameClaim = CurrentUserName;
               if (nameClaim == null)
                    return Unauthorized();

               if (!Guid.TryParse(request.Id, out var guid)) guid = Guid.Empty;
               var boss = await _dataContext.Bosses.FirstOrDefaultAsync(entity => entity.Identifier == guid);
               if (boss != null)
               {
                    if (boss.UserName != nameClaim)
                         return Unauthorized();
                    boss.Data = request.Data;
                    boss.IsPrivate = request.IsPrivate;
               }
               else
               {
                    boss = new BossEntity()
                    {
                         Identifier = Guid.NewGuid(),
                         Name = request.Name,
                         UserName = request.UserName,
                         IsPrivate = request.IsPrivate,
                         Data = request.Data,
                         Reference = request.Reference,
                         CreateDate = DateTimeOffset.UtcNow,
                         Game = request.Game
                    };
                    _dataContext.Bosses.Add(boss);
               }
               boss.ModifiedDate = DateTimeOffset.UtcNow;

               await _dataContext.SaveChangesAsync();

               return Json(new BossData()
               {
                    Id = boss.Identifier.ToString("N"),
                    Name = boss.Name,
                    UserName = boss.UserName,
                    Data = "",
                    IsPrivate = boss.IsPrivate,
                    Reference = boss.Reference.GetValueOrDefault(),
                    CreateDate = boss.CreateDate.GetValueOrDefault(),
                    ModifiedDate = boss.ModifiedDate.GetValueOrDefault(),
                    Game = boss.Game
               });
          }

          [HttpPost("[action]")]
          public async Task<IActionResult> RemoveBosses([FromBody] string[] ids)
          {
               var nameClaim = CurrentUserName;
               if (nameClaim == null)
                    return Unauthorized();

               var guids = ids.Select(s =>
               {
                    if (!Guid.TryParse(s, out var guid) && !Guid.TryParseExact(s, "N", out guid))
                         return Guid.Empty;
                    return guid;
               }).ToArray();
               
               var data = _dataContext.Bosses.Where(entity => guids.Contains(entity.Identifier) && entity.UserName == nameClaim);

               _dataContext.RemoveRange(data);
               await _dataContext.SaveChangesAsync();

               return Ok();
          }

          [HttpGet("[action]/{id?}")]
          public async Task<IActionResult> Fight(string id)
          {
               if (!Guid.TryParse(id, out var guid) && !Guid.TryParseExact(id, "N", out guid))
                    return BadRequest("Fight is not provided");
               
               var data = await _dataContext.Fights.FirstOrDefaultAsync(entity => entity.Identifier == guid);
               if (data == null) return Json(null);

               return Json(new FightData
               {
                    Id = data.Identifier.ToString("N"),
                    Name = data.Name,
                    UserName = data.UserName,
                    Data = data.Data,
                    IsDraft = data.IsDraft.GetValueOrDefault(true),
                    DateModified = data.ModifiedDate.GetValueOrDefault(DateTimeOffset.UtcNow),
                    Game = data.Game
               });
          }

          [HttpPost("[action]/{game}")]
          [AllowAnonymous]
          public async Task<IActionResult> NewFight([FromRoute]string game)
          {
               var nameClaim = CurrentUserName;

               var entityEntry = await _dataContext.Fights.AddAsync(new FightEntity()
               {
                    IsDraft = true,
                    Name = "new",
                    CreateDate = DateTimeOffset.UtcNow,
                    ModifiedDate = DateTimeOffset.UtcNow,
                    Data = "",
                    Identifier = Guid.NewGuid(),
                    Game = game,
                    UserName = nameClaim ?? "anonymous"
               });

               await _dataContext.SaveChangesAsync();

               return Json(new FightData()
               {
                    Id = entityEntry.Entity.Identifier.ToString("N"),
                    Name = entityEntry.Entity.Name,
                    IsDraft = entityEntry.Entity.IsDraft.GetValueOrDefault(true),
                    UserName = entityEntry.Entity.UserName,
                    Data = entityEntry.Entity.Data,
                    DateModified = entityEntry.Entity.ModifiedDate.GetValueOrDefault(DateTimeOffset.UtcNow)   ,
                    Game = entityEntry.Entity.Game
               });
          }

          [HttpPost("[action]")]
          [Authorize]
          public async Task<IActionResult> SaveFight([FromBody]FightData request)
          {
              var nameClaim = CurrentUserName;
               if (nameClaim == null)
                    return Unauthorized();


               if (!Guid.TryParse(request.Id, out var guid)) guid = Guid.Empty;
               var fight = await _dataContext.Fights.FirstOrDefaultAsync(entity => entity.Identifier == guid);
               if (fight != null)
               {
                    if (fight.UserName.Trim() != nameClaim && !string.Equals(fight.UserName, "anonymous", StringComparison.OrdinalIgnoreCase))
                         return Unauthorized();

                    fight.Name = request.Name;
                    fight.Data = request.Data;
                    fight.IsDraft = false;
                    fight.ModifiedDate = DateTimeOffset.UtcNow;
               }
               else
               {
                    fight = new FightEntity()
                    {
                         Identifier = Guid.NewGuid(),
                         Name = request.Name,
                         UserName = nameClaim,
                         Data = request.Data,
                         IsDraft = false,
                         CreateDate = DateTimeOffset.UtcNow,
                         ModifiedDate = DateTimeOffset.UtcNow,
                         Game = request.Game
                    };
                    _dataContext.Fights.Add(fight);
               }

               await _dataContext.SaveChangesAsync();

               return Json(new FightData
               {
                    Id = fight.Identifier.ToString("N"),
                    Name = fight.Name,
                    UserName = fight.UserName,
                    Data = "",
                    IsDraft = fight.IsDraft.GetValueOrDefault(true),
                    DateModified = fight.ModifiedDate.GetValueOrDefault(DateTimeOffset.UtcNow),
                    Game = fight.Game
                    
               });
          }

          [HttpGet("[action]/{game}")]
          [Authorize]
          public async Task<IActionResult> Fights([FromRoute]string game)
          {
               var nameClaim = CurrentUserName;
               if (nameClaim == null)
                    return Unauthorized();

               var data = await _dataContext.Fights
                   .Where(s => s.UserName == nameClaim && s.Game == game)
                   .Select(entity => new FightSearchResult()
                   {
                        Id = entity.Identifier.ToString("N"),
                        Name = entity.Name,
                        IsDraft = entity.IsDraft.GetValueOrDefault(false),
                        DateModified = entity.ModifiedDate,
                        DateCreated = entity.CreateDate,
                   }).ToArrayAsync();
               return Json(data);
          }

          [HttpPost("[action]")]
          [Authorize]
          public async Task<IActionResult> RemoveFights([FromBody] string[] ids)
          {
               var nameClaim = CurrentUserName;
               if (nameClaim == null)
                    return Unauthorized();

               var guids = ids.Select(s =>
               {
                    if (!Guid.TryParse(s, out var guid) && !Guid.TryParseExact(s, "N", out guid))
                         return Guid.Empty;
                    return guid;
               }).ToArray();

               var data = _dataContext.Fights.Where(entity => guids.Contains(entity.Identifier) && entity.UserName == nameClaim);

               _dataContext.RemoveRange(data);
               await _dataContext.SaveChangesAsync();

               return Ok();
          }

          [HttpPost("[action]")]
          [AllowAnonymous]
          public async Task<IActionResult> AddCommand([FromBody] AddCommandData data)
          {
               if (data == null)
                    return BadRequest("Request is not provided");
               if (!Guid.TryParse(data.Fight, out var id))
                    return BadRequest("Fight is not provided");
               if (string.IsNullOrWhiteSpace(data.Data))
                    return BadRequest("Data is empty");


               var userName = CurrentUserName;

               await _dataContext.Commands.AddAsync(new CommandEntity()
               {
                    UserName = userName ?? "anonymous",
                    Body = data.Data,
                    DateCreated = DateTimeOffset.UtcNow,
                    Fight = id
               });
               await _dataContext.SaveChangesAsync();
               return Ok();
          }

          [HttpGet("[action]/{fight}/{timestamp?}")]
          [AllowAnonymous]
          public async Task<IActionResult> LoadCommands([FromRoute] string fight, [FromRoute] long? timestamp)
          {
               if (string.IsNullOrWhiteSpace(fight))
                    return BadRequest("Fight is not provided");
               if (!Guid.TryParse(fight, out var fightValue))
                    return BadRequest("Fight value is not recognized");

               DateTimeOffset? timeOffset = null;

               if (timestamp.HasValue)
               {
                    timeOffset = DateTimeOffset.FromUnixTimeMilliseconds(timestamp.Value);
               }

               var query = _dataContext.Commands.Where(entity => entity.Fight == fightValue);
               if (timeOffset.HasValue)
                    query = query.Where(entity => entity.DateCreated > timeOffset.Value.ToUniversalTime());

               var arrayAsync = await query.OrderBy(entity => entity.DateCreated).ToArrayAsync();

               var commandDatas = arrayAsync.Select(entity => new CommandData()
               {
                    UserName = entity.UserName,
                    Fight = entity.Fight.ToString("N"),
                    Data = entity.Body,
                    Timestamp = entity.DateCreated
               }).ToArray();

               return Json(commandDatas);
          }


      
     }
}
