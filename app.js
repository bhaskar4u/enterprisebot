console.log("app is running");
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs')
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const app = express();
const port = process.env.PORT || 5000;

const mongoURI = "mongodb://localhost:27017/Bot"
//importing routes
const authRoutes = require('./routes/auth')
const Employee = require('./models/Employee')
// const path = path.resolve(__dirname,'files','image.jpg')




//middlewares
app.use(bodyParser.json());
app.use(express.json())
app.use(bodyParser.urlencoded({extended:false}));
app.use(cors());
app.use('/api/user/',authRoutes);

//use mongoose.connect with authRoutes
//use mongoose.createConnection with binary data
conn = mongoose.connect(mongoURI,{
    useNewUrlParser:true,
    useUnifiedTopology:true
},(err)=>{
    if(err){
        console.log("mongoDB not Connected",err);
        
    }
    console.log("mongoDB connected Successfully");
    
});

let gfs;
//comment conn.once while using mongoose.connect
conn.once('open',()=>{
    //init stream
    gfs = Grid(conn.db,mongoose.mongo);
    gfs.collection('uploads')
});

//create storage
const storage = new GridFsStorage({
    url:mongoURI,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
  });
  const upload = multer({ storage });

  app.post('/upload',upload.single('image'),async(req,res)=>{
    const emp = new Employee({
        name:req.body.name,
        image:res.send(req.file)
    })
    try{
        const empPhoto = await emp.save();
        res.status(200).send(empPhoto.name);
    }
    catch(err){
        res.status(400).send(err)
    }    
    });

    app.get('/file',(req,res)=>{
        gfs.files.find().toArray((err,files)=>{
            if(!files || files.length===0){
                return res.status(404).json({
                    err:'file not found'
                })
            }
            return res.status(200).json(files)
        })
        
    });
    
    app.get('/file/:filename',(req,res)=>{
       gfs.files.findOne({filename:req.params.filename},(err,file)=>{
        if(!file || file.length===0){
            return res.status(404).json({
                err:'file not found'
            })
        }
        return res.status(200).json(file)
       }) ;
    });



    app.listen(port,(err,res) =>{
    if(err){
        console.log("server interrupted",err);
        
    }{
        console.log("server started at port:"+port);
        
    }
})

