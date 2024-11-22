import { Hono } from "hono";
import { handle } from "hono/vercel";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc, and } from "drizzle-orm";
import { users, transactions, type Transaction } from "../orm";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export const config = {
  runtime: "edge",
};

const app = new Hono().basePath("/api");

app.use(
  "/*",
  logger(),
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length", "X-Requested-With"],
    maxAge: 86400,
    credentials: true,
  })
);

app.onError((err, c) => {
  console.error(`${err}`);

  return c.json({ message: "Something went wrong" }, 500);
});

interface DbError extends Error {
  code?: string;
}

app.get("/user/:username", async (c) => {
  const username = c.req.param("username");

  const user = await db
    .select()
    .from(users)
    .where(eq(users.username, username.toLocaleLowerCase()))
    .limit(1);

  return c.json({ exists: user.length > 0 });
});

app.post("/user", async (c) => {
  const { username } = await c.req.json();

  if (!username) {
    return c.json({ error: "Username is required" }, 400);
  }

  const sanitizedUsername = username.trim().toLowerCase();
  const usernameRegex = /^[a-z0-9_]{3,20}$/;

  if (!usernameRegex.test(sanitizedUsername)) {
    return c.json(
      {
        error:
          "Invalid username. Use 3-20 characters, only letters, numbers and underscores allowed.",
      },
      400
    );
  }

  try {
    const result = await db
      .insert(users)
      .values({ username: sanitizedUsername })
      .returning();

    return c.json({ username: result[0].username });
  } catch (error: unknown) {
    const dbError = error as DbError;
    if (dbError.code === "23505") {
      return c.json({ error: "Username already exists" }, 409);
    }
    return c.json(
      { error: "Failed to create user", details: dbError.message },
      500
    );
  }
});

app.get("/transactions/:username", async (c) => {
  const username = c.req.param("username");

  const result = await db
    .select()
    .from(transactions)
    .where(eq(transactions.username, username.toLowerCase()))
    .orderBy(desc(transactions.datetime));

  return c.json(result);
});

app.post("/transactions", async (c) => {
  const body: Transaction = await c.req.json();

  const parsedBody = {
    ...body,
    datetime: new Date(body.datetime),
    username: body.username?.toLowerCase(),
  };

  const result = await db.insert(transactions).values(parsedBody).returning();

  return c.json(result[0]);
});

app.delete("/transactions/:id/:username", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const username = c.req.param("username");

  const result = await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.username, username)))
    .returning();

  if (!result.length) {
    return c.json({ error: "Transaction not found or unauthorized" }, 404);
  }

  return c.json({ message: "Transaction deleted successfully" });
});

app.get("/transactions/analysis/:username", async (c) => {
  const username = c.req.param("username");

  const userTransactions = await db
    .select()
    .from(transactions)
    .where(eq(transactions.username, username.toLowerCase()))
    .orderBy(desc(transactions.datetime));

  const transactionsData = userTransactions.map((t) => ({
    amount: t.value,
    category: t.type,
    description: t.description,
    datetime: t.datetime,
  }));
  const prompt = `¡Hola! 👋 Soy tu asistente financiero de Cachín, la app que te ayuda a controlar tus finanzas mientras te diviertes.

    Analizaré tus transacciones para darte un reporte personalizado. Incluiré:
    
    🔍 Análisis detallado de tus patrones de gasto
    💰 Distribución de ingresos y gastos
    📊 Categorías donde más gastas
    🚩 Gastos recurrentes o patrones que debes vigilar
    💡 Tips específicos basados en tus hábitos de consumo
    🎯 Recomendaciones para mejorar tu salud financiera
    🌟 Oportunidades de ahorro según tus gastos
    
    ¡Usaré un lenguaje casual y emojis para que sea más divertido! No usaré markdown.
    
    Aquí están tus transacciones para analizar: ${JSON.stringify(
      transactionsData,
      null,
      2
    )}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Eres Cachín, un asistente financiero amigable y moderno que ayuda a jóvenes a manejar mejor su dinero. Tu objetivo es analizar patrones de gasto, identificar áreas de mejora, y dar consejos personalizados basados en sus hábitos específicos. Usa un tono casual, divertido y empático, con emojis, pero manteniendo el profesionalismo en tus recomendaciones financieras. Enfócate en encontrar patrones de consumo y sugerir cambios realistas y alcanzables.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI API error");
    }

    const aiResponse = await response.json();
    const analysis = aiResponse.choices[0].message.content;

    return c.json({ analysis });
  } catch (error) {
    console.error("Error al analizar transacciones:", error);
    return c.json(
      {
        error: "No se pudo generar el análisis",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

export default handle(app);
