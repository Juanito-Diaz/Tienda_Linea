import React from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="mb-4 grid size-16 place-items-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-200">
            <AlertTriangle className="size-8" />
          </div>
          <h2 className="font-display text-2xl font-bold text-navy-900 mb-2">
            Ocurrió un detalle al cargar esta sección
          </h2>
          <p className="max-w-md text-sm text-slate-500 mb-6">
            El contenido se está actualizando. Puedes restaurar la vista fácilmente con el siguiente botón:
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="btn-gold inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold shadow-md"
          >
            <RotateCcw className="size-4" /> Restaurar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
