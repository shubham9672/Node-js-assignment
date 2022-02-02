const express = require('express')
const routesController = require('./api')
const app = express()
const port =8000

app.use('/api',routesController)
app.listen(port, () =>{
    console.log(`Server is started and it is listening on Port : ${port}`);
})