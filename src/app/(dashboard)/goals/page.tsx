'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, MoreHorizontal, Trash2, Edit, TrendingUp, Calendar } from 'lucide-react';
import { useGoals, useLifeAreas } from '@/lib/hooks/use-goals';
import { GoalForm } from '@/components/goals/goal-form';
import { WheelOfLife } from '@/components/goals/wheel-of-life';
import { Goal } from '@/lib/db/schema';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function GoalsPage() {
  const { goals, objectives, addGoal, updateGoal, deleteGoal } = useGoals();
  const { areas, updateArea, initAreas } = useLifeAreas();
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | undefined>();
  const [activeTab, setActiveTab] = useState<'okr' | 'wheel'>('okr');

  useEffect(() => {
    initAreas();
  }, [initAreas]);

  const handleEdit = (goal: Goal) => {
    setEditGoal(goal);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu hedefi silmek istediğine emin misin?')) {
      await deleteGoal(id);
    }
  };

  const handleScoreChange = async (areaId: string, field: 'currentScore' | 'targetScore', value: number) => {
    await updateArea(areaId, { [field]: value });
  };

  const activeGoals = goals.filter((g) => g.status === 'active');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hedefler</h1>
          <p className="text-muted-foreground">{activeGoals.length} aktif hedef</p>
        </div>
        <Button onClick={() => { setEditGoal(undefined); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Hedef
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'okr' ? 'default' : 'outline'}
          onClick={() => setActiveTab('okr')}
        >
          <Target className="w-4 h-4 mr-2" />
          OKR Hedefler
        </Button>
        <Button
          variant={activeTab === 'wheel' ? 'default' : 'outline'}
          onClick={() => setActiveTab('wheel')}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Wheel of Life
        </Button>
      </div>

      {activeTab === 'okr' ? (
        <>
          {/* Objectives */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Objectives (Amaçlar)</h2>
            {objectives.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-muted-foreground">
                    <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="mb-3">Henüz objective yok</p>
                    <Button variant="outline" onClick={() => { setEditGoal(undefined); setShowForm(true); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      İlk Objective&apos;ı Oluştur
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {objectives.map((obj) => {
                  const keyResults = goals.filter((g) => g.parentId === obj.id);
                  const completedKR = keyResults.filter((k) => k.status === 'completed').length;
                  const progress = keyResults.length > 0
                    ? Math.round((completedKR / keyResults.length) * 100)
                    : obj.targetValue
                      ? Math.round((obj.currentValue / obj.targetValue) * 100)
                      : 0;

                  return (
                    <Card key={obj.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div>
                          <CardTitle className="text-base">{obj.title}</CardTitle>
                          {obj.description && (
                            <p className="text-sm text-muted-foreground mt-1">{obj.description}</p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" />}>
                            <MoreHorizontal className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(obj)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Düzenle
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(obj.id)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardHeader>
                      <CardContent>
                        {/* Progress */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">%{progress}</span>
                        </div>

                        {/* Key Results */}
                        {keyResults.length > 0 && (
                          <div className="space-y-2">
                            {keyResults.map((kr) => {
                              const krProgress = kr.targetValue
                                ? Math.round((kr.currentValue / kr.targetValue) * 100)
                                : 0;
                              return (
                                <div
                                  key={kr.id}
                                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{kr.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-primary rounded-full transition-all"
                                          style={{ width: `${krProgress}%` }}
                                        />
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        {kr.currentValue}/{kr.targetValue} {kr.unit}
                                      </span>
                                    </div>
                                  </div>
                                  <Badge
                                    variant={kr.status === 'completed' ? 'default' : 'secondary'}
                                    className="text-xs shrink-0"
                                  >
                                    {kr.status === 'completed' ? 'Tamamlandı' : `%${krProgress}`}
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {obj.deadline && (
                          <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(obj.deadline).toLocaleDateString('tr-TR')}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Standalone Key Results */}
          {goals.filter((g) => g.type === 'key_result' && !g.parentId).length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Bağımsız Key Results</h2>
              <div className="space-y-2">
                {goals
                  .filter((g) => g.type === 'key_result' && !g.parentId)
                  .map((kr) => {
                    const krProgress = kr.targetValue
                      ? Math.round((kr.currentValue / kr.targetValue) * 100)
                      : 0;
                    return (
                      <Card key={kr.id}>
                        <CardContent className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{kr.title}</p>
                            </div>
                            <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${krProgress}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-20 text-right">
                              {kr.currentValue}/{kr.targetValue} {kr.unit}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Wheel of Life */
        <Card>
          <CardHeader>
            <CardTitle>Wheel of Life</CardTitle>
            <p className="text-sm text-muted-foreground">
              Hayat alanlarını değerlendir. Her alan için mevcut durumunu ve hedefini belirle.
            </p>
          </CardHeader>
          <CardContent>
            <WheelOfLife areas={areas} onScoreChange={handleScoreChange} />
          </CardContent>
        </Card>
      )}

      <GoalForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={editGoal ? (data) => updateGoal(editGoal.id, data) : addGoal}
        initialData={editGoal}
        objectives={objectives}
      />
    </div>
  );
}
