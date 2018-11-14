DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        firstname VARCHAR(200) NOT NULL,
        lastname VARCHAR(200) NOT NULL,
        email VARCHAR(200) NOT NULL UNIQUE CHECK (email <> ''),
        pass VARCHAR(200) NOT NULL
);


CREATE TABLE signatures (
        id SERIAL PRIMARY KEY,
        signature TEXT NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id)
);


CREATE TABLE user_profiles(
    id SERIAL PRIMARY KEY,
    age INTEGER,
    city VARCHAR(100),
    url VARCHAR(250),
    user_id INT UNIQUE NOT NULL REFERENCES users(id)
);
