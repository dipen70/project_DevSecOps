const express = require('express');
const lodash = require('lodash');
const minimatch = require('minimatch');


const app = express();


app.get('/', (req, res) => {
  const obj = lodash.cloneDeep({
    message: 'Hello, DevSecOps by Team 6, this is a project demo!'
  });


  const pattern = minimatch('.js', '.js');


  res.send(`${obj.message} (Pattern match: ${pattern})`);
});


module.exports = app;