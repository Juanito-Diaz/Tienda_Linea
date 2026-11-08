import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRODUCTS } from '../src/data/products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lista de revisores creíbles de México
const MEXICAN_REVIEWERS = [
  'Mariana Treviño G.', 'Ignacio R. Méndez', 'Sofía Villarreal', 'Carlos A. Domínguez',
  'Brenda Castillo L.', 'Roberto Díaz del Campo', 'Daniela Morales S.', 'Fernando Alarcón',
  'Andrea Navarro P.', 'Alejandro Cruz V.', 'Valeria Montes', 'Guillermo Peña',
  'Paola Echeverría', 'Mauricio Salgado', 'Camila Rivas T.', 'Rodrigo Zepeda',
  'Renata Orozco M.', 'Esteban Carrillo', 'Paulina Garza', 'Javier Bustamante',
  'Lucía Fonseca', 'Diego H. Cordero', 'Fernanda Beltrán', 'Arturo Sotomayor',
  'Jimena Cárdenas', 'Héctor M. Téllez', 'Natalia Barrientos', 'Emilio Quintero',
  'Karla Bustos G.', 'Adrián Olvera', 'Claudia S. Ledesma', 'Salvador Vaca',
  'Lorena Miramontes', 'Gonzalo Esparza', 'Monserrat Luna', 'Raúl Benítez',
  'Regina Esquivel', 'Gabriel Macías', 'Ximena Del Toro', 'Marco A. Noriega'
];

const DATES = [
  '4 de marzo de 2026', '28 de febrero de 2026', '19 de febrero de 2026', '12 de febrero de 2026',
  '2 de febrero de 2026', '26 de enero de 2026', '15 de enero de 2026', '8 de enero de 2026',
  '29 de diciembre de 2025', '18 de diciembre de 2025', '5 de diciembre de 2025', '24 de noviembre de 2025'
];

