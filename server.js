// estoquespy-backend/server.js
import express from "express";
import cors from "cors";
import { products, movements } from "./data.js";

const app = express();
const PORT = 3001;

// CORS liberado pra qualquer origem (facilita no desenvolvimento)
app.use(cors());
app.use(express.json());

// ---------- ROTAS PRO FRONT ----------

// Lista de produtos
app.get("/api/products", (req, res) => {
  console.log("GET /api/products chamado");
  res.json(products);
});

// Lista de movimentações
app.get("/api/movements", (req, res) => {
  console.log("GET /api/movements chamado");
  res.json(movements);
});

// ---------- ROTA QUE A ESP32 VAI USAR ----------
app.post("/api/rfid/read", (req, res) => {
  const { rfid_tag, leitor_id } = req.body;

  if (!rfid_tag || !leitor_id) {
    return res
      .status(400)
      .json({ error: "rfid_tag e leitor_id são obrigatórios" });
  }

  console.log("TAG recebida:", rfid_tag, "do leitor:", leitor_id);

  // Encontrar produto pelo IDRFID
  const product = products.find((p) => p.IDRFID === rfid_tag);

  const now = new Date();
  const date = now.toISOString().slice(0, 10); // yyyy-mm-dd
  const time = now.toTimeString().slice(0, 5); // hh:mm

  if (!product) {
    console.warn("Nenhum produto cadastrado para esta TAG:", rfid_tag);

    // Mesmo sem produto, registramos uma movimentação de SAÍDA de TAG desconhecida
    movements.push({
      id: (movements.length + 1).toString(),
      productName: "TAG DESCONHECIDA",
      type: "saida",
      quantity: 1,
      date,
      time,
      responsible: `Leitor ${leitor_id}`,
    });

    return res.status(200).json({
      message: "TAG recebida, mas não vinculada a produto",
    });
  }

  // Garante que quantity é um número
  if (typeof product.quantity !== "number") {
    product.quantity = 0;
  }

  // FAZER SAÍDA: remover 1 unidade, sem deixar negativo
  if (product.quantity > 0) {
    product.quantity = product.quantity - 1;
  } else {
    console.warn(
      `Produto ${product.name} já está com quantidade 0, não foi possível decrementar.`
    );
  }

  // Registrar movimentação como SAÍDA
  movements.push({
    id: (movements.length + 1).toString(),
    productName: product.name,
    type: "saida", // <<< SAÍDA
    quantity: 1,
    date,
    time,
    responsible: `Leitor ${leitor_id}`,
  });

  console.log(
    `Movimentação de SAÍDA registrada para produto: ${product.name}. Novo saldo: ${product.quantity}`
  );

  return res.status(200).json({
    message: "Saída registrada com sucesso",
    product: {
      id: product.id,
      name: product.name,
      quantity: product.quantity,
    },
  });
});

// ---------- INICIAR SERVIDOR ----------
app.listen(PORT, () => {
  console.log(`Backend EstoqueSpy rodando em http://localhost:${PORT}`);
});
