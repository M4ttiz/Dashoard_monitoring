import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-red-700/50 bg-red-950/20 p-6 text-sm text-red-200">
          <p className="font-semibold">Si e verificato un errore nel pannello.</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="mt-3 rounded bg-red-700 px-3 py-1.5 text-white"
          >
            Riprova
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

