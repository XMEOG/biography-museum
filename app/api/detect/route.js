import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

/**
 * OTOMATİK KİŞİ/YÜZ ALGILAMA — YER TUTUCU (PLACEHOLDER)
 *
 * Bu endpoint, gerçek bir yüz/kişi algılama servisiyle (ör. bir bulut görü API'si
 * veya kendi barındırdığınız bir model) entegre edilecek yerdir. Şu anda gerçek bir
 * algılama yapmaz; bunun yerine görselin ortasına, kabaca "muhtemel kişi alanları"
 * öneren birkaç kutu döndürür. Amaç, admin panelindeki editörün her zaman elle
 * düzenlenebilir/silinebilir/taşınabilir kutularla çalıştığını göstermektir.
 *
 * Üretime geçerken burada yapmanız gereken:
 *  1. Görseli gerçek bir yüz algılama servisine gönderin.
 *  2. Dönen kutuları piksel yerine YÜZDE (0-100) cinsine çevirin.
 *  3. Aynı { x, y, width, height, source: "auto" } biçiminde bu endpoint'ten döndürün.
 *
 * Admin panelindeki HotspotEditor bileşeni bu kutuları "öneri" olarak gösterir;
 * yönetici bunları olduğu gibi kabul edebilir, taşıyabilir, boyutlandırabilir
 * ya da tamamen silip elle yeni alan çizebilir. Algılama hiçbir zaman zorunlu
 * ya da tek yol değildir.
 */
export async function POST(request) {
  const authed = await requireAuth(request);
  if (!authed) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  if (!body.imageUrl) {
    return NextResponse.json({ error: "imageUrl gerekli." }, { status: 400 });
  }

  // Yer tutucu "öneri" kutuları — gerçek bir model yerine sabit bir düzen.
  const suggestions = [
    { x: 15, y: 15, width: 20, height: 60, source: "auto" },
    { x: 42, y: 12, width: 20, height: 65, source: "auto" },
    { x: 68, y: 15, width: 20, height: 60, source: "auto" },
  ];

  return NextResponse.json({
    note: "Bu bir yer tutucu (placeholder) sonuçtur; gerçek bir algılama modeli bağlanmadı. Lütfen önerilen alanları kontrol edip düzenleyin.",
    suggestions,
  });
}
