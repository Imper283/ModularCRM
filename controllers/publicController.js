const express = require('express');
const authLib = require('../appLibs/authLib');

exports.frontPage = async (req, res)=>{
    let result = authLib.tokenProcess(req)
    if(result.tokenProcessStatus === 200){
        res.sendFile(global.appRoot+"/view/interface/index.html")
    }else{
        res.sendFile(global.appRoot+"/view/enter/index.html")
    }
}