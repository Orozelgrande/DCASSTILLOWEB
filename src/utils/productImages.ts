type ProductImageInput = {
  name?: string;
  description?: string;
  images?: string[];
};

const PRODUCT_IMAGE_MATCHES: Array<[string, string]> = [
  ['johnnie walker double black', 'https://img.thewhiskyexchange.com/330/blend_joh88.jpg?v=202407241'],
  ['johnnie walker blue label', 'https://img.thewhiskyexchange.com/330/blend_joh84.jpg?v=202407241'],
  ['johnnie walker black label', 'https://img.thewhiskyexchange.com/330/blend_joh1.jpg?v=202407241'],
  ['johnnie walker red label', 'https://img.thewhiskyexchange.com/330/blend_joh2.jpg?v=202407241'],
  ['monkey shoulder', 'https://img.thewhiskyexchange.com/330/vatted_mon1.jpg?v=202407241'],
  ['buchanan', 'https://img.thewhiskyexchange.com/330/blend_buc12yo.jpg?v=202407241'],
  ['chivas regal 18', 'https://img.thewhiskyexchange.com/330/blend_chi18yo.jpg?v=202407241'],
  ['chivas regal 12', 'https://img.thewhiskyexchange.com/330/blend_chi1.jpg?v=202407241'],
  ['john barr reserve', 'https://cdn.shopify.com/s/files/1/0637/2569/9229/files/john-barr-reserve-blend-black-label-blended-scotch-whisky-750ml-hW6vHMKh.jpg?crop=center&height=600&v=1742002762&width=600'],
  ['old parr', 'https://img.thewhiskyexchange.com/330/blend_par12yo.jpg?v=202407241'],
  ['something special', 'https://www.liquorstore-online.com/product_images/p_145917.webp'],
  ['santa teresa 1796', 'https://www.lavinia.com/media/catalog/product/s/a/santa-teresa-1796.jpeg'],
  ['diplomatico reserva exclusiva', 'https://www.rondiplomatico.com/wp-content/uploads/2022/03/ReservaExclusiva_678x1310px-600x1159.png'],
  ['pampero aniversario', 'https://www.pampero.com/assets/img/rums-bg/Aniversario.png'],
  ['cacique 500', 'https://www.vilaviniteca.es/media/catalog/product/v/0/v005984.jpg'],
  ['polar pilsen', 'https://empresaspolar.com/wp-content/uploads/2022/04/Group-1757-2x.png'],
  ['solera verde', 'https://empresaspolar.com/wp-content/uploads/2022/05/Group-1657.png'],
  ['zulia', 'https://static.wixstatic.com/media/526084_b3080112eb104c61bcfc2d48847d3408~mv2.png/v1/crop/x_0%2Cy_12%2Cw_472%2Ch_626/fill/w_295%2Ch_390%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/250%20ml%20no%20retornaba.png'],
  ['heineken', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Heineken_Bottle.jpg/500px-Heineken_Bottle.jpg'],
  ['corona extra', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Corona_Extra_beer_bottle_%282019%29.png/330px-Corona_Extra_beer_bottle_%282019%29.png'],
  ['carorena blanca', 'https://www.laverdureria.com/cdn/shop/files/SANGRIABLANCACARORENA1.75L.webp?v=1753833027&width=1946'],
  ['la carorena', 'https://domivzla.com/cdn/shop/files/sangria-carorena-175l-722051.jpg?v=1776333654&width=3840'],
  ['grey goose', 'https://img.thewhiskyexchange.com/330/vodka_gre1.jpg'],
  ['absolut vodka', 'https://img.thewhiskyexchange.com/330/vodka_abs1.jpg'],
  ['smirnoff vodka', 'https://img.thewhiskyexchange.com/330/vodka_smi1.jpg'],
  ['don julio 70', 'https://img.thewhiskyexchange.com/330/teqla_don35.jpg?v=202407241'],
  ['jose cuervo especial', 'https://www.thebarreltap.com/cdn/shop/files/JoseCuervoEspecialGoldTequila750mL.webp?v=1755118379&width=700'],
  ['patron silver', 'https://img.thewhiskyexchange.com/330/teqla_pat1.jpg'],
  ['bombay sapphire', 'https://img.thewhiskyexchange.com/330/gin_bom2.jpg?v=202407241'],
  ['tanqueray london dry', 'https://img.thewhiskyexchange.com/330/gin_tan1.jpg'],
  ['hendrick', 'https://img.thewhiskyexchange.com/330/gin_hen1.jpg'],
  ['moet chandon imperial', 'https://img.thewhiskyexchange.com/330/champ_moe34.jpg?v=202407241'],
];

const normalizeProductName = (value = '') =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export const getCategoryFallbackImage = (description = '') => {
  const d = normalizeProductName(description);
  if (d.includes('beer') || d.includes('cerveza')) {
    return 'https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=600&auto=format&fit=crop';
  }
  if (d.includes('wine') || d.includes('vino') || d.includes('sangria')) {
    return 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=600&auto=format&fit=crop';
  }
  if (d.includes('rum') || d.includes('ron')) {
    return 'https://images.unsplash.com/photo-1609345265499-2133bbeb6ce5?q=80&w=600&auto=format&fit=crop';
  }
  if (d.includes('whisky') || d.includes('whiskey')) {
    return 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?q=80&w=600&auto=format&fit=crop';
  }
  if (d.includes('jamon') || d.includes('queso') || d.includes('food') || d.includes('comida')) {
    return 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop';
  }
  return 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=600&auto=format&fit=crop';
};

export const getProductImage = (product: ProductImageInput) => {
  const normalizedName = normalizeProductName(product.name);
  const matchedProduct = PRODUCT_IMAGE_MATCHES.find(([productName]) => normalizedName.includes(productName));

  if (matchedProduct) {
    return matchedProduct[1];
  }

  return product.images?.find(Boolean) || getCategoryFallbackImage(product.description);
};

export const getProductSeedImage = (name: string, description = '') =>
  getProductImage({ name, description, images: [] });

export const setProductImageFallback = (image: HTMLImageElement, description = '') => {
  if (image.dataset.fallbackApplied) return;
  image.dataset.fallbackApplied = 'true';
  image.src = getCategoryFallbackImage(description);
};
