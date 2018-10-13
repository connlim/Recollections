const dotenv = require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({
  storage
});

const minio = require('minio');
const mClient = new minio.Client({
  endPoint : process.env.MINIO_HOST,
  port : +process.env.MINIO_PORT,
  useSSL : false,
  accessKey : process.env.MINIO_ACCESS_KEY,
  secretKey : process.env.MINIO_SECRET_KEY
});

const { Pool } = require('pg');
const db = new Pool({
  host : process.env.PG_HOST,
  port : process.env.PG_PORT,
  database : 'postgres',
  user : process.env.PG_USER,
  password : process.env.PG_PASSWORD
});

const bearerToken = require('bearer-token');
const crypto = require('crypto');
const exifParser = require('exif-parser');
const fileType = require('file-type');
const jwt = require('jsonwebtoken');
const uniqid = require('uniqid');

const insert_file = (userid, file) => {
  return new Promise((resolve, reject) => {
    const putFile = () => {
      const ext = fileType(file).ext;
      const id = `${uniqid()}.${ext}`;
      mClient.putObject(userid, id, file, (put_err, etag) => {
        if(put_err){
          console.log(put_err);
          reject({
            code: 500,
            message: 'Error storing file'
          });
        }else{
          resolve(id);
        }
      });
    };
    mClient.bucketExists(userid, (exists) => {
      if(!exists){ //Create user bucket if it doesn't exist
        mClient.makeBucket(userid, 'ap-southeast-1', (make_err) => {
          if(make_err){
            reject({
              code: 500,
              message: 'Error storing file'
            });
          }else{
            putFile();
          }
        });
      }else{
        putFile();
      }
    });
  });
};

const auth = (req, res, next) => {
  bearerToken(req, (tok_err, token) => { //Get Bearer token from headers
    if(token){
      jwt.verify(token, process.env.SECRET, (ver_err, decoded) => {
        if(ver_err){
          res.status(403).send('Invalid token');
        }else{
          req.user = decoded.email;
          next();
        }
      })
    }else{
      res.status(403).send('Token required');
    }
  });
};

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', auth, (req, res) => {
  res.status(200).send('Received at backend service.');
});

app.post('/login', (req, res) => {
  if(!req.body.email){
    res.status(400).send('No email provided');
  }else if(!req.body.password){
    res.status(400).send('No password provided');
  }else{
    db.query('SELECT password FROM users WHERE email = $1', [
      req.body.email
    ]).then((db_res) => {
      if(db_res.rows[0] && db_res.rows[0].password === req.body.password) {
        res.status(200).send(jwt.sign({
          email: req.body.email
        }, process.env.SECRET));
      }else{
        res.status(403).send('Invalid credentials');
      }
    }).catch(() => {
      res.status(500).send('Database error');
    });
  }
});

app.post('/signup', upload.single('profile_pic'), (req, res) => {
  if(!req.body.email) {
    res.status(400).send('No email');
  } else if(!req.body.username) {
    res.status(400).send('No username');
  } else if(!req.body.password) {
    res.status(400).send('No email');
  } else if(!req.file) {
    res.status(400).send('No email');
  } else {
    db.query('SELECT 1 FROM users WHERE email = $1', [
      req.body.email
    ]).then((db_res) => {
      if(db_res.rows.length > 0) {
        throw { code: 400, message: "User already exists" };
      } else {
        return insert_file(req.body.email, req.file.buffer);
      }
    }).then((profile_id) => {
      return db.query('INSERT INTO users (email, username, password, profile_pic) VALUES ($1, $2, $3, $4)', [
        req.body.email,
        req.body.username,
        req.body.password,
        profile_id,
      ]);
    }).then(() => {
      res.status(200).send('Success');
    }).catch((err) => {
      if(err.code && err.message) {
        res.status(err.code).send(err.message);
      } else {
        res.status(500).send("Database error");
      }
    });
  }
});

app.post('/images', upload.array('file'), (req, res) => {
  // if(!req.files) {
  //   res.status(400).send('No files');
  // } else {
  //   for(file in files) {
  //
  //   }
  // }
  // else if(fileType(req.file.buffer) !== 'image/jpeg') {
  //   res.status(400).send('Incorrect file type');
  // } else {
  //   let metadata = {};
  //   try {
  //     const parser = exifParser.create(req.file.buffer);
  //     const results = parser.parse();
  //     metadata.lat = results.tags.GPSLatitude;
  //     metadata.lng = results.tags.GPSLongitude;
  //     metadata.datetime = results.tags.DateTimeOriginal;
  //   } catch(e) {}
  //   res.status(200).send(metadata);
  // }
});

app.listen(process.env.BACKEND_PORT, (err) => {
  err ? console.error(err) : console.log(`Backend listening at ${process.env.BACKEND_PORT}`);
});
