import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import "./EventQrPage.css";

const EventQrPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    const generateQR = async () => {
      try {
        const checkInUrl = `${window.location.origin}/event/${eventId}/scan`;
        const qr = await QRCode.toDataURL(checkInUrl, {
          width: 300,
          margin: 2,
        });
        setQrUrl(qr);
      } catch (err) {
        console.error("QR generation failed", err);
      }
    };

    generateQR();
  }, [eventId]);

  const downloadQR = () => {
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `event-${eventId}-qr.png`;
    link.click();
  };

  return (
    <div className="qr-page">
      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h2>📌 Event QR Code</h2>
      <p className="qr-desc">
        Scan this QR to open event check-in page
      </p>

      {qrUrl && (
        <>
          <img src={qrUrl} alt="Event QR" className="qr-image" />

          <button className="download-btn" onClick={downloadQR}>
            ⬇️ Download QR
          </button>
        </>
      )}
    </div>
  );
};

export default EventQrPage;
