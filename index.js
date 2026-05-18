import { app } from './src/app.js';
import { config } from './src/config.js';

app.listen(config.port, () => {
  console.log(`listening on :${config.port}`);
});
