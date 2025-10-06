import AgoraRTC from 'agora-rtc-sdk-ng';
import AgoraChat from 'agora-chat';

// Read from env to avoid leaking credentials in the bundle/repo
const APP_ID = import.meta.env.VITE_AGORA_APP_ID;
const WHITEBOARD_APP_ID = import.meta.env.VITE_AGORA_WHITEBOARD_APP_ID || APP_ID;

class AgoraService {
  constructor() {
    this.client = null;
    this.rtmClient = null;
    this.localAudioTrack = null;
    this.localVideoTrack = null;
    this.screenTrack = null;
    this.isJoined = false;
    this.uid = null;
    this.channel = null;
  }

  // Initialize Agora RTC client
  async initRTCClient() {
    this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    return this.client;
  }

  // Initialize Agora RTM client for signaling (using Agora Chat)
  async initRTMClient(uid) {
    this.rtmClient = new AgoraChat.connection({
      appKey: APP_ID,
    });

    this.uid = uid.toString();

    // Connect to Agora Chat
    await new Promise((resolve, reject) => {
      this.rtmClient.open({
        user: this.uid,
        pwd: 'default_password', // You might want to use a proper auth system
        success: resolve,
        error: reject
      });
    });

    return this.rtmClient;
  }

  // Join a channel
  async joinChannel(channelName, token, uid) {
    try {
      this.channel = channelName;
      
      // Join RTC channel
      await this.client.join(APP_ID, channelName, token, uid);
      
      // Create and publish local tracks
      [this.localAudioTrack, this.localVideoTrack] = await Promise.all([
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack()
      ]);
      
      await this.client.publish([this.localAudioTrack, this.localVideoTrack]);
      
      // Join RTM channel (Agora Chat approach)
      // Note: Agora Chat handles channels differently, we'll implement basic messaging
      this.rtmChannel = channelName;

      this.isJoined = true;
      return { audioTrack: this.localAudioTrack, videoTrack: this.localVideoTrack };
    } catch (error) {
      console.error('Failed to join channel:', error);
      throw error;
    }
  }

  // Leave the channel
  async leaveChannel() {
    try {
      // Stop and close local tracks
      if (this.localAudioTrack) {
        this.localAudioTrack.stop();
        this.localAudioTrack.close();
      }
      
      if (this.localVideoTrack) {
        this.localVideoTrack.stop();
        this.localVideoTrack.close();
      }
      
      // Leave RTC channel
      await this.client.leave();
      
      // Leave RTM channel and logout (Agora Chat approach)
      if (this.rtmClient) {
        this.rtmClient.close();
      }
      
      this.isJoined = false;
      this.channel = null;
    } catch (error) {
      console.error('Error leaving channel:', error);
      throw error;
    }
  }

  // Start screen sharing
  async startScreenShare() {
    try {
      this.screenTrack = await AgoraRTC.createScreenVideoTrack({}, 'disable');
      await this.client.unpublish([this.localVideoTrack]);
      await this.client.publish([this.screenTrack]);
      return this.screenTrack;
    } catch (error) {
      console.error('Failed to start screen share:', error);
      throw error;
    }
  }

  // Stop screen sharing
  async stopScreenShare() {
    if (this.screenTrack) {
      await this.client.unpublish([this.screenTrack]);
      this.screenTrack.close();
      this.screenTrack = null;
      
      // Publish local video track again
      if (this.localVideoTrack) {
        await this.client.publish([this.localVideoTrack]);
      }
    }
  }

  // Mute/Unmute audio
  toggleAudio() {
    if (this.localAudioTrack) {
      this.localAudioTrack.setEnabled(!this.localAudioTrack.enabled);
      return this.localAudioTrack.enabled;
    }
    return false;
  }

  // Mute/Unmute video
  toggleVideo() {
    if (this.localVideoTrack) {
      this.localVideoTrack.setEnabled(!this.localVideoTrack.enabled);
      return this.localVideoTrack.enabled;
    }
    return false;
  }

  // Subscribe to remote users
  setupRemoteUserHandlers(onUserPublished, onUserUnpublished) {
    this.client.on('user-published', async (user, mediaType) => {
      await this.client.subscribe(user, mediaType);
      if (onUserPublished) {
        onUserPublished(user, mediaType);
      }
    });

    this.client.on('user-unpublished', (user, mediaType) => {
      if (onUserUnpublished) {
        onUserUnpublished(user, mediaType);
      }
    });
  }
}

export const agoraService = new AgoraService();
