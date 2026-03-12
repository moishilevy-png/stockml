export default async function handler(req, res) {
  const { token, user_id } = req.query;

  if (!token || !user_id) {
    return res.status(400).json({ error: 'Faltan token o user_id' });
  }

  try {
    const itemsRes = await fetch(
      `https://api.mercadolibre.com/users/${user_id}/items/search?status=active&limit=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const itemsData = await itemsRes.json();
    const ids = itemsData.results || [];

    if (ids.length === 0) return res.json([]);

    const chunks = [];
    for (let i = 0; i < ids.length; i += 20) chunks.push(ids.slice(i, i + 20));

    const products = [];
    for (const chunk of chunks) {
      const detailRes = await fetch(
        `https://api.mercadolibre.com/items?ids=${chunk.join(',')}&attributes=id,title,available_quantity,price,thumbnail,attributes`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const details = await detailRes.json();
      details.forEach(d => {
        if (d.code === 200) {
          const item = d.body;
          const skuAttr = item.attributes?.find(a =>
            a.id === 'SELLER_SKU' || a.id === 'seller_sku'
          );
          products.push({
            id: item.id,
            title: item.title,
            available_quantity: item.available_quantity,
            price: item.price,
            thumbnail: item.thumbnail,
            seller_sku: skuAttr?.value_name || null
          });
        }
      });
    }

    res.json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
