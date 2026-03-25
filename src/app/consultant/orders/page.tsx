import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Package, TrendingUp, DollarSign, Download, 
  ExternalLink, Search, Filter, ArrowUpRight, Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ConsultantOrdersPage() {
  const mockOrders = [
    { id: 'ORD-001', client: 'Beatriz Silva', date: '22 Mar, 2026', amount: 'R$ 549,90', commission: 'R$ 54,99', status: 'completed' },
    { id: 'ORD-002', client: 'Juliana Mendes', date: '24 Mar, 2026', amount: 'R$ 299,00', commission: 'R$ 29,90', status: 'pending' },
    { id: 'ORD-003', client: 'Carla Oliveira', date: '25 Mar, 2026', amount: 'R$ 1.250,00', commission: 'R$ 125,00', status: 'completed' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight mb-2">Pedidos & Comissões</h1>
          <p className="text-muted-foreground text-lg">Acompanhe suas vendas e o processamento de suas recompensas.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-12 border-primary/20 bg-background/50 text-foreground hover:bg-primary/5 rounded-2xl px-6">
            <Download className="w-4 h-4 mr-2" /> Exportar
          </Button>
          <Button className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-8 shadow-lg shadow-primary/20 border-none">
            Solicitar Saque
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Saldo Disponível', value: 'R$ 1.845,50', icon: DollarSign, trend: '+12% este mês', color: 'text-emerald-600' },
          { label: 'Total de Pedidos', value: '42', icon: Package, trend: '5 aguardando', color: 'text-primary' },
          { label: 'Média de Conversão', value: '8.4%', icon: TrendingUp, trend: 'Excellent', color: 'text-muted-foreground' }
        ].map((stat, i) => (
          <Card key={i} className="border-none bg-card/60 backdrop-blur-md shadow-sm rounded-[2rem] p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <stat.icon className="w-20 h-20 text-primary" />
            </div>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-2">{stat.label}</p>
            <h3 className="text-4xl font-bold text-foreground mb-3">{stat.value}</h3>
            <div className={`flex items-center ${stat.color} text-xs font-bold uppercase tracking-wider`}>
              {i === 0 && <ArrowUpRight className="w-4 h-4 mr-1" />}
              {i === 1 && <Clock className="w-4 h-4 mr-1" />}
              {stat.trend}
            </div>
          </Card>
        ))}
      </div>

      {/* Filters & Table */}
      <Card className="border-none bg-card/60 backdrop-blur-md shadow-sm rounded-[2rem] overflow-hidden">
        <div className="p-8 border-b border-primary/5 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-12 bg-background/50 border-primary/10 text-foreground rounded-2xl h-12 focus:ring-primary/20" placeholder="Buscar pedidos..." />
          </div>
          <Button variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-primary/5 h-12 px-6 rounded-2xl">
            <Filter className="w-4 h-4 mr-2" /> Filtros Avançados
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-primary/5 text-[10px] font-bold text-primary uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">ID Pedido</th>
                <th className="px-8 py-5">Cliente</th>
                <th className="px-8 py-5">Data</th>
                <th className="px-8 py-5">Valor Total</th>
                <th className="px-8 py-5">Comissão</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {mockOrders.map((order) => (
                <tr key={order.id} className="hover:bg-primary/[0.03] transition-colors group">
                  <td className="px-8 py-6 text-sm font-bold text-foreground">{order.id}</td>
                  <td className="px-8 py-6 text-sm text-foreground/80 font-medium">{order.client}</td>
                  <td className="px-8 py-6 text-sm text-muted-foreground">{order.date}</td>
                  <td className="px-8 py-6 text-sm font-bold text-foreground">{order.amount}</td>
                  <td className="px-8 py-6 text-sm font-bold text-primary">{order.commission}</td>
                  <td className="px-8 py-6">
                    <Badge className={`rounded-xl px-4 py-1 border-none font-bold text-[10px] uppercase tracking-wider ${
                      order.status === 'completed' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {order.status === 'completed' ? 'Concluído' : 'Processando'}
                    </Badge>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-all text-primary hover:bg-primary/10 rounded-xl">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
