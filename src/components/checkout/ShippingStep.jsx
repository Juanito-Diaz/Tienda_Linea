import { useCallback, useState } from 'react';
import { ArrowLeft, ArrowRight, MapPin, Zap, Truck, Clock } from 'lucide-react';
import MapPicker from '../MapPicker';
import OrderSummary from './OrderSummary';
import { reverseGeocode } from '../../lib/geo';
import { useStore, DELIVERY_METHODS } from '../../context/StoreContext';

const ESTADOS = ['Ciudad de México', 'Estado de México', 'Jalisco', 'Nuevo León', 'Puebla', 'Querétaro', 'Veracruz', 'Yucatán', 'Chiapas', 'Oaxaca', 'Guanajuato', 'Otro'];

export const DELIVERY = {
  estandar: { label: 'Estándar 24 h', desc: 'Siguiente día hábil', badge: 'Sin cargo extra', icon: Truck },
  express: { label: 'Exprés Hoy', desc: 'Mismo día hábil (CDMX y Edo. Méx.)', badge: '+$89.00 MXN', icon: Zap },
  flash: { label: 'Flash 2-3 h', desc: 'Repartidor dedicado prioritario', badge: '+$149.00 MXN', icon: Clock },
};

export default function ShippingStep({ data, onBack, onNext }) {
  const { deliveryMethod, setDeliveryMethod } = useStore();
  const [form, setForm] = useState(() => ({
    ...data,
    entrega: deliveryMethod || data?.entrega || 'estandar',
    telefono: (data?.telefono || '').replace(/\D/g, '').slice(0, 10),
  }));
  const [geoMsg, setGeoMsg] = useState('');
  const [mapError, setMapError] = useState(false);
  const set = (k) => (e) => {
    let val = e.target.value;
    if (k === 'telefono') {
      // Solo números y máximo 10 dígitos exactos
      val = val.replace(/\D/g, '').slice(0, 10);
    }
    setForm((f) => ({ ...f, [k]: val }));
  };

  const onPick = useCallback(async (lat, lng) => {
    setForm((f) => ({ ...f, coords: { lat, lng } }));
    setMapError(false);
    setGeoMsg('Buscando dirección…');
    const addr = await reverseGeocode(lat, lng);
    if (addr) {
      setForm((f) => ({
        ...f,
        calle: addr.calle || f.calle,
        numero: addr.numero || f.numero,
        colonia: addr.colonia || f.colonia,
        cp: addr.cp || f.cp,
        ciudad: addr.ciudad || f.ciudad,
        estado: ESTADOS.find((e) => addr.estado?.includes(e.split(' ')[0])) ?? f.estado,
      }));
      setGeoMsg('Dirección completada desde el mapa. Verifica los datos.');
    } else setGeoMsg('');
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (!form.coords) {
      setMapError(true);
      document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    onNext({ ...form, entrega: deliveryMethod });
  };

  const field = (k, label, { wide, ...props } = {}) => (
    <label className={wide ? 'sm:col-span-2' : ''}>
      <span className="label">{label}</span>
      <input name={k} value={form[k] ?? ''} onChange={set(k)} className="input" required {...props} />
    </label>
  );

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-6">
        <fieldset className="card grid gap-4 p-6 sm:grid-cols-2">
          <legend className="sr-only">Datos de contacto</legend>
          <h2 className="font-bold text-navy-900 sm:col-span-2">Datos de contacto</h2>
          {field('nombre', 'Nombre completo', { autoComplete: 'name', wide: true })}
          {field('email', 'Correo electrónico', { type: 'email', autoComplete: 'email' })}
          {field('telefono', 'Teléfono (10 dígitos)', { type: 'tel', autoComplete: 'tel', maxLength: 10, pattern: '[0-9]{10}', inputMode: 'numeric', title: 'Exactamente 10 dígitos', placeholder: '5512345678' })}
          <p className="text-xs text-slate-500 sm:col-span-2 flex items-center gap-1.5 pt-0.5">
            <span className="size-1.5 rounded-full bg-mint-500" />
            Tus datos de contacto y entrega se guardan automáticamente para tus próximas compras.
          </p>
        </fieldset>

        <fieldset id="map-section" className={`card space-y-4 p-6 ${mapError ? 'ring-2 ring-coral-500' : ''}`}>
          <legend className="sr-only">Ubicación en mapa</legend>
          <div className="flex items-center gap-2">
            <MapPin className="size-5 text-gold-600" />
            <h2 className="font-bold text-navy-900">Ubica tu domicilio en el mapa</h2>
          </div>
          <p className="text-sm text-slate-500">Haz clic, arrastra el pin o busca tu dirección. Usaremos este punto para el rastreo GPS de tu repartidor.</p>
          <MapPicker value={form.coords} onChange={onPick} />
          {mapError && <p className="text-sm font-medium text-coral-500" role="alert">Selecciona tu ubicación en el mapa para continuar.</p>}
          {geoMsg && <p className="text-xs text-slate-500" aria-live="polite">{geoMsg}</p>}
        </fieldset>

        <fieldset className="card grid gap-4 p-6 sm:grid-cols-6">
          <legend className="sr-only">Dirección de entrega</legend>
          <h2 className="font-bold text-navy-900 sm:col-span-6">Dirección de entrega</h2>
          <label className="sm:col-span-4"><span className="label">Calle</span><input value={form.calle} onChange={set('calle')} className="input" required autoComplete="address-line1" /></label>
          <label className="sm:col-span-2"><span className="label">Número ext./int.</span><input value={form.numero} onChange={set('numero')} className="input" required /></label>
          <label className="sm:col-span-4"><span className="label">Colonia</span><input value={form.colonia} onChange={set('colonia')} className="input" required /></label>
          <label className="sm:col-span-2"><span className="label">C.P.</span><input value={form.cp} onChange={set('cp')} className="input" required pattern="[0-9]{5}" inputMode="numeric" title="5 dígitos" autoComplete="postal-code" /></label>
          <label className="sm:col-span-3"><span className="label">Ciudad / Alcaldía</span><input value={form.ciudad} onChange={set('ciudad')} className="input" required autoComplete="address-level2" /></label>
          <label className="sm:col-span-3">
            <span className="label">Estado</span>
            <select value={form.estado} onChange={set('estado')} className="input cursor-pointer" required>
              {ESTADOS.map((e) => <option key={e}>{e}</option>)}
            </select>
          </label>
          <label className="sm:col-span-6"><span className="label">Referencias (opcional)</span><textarea value={form.referencias} onChange={set('referencias')} rows={2} className="input resize-none" placeholder="Entre calles, color de fachada, portería…" /></label>
        </fieldset>

        <fieldset className="card p-6">
          <legend className="sr-only">Tipo de entrega</legend>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-navy-900">Tipo de entrega</h2>
            <span className="text-xs text-slate-500">Elige la velocidad para tu pedido</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {Object.entries(DELIVERY).map(([k, d]) => {
              const isSelected = deliveryMethod === k;
              return (
                <label
                  key={k}
                  className={`flex cursor-pointer flex-col justify-between gap-3 rounded-2xl border-2 p-4 transition ${
                    isSelected ? 'border-navy-900 bg-navy-50/40 shadow-sm' : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <input
                      type="radio"
                      name="entrega"
                      checked={isSelected}
                      onChange={() => {
                        setDeliveryMethod(k);
                        setForm((f) => ({ ...f, entrega: k }));
                      }}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2">
                      <d.icon className={`size-5 shrink-0 ${isSelected ? 'text-navy-900' : 'text-slate-400'}`} />
                      <span className="block text-sm font-bold text-navy-900">{d.label}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{d.desc}</p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                      d.badge.includes('+') ? 'bg-amber-100 text-amber-800' : 'bg-mint-100 text-mint-800'
                    }`}>
                      {d.badge}
                    </span>
                    {isSelected && (
                      <span className="text-[11px] font-bold text-navy-900 flex items-center gap-1">
                        ✓ Seleccionado
                      </span>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      <OrderSummary>
        <button type="submit" className="btn-primary w-full py-3 text-base">Continuar al pago <ArrowRight className="size-4" /></button>
        <button type="button" onClick={onBack} className="btn-ghost w-full"><ArrowLeft className="size-4" /> Volver al carrito</button>
      </OrderSummary>
    </form>
  );
}
