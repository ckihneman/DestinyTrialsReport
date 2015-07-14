'use strict';

angular.module('trialsReportApp')
  .factory('currentAccount', function($http, requestUrl) {
    var path = requestUrl.url;
    var getAccount = function(name, platform) {
      return $http({method:"GET", url: path + 'Destiny/SearchDestinyPlayer/' + platform + '/' + name}).then(function(resultAcc){
        if (resultAcc.data.Response.length < 1){
          return;
        }
        var name = resultAcc.data.Response[0].displayName;
        var membershipType = resultAcc.data.Response[0].membershipType;
        var membershipId = resultAcc.data.Response[0].membershipId;
        return $http({method:"GET", url: path + 'Destiny/' + membershipType +'/Account/' + membershipId + '/?definitions=true'}).then(function(resultChar){
          var stats = resultChar.data.Response.data.characters[0].characterBase.stats;
          var int = stats.STAT_INTELLECT.value;
          var dis = stats.STAT_DISCIPLINE.value;
          var str = stats.STAT_STRENGTH.value;
          var allItems = resultChar.data.Response.definitions.items;
          var allPerks = resultChar.data.Response.definitions.perks;
          var allCharacters = resultChar.data.Response.data.characters;
          var characterId = resultChar.data.Response.data.characters[0].characterBase.characterId;
          var equipment = resultChar.data.Response.data.characters[0].characterBase.peerView.equipment;
          var level = resultChar.data.Response.data.characters[0].characterLevel;
          var grimoire = resultChar.data.Response.data.characters[0].characterBase.grimoireScore;
          var background = ['http://bungie.net' + resultChar.data.Response.data.characters[0].backgroundPath];
          var emblem = 'http://bungie.net' + resultChar.data.Response.data.characters[0].emblemPath;
          var armors = [];
          var subClass = [];
          return {
            name: name,
            membershipId: membershipId,
            membershipType: membershipType,
            characterId: characterId,
            allCharacters: allCharacters,
            level: level,
            int: int,
            dis: dis,
            str: str,
            grimoire: grimoire,
            background: background,
            emblem: emblem,
            items: allItems,
            perks: allPerks,
            armors: armors,
            class: subClass
          };
        });
      }).catch(function(e, r){
      });
    };
    var getActivities = function(account) {
      return $http({method:"GET", url: path + 'Destiny/Stats/ActivityHistory/' + account.membershipType + '/' + account.membershipId + '/' + account.characterId  + '/?mode=trialsofosiris&count=10&definitions=true'}).then(function(resultAct){
        var activities = resultAct.data.Response.data.activities;
        if (angular.isUndefined(activities)) {
          return;
        }
        var activityIds = [];
        var pastActivities = [];
        var recentActivity = {"id": activities[0].activityDetails.instanceId, "standing": activities[0].values.standing.basic.value};
        var streak = [];
        var totalKills =0;
        angular.forEach(activities.slice().reverse(),function(activity,index){
          totalKills += activity.values.kills.basic.value;
          pastActivities.push({"id": activity.activityDetails.instanceId,
            "standing": activity.values.standing.basic.value,
            "date": activity.period, "kills": activity.values.kills.basic.value,
            "kd": activity.values.killsDeathsRatio.basic.displayValue,
            "deaths": activity.values.deaths.basic.value, "assists": activity.values.assists.basic.value});
        });
        return angular.extend(account, {
          streak: streak,
          recentActivity: recentActivity,
          pastActivities: pastActivities,
          totalKills: totalKills
        });
      }).catch(function(e, r){
      });
    };

    var getLastTwentyOne = function(account, character) {
      var allPastActivities = [];
      return $http({method:"GET", url: path + 'Destiny/Stats/ActivityHistory/' + account.membershipType + '/' + account.membershipId + '/' + character.characterBase.characterId  + '/?mode=trialsofosiris&count=21'}).then(function(resultAct){
        var activities = resultAct.data.Response.data.activities;
        if (angular.isUndefined(activities)) {
          return;
        }
        angular.forEach(activities.slice().reverse(),function(activity,index){
          if (index % 3 === 0 ){
            allPastActivities.push({"id": activity.activityDetails.instanceId,
              "standing": activity.values.standing.basic.value});
          }
        });
        return allPastActivities;
      }).catch(function(e, r){ });
    };


    var getFireteam = function(recentActivity, name) {
      return $http({method:"GET", url: path + 'Destiny/Stats/PostGameCarnageReport/' + recentActivity.id + '/?definitions=true'}).then(function(resultPostAct){
        var fireteamIndex = [];
        var fireTeam = [];
        if (recentActivity.standing === 0){
          fireteamIndex = [0,1,2]
        }else {
          fireteamIndex = [3,4,5]
        }
        angular.forEach(fireteamIndex,function(idx,index) {
          var member = resultPostAct.data.Response.data.entries[idx];
          var player = member.player;
          if (angular.lowercase(player.destinyUserInfo.displayName) !== angular.lowercase(name)) {
            fireTeam.push({
              name: member.player.destinyUserInfo.displayName,
              membershipId: member.player.destinyUserInfo.membershipId,
              membershipType: member.player.destinyUserInfo.membershipType,
              emblem: 'http://www.bungie.net/' + member.player.destinyUserInfo.iconPath,
              characterId: member.characterId,
              level: member.player.characterLevel,
              class: member.player.characterClass
            });
          }
        });
        return fireTeam
      }).catch(function(e, r){
      });
    };
    return { getAccount: getAccount, getActivities: getActivities, getFireteam: getFireteam, getLastTwentyOne: getLastTwentyOne };
  });
