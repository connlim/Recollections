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

const identify = require('./identify-test');
identify.initialize(process.env.GROUP_ID, process.env.GROUP_NAME);

const insert_file = (file) => {
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
    let azure_id = '';
    db.query('SELECT 1 FROM users WHERE email = $1', [
      req.body.email
    ]).then((db_res) => {
      if(db_res.rows.length > 0) {
        throw { code: 400, message: "User already exists" };
      } else {
        return Promise.all(req.files.map((file) => {
          return insert_file(file.buffer);
        }));
      }
    }).then((profile_ids) => {
      return identify.createUser(process.env.GROUP_ID, req.body.username).then((aid) => {
        azure_id = aid;
        return profile_ids;
      });
    }).then((profile_ids) => {
      return db.query('INSERT INTO users (email, username, password, profile_pic_1, profile_pic_2, profile_pic_3, azure_id) VALUES ($1, $2, $3, $4, $5, $6, $7)', [
        req.body.email,
        req.body.username,
        req.body.password,
        profile_ids[0],
        profile_ids[1],
        profile_ids[2],
        azure_id,
      ]);
    }).then(() => {
      return identify.addFaces(process.env.GROUP_ID, azure_id, req.files.map(file => file.buffer));
    }).then(() => {
      return identify.update(process.env.GROUP_ID);
    }).then(() => {
      res.status(200).send('Success');
    }).catch((err) => {
      console.log(err);
      if(err.code && typeof err.code == 'number' && err.message && !err.severity) {
        res.status(err.code).send(err.message);
      } else {
        res.send(err);
        // res.status(500).send("Database error");
      }
    });
  }
});

