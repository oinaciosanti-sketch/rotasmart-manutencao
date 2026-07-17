"use client";
import React from "react";
export default class RouteErrorBoundary extends React.Component<{children:React.ReactNode},{hasError:boolean}>{
 state={hasError:false};
 static getDerivedStateFromError(){return {hasError:true};}
 componentDidCatch(error:unknown){console.error("Erro ao carregar rota",error);}
 private clearLocalData=()=>{try{Object.keys(localStorage).filter(key=>key.startsWith("rotasmart-")).forEach(key=>localStorage.removeItem(key));}catch{} window.location.reload();};
 render(){if(this.state.hasError)return <div className="panel alert-box"><div><b>Algo deu errado ao carregar esta rota. Limpe os dados locais ou revise os chamados.</b><p>Você pode remover somente os dados locais do RotaSmart e recarregar.</p><button className="btn primary" onClick={this.clearLocalData}>Limpar dados locais</button></div></div>;return this.props.children;}
}
