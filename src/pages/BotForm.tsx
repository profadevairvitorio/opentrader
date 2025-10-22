import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Bot } from 'lucide-react';

const BotForm = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    asset_symbol: '',
    strategy: 'scalping',
    initial_capital: '',
    stop_loss_percentage: '',
    take_profit_percentage: '',
    max_trades_per_day: '',
    is_active: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else if (isEditing) {
      fetchBot();
    }
  }, [user, isEditing, navigate]);

  const fetchBot = async () => {
    try {
      const { data, error } = await supabase
        .from('trading_bots')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setFormData({
        name: data.name,
        asset_symbol: data.asset_symbol,
        strategy: data.strategy,
        initial_capital: data.initial_capital.toString(),
        stop_loss_percentage: data.stop_loss_percentage?.toString() || '',
        take_profit_percentage: data.take_profit_percentage?.toString() || '',
        max_trades_per_day: data.max_trades_per_day?.toString() || '',
        is_active: data.is_active,
      });
    } catch (error: any) {
      toast.error('Erro ao carregar bot: ' + error.message);
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.asset_symbol || !formData.initial_capital) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);

    try {
      const botData = {
        name: formData.name,
        asset_symbol: formData.asset_symbol.toUpperCase(),
        strategy: formData.strategy,
        initial_capital: parseFloat(formData.initial_capital),
        stop_loss_percentage: formData.stop_loss_percentage ? parseFloat(formData.stop_loss_percentage) : null,
        take_profit_percentage: formData.take_profit_percentage ? parseFloat(formData.take_profit_percentage) : null,
        max_trades_per_day: formData.max_trades_per_day ? parseInt(formData.max_trades_per_day) : null,
        is_active: formData.is_active,
        user_id: user?.id,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('trading_bots')
          .update(botData)
          .eq('id', id);

        if (error) throw error;
        toast.success('Bot atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('trading_bots')
          .insert([botData]);

        if (error) throw error;
        toast.success('Bot criado com sucesso!');
      }

      navigate('/dashboard');
    } catch (error: any) {
      toast.error('Erro ao salvar bot: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                {isEditing ? 'Editar Bot' : 'Novo Bot de Trading'}
              </CardTitle>
            </div>
            <CardDescription>
              Configure os parâmetros do seu bot automatizado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Bot *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Bot BTC Scalping"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="asset">Ativo *</Label>
                <Input
                  id="asset"
                  placeholder="Ex: BTCUSDT"
                  value={formData.asset_symbol}
                  onChange={(e) => setFormData({ ...formData, asset_symbol: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Símbolo do ativo para trading (ex: BTCUSDT, ETHUSDT)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="strategy">Estratégia *</Label>
                <Select
                  value={formData.strategy}
                  onValueChange={(value) => setFormData({ ...formData, strategy: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scalping">Scalping</SelectItem>
                    <SelectItem value="day_trade">Day Trade</SelectItem>
                    <SelectItem value="swing">Swing Trading</SelectItem>
                    <SelectItem value="grid">Grid Trading</SelectItem>
                    <SelectItem value="dca">DCA (Dollar Cost Average)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capital">Capital Inicial (R$) *</Label>
                <Input
                  id="capital"
                  type="number"
                  step="0.01"
                  placeholder="1000.00"
                  value={formData.initial_capital}
                  onChange={(e) => setFormData({ ...formData, initial_capital: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stopLoss">Stop Loss (%)</Label>
                  <Input
                    id="stopLoss"
                    type="number"
                    step="0.1"
                    placeholder="2.0"
                    value={formData.stop_loss_percentage}
                    onChange={(e) => setFormData({ ...formData, stop_loss_percentage: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="takeProfit">Take Profit (%)</Label>
                  <Input
                    id="takeProfit"
                    type="number"
                    step="0.1"
                    placeholder="5.0"
                    value={formData.take_profit_percentage}
                    onChange={(e) => setFormData({ ...formData, take_profit_percentage: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTrades">Máximo de Trades por Dia</Label>
                <Input
                  id="maxTrades"
                  type="number"
                  placeholder="10"
                  value={formData.max_trades_per_day}
                  onChange={(e) => setFormData({ ...formData, max_trades_per_day: e.target.value })}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : (isEditing ? 'Atualizar Bot' : 'Criar Bot')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BotForm;
