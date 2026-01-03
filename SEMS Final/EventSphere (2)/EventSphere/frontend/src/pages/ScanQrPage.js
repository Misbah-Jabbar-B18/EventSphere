import React, { useState } from "react";
import { QrReader } from "react-qr-reader";
import { useParams, useNavigate } from "react-router-dom";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const ScanQrPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [attendee, setAttendee] = useState(null);
  const [locked, setLocked] = useState(false);

  const handleScan = async (result) => {
    if (!result || locked) return;

    setLocked(true);

    try {
      const qrPayload = JSON.parse(result.text);
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/rsvps/checkin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rsvpId: qrPayload.rsvpId,
          eventId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(`❌ ${data.message}`);
        setAttendee(null);
        // Auto-unlock after 2 seconds to scan next attendee
        setTimeout(() => setLocked(false), 2000);
        return;
      }

      setMessage(`✅ ${data.message || 'Checked in successfully!'}`);
      setAttendee(data.attendee);
      // Auto-unlock after 3 seconds to scan next attendee
      setTimeout(() => {
        setLocked(false);
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error("Scan error:", err);
      setMessage("❌ Invalid QR Code");
      setAttendee(null);
      // Auto-unlock after 2 seconds to try again
      setTimeout(() => setLocked(false), 2000);
    }
  };

  return (
    <div style={{ 
      padding: "2rem", 
      textAlign: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    }}>
      <button
        onClick={() => navigate(-1)}
        style={{ 
          position: "absolute",
          top: "20px",
          left: "20px",
          padding: "8px 16px",
          background: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        ⬅ Back
      </button>

      <div style={{
        background: "white",
        borderRadius: "15px",
        padding: "2rem",
        maxWidth: "500px",
        margin: "2rem auto",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)"
      }}>
        <h2 style={{ color: "#2563eb", marginBottom: "1rem" }}>📷 Scan Attendee QR Code</h2>
        <p style={{ color: "#666", marginBottom: "1.5rem", fontSize: "14px" }}>
          Position the QR code in front of your camera to check in attendees
        </p>

        <div style={{ maxWidth: "360px", margin: "auto", borderRadius: "10px", overflow: "hidden" }}>
          <QrReader
            constraints={{ facingMode: "environment" }}
            onResult={(result) => result && handleScan(result)}
            style={{ width: "100%" }}
          />
        </div>

        {message && (
          <div style={{ 
            marginTop: "1.5rem", 
            padding: "1rem",
            background: message.includes("✅") ? "#d1fae5" : message.includes("❌") ? "#fee2e2" : "#dbeafe",
            borderRadius: "8px",
            color: message.includes("✅") ? "#065f46" : message.includes("❌") ? "#7f1d1d" : "#003366",
            fontWeight: "bold"
          }}>
            {message}
          </div>
        )}

        {attendee && (
          <div style={{
            background: "#ecfeff",
            padding: "1.5rem",
            marginTop: "1.5rem",
            borderRadius: "10px",
            border: "2px solid #06b6d4"
          }}>
            <h4 style={{ color: "#0891b2", marginBottom: "0.5rem" }}>✅ Checked In</h4>
            <p style={{ margin: "0.5rem 0", fontSize: "16px" }}>
              <strong>Name:</strong> {attendee.name}
            </p>
            <p style={{ margin: "0.5rem 0", fontSize: "16px" }}>
              <strong>Email:</strong> {attendee.email}
            </p>
          </div>
        )}
      </div>

      <p style={{ color: "white", fontSize: "12px", marginTop: "2rem" }}>
        💡 Scanning will automatically unlock for the next attendee in a few seconds
      </p>
    </div>
  );
};

export default ScanQrPage;
