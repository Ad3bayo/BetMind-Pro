import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function BetMindPro() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [search, setSearch] = useState('');
  const [vip, setVip] = useState(false);
  const [monster, setMonster] = useState(false);

  // --- LIVE CONFIGURATION ---
  const API_KEY = '2ca838566124255af057f8e817c5d2c8'; 

  useEffect(() => {
    async function fetchLiveGames() {
      setLoading(true);
      try {
        const response = await fetch('https://v3.football.api-sports.io/fixtures?live=all', {
          method: 'GET',
          headers: {
            'x-apisports-key': API_KEY,
            'x-rapidapi-host': 'v3.football.api-sports.io'
          }
        });
        const data = await response.json();
        
        if (data.response && data.response.length > 0) {
          const liveMatches = data.response.map(item => ({
            id: item.fixture.id,
            league: item.league.name,
            home: item.teams.home.name,
            away: item.teams.away.name,
            time: item.fixture.status.elapsed + "'",
            score: `${item.goals.home ?? 0}-${item.goals.away ?? 0}`
          }));
          setFixtures(liveMatches);
        } else {
          // If no live games, fetch today's upcoming games as fallback
          const today = new Date().toISOString().split('T')[0];
          const fallResponse = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}`, {
            method: 'GET',
            headers: { 'x-apisports-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }
          });
          const fallData = await fallResponse.json();
          if (fallData.response) {
            setFixtures(fallData.response.slice(0, 15).map(item => ({
              id: item.fixture.id,
              league: item.league.name,
              home: item.teams.home.name,
              away: item.teams.away.name,
              time: new Date(item.fixture.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
              score: 'VS'
            })));
          }
        }
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLiveGames();
    const timer = setInterval(fetchLiveGames, 60000); 
    return () => clearInterval(timer);
  }, [API_KEY]);

  const filtered = useMemo(() => {
    return fixtures.filter(f => `${f.home} ${f.away}`.toLowerCase().includes(search.toLowerCase()));
  }, [fixtures, search]);

  const handlePredict = (match) => {
    setSelected(match);
    setPrediction(null);
    setTimeout(() => {
      setPrediction({
        pick: match.score === 'VS' ? 'Home Win' : 'Next Goal: ' + match.home,
        confidence: Math.floor(Math.random() * (92 - 82 + 1) + 82),
        extra: 'Over 1.5 Match Goals'
      });
    }, 1200);
  };

  return (
    <div className='min-h-screen bg-slate-950 text-white p-4 font-sans'>
      <div className='max-w-4xl mx-auto space-y-6 text-left'>
        
        <header className='flex justify-between items-center'>
          <div>
            <h1 className='text-3xl font-black text-cyan-500'>BETMIND PRO</h1>
            <Badge className='bg-red-600 animate-pulse'>LIVE ENGINE ACTIVE</Badge>
          </div>
          <Button className='bg-emerald-600 font-bold' onClick={() => setVip(!vip)}>
            {vip ? 'VIP ACTIVE' : 'UPGRADE ₦3,000'}
          </Button>
        </header>

        <Card className='bg-slate-900 border-slate-800 shadow-xl'>
          <CardContent className='p-4 flex flex-col md:flex-row gap-2'>
            <Input 
              placeholder='Search live teams...' 
              className='bg-slate-950 border-slate-700' 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
            <Button className='bg-blue-700 hover:bg-blue-600' onClick={() => setMonster(!monster)}>
              {monster ? 'MONSTER: ON' : 'AI MONSTER'}
            </Button>
          </CardContent>
        </Card>

        <div className='grid md:grid-cols-5 gap-6'>
          <div className='md:col-span-3 space-y-3'>
            <h3 className='text-xs font-bold text-slate-500 uppercase'>Current Fixtures</h3>
            {loading && fixtures.length === 0 ? (
              <p className='text-slate-500 animate-pulse'>Connecting to global feed...</p>
            ) : filtered.length > 0 ? (
              filtered.map(f => (
                <Card key={f.id} className='bg-slate-900 border-slate-800 cursor-pointer hover:border-cyan-500' onClick={() => handlePredict(f)}>
                  <CardContent className='p-4 flex justify-between items-center'>
                    <div>
                      <div className='text-[10px] text-cyan-500 font-bold uppercase'>{f.league} • {f.time}</div>
                      <div className='font-bold'>{f.home} <span className='text-cyan-400'>{f.score}</span> {f.away}</div>
                    </div>
                    <Badge variant="outline" className='text-cyan-400 border-cyan-900'>ANALYZE</Badge>
                  </CardContent>
                </Card>
              ))
            ) : <p className='text-slate-500'>No matches found. Loading daily schedule...</p>}
          </div>

          <div className='md:col-span-2'>
            <Card className='bg-slate-900 border-slate-800 border-t-4 border-t-cyan-500 sticky top-4'>
              <CardContent className='p-5'>
                {!selected ? (
                  <p className='text-center text-slate-500 py-10 italic'>Select a match to start analysis</p>
                ) : !prediction ? (
                  <div className='text-center space-y-2'>
                    <div className='w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto' />
                    <p className='text-xs text-cyan-500 animate-pulse'>BETMIND AI CALCULATING...</p>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <h2 className='text-center font-bold border-b border-slate-800 pb-2 uppercase text-sm'>{selected.home} vs {selected.away}</h2>
                    <div className='flex justify-between p-3 bg-slate-950 rounded-lg border border-slate-800'>
                      <span className='text-[10px] text-slate-500 uppercase font-bold'>Pick</span>
                      <span className='text-sm font-bold'>{prediction.pick}</span>
                    </div>
                    <div className='flex justify-between p-3 bg-slate-950 rounded-lg border border-slate-800'>
                      <span className='text-[10px] text-slate-500 uppercase font-bold'>Confidence</span>
                      <span className='text-sm font-bold text-cyan-400'>{prediction.confidence}%</span>
                    </div>
                    {monster && (
                      <div className='p-3 bg-emerald-950/30 border border-emerald-900 rounded-lg'>
                        <div className='text-[9px] text-emerald-400 font-bold uppercase'>Monster Insight</div>
                        <div className='text-xs font-semibold'>{prediction.extra}</div>
                      </div>
                    )}
                    <Button className='w-full bg-blue-600 py-6 font-black tracking-widest text-white shadow-lg'>BOOK NOW</Button>
                    <p className='text-[8px] text-center text-slate-600'>REAL-TIME DATA POWERED BY BETMIND PRO V2</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
