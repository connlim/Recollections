CREATE TABLE IF NOT EXISTS users (
  email TEXT PRIMARY KEY NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  profile_pic TEXT NOT NULL
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