app.post('/images', auth, upload.array('file'), (req, res) => {
  if(!req.files) {
    res.status(400).send('No files');
  } else {
    let group_means = [];
    let locations = [];
    let grouped_files = [];
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
        let return_val = {};
        insert_file(file.buffer).then((id) => { // Insert file into minio
          return_val = { id, ...metadata, buffer: file.buffer };
          //Insert entry into postgres
          return db.query('INSERT INTO images (id, userid, timestamp, lat, lng) VALUES ($1, $2, $3, $4, $5)', [
            id,
            req.user,
            metadata.datetime,
            metadata.lat,
            metadata.lng
          ]);
        }).then(() => {
          resolve(return_val);
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
          let group_total = groups[current_group].reduce((acc, val) => acc + val.datetime, 0);
          group_means[current_group] = group_total / groups[current_group].length;
          let mean_lat = groups[current_group].reduce((acc, val) => acc + val.lat, 0) / groups[current_group].length;
          let mean_lng = groups[current_group].reduce((acc, val) => acc + val.lng, 0) / groups[current_group].length;
          locations[current_group] = reverseGeocode(mean_lat, mean_lng);

          current_group++;
          groups.push([files_data[i+1]]); //Push into new array entry
        }
      }
      let group_total = groups[current_group].reduce((acc, val) => acc + val.datetime, 0);
      group_means[current_group] = group_total / groups[current_group].length;
      let mean_lat = groups[current_group].reduce((acc, val) => acc + val.lat, 0) / groups[current_group].length;
      let mean_lng = groups[current_group].reduce((acc, val) => acc + val.lng, 0) / groups[current_group].length;
      locations[current_group] = reverseGeocode(mean_lat, mean_lng);
      return groups;
    }).then((groups) => { //Identify people in photos
      grouped_files = groups;
      return Promise.all(groups.map(event => {
        return Promise.all(event.map(photo => {
          return identify.identify(process.env.GROUP_ID, photo.buffer);
        }));
      }));
    }).then((groups) => { //Flatten photos
      return groups.map(group => {
        return group.reduce((acc, photo) =>  acc.concat(photo.filter(x => !acc.some(y => x == y))), []);
      });
    }).then((groups) => { //Find people in an event
      console.log(2);
      return Promise.all(groups.map((group, i) => {
        console.log(`${group}, ${i}`);
        console.log(grouped_files);
        let dominant_clique;
        let event_id;
        return db.query(`
          SELECT DISTINCT c.id AS id, array_agg(u.azure_id) AS aids FROM (
          	SELECT * FROM cliques c, users_in_clique uic
          		WHERE c.id = uic.clique AND uic.userid = $1
          	) c, users u, users_in_clique uic
          	WHERE c.id = uic.clique AND u.email = uic.userid
          	GROUP BY c.id
        `, [
          req.user
        ]).then((db_res) => {
          console.log(db_res.rows);
          let proportions = db_res.map((clique) => {
            let total = clique.aids.reduce((acc, val) => {
              if(group.some(x => x == val)){
                return acc + 1;
              } else {
                return acc;
              }
            }, 0);
            return total / clique.aids.length;
          });
          console.log(proportions);
          const max_proportion = Math.max(...proportions);
          dominant_clique = db_res[db_res.findIndex((elem) => elem == max_proportion)].id;
          return db.query('SELECT DISTINCT e.* FROM events e, event_clique_image eci WHERE eci.clique = $1 AND eci.event = e.id', [
            dominant_clique
          ]);
        }).then((db_res) => {
          console.log(4);
          let events = db_res.rows.sort((a, b) => a.datetime - b.datetime);
          let differences = [];
          for(let i = 0; i < events.length - 1; i++){
            differences.push(events[i+1].datetime - events[i].datetime);
          }
          const difference_sum = differences.reduce((acc, val) => acc + val, 0);
          const difference_mean = difference_sum / differences.length;
          const difference_sd = Math.sqrt(differences.reduce((acc, val) => acc + Math.pow(val - difference_mean, 2), 0.0) / (differences.length - 1));

          let mean = group_means[i];
          console.log(mean);
          if(mean > 3 * difference_sd) {
            return db.query('INSERT INTO events (name, location, date) VALUES ($1, $2, $3) RETURNING id', [
              `${mean % 24 < 12 ? 'Morning' : 'Afternoon'} at ${locations[i]}`,
              locations[i],
              mean
            ]).then((db_res) => {
              return db_res.rows[0].id;
            });
          } else {
            let target_event = events.find((elem) => {
              return Math.abs(elem.datetime - mean) == Math.min(...events.map(e => Math.abs(e.datetime - mean)));
            });
            return target_event;
          };
        }).then((eid) => {
          event_id = eid;
          console.log(5);
          return db.query('SELECT email, azure_id FROM users').then((db_res) => {
            let values = group.map(val => `(${event_id}, ${db_res.find(elem => elem.azure_id == val).email})`).join(', ');
            return db.query(`INSERT INTO users_in_event (event, userid) VALUES ${values}`);
          });
        }).then(() => {
          return Promise.all(grouped_files[i].map(file => {
            return db.query('INSERT INTO event_clique_image (event, clique, image) VALUES ($1, $2, $3)', [
              event_id,
              dominant_clique,
              file.id
            ]);
          }))          r
        });
      }));
    }).then((groups) => {
      console.log(groups);
      res.status(200).send("Success");
    }).catch((err) => {
      console.log('died');
      // console.log(err);
      res.status(500).send(err);
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

app.post("/clique", auth, (req, res) => {
  db.query("INSERT INTO cliques (name) VALUES ($1) RETURNING id;", [req.body.clique_name])
  .then((db_res) => {
    let clique = db_res.rows[0].id;
    console.log(clique);
    let users = req.body.users;
    users.push(req.user);
    let clique_values = users.map(u => '( \'' + u + `\', ${clique})`).join(',');
    console.log(clique_values);
    return db.query(`INSERT INTO users_in_clique (userid, clique) VALUES ${clique_values}`);
  }).then((db_res) => {
    console.log(db_res);
    res.status(200).send('Success');
  }).catch((err) => {
    res.status(500).send(err);
  });
});

app.get("/clique", auth, (req, res) => {
  db.query(`
    SELECT cliques.id, cliques.name FROM cliques
    INNER JOIN users_in_clique on cliques.id = users_in_clique.clique
    WHERE users_in_clique.userid = $1
  `, [req.user])
  .then((db_res) => {
    res.status(200).send(db_res.rows);
  }).catch((err) => {
    res.status(500).send(err);
  });
});

app.get("/clique/:clique_id", auth, (req, res) => {
  db.query(`
    SELECT e.name, e.location, e.date, array_agg(DISTINCT i.id) AS images, array_agg(DISTINCT u.username) AS other_users
      FROM (
            SELECT e.* FROM 
              events e
                INNER JOIN 
              event_clique_image eci 
                ON e.id=eci.event
                INNER JOIN
              cliques c
                ON c.id=eci.clique 
            WHERE c.id=$1
           ) e, event_clique_image eci, images i, users_in_event uie, users u
      WHERE e.id = eci.event AND eci.image = i.id AND uie.event = e.id AND uie.userid = u.email
      GROUP BY e.name, e.location, e.date
      ORDER BY e.date DESC;
  `, [req.params.clique_id])
  .then((db_res) => {
    res.status(200).send(db_res.rows);
  }).catch((err) => {
    res.status(500).send(err);
  });
});

app.listen(process.env.BACKEND_PORT, (err) => {
  err ? console.error(err) : console.log(`Backend listening at ${process.env.BACKEND_PORT}`);
});
