const uygulama = require("./uygulama");

const PORT = process.env.PORT || 3000;

uygulama.listen(PORT, () => {
  console.log(`TASKFLOW çalışıyor → http://localhost:${PORT}`);
});
