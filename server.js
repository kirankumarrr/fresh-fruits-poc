const express = require('express');
const app = express();
const path = require('path');

app.use(express.static('dist'));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', '/', 'index.html'));
});
const port = process.env.PORT || 5000;

const server = app.listen(port, console.log(`Server runnig on port  ${port}`));
