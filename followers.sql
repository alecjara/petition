DROP TABLE IF EXISTS followers;

CREATE TABLE followers (

        id SERIAL PRIMARY KEY,
        firstname VARCHAR(200) NOT NULL,
        lastname VARCHAR(200) NOT NULL,
        signature TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
