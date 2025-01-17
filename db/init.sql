CREATE DATABASE hello_db;

\c hello_db;

CREATE TABLE greetings (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL
);

INSERT INTO greetings (message) VALUES ('Hello, World!');
