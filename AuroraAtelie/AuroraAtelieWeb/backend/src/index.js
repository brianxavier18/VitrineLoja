export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS Headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Helper para resposta JSON
    const jsonResponse = (data, status = 200) => 
      new Response(JSON.stringify(data), { 
        status, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });

    // Helper de Autenticação Google
    async function verifyAuth(request) {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        const token = authHeader.split(" ")[1];
        
        try {
            // Verifica o token diretamente com o Google
            const googleResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
            if (!googleResponse.ok) return null;
            
            const payload = await googleResponse.json();
            
            // LISTA DE EMAILS PERMITIDOS - SUBSTITUA PELO SEU EMAIL
            const ALLOWED_EMAILS = ["xavierbrian67@gmail.com", "llauracristina01@gmail.com"];
            
            if (ALLOWED_EMAILS.includes(payload.email)) {
                return payload;
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    try {
      // GET /images/:key - Servir imagens do R2
      if (url.pathname.startsWith("/images/")) {
        const rawKey = url.pathname.split("/images/")[1];
        const key = decodeURIComponent(rawKey); // Decodifica espaços e caracteres especiais

        try {
            const object = await env.IMAGE_BUCKET.get(key);

            if (!object) {
              return new Response("Image not found", { status: 404 });
            }

            const headers = new Headers();
            object.writeHttpMetadata(headers);
            headers.set("etag", object.httpEtag);
            headers.set("Access-Control-Allow-Origin", "*");
            headers.set("Cache-Control", "public, max-age=31536000"); // Cache por 1 ano
            
            // Garantir que o Content-Type exista
            if (!headers.get("Content-Type")) {
                headers.set("Content-Type", "image/jpeg");
            }

            return new Response(object.body, { headers });
        } catch (err) {
            return new Response("Error fetching image: " + err.message, { status: 500 });
        }
      }

      // POST /api/upload - Upload de imagem para R2
      if (url.pathname === "/api/upload" && request.method === "POST") {
        const user = await verifyAuth(request);
        if (!user) return jsonResponse({ error: "Unauthorized" }, 401);

        const formData = await request.formData();
        const file = formData.get("file");

        if (!file) {
          return jsonResponse({ error: "No file uploaded" }, 400);
        }

        // Sanitizar nome do arquivo (remove espaços e caracteres estranhos)
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const fileName = `${crypto.randomUUID()}-${safeName}`;
        
        // Salvar com metadados de tipo de arquivo
        await env.IMAGE_BUCKET.put(fileName, file, {
            httpMetadata: {
                contentType: file.type
            }
        });

        const imageUrl = `${url.origin}/images/${fileName}`;
        return jsonResponse({ url: imageUrl });
      }

      // GET /api/auth/check - Verificar se o token é válido e autorizado
      if (url.pathname === "/api/auth/check" && request.method === "GET") {
        const user = await verifyAuth(request);
        if (!user) return jsonResponse({ authorized: false }, 401);
        return jsonResponse({ authorized: true, email: user.email });
      }

      // GET /api/products - Listar todos
      if (url.pathname === "/api/products" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM products ORDER BY created_at DESC").all();
        return jsonResponse(results);
      }

      // POST /api/products - Criar novo
      if (url.pathname === "/api/products" && request.method === "POST") {
        const user = await verifyAuth(request);
        if (!user) return jsonResponse({ error: "Unauthorized" }, 401);

        const data = await request.json();
        const { success } = await env.DB.prepare(
          "INSERT INTO products (name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?)"
        ).bind(data.name, data.description, data.price, data.category, data.image_url).run();
        
        return jsonResponse({ success, message: "Produto criado" }, 201);
      }

      // PUT /api/products/:id - Atualizar
      if (url.pathname.startsWith("/api/products/") && request.method === "PUT") {
        const user = await verifyAuth(request);
        if (!user) return jsonResponse({ error: "Unauthorized" }, 401);

        const id = url.pathname.split("/").pop();
        const data = await request.json();
        
        const { success } = await env.DB.prepare(
          "UPDATE products SET name=?, description=?, price=?, category=?, image_url=? WHERE id=?"
        ).bind(data.name, data.description, data.price, data.category, data.image_url, id).run();

        return jsonResponse({ success, message: "Produto atualizado" });
      }

      // DELETE /api/products/:id - Remover
      if (url.pathname.startsWith("/api/products/") && request.method === "DELETE") {
        const user = await verifyAuth(request);
        if (!user) return jsonResponse({ error: "Unauthorized" }, 401);

        const id = url.pathname.split("/").pop();
        const { success } = await env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
        return jsonResponse({ success, message: "Produto removido" });
      }

    } catch (e) {
      return jsonResponse({ error: e.message }, 500);
    }

    return new Response("Aurora Ateliê API", { headers: corsHeaders });
  }
};
