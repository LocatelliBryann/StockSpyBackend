// estoquespy-backend/data.js

export const products = [
  {
    id: "1",
    name: "Camiseta Básica Branca",
    category: "Camisetas",
    size: "M",
    color: "Branco",
    quantity: 150,
    price: 29.9,
    supplier: "Confecções Lima",
    registeredBy: "Maria Silva",
    registeredAt: "2025-01-20",
    IDRFID: "417370A2", // <--- Tag 1
  },
  {
    id: "2",
    name: "Calça Jeans Azul",
    category: "Calças",
    size: "40",
    color: "Azul",
    quantity: 80,
    price: 89.9,
    supplier: "Jeans Brasil",
    registeredBy: "João Santos",
    registeredAt: "2025-01-22",
    IDRFID: "2EEB47AF", // <--- Tag 2
  },
  {
    id: "3",
    name: "Jaqueta de Couro",
    category: "Casacos",
    size: "G",
    color: "Preto",
    quantity: 25,
    price: 250.00,
    supplier: "Couro Fino",
    registeredBy: "Ana Souza",
    registeredAt: "2025-02-10",
    IDRFID: "E152F804", // <--- Tag 3
  },
];

export const movements = [];