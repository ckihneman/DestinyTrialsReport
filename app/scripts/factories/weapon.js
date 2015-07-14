'use strict';

angular.module('trialsReportApp')
  .factory('weaponStats', function($http, requestUrl) {
    var path = requestUrl.url;
    var getData = function(membershipType, membershipId, characterId) {
      return $http({method:"GET", url: path + 'Destiny/' + membershipType + '/Account/' + membershipId  + '/Character/' + characterId + '/Inventory/?definitions=true'}).then(function(result){
        var items = result.data.Response.data.buckets.Equippable;
        var talentGrid = result.data.Response.definitions.talentGrids;
        var background = [];
        var armors = [];
        var weapons = [];
        var subClass = [];
        var classNodes = [];
        classNodes.hazards = [];
        var blink = false;
        var shotgun = false;
        armors.hazards = [];
        var hazardPerks = ['Light Beyond Nemesis', 'Crest of Alpha Lupi'];
        var grenadePerks = ['Lucky Raspberry', 'Voidfang Vestments'];
        var doubleNade = ['The Armamentarium'];
        weapons.hazards = [];
        return $http({method:"GET", url: '/json/weapons.json'}).then(function(data){
          angular.forEach(items,function(item,index){
            var itemS = item.items[0];
            var wItem = data.data.items[itemS.itemHash];
            var nodes = [];
            var avoidNodes = ['Ascend', 'Reforge Ready', 'Void Damage', 'Arc Damage', 'Solar Damage', 'Kinetic Damage',
              'Hive Disruptor', 'Oracle Disruptor', 'Wolfpack Rounds', 'Last Word', 'Fan Fire', 'Mark of the Devourer',
              'Ice Breaker', 'No Backpack', 'Lich Bane', 'Invective', 'Cursebringer', 'Disciplinarian', 'Holding Aces',
              'Timeless Mythoclast'];
            var burns = ['Void Damage', 'Arc Damage', 'Solar Damage'];
            var avoidClassNodes = ["Training focused on toughness at all costs."];
            if (wItem) {
              if (wItem.subType === "Sniper Rifle"){
                //angular.forEach(itemS.stats,function(stat,index){
                //  if (stat.statHash == 4043523819 && stat.value > 16){
                //    weapons.hazards.push('Revive Kill Sniper');
                //  }
                //});

              }else if (wItem.subType === "Shotgun"){
                shotgun = true;
              }
              angular.forEach(itemS.nodes,function(node,index){
                if (node.isActivated === true) {
                  var nodeStep = talentGrid[itemS.talentGridHash].nodes[index].steps[node.stepIndex];
                  if (!nodeStep.affectsQuality && !(avoidNodes.indexOf(nodeStep.nodeStepName) > -1)){
                    var longNames = ['Grenades and Horseshoes'];
                    var name = (longNames.indexOf(nodeStep.nodeStepName) > -1) ? 'Nades & Shoes' : nodeStep.nodeStepName;
                    if (wItem.subType === "Sniper Rifle"){
                      if (nodeStep.perkHashes[0] == 3752206822){
                        weapons.hazards.push('Final Round Sniper');
                      }
                    }
                    nodes.push({"name": name, "description": nodeStep.nodeStepDescription,
                      "icon": "http://www.bungie.net" + nodeStep.icon })
                  }else if (burns.indexOf(nodeStep.nodeStepName) > -1){
                    switch(nodeStep.nodeStepName) {
                      case "Solar Damage":
                        wItem.burnColor = "solar-dmg";
                        break;
                      case "Void Damage":
                        wItem.burnColor = "void-dmg";
                        break;
                      case "Arc Damage":
                        wItem.burnColor = "arc-dmg";
                        break;
                    }
                  }
                }
              });
              weapons[wItem.bucket] = wItem;
              weapons[wItem.bucket].nodes = nodes;
            }else if ([3828867689, 3658182170, 2962927168, 1716862031, 2455559914, 2007186000].indexOf(itemS.itemHash) > -1) {
              var hasFireboltGrenade = false; var hasVikingFuneral = false; var hasTouchOfFlame = false;
              //console.log(talentGrid[itemS.talentGridHash]);
              angular.forEach(itemS.nodes,function(node,index){
                if (node.isActivated === true) {
                  //console.log(itemS);
                  var nodeStep = talentGrid[itemS.talentGridHash].nodes[index];
                  if (nodeStep.nodeHash == 835330335) hasFireboltGrenade = true;
                  if (nodeStep.nodeHash == 1173110174) hasVikingFuneral = true;
                  if (nodeStep.nodeHash == 527202181) hasTouchOfFlame = true;
                  if ([1,3,6,8].indexOf(nodeStep.column) > -1) {
                    if (!(nodeStep.row == 0 && nodeStep.column == 3)) {
                      var noderStepper = nodeStep.steps[node.stepIndex];
                      classNodes.push({"name": noderStepper.nodeStepName, "description": noderStepper.nodeStepDescription,
                        "icon": "http://www.bungie.net" + noderStepper.icon })
                    }
                  }
                  if (itemS.itemHash == 2962927168 || itemS.itemHash == 3828867689) {
                    if ((nodeStep.row == 3 && nodeStep.column == 2)) {
                      blink = true;
                    }
                  }
                }
              });
              if (hasFireboltGrenade && hasVikingFuneral && hasTouchOfFlame) {
                classNodes.hazards.push('Superburn Grenade');
              }
            }
          });
          if (blink && shotgun){
            weapons.hazards.push('Blink Shotgun');
          }
          return $http({method:"GET", url: '/json/armor.json'}).then(function(data){
            //144602215 1735777505 4244567218
            var intellect = 0;
            var discipline = 0;
            var strength = 0;
            angular.forEach(items,function(item,index){
              var itemS = item.items[0];
              var aItem = data.data.items[itemS.itemHash];
              if (aItem) {
                if (hazardPerks.indexOf(aItem.name) > -1) {
                  armors.hazards.push('Quick Revive');
                }else if (grenadePerks.indexOf(aItem.name) > -1){
                  armors.hazards.push('Grenade on Spawn');
                }else if (doubleNade.indexOf(aItem.name) > -1){
                  armors.hazards.push('Double Grenade');
                }
                angular.forEach(itemS.stats,function(stat,index){
                  switch(stat.statHash) {
                    case 144602215:
                      intellect += stat.value;
                      break;
                    case 1735777505:
                      discipline += stat.value;
                      break;
                    case 4244567218:
                      strength += stat.value;
                      break;
                  }
                });
                //intellect += itemS.stats[144602215].value;
                //console.log(itemS.stats);
                armors[aItem.bucket] = aItem;
              }
            });
            //console.log(intellect);
            return $http({method:"GET", url: '/json/class.json'}).then(function(data){
              angular.forEach(items,function(item,index){
                var itemS = item.items[0];
                var cItem = data.data.items[itemS.itemHash];
                if (cItem) {
                  subClass = {"name": cItem.name};
                }else if (itemS.itemLevel == 0 && result.data.Response.definitions.items[itemS.itemHash].bucketTypeHash == 4274335291){
                  background[0] = "http://www.bungie.net" + result.data.Response.definitions.items[itemS.itemHash].secondaryIcon;
                  background[1] = "http://www.bungie.net" + result.data.Response.definitions.items[itemS.itemHash].icon;
                }
              });
              return {"weapons": weapons, "classNodes": classNodes,
                "bg": background, "armors": armors, "subClass": subClass,
              "int": intellect, "dis": discipline, "str": strength};
            });
          });

        });

      });

    };
    return { getData: getData };
  });
