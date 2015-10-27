'use strict';

const request = require('superagent');

const AuthSource = {

  fetch() {

    return new Promise(function (resolve, reject) {
      request
          .get("https://www.bungie.net/Platform/User/GetBungieNetUser/")
          .set({
            ":host": "www.bungie.net",
            ":method": "GET",
            ":path": "/Platform/User/GetBungieNetUser/",
            ":scheme": "https"
          })
          //.set("X-API-Key", "f82c06ef47074168b0a545a7ffd1c271")
          .end(function (err, resp) {
            debugger;
            if(!resp.ok) {
              reject(err);
            } else {
              resolve(resp.body);
            }
          });
    });

  }
};

module.exports = AuthSource;
