import React from "react";
export default class ErrorBoundary extends React.Component {
  state={error:null};
  static getDerivedStateFromError(error){return {error};}
  render(){if(this.state.error)return <div className="grid min-h-screen place-items-center bg-[#fffafc] p-6"><div className="panel max-w-lg p-8 text-center"><h1 className="text-2xl font-extrabold">Something went wrong</h1><p className="mt-2 text-sm text-gray-500">The interface hit an unexpected error. Reload the page to recover.</p><button className="btn-primary mt-5" onClick={()=>location.reload()}>Reload</button></div></div>;return this.props.children;}
}