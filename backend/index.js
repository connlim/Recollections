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

const NodeGeocoder = require('node-geocoder');
const options = {
  provider: 'google',
  httpAdapter: 'https', // Default
  apiKey: 'AIzaSyCYeybduSuf8lNaqC_OSc-VFxlaDSltYuo', // for Mapquest, OpenCage, Google Premier
  formatter: null         // 'gpx', 'string', ...
};
const geocoder = NodeGeocoder(options);

const reverseGeocode = (lat, lng) => {
  geocoder.reverse({lat: lat, lon: lng}, function(err, res) {
    console.log('=============================================================================================');
    console.log(res);
    return res.premise || res.neighborhood;
  });
}

// reverseGeocode(1.341024, 103.665972);

mClient.bucketExists('recollections', (exists) => {
  if(!exists){ //Create user bucket if it doesn't exist
    mClient.makeBucket('recollections', 'ap-southeast-1', (make_err) => {
      if(make_err){
        console.error(make_err);
      }else{
        console.log("Made bucket 'recollections'");
      }
    });
  }else{
    console.log("Bucket 'recollections' already exists");
  }
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
    const ext = fileType(file).ext;
    const id = `${uniqid()}.${ext}`;
    mClient.putObject('recollections', id, file, (put_err, etag) => {
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
  });
};

const auth = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    next();
  }
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
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get('/',(req, res) => {
  res.status(200).send('Received at backend service.');
});

app.get('/feed', auth, (req, res) => {
  db.query(`
    SELECT DISTINCT e.name, e.location, e.date, array_agg(DISTINCT i.id) AS images, array_agg(DISTINCT u.username) AS other_users
    FROM (
          SELECT DISTINCT e.*
            FROM users_in_event uie, events e
            WHERE userid IN (
                SELECT DISTINCT userid
                    FROM users_in_clique
                    WHERE clique IN (
                        SELECT clique FROM users_in_clique WHERE userid = $1
                    ) AND userid <> $1 ) AND uie.event = e.id
         ) e, event_clique_image eci, images i, users_in_event uie, users u
    WHERE e.id = eci.event AND eci.image = i.id AND uie.event = e.id AND uie.userid = u.email
    GROUP BY e.name, e.location, e.date
    ORDER BY e.date DESC;
    `, [req.user]).then((db_res) => {
      res.status(200).send(db_res.rows);
    }).catch((err) => {
      res.status(500).send(err);
    });
});

app.get('/recollections', auth, (req, res) => {
  //select * from users_in_clique WHERE userid = 'test@foo.com' ORDER BY random() LIMIT 1000;
  db.query(`
    SELECT e.name, e.location, e.date, array_agg(DISTINCT i.id) AS images, array_agg(DISTINCT u.username) AS other_users
    FROM (
          SELECT events.* FROM events 
          INNER JOIN users_in_event ON events.id = users_in_event.event
          WHERE users_in_event.userid = $1
         ) e, event_clique_image eci, images i, users_in_event uie, users u
    WHERE e.id = eci.event AND eci.image = i.id AND uie.event = e.id AND uie.userid = u.email
    GROUP BY e.name, e.location, e.date
    ORDER BY random() LIMIT 1000;
    `, [req.user]).then((db_res) => {
      res.status(200).send(db_res.rows);
    }).catch((err) => {
      res.status(500).send(err);
    });
});

