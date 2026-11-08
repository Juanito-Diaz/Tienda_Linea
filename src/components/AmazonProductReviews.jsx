import { useState, useMemo, useEffect } from 'react';
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  Sparkles,
  User,
  X,
  MessageSquare,
  ArrowUpRight,
} from 'lucide-react';
import {
  getProductReviews,
  calculateRatingStats,
  saveUserReview,
} from '../data/productReviews';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SmartImage } from './ui';

export default function AmazonProductReviews({ product }) {
  const toast = useToast();
  const { currentUser } = useAuth();
  const defaultUserName = currentUser?.nombre || 'Lily García';

  const [reviewsData, setReviewsData] = useState(() => getProductReviews(product.id));
  const [selectedStarFilter, setSelectedStarFilter] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [sortBy, setSortBy] = useState('mejores');
  const [showExplanation, setShowExplanation] = useState(false);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [votedReviews, setVotedReviews] = useState({});

  // Formulario de nueva reseña: por defecto con el nombre del usuario logueado o cuenta demo
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formAuthor, setFormAuthor] = useState(() => defaultUserName);

  // Mantener actualizado el nombre cuando cambie el usuario o inicie sesión
  useEffect(() => {
    setFormAuthor(defaultUserName);
  }, [defaultUserName]);

  const handleOpenWriteModal = () => {
    setFormAuthor(currentUser?.nombre || 'Lily García');
    setShowWriteModal(true);
  };

  // Estadísticas globales del producto
  const stats = useMemo(() => {
    return calculateRatingStats(reviewsData.reviews);
  }, [reviewsData.reviews]);

  // Filtrado y ordenamiento de opiniones
  const displayedReviews = useMemo(() => {
    let list = [...reviewsData.reviews];

    if (selectedStarFilter !== null) {
      list = list.filter((r) => Math.round(r.rating) === selectedStarFilter);
    }

    if (selectedTag) {
      const tagLower = selectedTag.toLowerCase();
      list = list.filter(
        (r) =>
          r.content.toLowerCase().includes(tagLower) ||
          r.title.toLowerCase().includes(tagLower)
      );
    }

    if (sortBy === 'recientes') {
      // Dejar orden reciente o por id
      list.reverse();
    } else if (sortBy === 'criticas') {
      list.sort((a, b) => a.rating - b.rating);
    } else {
      // 'mejores': calificación alta y útiles primero
      list.sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return (b.helpfulCount || 0) - (a.helpfulCount || 0);
      });
    }

    return list;
  }, [reviewsData.reviews, selectedStarFilter, selectedTag, sortBy]);

  const handleHelpfulClick = (reviewId) => {
    if (votedReviews[reviewId]) return;

    setVotedReviews((prev) => ({ ...prev, [reviewId]: true }));
    setReviewsData((prev) => ({
      ...prev,
      reviews: prev.reviews.map((r) =>
        r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r
      ),
    }));

    toast({
      title: '¡Gracias por tus comentarios!',
      description: 'Tu voto ayuda a otros clientes a elegir mejor.',
      type: 'success',
    });
  };

  const handleReportClick = () => {
    toast({
      title: 'Opinión reportada',
      description: 'Agradecemos tu reporte. Nuestro equipo de moderación revisará este comentario.',
      type: 'info',
    });
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!formContent.trim()) {
      toast({
        title: 'Comentario requerido',
        description: 'Por favor escribe tu reseña antes de enviar.',
        type: 'error',
      });
      return;
    }

    const authorName = formAuthor.trim() || defaultUserName;
    const created = saveUserReview(product.id, {
      author: authorName,
      rating: formRating,
      title: formTitle.trim() || 'Excelente producto',
      content: formContent.trim(),
      variant: product.variants?.options?.[0]?.label
        ? `${product.variants.label || 'Opción'}: ${product.variants.options[0].label}`
        : null,
    });

    if (created) {
      setReviewsData(getProductReviews(product.id));
      setShowWriteModal(false);
      setFormTitle('');
      setFormContent('');
      setFormAuthor(defaultUserName);
      setFormRating(5);
      toast({
        title: '¡Opinión publicada con éxito!',
        description: 'Gracias por compartir tu experiencia en 5 a Logística.',
        type: 'success',
      });
    }
  };

  // Número total de calificaciones globales
  const totalGlobalRatings = product.reviews
    ? Math.max(product.reviews, 8)
    : 642;

  return (
    <section className="mt-16 border-t border-slate-200 pt-12" id="opiniones-clientes">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* ========================================================= */}
        {/* COLUMNA IZQUIERDA: Resumen de Calificaciones y Desglose   */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-navy-950 font-display">
              Opiniones de clientes
            </h2>

            {/* Promedio y estrellas */}
            <div className="mt-3 flex items-center gap-3">
              <div className="flex text-amber-500" aria-hidden>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`size-5 ${
                      star <= Math.round(stats.average)
                        ? 'fill-amber-500 text-amber-500'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-bold text-navy-950">
                {stats.average} de 5
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              {totalGlobalRatings.toLocaleString('es-MX')} calificaciones globales
            </p>
          </div>

          {/* Barras de distribución por estrella estilo Amazon */}
          <div className="space-y-2.5 pt-2">
            {[5, 4, 3, 2, 1].map((starsLevel) => {
              const pct = stats.distribution[starsLevel] || 0;
              const isSelected = selectedStarFilter === starsLevel;

              return (
                <button
                  key={starsLevel}
                  type="button"
                  onClick={() =>
                    setSelectedStarFilter(isSelected ? null : starsLevel)
                  }
                  className={`group flex items-center gap-3 w-full text-xs text-left transition rounded-md p-1 -mx-1 ${
                    isSelected ? 'bg-amber-50 ring-1 ring-amber-300' : 'hover:bg-slate-50'
                  }`}
                  title={`Filtrar por ${starsLevel} estrellas (${pct}%)`}
                >
                  <span className="w-16 shrink-0 text-slate-700 group-hover:text-amber-800 group-hover:underline">
                    {starsLevel} {starsLevel === 1 ? 'estrella' : 'estrellas'}
                  </span>

                  {/* Barra de progreso */}
                  <div className="flex-1 h-5 bg-slate-100 rounded-sm overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-xs transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <span className="w-9 text-right font-medium text-slate-600 group-hover:text-navy-900 shrink-0">
                    {pct}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Explicación desplegable estilo Amazon */}
          <div className="border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-navy-900 transition font-medium"
            >
              <span>Cómo funcionan las opiniones y calificaciones de los clientes</span>
              {showExplanation ? (
                <ChevronUp className="size-3.5 text-slate-500" />
              ) : (
                <ChevronDown className="size-3.5 text-slate-500" />
              )}
            </button>

            {showExplanation && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600 leading-relaxed space-y-2 animate-fade-in">
                <p>
                  Para calcular la calificación general por estrellas y el desglose porcentual por estrella, nuestro sistema considera factores como la antigüedad de la opinión y si el comprador adquirió el artículo con <strong>Compra Verificada</strong>.
                </p>
                <p className="text-[11px] text-slate-500">
                  Las opiniones no son modificadas ni eliminadas si cumplen con nuestras políticas comunitarias de transparencia.
                </p>
              </div>
            )}
          </div>

          {/* Escribir reseña */}
          <div className="border-t border-slate-200 pt-6 space-y-3">
            <h3 className="font-bold text-sm text-navy-900">
              Escribir reseña sobre este producto
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Comparte tu opinión con otros clientes para ayudarlos en su decisión de compra.
            </p>
            <button
              type="button"
              onClick={handleOpenWriteModal}
              className="w-full rounded-full border border-slate-300 bg-white py-2 px-4 text-xs font-semibold text-navy-900 hover:bg-slate-50 hover:border-slate-400 shadow-xs transition"
            >
              Escribir mi opinión
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUMNA DERECHA: Los clientes dicen, Fotos y Reseñas      */}
        {/* ========================================================= */}
        <div className="lg:col-span-8 space-y-8">
          {/* Bloque "Los clientes dicen" (Resumen inteligente IA) */}
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-amber-50/20 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-lg font-bold text-navy-900">
                Los clientes dicen
              </h3>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                <Sparkles className="size-3 text-gold-600" /> Generado con IA a partir de las opiniones
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {reviewsData.aiSummary}
            </p>

            {/* Píldoras de filtros rápidos por temas */}
            {reviewsData.tags && reviewsData.tags.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Selecciona para obtener más información
                </p>
                <div className="flex flex-wrap gap-2">
                  {reviewsData.tags.map((tag) => {
                    const isTagActive = selectedTag === tag.label;
                    return (
                      <button
                        key={tag.label}
                        type="button"
                        onClick={() =>
                          setSelectedTag(isTagActive ? null : tag.label)
                        }
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition cursor-pointer ${
                          isTagActive
                            ? 'border-navy-900 bg-navy-900 text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                        }`}
                      >
                        <ArrowUpRight className="size-3 text-slate-400" />
                        <span>{tag.label}</span>
                        <span className="text-[10px] opacity-70">({tag.count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Cabecera del listado de opiniones */}
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-bold text-navy-900">
                  Las mejores opiniones de México
                </h3>
                {selectedStarFilter !== null && (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-slate-600">
                      Filtrado por: <strong>{selectedStarFilter} estrellas</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedStarFilter(null)}
                      className="text-xs font-semibold text-amber-700 hover:underline flex items-center gap-0.5"
                    >
                      <X className="size-3" /> Quitar filtro
                    </button>
                  </div>
                )}
                {selectedTag && (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-slate-600">
                      Mencionando: <strong>"{selectedTag}"</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedTag(null)}
                      className="text-xs font-semibold text-amber-700 hover:underline flex items-center gap-0.5"
                    >
                      <X className="size-3" /> Quitar
                    </button>
                  </div>
                )}
              </div>

              {/* Selector de ordenamiento */}
              <div className="flex items-center gap-2">
                <label htmlFor="sort-reviews" className="text-xs text-slate-500 whitespace-nowrap">
                  Ordenar por:
                </label>
                <div className="relative">
                  <select
                    id="sort-reviews"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-xs focus:border-navy-900 focus:outline-hidden cursor-pointer"
                  >
                    <option value="mejores">Las mejores opiniones</option>
                    <option value="recientes">Más recientes</option>
                    <option value="criticas">Críticas primero</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Listado de Opiniones Individuales */}
            {displayedReviews.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {displayedReviews.map((rev) => {
                  const hasVoted = Boolean(votedReviews[rev.id]);

                  return (
                    <article key={rev.id} className="py-6 first:pt-2 space-y-2.5">
                      {/* Autor */}
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-full bg-slate-200 text-slate-600 font-bold text-xs grid place-items-center uppercase shrink-0">
                          {rev.avatar || <User className="size-4" />}
                        </div>
                        <span className="text-xs font-semibold text-slate-800">
                          {rev.author}
                        </span>
                      </div>

                      {/* Estrellas y Título de la reseña */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex text-amber-500" aria-hidden>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`size-3.5 ${
                                s <= Math.round(rev.rating)
                                  ? 'fill-amber-500 text-amber-500'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-navy-950">
                          {rev.title}
                        </h4>
                      </div>

                      {/* Fecha y badges */}
                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                        <span>Comentado en México el {rev.date}</span>
                        {rev.variant && (
                          <>
                            <span>·</span>
                            <span className="font-medium text-slate-600">{rev.variant}</span>
                          </>
                        )}
                        {rev.verified && (
                          <>
                            <span>·</span>
                            <span className="font-bold text-[#c45500]">
                              Compra verificada
                            </span>
                          </>
                        )}
                      </div>

                      {/* Texto de la opinión */}
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {rev.content}
                      </p>

                      {/* Botón Útil e Informar estilo Amazon */}
                      <div className="pt-2 flex items-center gap-4 text-xs">
                        <span className="text-slate-500 text-[11px]">
                          A {(rev.helpfulCount || 0)} {rev.helpfulCount === 1 ? 'persona le' : 'personas les'} resultó útil
                        </span>

                        <button
                          type="button"
                          onClick={() => handleHelpfulClick(rev.id)}
                          disabled={hasVoted}
                          className={`rounded-full border px-3.5 py-1 text-xs font-medium transition flex items-center gap-1.5 ${
                            hasVoted
                              ? 'border-mint-300 bg-mint-50 text-mint-800 cursor-default'
                              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs'
                          }`}
                        >
                          <ThumbsUp className="size-3" />
                          <span>{hasVoted ? 'Útil ✓' : 'Útil'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleReportClick}
                          className="text-slate-400 hover:text-slate-600 hover:underline text-[11px]"
                        >
                          Informar
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500 text-xs">
                No hay opiniones que coincidan con los filtros seleccionados.{' '}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStarFilter(null);
                    setSelectedTag(null);
                  }}
                  className="font-bold text-amber-700 hover:underline ml-1"
                >
                  Restablecer filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: Escribir mi opinión estilo Amazon                  */}
      {/* ========================================================= */}
      {showWriteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-fade-in">
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 animate-slide-up"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-slate-100 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <MessageSquare className="size-4 text-gold-600" /> Crear reseña
              </span>
              <button
                type="button"
                onClick={() => setShowWriteModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="p-6 space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="size-12 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 shrink-0">
                  <SmartImage
                    src={product.images?.[0]}
                    alt={product.name}
                    className="size-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase text-gold-700">
                    {product.brand}
                  </p>
                  <h4 className="font-bold text-xs text-navy-950 line-clamp-1">
                    {product.name}
                  </h4>
                </div>
              </div>

              {/* Selector de Estrellas */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-navy-900">
                  Calificación general <span className="text-coral-600">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setFormRating(starVal)}
                      className="p-1 hover:scale-110 transition cursor-pointer"
                    >
                      <Star
                        className={`size-7 ${
                          starVal <= formRating
                            ? 'fill-amber-500 text-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-navy-900 ml-2">
                    {formRating} de 5 estrellas
                  </span>
                </div>
              </div>

              {/* Nombre del autor */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-navy-900">
                    Tu nombre o apodo público
                  </label>
                  {currentUser && (
                    <span className="text-[11px] text-mint-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> Cuenta activa
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={formAuthor}
                  onChange={(e) => setFormAuthor(e.target.value)}
                  placeholder={defaultUserName}
                  className="input text-xs"
                />
                <p className="text-[11px] text-slate-400">
                  Aparece por defecto el nombre de tu cuenta ({defaultUserName}). Puedes personalizarlo si lo deseas.
                </p>
              </div>

              {/* Título de la reseña */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-navy-900">
                  Agrega un título a tu opinión
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="¿Qué es lo más importante a destacar?"
                  className="input text-xs"
                />
              </div>

              {/* Contenido */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-navy-900">
                  Escribe tu reseña <span className="text-coral-600">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="¿Qué te gustó o disgustó de este producto? ¿Para qué lo usaste?"
                  className="input text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWriteModal(false)}
                  className="btn-ghost text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-semibold px-6 py-2.5 text-xs shadow-sm border border-amber-500 transition cursor-pointer"
                >
                  Publicar opinión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
