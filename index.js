'use strict';
var AWS = require('aws-sdk');
var ncu = require('npm-check-updates');
var get = require('get-file');
var fs = require("fs");
var R =  require('ramda');
var input = {};

function checkRepo(repo) {
  var ses = new AWS.SES({
     region: input.region
  });

  var owner = repo['owner'];
  var name = repo['name'];
  var subDir = repo['subdirectory'];
  var githubPath = githubPath = owner + '/' + name;
  var pkg = 'package.json';

  if (subDir != '' && subDir != undefined) {
    pkg = subDir + '/package.json';
  }

  var string = '';

  get(githubPath, pkg, function(err, res) {
    if (err) return console.error(err);
    var file = fs.createReadStream('package.json');

    res.on('data', function(buffer) {
      var part = buffer.toString();
      string += part;
    })

    res.on('end', function() {
      var ownerDir = '/tmp/' + owner;
      if (!fs.existsSync(ownerDir)){
        fs.mkdirSync(ownerDir);
      }

      var tmpDir = '/tmp/' + githubPath;
      console.log(tmpDir);
      if (!fs.existsSync(tmpDir)){
        fs.mkdirSync(tmpDir);
      }
      var filename = tmpDir + '/package.json';
      var json  = JSON.parse(string);

      fs.writeFile(filename, string, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
      });

      ncu.run({
        packageFile: filename,
        silent: false
      }).then(function(upgrades) {
        var numberOfUpgrades = Object.keys(upgrades).length;
        var deps = json.dependencies;
        var differences = 'Dependency Notice:\n\nBased on the package.json in the Master branch of the GitHub repo: ' + githubPath + '\n' + name + ' has ' + numberOfUpgrades.toString() + ' dependency updates\n\n';

        function compareVersions (key) {
          var oldVersion = deps[key];
          var newVersion = upgrades[key];
          if (oldVersion === undefined) {
            oldVersion = 'NEW PACKAGE'
          }
          var diffStr = key + ':  ' + oldVersion + '  --->  ' + newVersion + '\n';
          differences += diffStr;
        }

        R.keys(upgrades).forEach(compareVersions, upgrades);

        console.log("EMAILING: " + githubPath);
        var eParams = {
          Destination: {
              ToAddresses: input.recipients
          },
          Message: {
              Body: {
                  Text: {
                      Data: differences
                  }
              },
              Subject: {
                  Data: 'Dependency Updates: ' + name
              }
          },
          Source: input.source
        };

        var email = ses.sendEmail(eParams, function(err, data){
            if(err) console.log(err);
            else {
                console.log("===EMAIL SENT===");
            }
        });

      });
    })

  });
}

function monitor(repos, recipients, region, source) {
  if(arguments.length < 2) {
    throw new Error('repos and recipients arguments required in the proper format');
  }

  if (Array.isArray(repo) === false || Array.isArray(recipients) === false || typeof region != 'string' || typeof source != 'string') {
    throw new Error('invalid argument type. repo must be an array of properly formatted objects (view README). recipients must be an array of email strings. region must be an aws region string. source must be an aws ses verified email string.');
  }

  input['recipients'] = recipients;
  input['region'] = region;
  input['source'] = source;

  R.forEach(checkRepo, repos);
};

module.exports = {
  monitor: monitor
};
