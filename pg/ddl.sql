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
  lng FLOAT(8),
  uri TEXT NOT NULL
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


INSERT INTO events (id, name, location, date)
VALUES ()