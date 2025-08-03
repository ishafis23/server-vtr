const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // ganti domain produksi nanti
  }
});

app.use(express.json());

// 🔄 Emit umum (default)
app.post('/emit-change', (req, res) => {
  const { uuid_teaching, message, now, present } = req.body;

  console.log('📩 Emit request received:', req.body);

  if (uuid_teaching && message) {
    io.emit('teaching-change', {
      uuid_teaching,
      message,
      now,
      present
    });
    res.json({ status: 'ok', sent: true });
  } else {
    res.status(400).json({ status: 'error', message: 'uuid_teaching or message missing' });
  }
});


// 🔐 Endpoint KHUSUS quiz aktif
app.post('/quiz-activated', (req, res) => {
  const { uuid_teaching, activity_id, question_number } = req.body;

  if (!uuid_teaching || !activity_id || typeof question_number !== 'number') {
    return res.status(400).json({ status: 'error', message: 'Missing quiz activation data' });
  }

  console.log('🚀 Quiz activated:', req.body);

  // Emit khusus ke siswa
  io.emit('quiz-activated', {
    uuid_teaching,
    activity_id,
    question_number
  });

  res.json({ status: 'ok', message: 'Quiz question emitted' });
});


// 📩 Endpoint siswa submit
app.post('/student-submit', (req, res) => {
  const { uuid_teaching_activity, uuid_teaching_register, kode_kelas, id_user, nama_user } = req.body;

  if (uuid_teaching_activity && id_user) {
    console.log("📩 Data from student:", req.body);

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
