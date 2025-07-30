const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Ganti dengan domain frontend kamu di production
  }
});

app.use(express.json()); // Untuk parsing body JSON dari POST request

// Endpoint yang bisa dipanggil dari PHP
app.post('/emit-change', (req, res) => {
  const { uuid_teaching, message, now, present } = req.body;

  console.log('📩 Emit request received:', req.body);

  if (uuid_teaching && message) {
    io.emit('teaching-change', {
      uuid_teaching,
      message,
      now,
      present // tambahkan ke payload
    });
    res.json({ status: 'ok', sent: true });
  } else {
    res.status(400).json({ status: 'error', message: 'uuid_teaching or message missing' });
  }
});



// Endpoint dari PHP untuk trigger
app.post('/student-submit', (req, res) => {
  const { uuid_teaching_activity, uuid_teaching_register, kode_kelas, id_user, nama_user } = req.body;

  if (uuid_teaching_activity && id_user) {
    console.log("📩 Data from student:", req.body);

    // Emit ke semua klien (guru)
    io.emit('student-submitted', {
      uuid_teaching_activity,
      uuid_teaching_register,
      kode_kelas,
      id_user,
      nama_user
    });

    res.json({ status: 'ok', sent: true });
  } else {
    res.status(400).json({ status: 'error', message: 'Missing data' });
  }
});

server.listen(3000, () => {
  console.log('🚀 Socket server running on http://localhost:3000');
});
