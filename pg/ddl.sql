CREATE TABLE IF NOT EXISTS users (
  email TEXT PRIMARY KEY NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  profile_pic_1 TEXT NOT NULL,
  profile_pic_2 TEXT NOT NULL,
  profile_pic_3 TEXT NOT NULL,
  azure_id TEXT NOT NULL
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

-- INSERT INTO users (email, username, password, profile_pic_1, profile_pic_2, profile_pic_3)
-- VALUES ('test@foo.com', 'test', 'password', 'eewk41jn7jrjmq.jpg', 'eewk41jn7jrjmr.jpg', 'eewk41jn7jrjms.jpg'),
-- ('test1@foo.com', 'test1', 'password', 'eewk41jn7ko0iz.jpg', 'eewk41jn7ko0j0.jpg', 'eewk41jn7ko0j1.jpg'),
-- ('test2@foo.com', 'test2', 'password', 'eewk41jn7krjz8.jpg', 'eewk41jn7krjz9.jpg', 'eewk41jn7krjza.jpg'),
-- ('test3@foo.com', 'test3', 'password', 'eewk41jn7krtc1.jpg', 'eewk41jn7krtc2.jpg', 'eewk41jn7krtc3.jpg');
--
-- INSERT INTO images (id, userid, timestamp, lat, lng)
-- VALUES ('eewk41jn7iz5kp.jpg', 'test@foo.com', 1534660022, 1.351658, 103.683273),
-- ('eewk41jn7jrjmq.jpg', 'test@foo.com', 1534660100, 1.351758, 103.684273),
-- ('eewk41jn7krjza.jpg', 'test@foo.com', 1534550100, 1.351858, 103.694273),
-- ('eewk41jn7krtc1.jpg', 'test@foo.com', 1534440100, 1.351958, 103.644273),
-- ('eewk41jn7jrjms.jpg', 'test@foo.com', 1534660000, 1.351858, 103.685273),
-- ('eewk41jn7krtc2.jpg', 'test@foo.com', 1534660000, 1.351858, 103.685273),
-- ('eewk41jn7krtc3.jpg', 'test@foo.com', 1534660000, 1.351858, 103.685273);
--
-- INSERT INTO events (name, location, date)
-- VALUES ('SDYC', 'NUS High School', 1534660022),
-- ('iNTUition', 'NTU', 1539960022),
-- ('Thingy', 'Piggy', 1546660022);
--
-- INSERT INTO users_in_event (event, userid)
-- VALUES (1, 'test@foo.com'),
-- (1, 'test1@foo.com'),
-- (1, 'test2@foo.com'),
-- (1, 'test3@foo.com'),
-- (2, 'test@foo.com'),
-- (2, 'test2@foo.com'),
-- (2, 'test3@foo.com'),
-- (3, 'test@foo.com'),
-- (3, 'test1@foo.com'),
-- (3, 'test2@foo.com');
--
-- INSERT INTO cliques (name)
-- VALUES ('Clique 1'),
-- ('Clique 2'),
-- ('Clique 3');
--
-- INSERT INTO users_in_clique (userid, clique)
-- VALUES ('test@foo.com', 1),
-- ('test1@foo.com', 1),
-- ('test2@foo.com', 1),
-- ('test1@foo.com', 2),
-- ('test2@foo.com', 2),
-- ('test3@foo.com', 2),
-- ('test@foo.com', 3),
-- ('test3@foo.com', 3);
--
-- INSERT INTO event_clique_image (event, image, clique)
-- VALUES (1, 'eewk41jn7iz5kp.jpg', 1),
-- (1, 'eewk41jn7jrjmq.jpg', 1),
-- (1, 'eewk41jn7krjza.jpg', 1),
-- (2, 'eewk41jn7krtc1.jpg', 2),
-- (2, 'eewk41jn7jrjms.jpg', 3),
-- (3, 'eewk41jn7krtc2.jpg', 3),
-- (3, 'eewk41jn7krtc3.jpg', 3);
