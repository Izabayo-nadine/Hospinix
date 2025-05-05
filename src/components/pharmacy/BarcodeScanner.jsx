import React, { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const BarcodeScanner = ({ onScan, onClose, scannerActive = true }) => {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' for back camera, 'user' for front
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (scannerActive && !scanning && !scanned) {
      startScanner();
    }
    
    return () => {
      stopScanner();
    };
  }, [scannerActive]);

  const startScanner = async () => {
    setError(null);
    setScanned(false);
    setScanResult(null);
    
    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScanning(true);
        setPermission(true);
        
        // Start processing frames
        requestAnimationFrame(processFrame);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check permissions and try again.');
      setPermission(false);
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setScanning(false);
  };

  const switchCamera = () => {
    stopScanner();
    setFacingMode(prevMode => 
      prevMode === 'environment' ? 'user' : 'environment'
    );
    setTimeout(() => {
      startScanner();
    }, 300);
  };

  const processFrame = async () => {
    if (!scanning || !videoRef.current || !canvasRef.current) return;
    
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Draw the video frame to the canvas
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // In a real implementation, you would use a barcode scanning library here
        // For example: ZXing, quagga.js, or a dedicated barcode scanning service
        
        // For demo purposes, we'll simulate a successful scan after a random interval
        if (!scanned && Math.random() < 0.005) { // 0.5% chance per frame to simulate a "scan"
          const mockBarcodes = [
            { code: '0123456789012', type: 'EAN-13', product: 'Amoxicillin 500mg' },
            { code: '5901234123457', type: 'EAN-13', product: 'Lisinopril 10mg' },
            { code: '9780201379624', type: 'ISBN', product: 'Metformin 850mg' },
            { code: '7350053850019', type: 'EAN-13', product: 'Atorvastatin 20mg' }
          ];
          
          const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
          handleSuccessfulScan(randomBarcode);
        }
      }
      
      // Continue processing frames if still scanning
      if (scanning && !scanned) {
        requestAnimationFrame(processFrame);
      }
    } catch (err) {
      console.error('Error processing frame:', err);
      setError('Error processing camera feed');
      stopScanner();
    }
  };

  const handleSuccessfulScan = (result) => {
    setScanned(true);
    setScanResult(result);
    stopScanner();
    
    // Notify parent component about the scan
    if (onScan) {
      onScan(result);
    }
    
    // Play a success sound
    playBeepSound();
  };

  const playBeepSound = () => {
    // Create and play a beep sound
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 1800;
    gainNode.gain.value = 0.5;
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.1);
  };

  const resetScanner = () => {
    setScanned(false);
    setScanResult(null);
    startScanner();
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4 bg-gray-100 border-b flex items-center justify-between">
        <h3 className="text-lg font-semibold">Barcode Scanner</h3>
        <div>
          {scanning && (
            <Button 
              size="sm" 
              variant="outline" 
              className="mr-2"
              onClick={switchCamera}
            >
              <RefreshCw size={16} className="mr-1" />
              Switch Camera
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        {!permission && (
          <div className="text-center p-8">
            <Camera size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="mb-4">Camera access is required to scan barcodes</p>
            <Button onClick={startScanner}>
              Allow Camera Access
            </Button>
          </div>
        )}
        
        {scanning && (
          <div className="relative">
            <div className="rounded-lg overflow-hidden border-2 border-dashed border-blue-500 aspect-video mx-auto max-w-md">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              {/* Scan overlay animation */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 opacity-75 animate-scanline"></div>
            </div>
            
            <p className="text-center mt-3 text-sm text-gray-600">
              Position the barcode within the box
            </p>
          </div>
        )}
        
        {scanned && scanResult && (
          <div className="text-center p-4">
            <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold">Barcode Detected!</h3>
            <div className="mt-3 p-3 bg-gray-100 rounded-lg">
              <p className="font-semibold">{scanResult.product}</p>
              <p className="text-sm text-gray-600">{scanResult.type}: {scanResult.code}</p>
            </div>
            <div className="mt-4 flex justify-center space-x-3">
              <Button variant="outline" onClick={resetScanner}>
                Scan Again
              </Button>
              <Button onClick={() => onClose(scanResult)}>
                Add to Inventory
              </Button>
            </div>
          </div>
        )}
        
        {error && (
          <div className="text-center p-4">
            <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold text-red-600">Error</h3>
            <p className="mt-1 text-gray-600">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={startScanner}
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
      
      {/* Hidden canvas for image processing */}
      <canvas 
        ref={canvasRef} 
        className="hidden"
      />
      
      <style jsx>{`
        @keyframes scanline {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(calc(100vh - 2px));
          }
          100% {
            transform: translateY(0);
          }
        }
        .animate-scanline {
          animation: scanline 3s ease-in-out infinite;
        }
      `}</style>
    </Card>
  );
};

export default BarcodeScanner; 