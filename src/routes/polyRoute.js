const express = require('express');
const router = express.Router();
const Poly = require('../models/poly');
const axios = require('axios');
const uniqid = require('uniqid');
const isUrl =  require('is-url');
const fetch = require('node-fetch');

// CREATE a Poly
router.post('/createpoly', async (req, res)=>{
  const {title, visibility, key, expiresIn} = req.body;
  let content = req.body.content;
  const slug = uniqid();
  if(key!=''){
    const url = 'https://classify-web.herokuapp.com/api/encrypt';
        const jsonData = JSON.stringify({ 
            data: content, key: key
        });
        let response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: jsonData
        });
        const result = await response.json();
        content = result.result;
  }
  console.log(content);
  const createdAt = new Date().getTime();
  let expireAfterSeconds; 
  switch (expiresIn) {
    case '1 day':
      expireAfterSeconds = createdAt+86400000;
      break;
    case '10 minutes':
      expireAfterSeconds = createdAt+600000;
      break;
    case '1 minute':
      expireAfterSeconds = createdAt+60000;
      break;
    default:
      break;
  }
    const fullLink = `127.0.0.1:3000/poly/${slug}`;
    const link = await axios.post(`https://api.shrtco.de/v2/shorten?url=${fullLink}`)
      .then(res => {
        return res.data.result.short_link;
      })
      .catch(err => {
        console.log(err);
      });
    const newPoly = new Poly({
      slug,
      title: title || 'Untitled',
      content,
      visibility,
      key,
      link,
      createdAt,
      expireAfterSeconds,
      expiryDuration: expiresIn
    });
  // }
  
  await newPoly.save()
    .then(poly => res.status(201).json({poly: poly}))
    .catch(err => console.log(err));
})


// FETCH A POLY
router.get('/poly/:slug', async (req, res)=>{
  const {slug} = req.params;
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
  // console.log(clientIp);
  try{
    const poly = await Poly.findOne({slug: slug, 'ipArray.ip': clientIp});
    // console.log(poly);
    if(poly){
      console.log('Found');
      await Poly.updateOne({slug: slug, 'ipArray.ip': clientIp}, {$set: {'ipArray.$.time': new Date()}});
    }
    else{
      console.log('Not Found');
      await Poly.updateOne({slug: slug}, {$push: {ipArray: {ip: clientIp, time: new Date()}}});
    }
    await Poly.findOne({slug})
    .then(poly => {
      const currentTime = new Date().getTime();
      console.log('current time: '+currentTime);
     console.log('expireAfterSeconds: '+poly.expireAfterSeconds);
      if(currentTime > poly.expireAfterSeconds){
        console.log('Expired');
        res.status(404).json({message: 'This link has expired'});
      }else{
        console.log('Not Expired');
        res.status(200).json({poly: poly, isUrl: isUrl(poly.content)});
      }
    })
  }catch(err){
    console.log(err);
  }
})

// DELETE A POLY
router.post('/deletepoly/:slug', async (req, res)=>{
  const {slug} = req.params;
  await Poly.deleteOne({slug: slug})
    .then(poly => res.status(200).json({message: 'Poly deleted'}))
    .catch(err => console.log(err));
})

// FETCH ALL POLYS
router.get('/allpolies', async (req, res)=>{
  try{
    const currentTime = new Date().getTime();
    const allPolies = await Poly.find({expireAfterSeconds: {$gt: currentTime}});
    res.status(200).json({allPolies: allPolies});
  }catch(err){
    console.log(err);
  }
})

// UPDATE EXPIRY TIME
router.post('/updateexpiry/:slug', async (req, res)=>{
  const {slug} = req.params;
  const {expiresIn} = req.body;
  const createdAt = new Date().getTime();
  let expireAfterSeconds; 
  switch (expiresIn) {
    case '1 day':
      console.log('1 day');
      expireAfterSeconds = createdAt+86400000;
      break;
    case '10 minutes':
      console.log('10 minutes');
      expireAfterSeconds = createdAt+600000;
      break;
    case '1 minute':
      console.log('1 minute');
      expireAfterSeconds = createdAt+60000;
      break;
    default:
      break;
  }
  await Poly.updateOne({slug: slug}, {$set: {expireAfterSeconds: expireAfterSeconds, expiryDuration: expiresIn}})
    .then(poly => res.status(200).json({message: 'Expiry time updated'}))
    .catch(err => console.log(err));
})

module.exports = router;