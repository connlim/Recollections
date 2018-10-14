CREATE TABLE IF NOT EXISTS users (
  email TEXT PRIMARY KEY NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  profile_pic_1 TEXT NOT NULL,
  profile_pic_2 TEXT NOT NULL,
  profile_pic_3 TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS images (
  id TEXT PRIMARY KEY NOT NULL,
  userid TEXT NOT NULL REFERENCES users(email),
  "timestamp" BIGINT,
  lat FLOAT(8),
  lng FLOAT(8)
);

CREATE TABLE IF NOT EXISTS users_in_image (
  userid TEXT NOT NULL REFERENCES users(email),
  image TEXT NOT NULL REFERENCES images(id),
  PRIMARY KEY (userid, image)
);

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  "date" BIGINT
);

CREATE TABLE IF NOT EXISTS users_in_event (
  event INTEGER NOT NULL REFERENCES events(id),
  userid TEXT NOT NULL REFERENCES users(email),
  PRIMARY KEY (event, userid)
);

CREATE TABLE IF NOT EXISTS cliques (
  id SERIAL PRIMARY KEY NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users_in_clique (
  userid TEXT NOT NULL REFERENCES users(email),
  clique INTEGER NOT NULL REFERENCES cliques(id),
  PRIMARY KEY (userid, clique)
);

CREATE TABLE IF NOT EXISTS event_clique_image (
  event INTEGER NOT NULL REFERENCES events(id),
  image TEXT NOT NULL REFERENCES images(id),
  clique INTEGER NOT NULL REFERENCES cliques(id),
  PRIMARY KEY (event, image, clique)
);

INSERT INTO users (email, username, password, profile_pic_1, profile_pic_2, profile_pic_3)
VALUES ('jacob.teo@gmail.com', 'jacobteo', 'password', 'eewk41jn7jrjmq.jpg', 'eewk41jn7jrjmr.jpg', 'eewk41jn7jrjms.jpg'),
('dylantoh@gmail.com', 'dylanabcd', 'password', 'eewk41jn7ko0iz.jpg', 'eewk41jn7ko0j0.jpg', 'eewk41jn7ko0j1.jpg'),
('clemenclemenclemen@gmail.com', 'clemeeeeen', 'password', 'eewk41jn7krjz8.jpg', 'eewk41jn7krjz9.jpg', 'eewk41jn7krjza.jpg');

INSERT INTO images (id, userid, timestamp, lat, lng)
VALUES ('eewk41jn7iz5kp.jpg', 'jacob.teo@gmail.com', 1534660022, 1.351658, 103.683273),
('eewk41jn7jrjmq.jpg', 'jacob.teo@gmail.com', 1534660100, 1.351758, 103.684273),
('eewk41jn7krjza.jpg', 'jacob.teo@gmail.com', 1534550100, 1.351858, 103.694273),
('eewk41jn7krtc1.jpg', 'dylantoh@gmail.com', 1534440100, 1.351958, 103.644273),
('eewk41jn7jrjms.jpg', 'dylantoh@gmail.com', 1534660000, 1.351858, 103.685273),
('eewk41jn7krtc2.jpg', 'dylantoh@gmail.com', 1534660000, 1.351858, 103.685273),
('eewk41jn7krtc3.jpg', 'dylantoh@gmail.com', 1534660000, 1.351858, 103.685273);

INSERT INTO events (name, location, date)
VALUES ('iNTUition', 'Nanyang Technological University', 1539470730),
('SDYC', 'NUS High School of Math and Science', 1534682730);

INSERT INTO users_in_event (event, userid)
VALUES (1, 'jacob.teo@gmail.com'),
(1, 'dylantoh@gmail.com'),
(1, 'clemenclemenclemen@gmail.com');

INSERT INTO cliques (name)
VALUES ('Jacob Gang'),
('ABCde'),
('my group');

INSERT INTO users_in_clique (userid, clique)
VALUES ('jacob.teo@gmail.com', 1),
('dylantoh@gmail.com', 1),
('clemenclemenclemen@gmail.com', 1);

INSERT INTO event_clique_image (event, image, clique)
VALUES (1, 'eewk41jn7iz5kp.jpg', 1),
(1, 'eewk41jn7jrjmq.jpg', 1),
(1, 'eewk41jn7krjza.jpg', 1),
(1, 'eewk41jn7krtc1.jpg', 1),
(1, 'eewk41jn7jrjms.jpg', 1),
(1, 'eewk41jn7krtc2.jpg', 1);

insert into users_in_clique values ('jacob.teo@gmail.com', 2), ('jacob.teo@gmail.com', 3)