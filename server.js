const express = require('express');
const session = require('express-session');
const path = require('path');

require('./database/db'); // garante que as tabelas existam

const authRoutes = require('./routes/auth');
const evaluationRoutes = require('./routes/evaluation');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'troque-esta-chave-secreta-em-producao',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 8 // 8 horas
  }
}));

app.use('/api/auth', authRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/admin', adminRoutes);
 
app.get('/', (req, res) => {
  res.redirect('/login.html');
});
 
app.use(express.static(path.join(__dirname, 'public')));
 
function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}
 
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  const ips = getLocalIPs();
  if (ips.length) {
    console.log('\nPara acessar de outros dispositivos na mesma rede (tablets, etc):');
    ips.forEach(ip => console.log(`  http://${ip}:${PORT}/login.html`));
  }
});
