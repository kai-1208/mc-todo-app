import React, { useEffect, useState, useRef } from 'react';

type Particle = {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  effectId: string;
  birthTime: number;
};

type ParticleEffectData = {
  id: string;
  blockTexture: string;
  blockPosition: { x: number; y: number };
  createdAt: number;
  duration: number;
};

type Props = {
  effects: ParticleEffectData[];
  onEffectComplete: (effectId: string) => void;
};

const ParticleEffect: React.FC<Props> = ({ effects, onEffectComplete }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const completedEffectsRef = useRef<Set<string>>(new Set());

  // テクスチャから主要な色を抽出する関数
  const extractColorsFromTexture = (imagePath: string): string[] => {
    const colorMap: { [key: string]: string[] } = {
      '/images/dirt.png': ['#8B4513', '#A0522D', '#654321', '#D2B48C'],
      '/images/stone.png': ['#808080', '#A9A9A9', '#696969', '#DCDCDC'],
      '/images/wood.png': ['#DEB887', '#F4A460', '#D2691E', '#CD853F'],
      '/images/iron.png': ['#C0C0C0', '#A8A8A8', '#D3D3D3', '#B8B8B8'],
      '/images/obsidian.png': ['#2F2F2F', '#1A1A1A', '#404040', '#555555'],
    };
    
    return colorMap[imagePath] || ['#808080', '#A9A9A9', '#696969', '#DCDCDC'];
  };

  const createParticles = (effect: ParticleEffectData) => {
    const colors = extractColorsFromTexture(effect.blockTexture);
    const particleCount = Math.floor(effect.duration / 100);
    const maxParticleCount = Math.max(15, Math.min(50, particleCount));
    const currentTime = Date.now();

    for (let i = 0; i < maxParticleCount; i++) {
      const spawnDelay = (effect.duration * i) / maxParticleCount;
      const particleLifeTime = Math.min(60, Math.floor(effect.duration / 16));
      
      setTimeout(() => {
        const particle: Particle = {
          id: `particle-${effect.id}-${i}-${Date.now()}`,
          x: effect.blockPosition.x + (Math.random() - 0.5) * 16,
          y: effect.blockPosition.y + (Math.random() - 0.5) * 16,
          vx: (Math.random() - 0.5) * 12,
          vy: -Math.random() * 8 - 3,
          size: Math.random() * 5 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: particleLifeTime,
          maxLife: particleLifeTime,
          effectId: effect.id,
          birthTime: currentTime + spawnDelay,
        };
        
        setParticles(prev => [...prev, particle]);
      }, spawnDelay);
    }
  };

  const updateParticles = () => {
    const currentTime = Date.now();
    
    setParticles(prevParticles => {
      const updatedParticles = prevParticles
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.4,
          vx: particle.vx * 0.98,
          life: particle.life - 1,
        }))
        .filter(particle => particle.life > 0);

      // エフェクトの完了チェック（非同期で処理）
      effects.forEach(effect => {
        const effectAge = currentTime - effect.createdAt;
        const hasActiveParticles = updatedParticles.some(p => p.effectId === effect.id);
        
        // エフェクトのdurationが経過し、そのエフェクトのパーティクルがすべて消えたら完了
        if (effectAge >= effect.duration && !hasActiveParticles && !completedEffectsRef.current.has(effect.id)) {
          completedEffectsRef.current.add(effect.id);
          
          // 次のフレームで完了通知を送る（レンダリング中の状態更新を避ける）
          setTimeout(() => {
            onEffectComplete(effect.id);
            completedEffectsRef.current.delete(effect.id);
          }, 0);
        }
      });

      return updatedParticles;
    });
  };

  // 新しいエフェクトが追加された時の処理
  useEffect(() => {
    if (effects.length > 0) {
      const existingEffectIds = new Set(particles.map(p => p.effectId));
      const newEffects = effects.filter(effect => !existingEffectIds.has(effect.id));
      
      newEffects.forEach(effect => {
        console.log(`パーティクルエフェクト開始: ${effect.id}, 継続時間: ${effect.duration}ms`);
        createParticles(effect);
      });
    }
  }, [effects]);

  // アニメーションループ
  useEffect(() => {
    const animationFrame = requestAnimationFrame(updateParticles);
    return () => cancelAnimationFrame(animationFrame);
  }, [particles, effects]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {particles.map(particle => {
        const opacity = particle.life / particle.maxLife;
        return (
          <div
            key={particle.id}
            className="absolute rounded-sm"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              opacity: opacity * 0.9,
              transform: `scale(${opacity})`,
              imageRendering: 'pixelated',
              boxShadow: '0 0 2px rgba(0,0,0,0.5)',
            }}
          />
        );
      })}
    </div>
  );
};

export default ParticleEffect;