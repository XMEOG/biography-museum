/**
 * Veri modelleri (JSDoc referansı — çalışma zamanında zorlanmaz, sadece dokümantasyon amaçlıdır).
 *
 * @typedef {Object} TimelineEntry
 * @property {string} year
 * @property {string} label
 *
 * @typedef {Object} GalleryItem
 * @property {string} url
 * @property {string} [caption]
 *
 * @typedef {Object} Person
 * @property {string} id
 * @property {string} name              - Ad soyad
 * @property {string} subtitle          - Kısa başlık (ör. "Matematikçi, Bilgisayar Bilimi Öncüsü")
 * @property {string} shortBiography    - Kısa açıklama (kart/önizleme için)
 * @property {string} biography         - Birinci ağızdan tam biyografi metni
 * @property {string[]} works           - Çalışmalar
 * @property {string[]} contributions   - Önemli katkılar
 * @property {string} period            - Doğum/ölüm tarihi veya dönem bilgisi
 * @property {GalleryItem[]} gallery
 * @property {string} [videoUrl]
 * @property {string} [audioUrl]        - Önceden hazırlanmış ses dosyası
 * @property {boolean} [audioIsTTS]     - Ses TTS ile mi üretildi
 * @property {boolean} [audioStale]     - Biyografi güncellendi ama ses güncellenmedi mi
 * @property {TimelineEntry[]} timeline
 * @property {string[]} relatedPersons  - İlişkili kişi ID'leri
 * @property {string} createdAt
 * @property {string} updatedAt
 *
 * @typedef {Object} Hotspot
 * @property {string} id
 * @property {string} sceneId
 * @property {string|null} personId
 * @property {number} x       - yüzde (0-100)
 * @property {number} y       - yüzde (0-100)
 * @property {number} width   - yüzde (0-100)
 * @property {number} height  - yüzde (0-100)
 * @property {"rectangle"|"polygon"} [shape] - Eski kayıtlar için belirtilmeyebilir
 * @property {{x:number,y:number}[]} [points] - Poligon köşeleri, sahne genelinde yüzde
 * @property {"manual"|"manual-polygon"|"auto"} source
 *
 * @typedef {Object} Scene
 * @property {string} id
 * @property {string} title
 * @property {string} imageUrl
 * @property {Hotspot[]} hotspots
 * @property {string} createdAt
 * @property {string} updatedAt
 */

export {};
