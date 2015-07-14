'use strict';

angular.module('trialsReportApp')
  .factory('trialsStats', function($http, requestUrl) {
    var path = requestUrl.url;
    var getData = function(membershipType, membershipId, characterId) {
      return $http({method:"GET", url: path + 'Destiny/Stats/' + membershipType + '/' + membershipId  + '/' + characterId + '/?modes=TrialsOfOsiris&definitions=true'}).then(function(result){
        //var stats = {"stats": result.data.Response.trialsOfOsiris.allTime};
        //return angular.extend(member, stats);
        //console.log(result.data.Response.trialsOfOsiris.allTime);
        return result.data.Response.trialsOfOsiris.allTime
        });
      };
    return { getData: getData };
  });
