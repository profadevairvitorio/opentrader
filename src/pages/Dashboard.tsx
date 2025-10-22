import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, LogOut, Search, Bot, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface TradingBot {
  id: string;
  name: string;
  asset_symbol: string;
  strategy: string;
  initial_capital: number;
  is_active: boolean;
  stop_loss_percentage: number;
  take_profit_percentage: number;
}

const Dashboard = () => {
  const [bots, setBots] = useState<TradingBot[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else {
      fetchBots();
    }
  }, [user, navigate]);

  const fetchBots = async () => {
    try {
      const { data, error } = await supabase
        .from('trading_bots')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBots(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar bots: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBot = async (id: string) => {
    try {
      const { error } = await supabase
        .from('trading_bots')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Bot excluído com sucesso!');
      fetchBots();
    } catch (error: any) {
      toast.error('Erro ao excluir bot: ' + error.message);
    }
  };

  const handleToggleBot = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('trading_bots')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Bot ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`);
      fetchBots();
    } catch (error: any) {
      toast.error('Erro ao atualizar bot: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold">Trading Bot Manager</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/asset-search')}
            >
              <Search className="w-4 h-4 mr-2" />
              Pesquisar Ativos
            </Button>
            <Button
              variant="outline"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Seus Bots de Trading</h2>
            <p className="text-muted-foreground">
              Gerencie e monitore seus bots automatizados
            </p>
          </div>
          <Button onClick={() => navigate('/bot/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Bot
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando bots...</p>
          </div>
        ) : bots.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bot className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Nenhum bot criado ainda</h3>
              <p className="text-muted-foreground mb-4">
                Crie seu primeiro bot de trading para começar
              </p>
              <Button onClick={() => navigate('/bot/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Bot
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bots.map((bot) => (
              <Card key={bot.id} className="hover:shadow-[var(--shadow-card)] transition-all">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {bot.name}
                        <Badge variant={bot.is_active ? 'default' : 'secondary'}>
                          {bot.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {bot.asset_symbol} • {bot.strategy}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Capital Inicial:</span>
                      <span className="font-semibold">
                        R$ {Number(bot.initial_capital).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stop Loss:</span>
                      <span className="text-danger">{bot.stop_loss_percentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Take Profit:</span>
                      <span className="text-success">{bot.take_profit_percentage}%</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/bot/edit/${bot.id}`)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleBot(bot.id, bot.is_active)}
                    >
                      {bot.is_active ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteBot(bot.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
