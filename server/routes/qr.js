const express = require('express');
const QRCode = require('qrcode');
const { auth, requireSpeaker, requireEventManager } = require('../middleware/auth');
const { updateInJsonFile, findInJsonFile } = require('../utils/fileUtils');

const router = express.Router();

// Generate QR code for speaker
router.get('/generate', auth, requireSpeaker, async (req, res) => {
  try {
    const speaker = await findInJsonFile('users.json', user => user.id === req.user.id);
    
    if (!speaker) {
      return res.status(404).json({ message: 'Speaker not found' });
    }
    
    // Create QR code data
    const qrData = {
      speakerId: speaker.id,
      speakerName: speaker.name,
      email: speaker.email,
      eventName: process.env.EVENT_NAME,
      timestamp: new Date().toISOString(),
      type: 'speaker-checkin'
    };
    
    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });
    
    // Update speaker record
    await updateInJsonFile('users.json', req.user.id, {
      qrCodeGenerated: true,
      qrCodeData: qrData,
      qrGeneratedAt: new Date().toISOString()
    });
    
    res.json({ 
      qrCode: qrCodeUrl,
      qrData,
      message: 'QR code generated successfully'
    });
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({ message: 'QR code generation failed', error: error.message });
  }
});

// Generate T-shirt collection QR code
router.get('/tshirt-qr', auth, requireSpeaker, async (req, res) => {
  try {
    const speaker = await findInJsonFile('users.json', user => user.id === req.user.id);
    
    if (!speaker) {
      return res.status(404).json({ message: 'Speaker not found' });
    }
    
    if (speaker.tshirtCollected) {
      return res.status(400).json({ message: 'T-shirt already collected' });
    }
    
    // Create T-shirt QR code data
    const tshirtQrData = {
      speakerId: speaker.id,
      speakerName: speaker.name,
      tshirtSize: speaker.tshirtSize,
      eventName: process.env.EVENT_NAME,
      timestamp: new Date().toISOString(),
      type: 'tshirt-collection'
    };
    
    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(tshirtQrData), {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#1f2937',
        light: '#FFFFFF'
      },
      width: 256
    });
    
    res.json({ 
      qrCode: qrCodeUrl,
      qrData: tshirtQrData,
      tshirtSize: speaker.tshirtSize,
      message: 'T-shirt QR code generated successfully'
    });
  } catch (error) {
    console.error('T-shirt QR generation error:', error);
    res.status(500).json({ message: 'T-shirt QR code generation failed', error: error.message });
  }
});

// Scan QR code (Event Manager only)
router.post('/scan', auth, requireEventManager, async (req, res) => {
  try {
    const { qrData } = req.body;
    
    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch {
      return res.status(400).json({ message: 'Invalid QR code data' });
    }
    
    const { speakerId, type } = parsedData;
    
    if (!speakerId || !type) {
      return res.status(400).json({ message: 'Incomplete QR code data' });
    }
    
    const speaker = await findInJsonFile('users.json', user => user.id === speakerId);
    
    if (!speaker) {
      return res.status(404).json({ message: 'Speaker not found' });
    }
    
    let updateData = {};
    let message = '';
    
    switch (type) {
      case 'speaker-checkin':
        if (speaker.checkedIn) {
          return res.status(400).json({ message: 'Speaker already checked in' });
        }
        updateData = {
          checkedIn: true,
          checkInTime: new Date().toISOString(),
          checkInBy: req.user.id
        };
        message = 'Speaker checked in successfully';
        break;
        
      case 'tshirt-collection':
        if (speaker.tshirtCollected) {
          return res.status(400).json({ message: 'T-shirt already collected' });
        }
        updateData = {
          tshirtCollected: true,
          tshirtCollectionTime: new Date().toISOString(),
          tshirtCollectedBy: req.user.id
        };
        message = 'T-shirt collection recorded successfully';
        break;
        
      default:
        return res.status(400).json({ message: 'Unknown QR code type' });
    }
    
    await updateInJsonFile('users.json', speakerId, updateData);
    
    res.json({ 
      message,
      speaker: {
        id: speaker.id,
        name: speaker.name,
        email: speaker.email,
        tshirtSize: speaker.tshirtSize
      },
      action: type,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('QR scan error:', error);
    res.status(500).json({ message: 'QR code scanning failed', error: error.message });
  }
});

// Get QR scan history (Event Manager only)
router.get('/scan-history', auth, requireEventManager, async (req, res) => {
  try {
    const users = await readJsonFile('users.json');
    
    const scanHistory = users
      .filter(user => user.role === 'speaker' && (user.checkedIn || user.tshirtCollected))
      .map(speaker => ({
        speakerId: speaker.id,
        speakerName: speaker.name,
        email: speaker.email,
        checkedIn: speaker.checkedIn || false,
        checkInTime: speaker.checkInTime || null,
        tshirtCollected: speaker.tshirtCollected || false,
        tshirtCollectionTime: speaker.tshirtCollectionTime || null,
        tshirtSize: speaker.tshirtSize
      }))
      .sort((a, b) => {
        const aTime = new Date(a.checkInTime || a.tshirtCollectionTime || 0);
        const bTime = new Date(b.checkInTime || b.tshirtCollectionTime || 0);
        return bTime - aTime;
      });
    
    res.json({ scanHistory });
  } catch (error) {
    console.error('Get scan history error:', error);
    res.status(500).json({ message: 'Failed to fetch scan history', error: error.message });
  }
});

module.exports = router;