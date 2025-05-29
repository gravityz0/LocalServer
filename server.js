const express = require('express');
const multer = require('multer');
const socketio = require('socket.io');
const fs = require('fs');
const path = require('path');
const http = require('http');
const cors = require('cors');
require('dotenv').config()


const app = express();
const server = http.createServer(app);
const io = socketio(server);
app.use(cors())

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if(!fs.existsSync(UPLOAD_DIR)){
    fs.mkdirSync(UPLOAD_DIR);
    }

const storage  = multer.diskStorage({
    destination: (req,file,cb) => cb(null,UPLOAD_DIR),
    filename: (req,file,cb) => cb(null,file.originalname)
})

const upload = multer({storage});

app.use(express.static('uploads'));
app.use('/uploads',express.static(UPLOAD_DIR));

app.post('/uploads',upload.single('file'), (req,res)=>{
    res.redirect('/');
})

app.get('/files',(req,res)=>{
    fs.readdir(UPLOAD_DIR,(err,files)=>{
        if(err){
            res.status(500).json([]);
        }else{
            res.json(files)
        }
    })
})

app.get('/uploads/:filename',(req,res)=>{
    const filePath = path.join(UPLOAD_DIR,req.params.filename);
    res.download(filePath);
})


app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'public/index.html'))
})


io.on('connection',(socket) =>{
    socket.on('chat message',(msg)=>{
        io.emit('chat message',msg)
    })
})

const PORT = process.env.PORT
server.listen(PORT,()=>{
    console.log('Listening ...')
})

