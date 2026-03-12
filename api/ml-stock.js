export default async function handler(req, res) {
  const { token, user_id } = req.query;

  if (!token || !user_id) {
    return res.status(400).json({ error: 'Faltan token o user_id' });
  }

  try {
    // Traer todas las publicaciones activas
    const itemsRes = await fetch(
      `https://api.mercadolibre.com/users/${user_id}/items/search?status=active&limit=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const itemsData = await itemsRes.json();
    const ids = itemsData.results || [];

    if (ids.length === 0) return res.json([]);

    // Traer detalles de cada publicación en grupos de 20
    const chunks = [];
    for (let i = 0; i < ids.length; i += 20) chunks.push(ids.slice(i, i + 20));

    const products = [];
    for (const chunk of chunks) {
      const detailRes = await fetch(
        `https://api.mercadolibre.com/items?ids=${chunk.join(',')}&attributes=id,title,available_quantity,price,thumbnail`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const details = await detailRes.json();
      details.forEach(d => {
        if (d.code === 200) products.push(d.body);
      });
    }

    res.json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}