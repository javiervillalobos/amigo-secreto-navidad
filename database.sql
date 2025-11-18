DROP TABLE IF EXISTS Regalos;
DROP TABLE IF EXISTS Familia;

CREATE TABLE Familia (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE Regalos (
    id SERIAL PRIMARY KEY,
    miembro_id INT UNIQUE NOT NULL,
    nombre_regalo VARCHAR(255) NOT NULL,
    url_regalo TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (miembro_id) REFERENCES Familia(id)
);