app.get('/profile', auth, (req, res) => {
  //select * from users_in_clique WHERE userid = 'test@foo.com' ORDER BY random() LIMIT 1000;
  db.query("SELECT id FROM images WHERE userid=$1", [req.user]
    ).then((db_res) => {
      res.status(200).send(db_res.rows);
    }).catch((err) => {
      res.status(500).send(err);
    });
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

app.post('/signup', upload.array('profile_pic', 3), (req, res) => {
  if(!req.body.email) {
    res.status(400).send('No email');
  } else if(!req.body.username) {
    res.status(400).send('No username');
  } else if(!req.body.password) {
    res.status(400).send('No email');
  } else if(!req.files) {
    res.status(400).send('No profile pic');
  } else if(req.files.length < 3) {
    res.status(400).send('Not enough pics');
  } else {
    db.query('SELECT 1 FROM users WHERE email = $1', [
      req.body.email
    ]).then((db_res) => {
      if(db_res.rows.length > 0) {
        throw { code: 400, message: "User already exists" };
      } else {
        return Promise.all(req.files.map((file) => {
          return insert_file(req.body.email, file.buffer);
        }));
      }
    }).then((profile_ids) => {
      return db.query('INSERT INTO users (email, username, password, profile_pic_1, profile_pic_2, profile_pic_3) VALUES ($1, $2, $3, $4, $5, $6)', [
        req.body.email,
        req.body.username,
        req.body.password,
        profile_ids[0],
        profile_ids[1],
        profile_ids[2],
      ]);
    }).then(() => {
      res.status(200).send('Success');
    }).catch((err) => {
      console.log(err);
      if(err.code && err.message && !err.severity) {
        res.status(err.code).send(err.message);
      } else {
        res.status(500).send("Database error");
      }
    });
  }
});

app.post('/images', auth, upload.array('file'), (req, res) => {
  if(!req.files) {
    res.status(400).send('No files');
  } else {
    Promise.all(req.files.map((file) => {
      return new Promise((resolve, reject) => {
        //TODO: Check fileType for image/jpeg
        let metadata = {};
        try {
          const parser = exifParser.create(file.buffer);
          const results = parser.parse();
          metadata.lat = results.tags.GPSLatitude;
          metadata.lng = results.tags.GPSLongitude;
          metadata.datetime = results.tags.DateTimeOriginal;
        } catch(e) {}
        insert_file(req.user, file.buffer).then((id) => { // Insert file into minio
          //Insert entry into postgres
          return db.query('INSERT INTO images (id, userid, timestamp, lat, lng) VALUES ($1, $2, $3, $4, $5)', [
            id,
            req.user,
            metadata.datetime,
            metadata.lat,
            metadata.lng
          ]);
        }).then(() => {
          resolve({ id, ...metadata, buffer: file.buffer });
        }).catch((err) => reject(err));
      });
    })).then((files_data) => {
      files_data = files_data.sort((a, b) => a.datetime - b.datetime); //Sort images on date and time
      let differences = [];
      for(let i = 0; i < files_data.length-1; i++){
        differences.push(files_data[i+1].datetime - files_data[i].datetime);
      }
      const difference_sum = differences.reduce((acc, val) => acc + val, 0);
      const difference_mean = difference_sum / differences.length;
      const difference_sd = Math.sqrt(differences.reduce((acc, val) => acc + Math.pow(val - difference_mean, 2), 0.0) / (differences.length - 1));
      let groups = [[files_data[0]]];
      let current_group = 0;
      for(let i = 0; i < differences.length; i++){
        if(differences[i] < 3 * difference_sd) { //3 standard deviations threshold
          groups[current_group].push(files_data[i+1]);
        }else{ //If difference is an outlier
          current_group++;
          groups.push([files_data[i+1]]); //Push into new array entry
        }
      }
      return groups;
    }).then((groups) => {

    });
  }
});

app.get("/image/:fileid", (req, res) => {
  mClient.getObject('recollections', req.params.fileid, (err, stream) => {
    if(err){
      if(err.code == 'NoSuchKey'){
        res.status(404).send("No such file");
      }else{
        res.status(500).send("Error retrieving file");
      }
    }else{
      res.set("Content-Type", "application/octet-stream");
      stream.pipe(res);
    }
  });
});

app.get("/profile", auth, (req, res) => {
  db.query(`

    `, [req.user]).then((db_res) => {
      res.status(200).send(db_res.rows);
    }).catch((err) => {
      res.status(500).send(err);
    });
});

app.listen(process.env.BACKEND_PORT, (err) => {
  err ? console.error(err) : console.log(`Backend listening at ${process.env.BACKEND_PORT}`);
});
