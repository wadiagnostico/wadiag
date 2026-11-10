import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Headphones, Music2 } from 'lucide-react';

interface CompactAudioPlayerProps {
  label?: string;
  audioUrl?: string | null;
  estimatedDuration?: string;
}

export const CompactAudioPlayer: React.FC<CompactAudioPlayerProps> = ({
  label = 'Áudio explicativo: Como responder',
  audioUrl,
  estimatedDuration = '1:15',
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
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

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
    <div className="bg-gradient-to-r from-[#FAF8F5] via-[#F5EFE6] to-[#ECE3D4] border border-[#D4C5A9] rounded-2xl p-4 shadow-sm space-y-3">
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
      )}

      {/* Linha Superior: Nome do áudio e botões de velocidade / mute */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white border border-[#D4C5A9] shadow-sm flex items-center justify-center text-[#8B7355] shrink-0">
            <Music2 className="w-4 h-4 text-[#8B7355]" />
          </div>
          <div>
            <h5 className="font-serif font-bold text-xs sm:text-sm text-[#3D2E1F]">
              {label}
            </h5>
            <span className="text-[10px] text-[#8B7355] font-medium">
              Duração estimada: {duration ? formatTime(duration) : estimatedDuration}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={cycleSpeed}
            title="Velocidade"
            className="px-2 py-1 text-[11px] font-bold rounded-lg bg-white hover:bg-[#FAF8F5] text-[#5C4A32] border border-[#D4C5A9] shadow-xs transition"
          >
            {playbackRate}x
          </button>

          <button
            type="button"
            onClick={toggleMute}
            title={isMuted ? 'Desmutar' : 'Mutar'}
            className="p-1.5 rounded-lg bg-white hover:bg-[#FAF8F5] text-[#5C4A32] border border-[#D4C5A9] shadow-xs transition"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5 text-[#8B7355]" />}
          </button>
        </div>
      </div>

      {/* Linha Inferior: Controles de Play, Barra de Progresso e Timer */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={restart}
          title="Ouvir do início"
          className="p-1.5 text-[#6B5B4D] hover:text-[#3D2E1F] rounded-lg hover:bg-white/60 transition shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={togglePlay}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8B7355] to-[#5C4A32] text-white flex items-center justify-center shadow-md hover:shadow-lg transition-transform transform active:scale-95 shrink-0"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        <span className="text-[11px] font-mono font-bold text-[#6B5B4D] w-8 text-right shrink-0">
          {formatTime(currentTime)}
        </span>

        {/* Barra de Progresso */}
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-[#D4C5A9] rounded-lg appearance-none cursor-pointer accent-[#8B7355]"
        />

        <span className="text-[11px] font-mono font-bold text-[#6B5B4D] w-8 shrink-0">
          {duration ? formatTime(duration) : estimatedDuration}
        </span>
      </div>
    </div>
  );
};
