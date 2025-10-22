import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Search, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

interface AssetData {
  symbol: string;
  price: string;
  change24h: string;
  volume: string;
  high24h: string;
  low24h: string;
}

const AssetSearch = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [assetData, setAssetData] = useState<AssetData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm) {
      toast.error('Digite um símbolo de ativo');
      return;
    }

    setLoading(true);
    
    // Simulação de dados do ativo (em produção, você usaria uma API real como Binance)
    setTimeout(() => {
      const mockData: AssetData = {
        symbol: searchTerm.toUpperCase(),
        price: '42,567.89',
        change24h: '+3.45',
        volume: '1,234,567,890',
        high24h: '43,210.50',
        low24h: '41,890.20',
      };
      
      setAssetData(mockData);
      setLoading(false);
      toast.success('Dados carregados com sucesso!');
    }, 1000);
  };

  const isPositive = assetData && parseFloat(assetData.change24h) > 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Pesquisar Ativos</h1>
          <p className="text-muted-foreground">
            Busque informações em tempo real sobre ativos de trading
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                placeholder="Digite o símbolo (ex: BTCUSDT, ETHUSDT)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="w-4 h-4 mr-2" />
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {assetData && (
          <div className="space-y-4">
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{assetData.symbol}</CardTitle>
                    <CardDescription>Mercado de Criptomoedas</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">
                      ${assetData.price}
                    </div>
                    <div className={`flex items-center gap-1 justify-end ${isPositive ? 'text-success' : 'text-danger'}`}>
                      {isPositive ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="font-semibold">{assetData.change24h}%</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Volume 24h</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${assetData.volume}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Máxima 24h</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">
                    ${assetData.high24h}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Mínima 24h</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-danger">
                    ${assetData.low24h}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Gráfico de Preço</CardTitle>
                <CardDescription>Últimas 24 horas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground">
                    Gráfico de preço em tempo real (integração com API necessária)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button 
              className="w-full"
              onClick={() => navigate('/bot/new')}
            >
              Criar Bot para {assetData.symbol}
            </Button>
          </div>
        )}

        {!assetData && !loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">
                Pesquise um ativo
              </h3>
              <p className="text-muted-foreground">
                Digite o símbolo de um ativo acima para ver informações detalhadas
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default AssetSearch;
