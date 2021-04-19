DROP TABLE IF EXISTS characters;
CREATE TABLE characters (
    id SERIAL PRIMARY KEY,
   name varchar(255),
    house varchar(255),
    patronus varchar(255),
   is_alive boolean NOT NULL DEFAULT true, 
   created_by varchar(255)
);
