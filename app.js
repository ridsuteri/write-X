const express = require('express')
const app = express()
const Port = process.env.PORT || 3000
app.set('views','views')
app.set('view engine', 'ejs')

app.get('/',(req,res)=>{
    res.send('Hello world')
})

app.listen(Port,(err)=>{
    console.log(`Server is running on ${Port}`)
})