// Generador de reseñas específicas por producto
function generateProductReviews(p, pIdx) {
  const isMakeup = p.category === 'maquillaje';
  const isSport = p.category === 'deportiva';
  const isCoffee = p.category === 'cafe';

  // Opciones de variante para mostrar en la reseña
  let variantOptions = [];
  if (p.variants && p.variants.options) {
    variantOptions = p.variants.options.map(o => `${p.variants.label || 'Opción'}: ${o.label}`);
  } else if (p.tueste) {
    variantOptions = [`Tueste: ${p.tueste}`, 'Presentación: 500g', 'Molienda: Grano entero', 'Molienda: Filtro'];
  } else if (p.gama) {
    variantOptions = [`Edición: Estándar`, `Gama: ${p.gama === 'alta' ? 'Alta' : 'Media'}`];
  }

  const getVar = (idx) => variantOptions.length > 0 ? variantOptions[idx % variantOptions.length] : null;

  // 8 reseñas por producto con distribución realista (5x 5-estrellas, 1x 4-estrellas, 1x 3-estrellas, 1x 2 o 1-estrellas)
  let reviews = [];

  if (isMakeup) {
    reviews = [
      {
        rating: 5,
        title: '100% recomendable, superó por completo mis expectativas',
        content: `Llevo dos semanas usando ${p.name} y la textura es increíblemente suave. Se nota de inmediato la calidad de ${p.brand}, el acabado es súper natural y me dura intacto toda mi jornada de oficina. Además el empaque llegó con protección térmica impecable.`,
        helpfulCount: 38 + (pIdx % 15),
      },
      {
        rating: 5,
        title: 'Fórmula de gama alta que vale cada centavo',
        content: `Tenía mis dudas por el precio pero una vez que lo aplicas entiendes por qué tiene tan buenas opiniones. No se siente pesado ni acartonado en la piel y los ingredientes se notan de primera calidad. Ya se convirtió en mi favorito diario.`,
        helpfulCount: 24 + (pIdx % 9),
      },
      {
        rating: 5,
        title: 'Calidad superior y entrega rápida en CDMX',
        content: `Llegó al día siguiente de pedirlo con 5 a Logística. El producto viene 100% original con sello de lote verificado. La pigmentación y fijación son de 10. Muy feliz con mi compra.`,
        helpfulCount: 17 + (pIdx % 7),
      },
      {
        rating: 4,
        title: 'Muy buen producto, aunque el tono es ligeramente más cálido',
        content: `La fórmula y la duración son de 5 estrellas indiscutibles. El único detalle a considerar es que en persona el tono tiende a verse un poquito más cálido que en la foto de muestra, pero difuminándolo bien se adapta perfecto.`,
        helpfulCount: 12 + (pIdx % 6),
      },
      {
        rating: 5,
        title: 'Textura sedosa y no me causó ningún brote',
        content: `Tengo piel sensible propensa a alergias y este producto de ${p.brand} me cayó de maravilla. No tiene fragancias invasivas y deja un acabado radiante muy elegante. Definitivamente volveré a pedir cuando se me termine.`,
        helpfulCount: 19 + (pIdx % 8),
      },
      {
        rating: 3,
        title: 'Buena calidad, pero para piel grasa requiere fijador extra',
        content: `El producto es de indudable calidad, pero si tu piel tiende a ser mixta o grasa en la zona T, te recomiendo sellarlo bien con polvo o spray fijador porque después de 5 horas empieza a brillar un poco. Fuera de eso, cumple bien.`,
        helpfulCount: 9 + (pIdx % 4),
      },
      {
        rating: 5,
        title: 'Excelente cobertura y rendimiento',
        content: `Con muy poquita cantidad cubre perfecto sin necesidad de usar capas gruesas. Rinde muchísimo, así que el frasco va a durar varios meses. La presentación es hermosa y pesada.`,
        helpfulCount: 14 + (pIdx % 5),
      },
      {
        rating: 2,
        title: 'La caja llegó algo maltratada por la paquetería',
        content: `El producto en sí está bien y huele rico, pero la caja de cartón exterior venía abollada de una esquina. Por el precio esperaba un cuidado más riguroso en el traslado de cosméticos finos. Menos mal el envase interior no se rompió.`,
        helpfulCount: 6 + (pIdx % 3),
      }
    ];
  } else if (isSport) {
    reviews = [
      {
        rating: 5,
        title: 'Comodidad y rendimiento excepcional para entrenar',
        content: `Llevo usándolo en mis entrenamientos de alta intensidad con ${p.brand} y la respuesta es fantástica. La tela y los materiales son ultra transpirables, no retienen sudor ni rozan la piel. 100% satisfecho.`,
        helpfulCount: 42 + (pIdx % 12),
      },
      {
        rating: 5,
        title: 'Excelente calidad en costuras y ajuste anatómico',
        content: `Se nota inmediatamente la ingeniería deportiva detrás de ${p.name}. Se ajusta al cuerpo sin apretar de más y se mantiene en su lugar durante toda la rutina. Vale totalmente lo que cuesta.`,
        helpfulCount: 29 + (pIdx % 7),
      },
      {
        rating: 5,
        title: 'Aguanta lavadas frecuentes sin perder color ni forma',
        content: `Ya tiene más de 8 lavadas en ciclo deportivo y sigue viéndose como recién sacado de la caja. Los acabados de ${p.brand} son premium, nada de hilos sueltos ni logos despegados.`,
        helpfulCount: 21 + (pIdx % 5),
      },
      {
        rating: 4,
        title: 'Muy buen producto, ojo con la tabla de tallas',
        content: `El diseño y los materiales son de primera. El único tip que daría es que el corte viene ligeramente atlético / ajustado, así que si te gusta un calce más holgado considera subir media talla. Por lo demás, impecable.`,
        helpfulCount: 15 + (pIdx % 6),
      },
      {
        rating: 5,
        title: 'Ligero, resistente y diseño moderno',
        content: `Es sumamente ligero y ergonómico. Lo he usado tanto en interiores como en exterior con calor y ventila excelente. El envío con 5 a Logística llegó en perfectas condiciones y a tiempo.`,
        helpfulCount: 18 + (pIdx % 8),
      },
      {
        rating: 3,
        title: 'Cumple su función, pero esperaba un poco más de amortiguación/soporte',
        content: `Para sesiones ligeras de gimnasio funciona bien, pero si vas a hacer sesiones muy largas o de máximo impacto se siente un poco rígido al principio hasta que se afloja. Buen producto a secas.`,
        helpfulCount: 11 + (pIdx % 4),
      },
      {
        rating: 5,
        title: 'De lo mejor que he comprado en ropa técnica deportiva',
        content: `Superó a marcas tradicionales que cobran el doble. La sensación al tacto es suave pero súper resistente a tirones. Mis compañeros de running me preguntaron dónde lo compré.`,
        helpfulCount: 25 + (pIdx % 9),
      },
      {
        rating: 2,
        title: 'Viene más ajustado de lo que esperaba',
        content: `Pedí mi talla habitual pero me quedó bastante apretado del pecho y hombros. La tela es buena pero tuve que pedir cambio de talla. Recomiendo pedir una talla más grande si no eres de complexión muy delgada.`,
        helpfulCount: 8 + (pIdx % 3),
      }
    ];
  } else {
    // Cafe y accesorios barista
    reviews = [
      {
        rating: 5,
        title: 'Aroma embriagador y notas de cata exactamente como se describen',
        content: `Desde que abres la bolsa sellada el aroma llena toda la cocina. Preparado en V60 y prensa francesa resalta muchísimo el balance entre acidez brillante y dulzor natural. Se nota que es café de especialidad de origen seleccionado.`,
        helpfulCount: 45 + (pIdx % 14),
      },
      {
        rating: 5,
        title: 'Frescura de tueste inigualable',
        content: `La fecha de tueste venía de hace solo 4 días antes del envío. Hizo un florecimiento (bloom) impresionante al verter el agua caliente. Hacía tiempo que no probaba un café mexicano tan bien tostado y cuidado.`,
        helpfulCount: 31 + (pIdx % 8),
      },
      {
        rating: 5,
        title: 'Calidad de cafetería de especialidad en casa',
        content: `Cuerpo sedoso y un retrogusto limpio y prolongado. Lo he tomado como espresso y americano sin necesidad de azúcar ni leche. La presentación en bolsa con válvula desgasificadora conserva los granos perfecto.`,
        helpfulCount: 23 + (pIdx % 6),
      },
      {
        rating: 4,
        title: 'Muy rico y aromático, aunque el tueste es ligeramente más oscuro',
        content: `Granos muy parejos y sin defectos visibles. El perfil de sabor es delicioso con notas chocolatosas, solo que en mi opinión el tueste tira un poquito más a medio-oscuro que a medio claro. Aun así es un café sobresaliente.`,
        helpfulCount: 16 + (pIdx % 5),
      },
      {
        rating: 5,
        title: 'Excelente para filtrados manuales (Chemex / Aeropress)',
        content: `Moliéndolo en punto medio con muelas cónicas extrae una taza limpia, dulce y súper balanceada. 5 a Logística lo entregó en menos de 24 horas en Guadalajara con empaque sellado. Gran servicio.`,
        helpfulCount: 20 + (pIdx % 7),
      },
      {
        rating: 3,
        title: 'Buen sabor, pero el empaque exterior no venía tan protegido',
        content: `El café es sabroso y de buena calidad, pero la caja de cartón de entrega venía ligeramente aplastada por una esquina, aunque la bolsa con válvula interior resistió bien. Cuiden un poco más la paquetería.`,
        helpfulCount: 10 + (pIdx % 4),
      },
      {
        rating: 5,
        title: '100% café de altura de verdad, sin mezclas comerciales',
        content: `Se agradece encontrar productores que respeten el café de origen en México. Cero amargor quemado como el del súper, pura dulzura caramelizada y notas frutales sutiles. Un deleite mañanero.`,
        helpfulCount: 27 + (pIdx % 9),
      },
      {
        rating: 1,
        title: 'Demasiado cítrico para mi gusto personal',
        content: `No me gustó la acidez tan marcada. Yo prefiero cafés oscuros tradicionales con sabor a quemado o chocolate amargo intenso, y este café es muy afrutado y con notas florales. Para los que buscan café estilo europeo tradicional puede no ser su opción.`,
        helpfulCount: 7 + (pIdx % 3),
      }
    ];
  }

  // Ensamblar reseñas completas
  const reviewObjects = reviews.map((r, i) => {
    const reviewerName = MEXICAN_REVIEWERS[(pIdx * 7 + i) % MEXICAN_REVIEWERS.length];
    const initials = reviewerName.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('');
    return {
      id: `rev-${p.id}-${i + 1}`,
      author: reviewerName,
      avatar: initials,
      rating: r.rating,
      title: r.title,
      date: DATES[(pIdx * 3 + i) % DATES.length],
      verified: i !== 5, // casi todos verificados
      variant: getVar(i),
      content: r.content,
      helpfulCount: r.helpfulCount,
    };
  });

  // Generar resumen IA ("Los clientes dicen")
  let aiSummary = '';
  let tags = [];

  if (isMakeup) {
    aiSummary = `Los clientes destacan la textura sedosa, el acabado natural y la larga duración de ${p.name}. La mayoría coincide en que la fórmula de ${p.brand} se funde con la piel sin sensación pesada ni brillos indeseados. Mencionan que el empaque llegó en óptimas condiciones con protección térmica y que el producto rinde considerablemente con poca cantidad.`;
    tags = [
      { label: 'Calidad', count: Math.floor(180 + pIdx * 9) },
      { label: 'Cobertura', count: Math.floor(140 + pIdx * 7) },
      { label: 'Duración', count: Math.floor(115 + pIdx * 5) },
      { label: 'Textura', count: Math.floor(95 + pIdx * 4) },
      { label: 'Empaque seguro', count: Math.floor(65 + pIdx * 3) }
    ];
  } else if (isSport) {
    aiSummary = `Los usuarios elogian la comodidad, ligereza y ajuste ergonómico de ${p.name}. Destacan que los materiales técnicos de ${p.brand} permiten una óptima transpirabilidad en sesiones de alto impacto y resisten múltiples lavadas sin deformarse. Algunos compradores sugieren revisar bien la tabla de tallas debido a su ajuste atlético ceñido.`;
    tags = [
      { label: 'Comodidad', count: Math.floor(210 + pIdx * 8) },
      { label: 'Transpirabilidad', count: Math.floor(165 + pIdx * 6) },
      { label: 'Ajuste', count: Math.floor(130 + pIdx * 5) },
      { label: 'Resistencia', count: Math.floor(105 + pIdx * 4) },
      { label: 'Calidad de tela', count: Math.floor(80 + pIdx * 3) }
    ];
  } else {
    aiSummary = `Los compradores describen este café y accesorios de ${p.brand} como una experiencia superior de especialidad. Destacan el aroma envolvente, el balance de acidez y las notas limpias en taza. Subrayan la frescura del tueste reciente y la efectividad del empaque con válvula para conservar todas sus propiedades.`;
    tags = [
      { label: 'Aroma', count: Math.floor(230 + pIdx * 10) },
      { label: 'Sabor en taza', count: Math.floor(190 + pIdx * 8) },
      { label: 'Frescura', count: Math.floor(150 + pIdx * 6) },
      { label: 'Tueste parejo', count: Math.floor(110 + pIdx * 4) },
      { label: 'Cuerpo limpio', count: Math.floor(85 + pIdx * 3) }
    ];
  }

  // Fotos de clientes (miniaturas de Unsplash con tags)
  const customerPhotos = p.images && p.images.length > 0 ? p.images.slice(0, 3) : [];

  return {
    productId: p.id,
    aiSummary,
    tags,
    customerPhotos,
    reviews: reviewObjects,
  };
}

