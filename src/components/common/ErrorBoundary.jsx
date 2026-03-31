import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#f2f2f2] flex flex-col items-center justify-center p-6 text-center">
                    <div className="bg-[#F3F2EF] p-8 md:p-12 rounded-[32px] shadow-xl border border-white/60 max-w-lg w-full">
                        <div className="w-16 h-16 bg-[#0f4c3a]/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#0f4c3a"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        </div>

                        <h1 className="font-serif text-3xl text-[#111827] mb-3">
                            Something went wrong
                        </h1>

                        <p className="text-[#374151] mb-8 leading-relaxed">
                            We encountered an unexpected error. Please try reloading the page, or contact support if the problem persists.
                        </p>

                        <button
                            onClick={this.handleReload}
                            className="bg-[#0f4c3a] text-white px-8 py-3 rounded-full font-medium hover:bg-[#3E5242] transition-colors shadow-lg shadow-[#0f4c3a]/20"
                        >
                            Reload Page
                        </button>

                        {import.meta.env.DEV && this.state.error && (
                            <div className="mt-8 text-left bg-red-50 p-4 rounded-xl border border-red-100 overflow-auto max-h-40">
                                <p className="text-red-800 font-mono text-xs">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;


