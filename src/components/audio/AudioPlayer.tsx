import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Headphones, Sparkles } from 'lucide-react';

interface AudioPlayerProps {
  title?: string;
  subtitle?: string;
  audioUrl?: string | null;
  onEnded?: () => void;
  autoPlay?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  title = 'Mensagem em Áudio',
  subtitle = 'Ouça com atenção antes de responder',
  audioUrl,
  onEnded,
  autoPlay = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    if (autoPlay && audioUrl) {
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl, autoPlay, onEnded]);

  const togglePlay = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch((err) => {
          console.warn('Erro ao reproduzir áudio:', err);
        });
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current && audioUrl) {
      audioRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const restart = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current.play();
    } else {
      setCurrentTime(0);
    }
    setIsPlaying(true);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="relative group mb-8">
      {/* Luz Neon Dourada Flutuante no Fundo */}
      <div className="absolute -inset-2 bg-gradient-to-r from-[#C9A96E]/50 via-[#E8D5A3]/75 to-[#C9A96E]/50 rounded-[2.5rem] blur-2xl opacity-75 group-hover:opacity-100 group-hover:scale-[1.01] transition-all duration-700 pointer-events-none" />

      {/* Card 3D em Ouro & Champanhe Flutuante */}
      <div className="relative bg-gradient-to-br from-[#FFFDF9] via-[#FAF4EA] to-[#F3E7D3] border-2 border-[#C9A96E] rounded-[2.2rem] p-7 sm:p-9 shadow-[inset_0_3px_6px_rgba(255,255,255,1),0_20px_45px_-10px_rgba(92,74,50,0.25),0_0_35px_rgba(201,169,110,0.35)] transform group-hover:-translate-y-1 group-hover:shadow-[inset_0_3px_8px_rgba(255,255,255,1),0_28px_55px_-10px_rgba(92,74,50,0.32),0_0_50px_rgba(201,169,110,0.55)] transition-all duration-500 overflow-hidden">
        {/* Ornamento Dourado no Canto Superior */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-[#C9A96E]/25 via-[#E8D5A3]/15 to-transparent rounded-bl-full pointer-events-none" />

        {audioUrl && (
          <audio ref={audioRef} src={audioUrl} preload="metadata" />
        )}

        {/* Cabeçalho do Card de Áudio */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
          <div className="flex items-center gap-4">
            {/* Ícone 3D em Relevo com Borda Ouro */}
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#FAF8F5] to-[#EAE0D0] border border-[#C9A96E] shadow-[inset_0_2px_3px_rgba(255,255,255,0.9),0_4px_10px_rgba(139,115,85,0.2)] flex items-center justify-center text-[#8B7355] shrink-0 p-3">
              <Headphones className="w-6 h-6 text-[#8B7355] drop-shadow-sm" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-[#2E2013] text-lg sm:text-2xl leading-tight">
                {title}
              </h4>
              <p className="text-xs sm:text-sm text-[#8B7355] mt-1 font-medium leading-relaxed">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Controles de velocidade e mute */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={cycleSpeed}
              title="Velocidade de reprodução"
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/90 hover:bg-white text-[#5C4A32] border border-[#D4C5A9] shadow-sm hover:border-[#C9A96E] transition"
            >
              {playbackRate}x
            </button>
            <button
              onClick={toggleMute}
              title={isMuted ? 'Desmutar' : 'Mutar'}
              className="p-2 rounded-xl bg-white/90 hover:bg-white text-[#5C4A32] border border-[#D4C5A9] shadow-sm hover:border-[#C9A96E] transition"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-[#8B7355]" />}
            </button>
          </div>
        </div>

        {/* Player 3D Funcional com Trilha Dourada */}
        <div className="space-y-4 pt-1 relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#6B5B4D] font-mono w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2.5 bg-[#EAE0D0] rounded-lg appearance-none cursor-pointer accent-[#8B7355] shadow-inner"
            />
            <span className="text-xs font-bold text-[#6B5B4D] font-mono w-10">
              {duration ? formatTime(duration) : '1:30'}
            </span>
          </div>

          {/* Botão de Play 3D Dourado em Destaque */}
          <div className="flex items-center justify-center gap-5 pt-1">
            <button
              onClick={restart}
              title="Reiniciar áudio"
              className="p-2.5 text-[#6B5B4D] hover:text-[#2E2013] transition rounded-full hover:bg-white/60"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8B7355] to-[#5C4A32] hover:from-[#5C4A32] hover:to-[#3D2E1F] text-white flex items-center justify-center shadow-xl hover:shadow-2xl shadow-[#8B7355]/40 transition-transform transform active:scale-95"
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-current" />
              ) : (
                <Play className="w-7 h-7 fill-current ml-0.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