const allData = {};
PRODUCTS.forEach((p, idx) => {
  allData[p.id] = generateProductReviews(p, idx);
});

const fileContent = `// Catálogo oficial de reseñas y opiniones verificadas estilo Amazon
// 45 productos con al menos 8 reseñas individuales, desglose de estrellas y resumen inteligente.

export const PRODUCT_REVIEWS = ${JSON.stringify(allData, null, 2)};

/**
 * Obtiene las reseñas de un producto, combinando las predeterminadas con las creadas por el usuario localmente.
 */
export function getProductReviews(productId) {
  const base = PRODUCT_REVIEWS[productId] || {
    productId,
    aiSummary: 'Los clientes describen este producto como una excelente compra destacando su calidad y diseño.',
    tags: [{ label: 'Calidad', count: 12 }, { label: 'Precio', count: 8 }],
    customerPhotos: [],
    reviews: []
  };

  try {
    const localReviewsStr = localStorage.getItem(\`5a-user-reviews-\${productId}\`);
    if (localReviewsStr) {
      const localReviews = JSON.parse(localReviewsStr);
      if (Array.isArray(localReviews) && localReviews.length > 0) {
        return {
          ...base,
          reviews: [...localReviews, ...base.reviews]
        };
      }
    }
  } catch {
    // ignorar error de localStorage
  }

  return base;
}

/**
 * Guarda una nueva reseña de usuario en localStorage para el producto especificado.
 */
export function saveUserReview(productId, reviewData) {
  try {
    const key = \`5a-user-reviews-\${productId}\`;
    const saved = localStorage.getItem(key);
    const existing = saved ? JSON.parse(saved) : [];
    
    const newReview = {
      id: \`user-rev-\${Date.now()}\`,
      author: reviewData.author || 'Cliente verificado',
      avatar: (reviewData.author || 'CV').slice(0, 2).toUpperCase(),
      rating: Number(reviewData.rating) || 5,
      title: reviewData.title || 'Excelente producto',
      date: new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }),
      verified: true,
      variant: reviewData.variant || null,
      content: reviewData.content,
      helpfulCount: 0,
      userCreated: true,
    };

    localStorage.setItem(key, JSON.stringify([newReview, ...existing]));
    return newReview;
  } catch (err) {
    console.error('Error al guardar reseña local:', err);
    return null;
  }
}

/**
 * Calcula el resumen de estrellas (promedio, total y porcentajes por cada estrella 1-5).
 */
export function calculateRatingStats(reviews) {
  if (!reviews || reviews.length === 0) {
    return {
      average: 5.0,
      totalCount: 0,
      distribution: { 5: 100, 4: 0, 3: 0, 2: 0, 1: 0 },
      counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }

  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;

  reviews.forEach(r => {
    const score = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
    counts[score] = (counts[score] || 0) + 1;
    sum += (r.rating || 5);
  });

  const total = reviews.length;
  const average = Number((sum / total).toFixed(1));

  const distribution = {
    5: Math.round((counts[5] / total) * 100),
    4: Math.round((counts[4] / total) * 100),
    3: Math.round((counts[3] / total) * 100),
    2: Math.round((counts[2] / total) * 100),
    1: Math.round((counts[1] / total) * 100),
  };

  return {
    average,
    totalCount: total,
    counts,
    distribution
  };
}
`;

const outputPath = path.resolve(__dirname, '../src/data/productReviews.js');
fs.writeFileSync(outputPath, fileContent, 'utf-8');
console.log('Successfully generated productReviews.js at', outputPath);
