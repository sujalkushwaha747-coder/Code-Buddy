import React from "react";

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || "Something went wrong while rendering this page.",
    };
  }

  componentDidCatch(error: Error) {
    console.error("Render error caught by ErrorBoundary:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 px-4 py-10">
          <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">Page Error</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The page hit a rendering problem, so the app showed this message instead of a blank
              screen.
            </p>
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {this.state.message}
            </div>
            <button
              type="button"
              onClick={() => window.location.assign("/dashboard")}
              className="mt-6 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
