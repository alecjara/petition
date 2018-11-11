DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS signatures;

CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        firstname VARCHAR(200) NOT NULL,
        lastname VARCHAR(200) NOT NULL,
        email VARCHAR(200) NOT NULL UNIQUE CHECK (email <> ''),
        pass VARCHAR(200) NOT NULL
);

CREATE TABLE signatures (
        id SERIAL PRIMARY KEY,
        firstname VARCHAR(200) NOT NULL,
        lastname VARCHAR(200) NOT NULL,
        signature TEXT NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id)
        -- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
