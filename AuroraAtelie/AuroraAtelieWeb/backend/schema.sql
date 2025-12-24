DROP TABLE IF EXISTS products;
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products (name, description, price, category, image_url) VALUES 
('Brinco Pérola Real', 'Brinco clássico com pérola natural', 299.90, 'brincos', 'img/p1.jpg'),
('Colar Gota de Ouro', 'Colar banhado a ouro 18k', 450.00, 'colares', 'img/p2.jpg'),
('Conjunto Noite Estrelada', 'Conjunto completo com pedras negras', 1200.00, 'conjuntos', 'img/p3.jpg');
