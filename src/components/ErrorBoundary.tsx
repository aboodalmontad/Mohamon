import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in application:', error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      // Clear URL params that might point to a malformed firm
      window.location.href = window.location.pathname;
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fbf8f2] text-[#181512] flex items-center justify-center p-4 font-sans rtl:text-right" dir="rtl">
          <div className="max-w-lg w-full p-8 rounded-3xl bg-white border border-[#c5a869]/50 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#b38a38]/15 border border-[#b38a38]/30 flex items-center justify-center mx-auto text-[#87641d]">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-serif-title font-bold text-[#181512]">
                حدث خطأ غير متوقع
              </h2>
              <p className="text-xs text-[#5c5343] leading-relaxed">
                تم رصد المشكلة ومعالجتها بأمان. يمكنك إعادة تحميل الصفحة أو إعادة تعيين التخزين المؤقت لاستئناف العمل فوراً.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-right text-[11px] font-mono text-amber-900 max-h-28 overflow-y-auto break-all">
                {this.state.error.message || this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={this.handleReload}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#b38a38] via-[#c5a869] to-[#87641d] text-white text-xs font-bold shadow-md hover:brightness-105 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة تحميل الصفحة</span>
              </button>

              <button
                onClick={this.handleReset}
                className="px-4 py-2.5 rounded-xl bg-[#f4eee2] text-[#87641d] border border-[#e6ddcc] text-xs font-semibold hover:bg-[#ede4d4] transition cursor-pointer"
              >
                إعادة ضبط البيانات واستئناف العمل
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
