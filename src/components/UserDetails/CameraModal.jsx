import React, { useState, useRef, useEffect } from "react";
import { RotateCcw, Check, X } from "lucide-react";

const CameraModal = ({ onClose, onConfirm }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const [tempSelfie, setTempSelfie] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setError("Could not access camera. Please ensure you have granted camera permissions.");
            }
        };

        startCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const captureSelfie = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0);
            const dataUrl = canvasRef.current.toDataURL('image/jpeg');
            setTempSelfie(dataUrl);
        }
    };

    const retakePhoto = () => {
        setTempSelfie(null);
    };

    const confirmPhoto = () => {
        if (tempSelfie) {
            onConfirm(tempSelfie);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                {error ? (
                    <div className="p-8 text-center text-white">
                        <p className="text-red-400 mb-4">{error}</p>
                        <button onClick={onClose} className="px-4 py-2 bg-white/10 rounded-lg">Close</button>
                    </div>
                ) : tempSelfie ? (
                    <img src={tempSelfie} alt="Preview" className="w-full h-auto aspect-[3/4] object-cover" />
                ) : (
                    <video ref={videoRef} autoPlay playsInline className="w-full h-auto aspect-[3/4] object-cover" />
                )}

                {!error && (
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 items-center">
                        {tempSelfie ? (
                            <>
                                <button onClick={retakePhoto} className="p-4 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors" title="Retake">
                                    <RotateCcw size={24} />
                                </button>
                                <button onClick={confirmPhoto} className="p-4 bg-green-500 rounded-full text-white hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30" title="Confirm">
                                    <Check size={28} />
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={onClose} className="p-4 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors">
                                    <X size={24} />
                                </button>
                                <button onClick={captureSelfie} className="p-1 rounded-full border-4 border-white/30 hover:border-white transition-all">
                                    <div className="w-16 h-16 bg-white rounded-full"></div>
                                </button>
                            </>
                        )}
                    </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
            </div>
        </div>
    );
};

export default CameraModal;
