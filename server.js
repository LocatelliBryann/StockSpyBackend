// estoquespy-backend/server.js
import express from "express";
import cors from "cors";
import { products, movements } from "./data.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ---------- ROTAS DE PRODUTOS (CRUD) ----------

// 1. LISTAR (GET)
app.get("/api/products", (req, res) => {
  res.json(products);
});

// 2. CRIAR NOVO (POST)
app.post("/api/products", (req, res) => {
  const newProduct = req.body;
  // Gera um ID simples se não vier um
  if (!newProduct.id) {
    newProduct.id = Date.now().toString();
  }
  // Garante que quantity e price sejam números
  newProduct.quantity = Number(newProduct.quantity) || 0;
  newProduct.price = Number(newProduct.price) || 0;
  
  products.push(newProduct);
  console.log("Produto criado:", newProduct.name);
  res.status(201).json(newProduct);
});

// 3. EDITAR / ATUALIZAR (PUT) - Essa é a rota que faltava para o seu erro!
app.put("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Produto não encontrado" });
  }

  // Atualiza os dados do produto no array
  products[index] = { ...products[index], ...updatedData };
  
  // Garante tipos numéricos
  products[index].quantity = Number(products[index].quantity);
  products[index].price = Number(products[index].price);

  console.log(`Produto atualizado: ${products[index].name} (Tag: ${products[index].IDRFID})`);
  res.json(products[index]);
});

// 4. EXCLUIR (DELETE)
app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Produto não encontrado" });
  }

  const deleted = products.splice(index, 1);
  console.log("Produto excluído:", deleted[0].name);
  res.json({ message: "Produto removido com sucesso" });
});

// ---------- ROTAS DE MOVIMENTAÇÕES ----------

app.get("/api/movements", (req, res) => {
  res.json(movements);
});

// ---------- ROTA DO HARDWARE (ESP32) ----------
app.post("/api/rfid/read", (req, res) => {
  const { rfid_tag, leitor_id } = req.body;

  if (!rfid_tag || !leitor_id) {
    return res.status(400).json({ error: "rfid_tag e leitor_id são obrigatórios" });
  }

  console.log("TAG recebida do ESP32:", rfid_tag);

  // Procura o produto pela TAG (agora comparando Strings)
  const product = products.find((p) => p.IDRFID === rfid_tag);

  const now = new Date();
  const date = now.toLocaleDateString("pt-BR"); // Formato DD/MM/AAAA
  const time = now.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });

  if (!product) {
    console.warn("TAG DESCONHECIDA:", rfid_tag);
    movements.push({
      id: Date.now().toString(),
      productName: "TAG DESCONHECIDA",
      type: "saida",
      quantity: 1,
      date,
      time,
      responsible: `Leitor ${leitor_id} (Tag: ${rfid_tag})`,
    });
    return res.status(200).json({ message: "Tag desconhecida registrada" });
  }

  // Lógica de Saída de Estoque
  if (product.quantity > 0) {
    product.quantity -= 1;
  }

  movements.push({
    id: Date.now().toString(),
    productName: product.name,
    type: "saida",
    quantity: 1,
    date,
    time,
    responsible: `Leitor ${leitor_id}`,
  });

  console.log(`Saída registrada: ${product.name}. Saldo: ${product.quantity}`);

  return res.status(200).json({
    message: "Saída registrada com sucesso",
    product: { name: product.name, quantity: product.quantity },
  });
});

// ---------- INICIAR SERVIDOR ----------
app.listen(PORT, () => {
  console.log(`Backend EstoqueSpy rodando em http://localhost:${PORT}`);
});