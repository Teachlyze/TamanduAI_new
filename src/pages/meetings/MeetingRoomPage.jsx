import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Video, Loader2, ArrowLeft } from 'lucide-react';
import { agoraService } from '@/services/agoraService';

export default function MeetingRoomPage() {
  const { meetingId } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const localVideoRef = useRef(null);
  const [remoteUsers, setRemoteUsers] = useState([]); // {uid, videoContainerId}
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('meetings')
          .select('*')
          .eq('id', meetingId)
          .maybeSingle();
        if (error) throw error;
        setMeeting(data);
      } catch (e) {
        setError(e.message || 'Falha ao carregar reunião');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [meetingId]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (joined) {
        agoraService.leaveChannel().catch(() => {});
      }
    };
  }, [joined]);

  const ensureClients = async () => {
    if (!agoraService.client) {
      await agoraService.initRTCClient();
    }
    if (!agoraService.rtmClient) {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id || Math.floor(Math.random() * 1e9);
      await agoraService.initRTMClient(uid);
    }
  };

  const handleJoin = async () => {
    try {
      if (!meeting) return;
      setJoining(true);
      await ensureClients();

      // Get token from Supabase Edge Function
      const channel = meeting.agora_channel || meeting.id;
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id || Math.floor(Math.random() * 1e9);
      const { data: tokenResp, error: tokenErr } = await supabase.functions.invoke('generate-agora-token', {
        body: { channel, uid }
      });
      if (tokenErr) throw tokenErr;
      const token = tokenResp?.token || tokenResp; // function may return {token}

      // Subscribe remote users
      agoraService.setupRemoteUserHandlers(
        async (user, mediaType) => {
          // Create or reuse a container for this user
          const containerId = `remote-${user.uid}`;
          let container = document.getElementById(containerId);
          if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.className = 'w-full h-48 bg-black rounded-md overflow-hidden';
            const grid = document.getElementById('remote-grid');
            if (grid) grid.appendChild(container);
            setRemoteUsers((prev) => {
              if (prev.find((u) => u.uid === user.uid)) return prev;
              return [...prev, { uid: user.uid, videoContainerId: containerId }];
            });
          }
          if (mediaType === 'video') {
            user.videoTrack?.play(containerId);
          } else if (mediaType === 'audio') {
            user.audioTrack?.play();
          }
        },
        (user) => {
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
          const container = document.getElementById(`remote-${user.uid}`);
          if (container?.parentNode) container.parentNode.removeChild(container);
        }
      );

      // Join and publish
      const { videoTrack } = await agoraService.joinChannel(channel, token, uid);
      // Render local video
      setJoined(true);
      setTimeout(() => {
        if (localVideoRef.current) {
          videoTrack?.play(localVideoRef.current);
        }
      }, 0);
    } catch (e) {
      setError(e?.message || 'Falha ao entrar na reunião');
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    try {
      await agoraService.leaveChannel();
      setJoined(false);
      setRemoteUsers([]);
      setScreenSharing(false);
    } catch (e) {
      setError(e?.message || 'Falha ao sair da reunião');
    }
  };

  const toggleAudio = () => {
    const enabled = agoraService.toggleAudio();
    setAudioEnabled(enabled);
  };

  const toggleVideo = () => {
    const enabled = agoraService.toggleVideo();
    setVideoEnabled(enabled);
  };

  const toggleScreenShare = async () => {
    try {
      if (!screenSharing) {
        await agoraService.startScreenShare();
        setScreenSharing(true);
      } else {
        await agoraService.stopScreenShare();
        setScreenSharing(false);
      }
    } catch (e) {
      setError(e?.message || 'Falha ao alternar compartilhamento de tela');
    }
  };

  // Whiteboard basic drawing handlers
  const onCanvasMouseDown = (e) => {
    drawingRef.current = true;
    const ctx = canvasRef.current.getContext('2d');
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };
  const onCanvasMouseMove = (e) => {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const rect = canvasRef.current.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
    ctx.stroke();
  };
  const onCanvasMouseUp = () => {
    drawingRef.current = false;
  };

  if (loading) return (
    <div className="p-6"><Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> Carregando…</div>
  );

  if (error || !meeting) return (
    <div className="p-6 space-y-4">
      <div className="text-red-600 text-sm">{error || 'Reunião não encontrada'}</div>
      <Link to="/dashboard/meetings" className="text-blue-600 underline">Voltar para Reuniões</Link>
    </div>
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/dashboard/meetings" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
          </Link>
          <h1 className="text-xl font-semibold">{meeting.title || 'Reunião'}</h1>
        </div>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Canal</div>
            <div className="font-mono text-sm">{meeting.agora_channel || meeting.id}</div>
          </div>
          <div className="flex gap-2">
            {!joined ? (
              <Button onClick={handleJoin} disabled={joining}>
                {joining ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Entrando…</>) : (<><Video className="w-4 h-4 mr-2" /> Entrar</>)}
              </Button>
            ) : (
              <Button variant="outline" onClick={handleLeave}>
                Sair
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {joined && (
            <>
              <Button size="sm" variant={audioEnabled ? 'outline' : 'destructive'} onClick={toggleAudio}>
                {audioEnabled ? 'Mutar' : 'Desmutar'} áudio
              </Button>
              <Button size="sm" variant={videoEnabled ? 'outline' : 'destructive'} onClick={toggleVideo}>
                {videoEnabled ? 'Desligar' : 'Ligar'} câmera
              </Button>
              <Button size="sm" onClick={toggleScreenShare}>
                {screenSharing ? 'Parar Compart.' : 'Compartilhar Tela'}
              </Button>
              <Button size="sm" variant={whiteboardOpen ? 'secondary' : 'outline'} onClick={() => setWhiteboardOpen((v) => !v)}>
                {whiteboardOpen ? 'Fechar Lousa' : 'Abrir Lousa'}
              </Button>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm mb-1">Seu vídeo</div>
            <div ref={localVideoRef} className="w-full h-48 bg-black rounded-md overflow-hidden" />
          </div>
          <div>
            <div className="text-sm mb-1">Participantes</div>
            <div id="remote-grid" className="grid grid-cols-1 gap-2">
              {remoteUsers.length === 0 && (
                <div className="w-full h-48 border rounded-md flex items-center justify-center text-xs text-muted-foreground">Aguardando participantes…</div>
              )}
            </div>
          </div>
        </div>

        {whiteboardOpen && (
          <div className="space-y-2">
            <div className="text-sm">Lousa</div>
            <canvas
              ref={canvasRef}
              width={960}
              height={540}
              className="border rounded-md bg-white"
              onMouseDown={onCanvasMouseDown}
              onMouseMove={onCanvasMouseMove}
              onMouseUp={onCanvasMouseUp}
              onMouseLeave={onCanvasMouseUp}
            />
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Vídeo e lousa básicos. Integração com whiteboard e mais controles virão na próxima etapa.
        </div>
      </Card>
    </div>
  );
}
