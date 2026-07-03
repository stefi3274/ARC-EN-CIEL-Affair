'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Variant = { size: string; color: string; stock: string; priceOverride: string };

export default function SellForm(props: { categories: any[]; onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [origin, setOrigin] = useState('');
  const [itemYear, setItemYear] = useState('');
  const [colors, setColors] = useState('');
  const [condition, setCondition] = useState('bon état');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addVariant() {
    setVariants((prev) => [...prev, { size: '', color: '', stock: '', priceOverride: '' }]);
  }

  function updateVariant(index: number, field: keyof Variant, value: string) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const supabase = createClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;
    if (!user) {
      setUploading(false);
      return;
    }

    const path = user.id + '/' + Date.now() + '-' + file.name;
    const uploadResult = await supabase.storage.from('marketplace').upload(path, file);

    setUploading(false);

    if (uploadResult.error) {
      setError("Envoi de l'image impossible.");
      return;
    }

    const publicUrl = supabase.storage.from('marketplace').getPublicUrl(path).data.publicUrl;
    setImages((prev) => [...prev, publicUrl]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const userResult = await supabase.auth.getUser();
    const user = userResult.data.user;

    if (!user) {
      setError('Session expirée, reconnecte-toi.');
      setSaving(false);
      return;
    }

    const colorsArray = colors
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const insertResult = await supabase
      .schema('marketplace')
      .from('listings')
      .insert({
        seller_id: user.id,
        title,
        description: description || null,
        price: price ? parseFloat(price) : null,
        category_id: categoryId || null,
        brand: brand || null,
        origin: origin || null,
        item_year: itemYear ? parseInt(itemYear, 10) : null,
        colors: colorsArray.length > 0 ? colorsArray : null,
        condition: condition || null,
        images,
      })
      .select('id')
      .single();

    if (insertResult.error || !insertResult.data) {
      setError('Publication impossible. Réessaie.');
      setSaving(false);
      return;
    }

    const listingId = insertResult.data.id;

    const variantRows = variants
      .filter((v) => v.size || v.color)
      .map((v) => ({
        listing_id: listingId,
        size: v.size || null,
        color: v.color || null,
        stock: v.stock ? parseInt(v.stock, 10) : 0,
        price_override: v.priceOverride ? parseFloat(v.priceOverride) : null,
      }));

    if (variantRows.length > 0) {
      const variantResult = await supabase.schema('marketplace').from('listing_variants').insert(variantRows);
      if (variantResult.error) {
        setError("Annonce publiée, mais les variantes n'ont pas pu être enregistrees : " + variantResult.error.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    props.onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="cv-box">
      <label htmlFor="title">Titre</label>
      <input id="title" type="text" required value={title} onChange={(e) => setTitle(e.target.value)} style={{ marginBottom: 16 }} />

      <label htmlFor="description">Description</label>
      <textarea id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} style={{ marginBottom: 16 }} />

      <label htmlFor="price">Prix (optionnel)</label>
      <input id="price" type="text" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} style={{ marginBottom: 16 }} />

      <label htmlFor="category">Catégorie</label>
      <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
        <option value="">Choisir une catégorie</option>
        {props.categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <label htmlFor="brand">Marque / nom</label>
      <input id="brand" type="text" value={brand} onChange={(e) => setBrand(e.target.value)} style={{ marginBottom: 16 }} />

      <label htmlFor="origin">Provenance</label>
      <input id="origin" type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} style={{ marginBottom: 16 }} />

      <label htmlFor="itemYear">Année</label>
      <input id="itemYear" type="text" inputMode="numeric" value={itemYear} onChange={(e) => setItemYear(e.target.value.replace(/[^0-9]/g, ''))} style={{ marginBottom: 16 }} />

      <label htmlFor="colors">Couleurs (séparées par des virgules)</label>
      <input id="colors" type="text" placeholder="rouge, noir" value={colors} onChange={(e) => setColors(e.target.value)} style={{ marginBottom: 16 }} />

      <label htmlFor="condition">État</label>
      <select id="condition" value={condition} onChange={(e) => setCondition(e.target.value)}>
        <option value="neuf">Neuf</option>
        <option value="très bon état">Très bon état</option>
        <option value="bon état">Bon état</option>
        <option value="usé">Usé</option>
      </select>

      <label>Photos</label>
      <div className="photo-row">
        {images.map((url) => (
          <div key={url} className="photo-thumb" style={{ backgroundImage: 'url(' + url + ')' }}></div>
        ))}
        <label className="photo-upload-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          {uploading ? '...' : '+'}
          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
        </label>
      </div>

      <label>Variantes (taille / couleur / stock)</label>
      {variants.map((v, i) => (
        <div key={i} className="variant-row">
          <input type="text" placeholder="Taille" value={v.size} onChange={(e) => updateVariant(i, 'size', e.target.value)} />
          <input type="text" placeholder="Couleur" value={v.color} onChange={(e) => updateVariant(i, 'color', e.target.value)} />
          <input type="text" inputMode="numeric" placeholder="Stock" value={v.stock} onChange={(e) => updateVariant(i, 'stock', e.target.value.replace(/[^0-9]/g, ''))} />
          <input type="text" inputMode="decimal" placeholder="Prix ($)" value={v.priceOverride} onChange={(e) => updateVariant(i, 'priceOverride', e.target.value)} />
          <button type="button" className="variant-remove" onClick={() => removeVariant(i)}>×</button>
        </div>
      ))}
      <button type="button" className="add-variant-btn" onClick={addVariant}>+ Ajouter une variante</button>

      {error && <p className="error-msg">{error}</p>}
      <button type="submit" disabled={saving || !title}>
        {saving ? 'Publication...' : "Publiér l'annonce"}
      </button>
    </form>
  );
}
