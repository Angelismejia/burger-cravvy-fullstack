/** Imágenes y textos fijos de la página (no vienen de la API). */
const unsplash = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`

export const heroImage = {
  src: unsplash('1460306855393-0410f61241c7', 1920),
  srcSet: [800, 1280, 1920]
    .map((w) => `${unsplash('1460306855393-0410f61241c7', w)} ${w}w`)
    .join(', '),
  alt: 'Hamburguesa jugosa con papas doradas y salsa servida en un plato sobre una mesa azul soleada',
}

export const galleryImages = [
  {
    src: unsplash('1619740455993-9e612b1af08a'),
    full: unsplash('1619740455993-9e612b1af08a', 1600),
    alt: 'Hot dog cargado con salsa fresca y aderezos servido en bandeja',
  },
  {
    src: unsplash('1555396273-367ea4eb4db5'),
    full: unsplash('1555396273-367ea4eb4db5', 1600),
    alt: 'Interior acogedor del restaurante con mesas de madera, sillas y luz natural cálida',
  },
  {
    src: unsplash('1594212699903-ec8a3eca50f5'),
    full: unsplash('1594212699903-ec8a3eca50f5', 1600),
    alt: 'Hamburguesa y vaso de papas fritas servidos juntos, estilo foto de menú',
  },
]
