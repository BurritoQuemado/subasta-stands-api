    CREATE DATABASE IF NOT EXISTS auctions;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    currency BIGINT NOT NULL default 0,
    updated_at TIMESTAMP,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS login (
    id SERIAL PRIMARY KEY,
    email text UNIQUE NOT NULL,
    hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(255) UNIQUE NOT NULL,
    equipment VARCHAR(255) NOT NULL,
    value BIGINT default 0
);

CREATE TABLE IF NOT EXISTS codes_visited_list (
    id SERIAL PRIMARY KEY,
    code_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (code_id) REFERENCES codes (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
); 