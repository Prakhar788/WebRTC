import { useEffect,useState } from "react";


export function Receiver(){
    const [socket, setSocket] = useState<WebSocket | null>(null);



    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
        
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: 'sender'
            }));
        }
        socket.onmessage=async(event)=>{
            const message=JSON.parse(event.data);
            let pc:RTCPeerConnection |null=null;
            if(message.type==='createOffer'){
                //create an answer
                pc=new RTCPeerConnection();
                pc.setRemoteDescription(message.sdp);
                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket?.send(JSON.stringify({
                            type: 'iceCandidate',
                            candidate: event.candidate
                        }));
                    }
                }
                pc.ontrack=(event)=>{
                    const video = document.createElement('video');
                    document.body.appendChild(video);
                    video.srcObject = new MediaStream([event.track]);
                    video.play() 
                }
                const answer=await pc.createAnswer();
                pc.setLocalDescription(answer);
                socket.send(JSON.stringify({type:'createAnswer',sdp:pc.localDescription}));
            }else if(message.type==='iceCandidate'){
                if(pc!==null){
                    //@ts-ignore
                    pc.addIceCandidate(message.candidate)
                }
            }
        }
    }, []);
    
    return <>
   Receiver
    </>
}